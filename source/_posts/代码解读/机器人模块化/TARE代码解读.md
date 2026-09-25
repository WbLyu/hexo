---
title: TARE代码解读
date: 2026-02-21 17:53:54
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
cover: https://img.wblyu.top/images/f4931ede4cb41307e3008fbe3d264750.avif
---

## 1. 代码结构

### 1.1 `lidar_model`

这里的体素索引依靠的是水平角度索引+垂直角度索引，二者的分辨率都是按每2度递增。其中垂直角度索引可以看成行索引，水平角度索引可以看成列索引

水平角度是以`map`坐标系下的x方向为零，在代码中将-x方向为索引的开始，逆时针为正；垂直角度是以`map`坐标系下的z方向为零，但是此方向一般为激光雷达的盲区，在代码中将视场角的上边作为索引的开始，通过`kVerticalAngleOffset`实现偏移

`GetHorizontalNeighborNum`和`GetVerticalNeighborNum`像是经验公式，即射线的邻居数量与距离成反比（距离越远，点云越稀疏）与分辨率成反比（分辨率越大，体素越稀疏）

### 1.2 `viewpoint`

定义了`ViewPoint`类用来表示视点，每一个视点中都有一个`lidar_model`，用来存储这个视点观测到的体素距离

### 1.2 `grid`

维护了一组栅格，并实现了线性索引、向量索引、维度下标索引和坐标值间的互相转换

### 1.3 `rolling_grid`

实现了3D滚动网格的功能，只维护机器人周围一个固定大小的局部网格。注意这里的网格只负责存储索引映射关系，真正的内容由另外的`grid`对象维护即`occupancy_array_`

采用双缓冲机制：定义两个网格对象`grid0_`和`grid1_`一个网格作为源，另一个作为目标

当机器人移动时，内存位置并不改变，只改变内存中存储的索引。这里的索引是全局网格的索引。这里roll_dir的定义比较特殊，和直观理解不同：在上层调用中，传给roll_dir的并不代表“机器人的移动方向”，而是代表“地图中心点向机器人移动的方向”即机器人移动方向的相反数

如果向右移动1格，那么目标网格的x=1位置应该获取源网格x=0的值；对于边界：目标网格的 x=0 位置会获取源网格x=MAX的值，这里的MAX为最大索引

为防止数据混乱，在存储和读取时都要使用取模运算。

栅格存储的数据反向滚动

### 1.4 `rolling_occupancy_grid`

维护了两个栅格`occupancy_array_`和`rolling_grid_`，两个栅格的尺寸一样

- `occupancy_array_`

  - 存储的是栅格的占用情况
  - 栅格的分辨率是人为定义的
  - 通过`UpdateOccupancyStatus`方法更改栅格状态为`FREE`或`OCCUPIED`；通过`UpdateRobotPosition`方法更改栅格状态为`UNKNOWN`

- `rolling_grid_`

  - 存储的是索引映射关系，指向`occupancy_array_`的索引
  - 栅格的分辨率没有意义
  - 仅通过`UpdateRobotPosition`方法更改

`occupancy_array_`负责存储栅格的占用情况，本质是一个环形缓冲区

`rolling_grid_`负责存储索引映射关系，即指向 `occupancy_array_`的索引

当机器人移动时，`rolling_grid_`存储的索引值随之一起全部更新；但是`occupancy_array_`存储的占用情况并不全部更新，用新加入的网格覆盖应该移除的网格，即直接设为`UNKNOWN`，重叠区域保持不变

举例

初始时刻
`occupancy_array_`的内容

| Index |   0  |     1    |   2  |     3    |     4    |
|:-----:|:----:|:--------:|:----:|:--------:|:--------:|
|  Data | FREE | OCCUPIED | FREE | OCCUPIED | OCCUPIED |

`rolling_grid_`的内容

| Index | 0 | 1 | 2 | 3 | 4 |
|:-----:|:-:|:-:|:-:|:-:|:-:|
|  Data | 0 | 1 | 2 | 3 | 4 |

机器人向右移动了 1 格

`occupancy_array_`的内容

| Index |    0    |    1     |  2   |    3     |    4     |
|:-----:|:-------:|:--------:|:----:|:--------:|:--------:|
| Data  | UNKNOWN | OCCUPIED | FREE | OCCUPIED | OCCUPIED |

`rolling_grid_`的内容

| Index | 0 | 1 | 2 | 3 | 4 |
|:-----:|:-:|:-:|:-:|:-:|:-:|
|  Data | 1 | 2 | 3 | 4 | 0 |

### 1.5 `pointcloud_manager`

维护了两个栅格`pointcloud_grid_`和`occupancy_cloud_grid_`，两个栅格的尺寸和分辨率完全一致

