---
title: Query-Based
date: 2026-07-12 21:54:32
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

## 1. 和LSS-Based的区别

LSS的核心是显式投影，在图像侧显式地为每个像素预测一个深度分布，然后用这个分布把图像特征“抬升”和“拍平”到BEV空间

Query的核心是隐式查询，它先有一个关于BEV空间的先验（BEV query），然后通过可微的注意力机制去“查询”2D图像中与该BEV位置最相关的区域，从而隐式地学习到从2D到3D的映射

## 2. Deformable DETR

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/fundamentalvision/Deformable-DETR',GitHub %}
{% btn 'https://arxiv.org/abs/2010.04159', ICLR 2021 %}
<!-- markdownlint-enable MD034 -->

创新点：将`Transformer`原本的“全局注意力”变成了“稀疏的局部注意力”

![deformabledetr-1.png](https://img.wblv66.top/end-to-end/deformabledetr-1.png)

### 2.1 传统多头注意力机制

设$z_q$为query元素，$x_k$为key元素，$x_v$为value元素。那么多头注意力机制特征的计算公式可以简写为

$$
\operatorname{MultiHeadAttn}(z_q,x_k) = \sum_{m}W_m [\sum_{k} A_{mkq} W_m^{'} x_v ]
$$

其中$m$为注意力头，$k$是key元素的索引，$W_m$对应多个特征头的权重矩阵，$W_m^{'}$是value的权重矩阵，$A_{mkq}$是注意力权重，计算公式为

$$
A_{mkq} = \operatorname{Softmax} (\frac{z_q^\top U_m^\top V_m x_k}{\sqrt{C_v}})
$$

其中$V_m,U_m$是$x_k,z_q$的对应权重

`Transformer`需要较长的训练周期才能收敛，因为在参数初始化阶段，$U_m z_q$和$V_m x_k$会服从一个均值为 0、方差较小的分布，经过`Softmax`操作后会导致权重趋于平均，反向传播的梯度极其微弱。在图像领域，query元素通常对应图像的像素，数量庞大，难以收敛。因此提出`Deformable Attention`进行改进

### 2.2 Deformable注意力机制

$$
\operatorname{DeformAttn}(z_q,p_q,x) = \sum_{m}W_m [\sum_{k} A_{mkq} W_m^{'} x(p_q+\Delta p_{mqk}) ]
$$

其中$m$为注意力头，$k$是key元素的索引，$A_{mkq}$是注意力权重，$x$为特征图，$p_q$为参考点，即query在特征图的大概位置，$\Delta p_{mqk}$为相对于参考点的偏移，$W_m^{'}$为value权重

$p_q+\Delta p_{mqk}$是为了得到最终的采样位置，与特征图$x$相乘可以得到具体的特征向量。在标准`Attention`中注意力权重是通过query和key相乘得到的，但这里是从query学习得到的；相对于参考点的偏移$\Delta p_{mqk}$也是从query学习得到的

所以对于每个query，模型先预测一个2D参考点，也就是它大概认为物体在哪，模型接着预测几个偏移量，看看这几个位置的特征，最终根据注意力权重计算这几个采样点的权重。这样就不需要看所有像素了

稀疏的局部注意力并不是通过约束注意力矩阵实现的，而是通过约束query实现的

## 3. BEVFormer

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/fundamentalvision/BEVFormer',GitHub %}
{% btn 'https://ieeexplore.ieee.org/abstract/document/10791908/', TPAMI %}
<!-- markdownlint-enable MD034 -->

![bevformer-1.png](https://img.wblv66.top/end-to-end/bevformer-1.png)

### 3.1 相关概念

BEV感知空间与BEV query

**BEV空间**以自车为中心的栅格化二维平面，$\mathbb{R} ^{H \times W \times 1}$

**BEV感知空间**把BEV平面在z轴方向选取$N_{ref}$个3D参考点进行扩展，以覆盖上坡下坡、高大目标物场景，$\mathbb{R} ^{H \times W \times N_{ref}}$

**BEV queries**预定义的一组栅格形可学习参数，这些queries与空间栅格一一对应，某一个栅格的query为单数，复数表示整个空间的query，$\mathbb{R} ^{H \times W \times C}$，这里的$C$为一个query的尺寸，与z轴尺寸无关。在输入到BEVFormer之前，BEV Queries加上了可学习的位置编码

### 3.2 数据预处理

多视角相机图像通过Backbone提取特征

LiDAR点云通过三维骨干网直接投影生成当前帧的LiDAR BEV特征

在BEV网格预定义了一组可学习的参数Queries

### 3.3 时间自注意力机制

首先根据车辆的自车运动（Ego-motion）参数，将$t-1$时刻的历史BEV特征$B_{t-1}$对齐到当前$t$时刻，得到对齐后的 $B'_{t-1}$

query在BEV网格中的坐标为$(x,y)$，利用`2D deformable attention`以$(x,y)$作为参考点在其周围对$B'_{t-1}$进行特征采样

### 3.4 空间交叉注意力机制

**LiDAR**：由于LiDAR BEV特征本身就在BEV网格，不存在透视误差。因此，BEV Queries直接使用`2D deformable attention`以$(x,y)$作为参考点在其周围对LiDAR BEV特征进行特征采样

**Camera**：

1. 对每一个$(x,y)$处的BEV query，计算真实世界中的坐标，并在z方向进行lift操作。即设置$N_{ref}$个3D参考点
2. 通过相机内外参，把3D参考点投影到相机图像上。受相机感知范围限制，每个3D参考点一般只在 1-2 个相机上找到有效的投影点（反过来描述，每个相机的features只与部分BEV queries构成有效投影关系）。
3. 使用`2D deformable attention`以像素点作为参考点在其周围对Camera BEV特征进行特征采样
4. 将所有高度、所有命中视角采样出来的图像特征进行加权求和，作为该 BEV query获得的视觉特征

**多模态融合**：使用一个可学习的权重参数$\alpha$，将 LiDAR采样出的空间特征与Camera采样出的空间特征进行自适应加权融合


---
参考文章

[Deformable DETR模型](https://zhuanlan.zhihu.com/p/1986806068278478080)

[一文读懂BEVFormer论文](https://zhuanlan.zhihu.com/p/538490215)
