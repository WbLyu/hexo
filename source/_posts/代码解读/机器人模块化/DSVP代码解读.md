---
title: DSVP代码解读
date: 2026-02-03 11:28:36
# updated:
# tags:
#     - 
categories: 
          - 代码解读
          - 机器人模块化
# keywords:
# description:
top_img: transparent
# comments:
# toc:
# toc_number:
# toc_style_simple:
# copyright:
# copyright_author:
# copyright_author_href:
# copyright_url:
# copyright_info:
# mathjax:
# katex:
# aplayer:
# highlight_shrink:
# aside:
# abcjs:
# noticeOutdate:
cover: https://img.wblyu.top/images/bb16890c0813b472bac2d0a71c0f28c9.avif
---

## 1. 代码依赖

- `volumetric_mapping`：[项目地址](https://github.com/ethz-asl/volumetric_mapping.git)
  - `minkindr`：[项目地址](https://github.com/ethz-asl/minkindr.git)
  - `minkindr_ros`：[项目地址](https://github.com/ethz-asl/minkindr_ros.git)

## 2. 代码结构

### 2.1 `dsvplanner`包

#### 2.1.1 `drrtp_node`

入口文件为，此文件会启动`drrtp`

#### 2.1.2 `exploration`

订阅：

- `/state_estimation`里程计信息
- `/navigation_boundary`整个算法的边界信息

客户端：

- `/drrtPlannerSrv`发送请求规划时间点
- `/cleanFrontierSrv`

#### 2.1.3 `drrtp`

订阅：

- `/state_estimation`里程计信息
- `/navigation_boundary`整个算法的边界信息

服务端：

`/drrtPlannerSrv`返回一系列目标点以及模式（探索或返航）
`/cleanFrontierSrv`

#### 2.1.4 `dual_state_froniter`

获取备选边界点

自动执行的操作

定时器：

`getFrontiers()`维护局部和全局边界点

关键函数解析：

`getFrontiers()`

```mermaid
flowchart TB
 subgraph A[getUnknowPointcloudInBoundingBox]
    direction LR
    A1[遍历机器人周围体素（octomap）]
    A2[提取未知状态点云（PCL存储）]
    A3[筛选局部边界点（范围内+符合边界条件，PCL存储）]
    A4[局部边界点降采样]
    A1 --> A2 --> A3--> A4
  end

  subgraph B[localFrontierUpdate]
   direction LR
   B1[遍历所有局部边界点（PCL）]
   B2[消剔除机器人周围的局部边界点]
   B3[可见性检查（octomap）+碰撞检测（占据网格）]
   B4[兜底条件：探索状态+近图节点（用kdtree在/global_points中搜索）]
   B5[满足条件的点 → 全局边界点（PCL）]
   B6[满足条件的点降采样 → 更新局部边界点（PCL）]
    B1 --> B2
    B2 --> B3
    B2 --> B4
    B3 --> B5
    B3 --> B6
    B4 --> B5
    B4 --> B6  
  end

  subgraph C[gloabalFrontierUpdate]
   direction LR
   C1[遍历所有全局边界点（PCL）]
   C2[舍弃被标记清空的边界点]
   C3[再次校验：未知状态+符合边界点条件]
   C4[满足条件的点降采样 → 更新全局边界点（PCL）]
   C1 --> C2 --> C3 --> C4
  end

  subgraph D[globalFrontiersNeighbourCheck]
   direction LR
   D1[基于全局边界点（PCL）构造kdtree]
   D2[遍历全局边界点（PCL）]
   D3[判断全局边界点是否有邻居（kdtree半径搜索）]
   D4[满足条件的点 → 更新全局边界点（PCL）]

   D1 --> D2 --> D3 --> D4
  end 
  subgraph E[publishFrontiers]
    direction LR
    E1[发布局部边界点]
    E2[发布全局边界点] 
    E3[发布未知状态的点云]
    E1 ~~~ E2 ~~~ E3
  end
  A -->B-->C -->D-->E
```

#### 2.1.5 `drrt`

关键函数解析：

`plannerInit()`

```mermaid
flowchart TB
 subgraph A[通用初始化]
    direction LR
    A1[创建3维kdtree]
    A2[清空节点数组]
    A3[初始化RRT根节点]
    A1 --> A2 --> A3
  end

  subgraph B[局部探索+有局部边界点]
   direction LR
   B1[将机器人当前位置设为根节点并插入kdtree中]
   B2[标记“需要继续局部规划”“正常局部迭代”]
   B3[获取当前探索方向最近的3个局部边界点]
   B4[基于根节点修剪RRT树（移除无效/冗余节点，优化树结构）]
   B5[用修剪后的图更新局部图（拓扑图） → 将局部地图分别以拓扑图和点云图形式发布出去]
   B1 --> B2 --> B3 --> B4 --> B5
  end

  subgraph C[局部探索+无局部边界点]
   direction LR
   C1[不打算重试]
   C2[清空局部图和修剪图]
   C3[标记无边界点并重置状态]
   C4[打算重试]
   C5[清空三个前沿点、局部图和修剪图]
   C6[重试次数递减]
   C7[试次数耗尽 → 不再重试]
   C1 --> C2 --> C3
   C4 --> C5 --> C6 --> C7
  end

  subgraph D[局部规划边界配置]
   direction LR
   D1[以根节点（机器人当前位置）为中心，向外扩展固定范围作为局部窗口边界]
  end

  subgraph E[全局重定位+有全局图节点]
   direction LR
   E1[更新根节点为全局图第一个节点（机器人最新全局位姿）并插入kdtree中]
   E2[全局图赋值给局部图（全局阶段下，局部图=全局图）]
   E3[找距离全局边界点最近的节点]
   subgraph EA[找到全局最优节点]
    direction LR
    EA1[给最优节点设超大增益]
    EA2[发布全局图]
    EA1 --> EA2
   end
   subgraph EB[未找到全局最优节点]
    direction LR
    subgraph EBA[遍历全局图所有节点]
     direction LR
     EBA1[将全局图中的每个点作为采样点扩展kdtree]
     EBA2[更新图中节点增益和节点数组，记录最优增益节点]
     EBA1 --> EBA2
    end
   end
   E1 --> E2 --> E3
   E3 --> EA
   E3 --> EB
  end
  subgraph F[全局重定位+无全局图节点]
   direction LR
   F1[将根节点设为机器人当前位置，并插入kdtree]
  end
  A ~~~B~~~C ~~~D~~~E~~~F

```

`plannerIterate()`

```mermaid
flowchart TB
 subgraph A[通用初始化]
    direction LR
    A1[创建3维kdtree]
    A2[清空节点数组]
    A3[初始化RRT根节点]
    A1 --> A2 --> A3
  end
```

### 2.2 `kdtree`包

使用`kdtree`数据接口来管理`drrt`的节点，从而加速最近邻搜索

这个包使用的是[开源项目](https://github.com/jtsiomb/kdtree)

## 3. 地图结构

### 3.1 占用栅格地图`Occupancy Grid`

### 3.2 八叉地图`Octomap`

### 3.3 拓扑地图`Topological Graph`

此地图仅在`dual_state_graph`中使用，因为代码中`getGain`函数是自主探索的核心，其逻辑依赖遍历拓扑图的路径序列并累加路径上所有节点的信息增益。这是路径级的计算，需要拓扑图提供 “路径” 的概念

其中的边会分为：**关键位姿边**和**非关键位姿边**。只有机器人实际走过的路线才定为关键位姿边，可靠性极高

### 3.4 k维树`kdtree`

在`dual_state_froniter`中并不会维护一个`kdtree`，仅在需要寻找最近邻时临时构造`kdtree`

## 4. 代码讲解

### 4.1 `dual_state_frontier`

1. 根据机器人的位置，在给定搜索范围内确定局部边界点
2. 更新局部位置的边界点，并加入到全局边界点中
3. 再更新全局边界点
4. 只保留那些在指定半径范围内有邻居的全局边界点
5. 发布边界信息

此处得到的边界点皆为待选点

{% mermaid %}

{% endmermaid %}

---

**未完待续**

参考文章

[代码解析：DSVP: Dual-Stage Viewpoint Planner for Rapid Exploration by Dynamic Expansion](https://www.guyuehome.com/detail?id=1825490290073202690)