- `pointcloud_grid_`

  - 存储的是`pcl::PointXYZRGBNormal`类型的点云
  - 获取的是原始点云数据
  - 仅存储垂直表面点云
  - 仅通过`UpdatePointCloud`方法增加点云
  - 点的g大于0则被覆盖；r大于0则是旧点

- `occupancy_cloud_grid_`

  - 存储的是`pcl::PointXYZI`类型的点云
  - 获取的是环境占用状态信息
  - 与滚动占据栅格进行数据交换，只会存储`rolling_occupancy_grid`中滚出去的点云，栅格为`FREE`则`intensity`为0
  - 仅通过`StoreOccupancyCloud`方法增加点云

栅格分为邻居栅格和其他栅格，原点也分为总原点`origin_`和邻居栅格的原点`neighbor_cells_origin_`

邻居栅格的总尺寸和`rolling_occupancy_grid`的总尺寸保持一致，并且二者的滚动条件本质上也是一致的

滚动的频率很低

### 1.6 `viewpoint_manager`

维护一个`RollingGrid`类型的grid_，此栅格为平面栅格

核心函数

- `GetViewPointCandidate` 遍历所有视点，筛选出候选视点，创建碰撞视点点云，构建二者的kdtree，构建候选视点的图结构

### 1.6 `pointcloud_utils`

这里的参数是写死的

- `kRadiusThreshold` 设为0.3，搜索邻居点时的半径阈值，注意这里计算半径时不考虑z轴距离
- `kZDiffMax` 设为1.0，筛选邻居点时z值差异绝对值的最大值
- `kZDiffMin` 设为0.3，筛选邻居点时z值差异绝对值的最小值
- `kNeighborThreshold` 设为1，判定为垂直表面点时需要邻居点数量的阈值

这里的判断过程遍历了所有点，一个点可能是多个其他点的邻居，会被重复检查，后续可以改为**区域生长算法**

### 1.7 `misc_utils`

其中`LinInterpPoints`函数实现了在两点间线性插值，

### 1.8 `exploration_path`

定义了节点类，节点共有9种状态

- `ROBOT` 机器人所在的节点
- `LOOKAHEAD_POINT`
- `LOCAL_VIEWPOINT`
- `LOCAL_PATH_START`
- `LOCAL_PATH_END`
- `LOCAL_VIA_POINT`
- `GLOBAL_VIEWPOINT` 全局视点
- `GLOBAL_VIA_POINT`
- `HOME`

并使用节点类创建了`ExplorationPath`类，负责维护探索的路径

### 1.9 `planning_env`

为了保持`pointcloud_manager_`中的邻居栅格和`rolling_occupancy_grid_`保持一致，需要同步二者的原点位置，步骤如下

1. 更新`pointcloud_manager_`中的机器人位置，并在第一次更新时初始化总原点。反向推算邻居栅格的原点
2. 将邻居栅格的原点赋给`rolling_occupancy_grid_`，设置原点
3. 更新`rolling_occupancy_grid_`中的机器人位置

点的`g`值大于0说明已经被覆盖过了，`r`大于0则是旧点

判断点被覆盖过的条件：

- 机器人附近的点需要同时满足以下条件
  - 点与机器人的z轴距离$<$ kSensorRange * 0.3
  - (点与机器人的xy距离 $<$ 3 *(kSurfaceCloudDwzLeafSize / 2) / 0.3 且 点与机器人的z轴距离$<$ 3* kSurfaceCloudDwzLeafSize) 或 (点与机器人的xy距离 $\leq$ kSensorRange 且 点与机器人的z轴距离$\leq$ 点与机器人的xy距离 * 0.3)
  - 通过lidar_model判断检测点不被遮挡
- 已访问的视点附近的点需要同时满足以下条件
  - 点与视点的z轴距离$\leq$ kSensorRange * tand(15)
  - (点与视点的xy距离 $<$ 3 *(kCoveragePointCloudResolution / 2) / tand(15) 且 点与视点的z轴距离$<$ 3* kCoveragePointCloudResolutio) 或 (点与视点的xy距离 $\leq$ kSensorRange 且 点与机器人的z轴距离$\leq$ 点与机器人的xy距离 * tand(15))
  - 通过lidar_model判断检测点不被遮挡
- 已覆盖的点周围的点
  - 将点云的z轴压缩为kCoverCloudZSqueezeRatio
  - 距离被覆盖的点的距离小于kCoverageDilationRadius

kCoverageOcclusionThr

### 1.10 `tare_planner_node`

入口代码，实例化`SensorCoveragePlanner3D`对象

### 1.11 `sensor_coverage_planner_ground`

核心函数`execute`

订阅的话题

