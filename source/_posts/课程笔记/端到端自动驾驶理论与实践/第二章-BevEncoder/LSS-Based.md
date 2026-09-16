---
title: LSS-Based
date: 2026-07-07 20:47:21
# updated:
# tags:
#     - 
categories: 
          - 课程笔记
          - 端到端自动驾驶理论与实践
          - 第二章-BevEncoder
# keywords:
# description:
top_img: transparent
# comments:
# cover:
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
---

## 1. BEV相关概念

### 1.1 BEV网格

在自车周围俯视平面x-y方向划分$n$个网格，每个网格表示特定物理距离$d$米。自车中心（自动驾驶的的车辆中心一般指后轴中心）在网格中心位置。类似于机器人中的栅格地图

### 1.2 BEV特征图

在BEV网格的所有格子中都填充$C$个通道的特征值作为内容（contex），就组成了BEV特征图。每个格子中$C$通道特征值都要来自格子所对应空间的特征信息，而不是胡乱地填充其它地方的特征信息

BEV方法的核心目标是：为BEV网格中每个格子组织并填充合适的特征信息，得到BEV特征图

## 2. LSS

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/nv-tlabs/lift-splat-shoot',GitHub %}
{% btn 'https://arxiv.org/abs/2008.05711', ECCV 2020 %}
<!-- markdownlint-enable MD034 -->

### 2.1 图片预处理

通过`CNN`网络从原始图片中提取特征，特征为长度为$C$的向量，于是预处理后得到$[B, N, H, W, C]$的特征张量，其中$B$是Batch Size，$N$是相机个数$H, W$是特征图大小

### 2.2 Lift升维

从2D图像中恢复图像的深度信息，这里恢复的深度信息并非确定的值，而是概率分布。文中将深度离散为$4m-44m$中步长为$1m$的$41$个点，那么深度的维度为$D=41$

`Lift`时对每个$C$维的特征点$c$和$D$维的深度分布概率$\alpha$做外积操作。这被称为软性分配（Soft Association）。即对每个深度都分配特征向量，并根据分布概率对特征值进行缩放，以此保留了不确定性