- `/start_exploration`，执行`ExplorationStartCallback`
- `/registered_scan` 执行`RegisteredScanCallback`
- `/terrain_map` 执行`TerrainMapCallback`
- `/terrain_map_ext` 执行`TerrainMapExtCallback`
- `/state_estimation_at_scan` 执行`StateEstimationCallback`
- `/sensor_coverage_planner/coverage_boundary`用不到
- `/navigation_boundary`可以忽略
- `/sensor_coverage_planner/nogo_boundary`用不到
- `/joy`用不到
- `/reset_waypoint`用不到

发布的话题

- `/way_point` 给下层规划器使用
- `/exploration_finish` 探索结束了
- 其余都是用于可视化的话题

### 1.12 `keypose_graph`

`AddKeyposeNode`的内容较为复杂

1. 通过`for`循环遍历所有节点，寻找：空间上最近的关键点、距离阈值内的所有节点、时序上最后一个关键点
2. 如果找到最近的关键点节点&&距离足够远：此时如果与时序上最后一个关键点距离在范围内，那么添加节点并连接到最后一个关键点节点；否则添加节点并连接到最近的关键点节点
3. 遍历所有距离阈值内的节点，对每一条潜在的边进行碰撞检测，如果没有障碍物，则添加额外的边
4. 正常会返回新节点的索引，如果最近的关键点节点距离太近，则返回最近节点的索引

### 1.13 `grid_world`

`UpdateCellStatus`的内容较为复杂

1. 清除所有邻居单元格的视角点索引
2. 将视角点管理器中最新的候选视角点，按空间位置分配到对应的单元格中
3. 遍历所有邻居单元格，统计每个单元格中满足条件的视点的数量，断言所有视点都是候选视点。根据这些数量对单元格的数量进行转换
4. 清理那些不在邻域范围内的、处于“几乎覆盖”状态的单元格

| **当前状态** | **满足条件** | **目标状态** | **逻辑解释** |
| :--- | :--- | :--- | :--- |
| **EXPLORING** | 优质视角点太少，且没被选中的点 | **COVERED** | 判定该区域剩余信息价值极低，标记为探索完成。 |
| **COVERED** | 出现了得分极高的视角点 | **EXPLORING** | 发现该区域仍有高价值信息，需重新激活探索逻辑。 |
| **EXPLORING** | 条件尚不足以判定为完成，但也没有点被选中 | **ALMOST COVERED** | 状态模糊，标记为“即将完成”，进入观察名单。 |
| **非 COVERED** | 只要有视角点被选中执行 | **EXPLORING** | 只要该区域有活跃任务在执行，就必须维持探索状态。 |
| **EXPLORING** | 单元格内完全没有候选视角点 | **COVERED** | 特殊兜底：机器人就在跟前或由于初始访问，直接标记为覆盖。 |

`SolveGlobalTSP`

1. **确定机器人的规划起点** 由于机器人的实时位置可能不在关键位姿图的节点上，程序需要找一个合法的起点。优先找距离机器人最近且连通的图节点；其次使用当前记录的关键帧节点。实在不行查找邻居栅格中已记录的路线图连接点
目的： 确保路径规划是从一个“已知可达”的点开始的。
2. **筛选待探索的目标单元格** 遍历地图中所有的单元格，找出哪些需要被列入探索单元格列表。过滤条件： 状态为 EXPLORING，且满足（机器人不在附近或该区域已经访问过但目前没点可看）。可达性检查： 检查这些单元格的“连接点”是否在导航图中可达。不可达的单元格会被跳过，防止机器人困在死胡同。
3. **处理返航逻辑** 如果没有发现任何需要探索的单元格 将`return_home_`设为`true`。利用关键位姿图计算一条从当前位置回到起始点的最短路径。构建一个往返路径并返回，结束全局规划
4. **构建距离矩阵** 为了喂给TSP求解器，程序需要知道每两个目标点之间的“路程”。带图模式： 调用关键位姿图的函数计算两点间的实际行驶距离（考虑障碍物）。无图模式： 直接计算欧几里得距离（直线距离）。注意：这里距离乘以了10，通常是为了将浮点数转为整数以提高 TSP 算法的计算鲁棒性。
5. **解决旅行商问题(TSP Solve)** 输入：刚刚算好的距离矩阵，并将机器人当前位置设为“仓库（Depot）”，即起点。核心：调用`tsp_solver`算出访问所有目标点并返回起点的最优顺序。结果： 得到一个排序后的索引列表 node_index。
6. **生成最终的探索路径** 根据 TSP 的结果，把零散的点串成一条完整的路径。节点标记：ROBOT：路径起点；GLOBAL_VIEWPOINT：各个单元格的目标点；GLOBAL_VIA_POINT：路径中间经过的导航图节点（路人甲）。路径补全： 使用导航图在两个目标点之间填充实际的路径点，确保机器人不会撞墙。形成闭环： 将起点再次添加到路径末尾。

## 2. 参数解读

`kKeyposeCloudDwzFilterLeafSize` 从slam中接收的点云下采样参数

`kDirectionChangeCounterThr` 运动方向变化的阈值，超过这个阈值则激活动量机制

`kDirectionNoChangeCounterThr` 运动方向累计不变化的阈值，超过这个阈值则关闭动量机制

`kSurfaceCloudDwzLeafSize` 栅格内点云下采样参数

`kUseFrontier` 是否使用边界点，代码中并未声明此参数，因此边界点相关参数无用

`kPointCloudCellSize` 点云栅格的尺寸

`kPointCloudCellHeight` 点云栅格的高度

`kPointCloudManagerNeighborCellNum` 邻居栅格的数量

`kPointCloudRowNum` 点云栅格的行数

`kPointCloudColNum` 点云栅格的列数

`kPointCloudLevelNum` 点云栅格的层数

`kMaxCellPointNum` 弃用

`kUseCoverageBoundaryOnObjectSurface` 是否启用`sub_coverage_boundary_topic_`判断边界，默认关闭

`sub_coverage_boundary_topic_` 覆盖边界的话题名，在代码中只有订阅者没有发布者，需要手动发布，一帮情况下不用，因此`kUseCoverageBoundaryOnObjectSurface`默认为`false`

`kKeyposeCloudStackNum` 关键点云栈(本质是vector)的size

`kUseCoverageBoundaryOnFrontier` 从边界点云中提取垂直表面时是否要求启用`coverage_boundary`判断，默认为`false`

`kFrontierClusterMinSize` 从边界点云中提取垂直表面并进行聚类，聚类中的点需要满足的最小数量

`kKeyposeGraphCollisionCheckRadius` 判断点是否与环境中的障碍物发生碰撞时的搜索半径

`kSensorRange` 传感器的覆盖半径

`kCoverageOcclusionThr` 判断一个点是否可见时，需要这个点距离这个方向上的障碍物点云的距离超过这个阈值

`viewpoint_manager/number_x` `viewpoint_manager`中网格在`x`方向的数量

`viewpoint_manager/number_y` `viewpoint_manager`中网格在`y`方向的数量

`viewpoint_manager/number_z` `viewpoint_manager`中网格在`z`方向的数量

`viewpoint_manager/resolution_x` `viewpoint_manager`中网格在`x`方向的尺寸

`viewpoint_manager/resolution_y` `viewpoint_manager`中网格在`y`方向的尺寸

`viewpoint_manager/resolution_z` `viewpoint_manager`中网格在`z`方向的尺寸

`kNeighborRange` 查找视点邻居视点的搜索半径

`kViewPointCollisionMargin`

`kCollisionPointThr` 碰撞栅格中点云数量超过这个阈值才认为是障碍物

`kViewPointCollisionMarginZPlus` 当碰撞点与视点的高度差的z轴差距小于这个阈值才认为有可能碰撞

`kViewPointCollisionMarginZMinus` 当碰撞点与视点的高度差的z轴差距大于这个阈值的负数才认为有可能碰撞

`kLineOfSightStopAtNearestObstacle` 视线检查时使用**穿透障碍物策略**还是**最近障碍物停止策略**，`fasle`为**最近障碍物停止策略**

`kCheckDynamicObstacleCollision` 是否检查动态障碍物

`kCollisionFrameCountMax` 碰撞帧计数最大值，超过这个阈值说明动态障碍物已被移开

`kConnectivityHeightDiffThr` 认定一个点是连通的，它必须满足两个邻居结点的高度差小于此阈值

`kViewPointHeightFromTerrainChangeThreshold` 如果机器人所在视点的雷达模型高度与机器人位置的高度差值超过这个阈值，则用机器人的高度更新视点高度

`kViewPointHeightFromTerrain` 视点相对于地形点的高度差

`kAddEdgeVerticalThreshold` 增加边时垂直方向的阈值

`kAddEdgeConnectDistThr` 向keypose_graph中添加关键点位姿时，查找范围内节点的距离阈值

`kAddNodeMinDist`

`kMinAddPointNumSmall` 视点覆盖点数的小阈值

`kMinAddPointNumBig` 视点覆盖点数的大阈值

`kCellExploringToCoveredThr` 栅格内视点覆盖点数超过小阈值的数量仍小于这个阈值便可能从`EXPLORING`变为`COVERED`，默认为`1`，意味着栅格内每个视点的覆盖点数都不超过小阈值

`kCellCoveredToExploringThr` 栅格内视点覆盖点数超过大阈值的数量大于这个阈值便可能从`COVERED`变为`EXPLORING`，默认为`10`，意味着栅格内有不少于`10`个视点的覆盖点数都超过大阈值  