![lss-1.png](https://img.wblyu.top/end-to-end/lss-1.png)

最终得到了$[B, N, D, H, W, C]$的**特征张量**，其中$D$是深度切片数。每个$[D, H, W, C]$都是一个视锥点云

![lss-2.png](https://img.wblyu.top/end-to-end/lss-2.png)

### 2.3 坐标变换

因为视锥点云是位于相机坐标系下的，需要变换到自车坐标系下

首先利用“内参”、“相似三角形”、“提取特征点时的缩放比例”，把 $H, W$转换成相机坐标系下的物理坐标

然后利用“外参”，转到自车坐标系下，可以得到$[B, N, D, H, W, 3]$的**位置张量**，其中$B$是Batch Size，$N$ 是相机个数，$D$是深度切片数，$H, W$是特征图大小，最后的$3$代表3D物理空间坐标$(x, y, z)$

### 2.4 Splat

此时需要将每个视锥点放进BEV网格中（pooling）

1. 读取**位置张量**，判断每个点落在BEV网格的哪个格子中
2. 根据网格索引对所有点进行排序，使同一网格的点连续排列
3. 去**特征张量**中把对应特征向量取出，并对**所有点**的特征进行累加（前缀和）
4. 根据每个网格的起始点索引和结束点索引，获取边界的累计和，二者作差（边界减法）便得到对应网格的特征值

这种方法会产生大量无用值

最终得到了$[L, W, C]$的BEV特征图，其中$L, W$是BEV网格的大小

## 3. CaDDN

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/TRAILab/CaDDN',GitHub %}
{% btn 'https://arxiv.org/abs/2008.05711', CVPR 2021 %}
<!-- markdownlint-enable MD034 -->

创新点：引入了显式深度监督学习；提出线性增加的离散化（linearly increasing bin sizes，LID）方法

![caddn-1.png](https://img.wblyu.top/end-to-end/caddn-1.png)

### 3.1 Lift

此部分对应从图像生成视锥特征（Frustum Feature）的过程

首先使用`ResNet`作为主干网络提取特征，然后分别预测深度信息$[W,H,D]$和降维得到语义特征$[W,H,C]$。将二者外积便得到视锥特征

为了提升深度估计精度，在此环节引入了有监督学习

第一步：生成真值（Ground Truth）

1. 将3D激光雷达的点云投影到图像平面上
2. 由于点云稀疏，需要进行像素补全
3. 对深度进行离散化，保证真值与深度的离散值保持一致，最终得到`One-Hot`向量如$[0,0,1,0,0]$

第二步：根据预测值与真值计算Loss

这里为了保证深度分布符合近密远疏的特点，采用LID。即近处划分的稠密些，远处稀疏些

![caddn-2.png](https://img.wblyu.top/end-to-end/caddn-2.png)

### 3.2 Splat

此部分对应从视锥特征生成体素特征（Voxel  Feature）再生成BEV特征（BEV  Feature）的过程

在从Frustum转换到Voxel时采用的是从体素空间反向投影到视锥空间进行采样，而不是正向投影，这里也会再次用到LID离散化的值。可能有的体素找不到对应的视锥点，于是会用到插值方法

这里使用反向投影是为了提高GPU的计算效率。如果正向投影，多个视锥点可能会投影到同一个体素内，GPU写入内存时可能会造成写冲突，在工程上浪费资源和时间。方向投影时，写入的地址是互相独立的

将体素特征拍平就可以得到BEV特征

### 3.3 3D目标检测

目标检测不是本教材重点，忽略

## 4. BEVDet

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/HuangJunJie2017/BEVDet',GitHub %}
{% btn 'https://arxiv.org/abs/2112.11790', arxiv %}
<!-- markdownlint-enable MD034 -->

创新点：在BEV空间中进行数据增强；改进NMS(非极大值抑制)，用于目标检测中，目的是消除冗余的检测框

![bevdet-1.png](https://img.wblyu.top/end-to-end/bevdet-1.png)

### 4.1 图像编码器（Image-view Encoder）

使用`backbone`（主干）提取高维特征，`neck`（连接）对多分辨率特征进行融合

### 4.2 视图转换器（View Transformer）

将图像特征变换为BEV特征，类似`LSS`

1. **Lift**，外积后得到视锥点云
2. **将视锥点云变换到车体坐标系下**
3. **pooling**，得到BEV特征图

### 4.3 BEV编码器（BEV Encoder）

对得到的BEV特征提取多尺度特征

### 4.4 3D目标检测（Head）

实现最终的3D目标检测任务

## 5. BEVFusion

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/mit-han-lab/bevfusion',GitHub %}
{% btn 'https://arxiv.org/abs/2205.13542', ICRA2023 %}
<!-- markdownlint-enable MD034 -->

创新点：提出了多模态输入（相机+雷达）和多任务输出（检测+分割）；设计了高效的相机到BEV变换；将BEV作为多模态融合的统一空间

![bevfusion-1.png](https://img.wblyu.top/end-to-end/bevfusion-1.png)

### 5.1 相机到BEV

使用`Swin Transformer`+`FPN`网络作为编码器以提取特征并融合

通过`Lift`操作将特征变为视锥点云，然后通过`BEV Pooling`操作得到密集的BEV特征图

### 5.2 雷达到BEV

使用`VoxelNet`将点云体素化，然后通过3D稀疏卷积提取特征

由于激光雷达特征原本就在3D空间，只需沿高度轴展平即可得到稀疏的BEV特征图

### 5.3 两个BEV特征融合

对两个特征进行性插值对齐到同一个分辨率，然后输入到全卷积的BEV编码器中输出融合的BEV特征。即通过可变形注意力模块来解决空间误差

### 5.4 多任务特征头

融合后的BEV特征被直接送入不同的任务头实现检测和分割

### 5.5 Pooling的改进

由于相机的内参和外参以及离散化分割是固定不变的，因此可以提前计算所有像素的3D坐标和BEV网格索引（预计算）

为每一个BEV网格分配一个GPU线程，只计算此网格的特征值和（间隔归约）

---
参考文章

[一文读懂BEV自底向上方法：LSS 和 BEVDepth](https://zhuanlan.zhihu.com/p/567880155)

[CVPR | 3D Detection | CaDDN](https://zhuanlan.zhihu.com/p/388593810)

[BEVDet 算法详细解读 - 全网最全攻略](https://juejin.cn/post/7530535140376739878)