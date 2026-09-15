---
title: 'Sparse BEV'
date: 2026-07-13 19:12:41
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

## 1. Sparse BEV

多数Sparse BEV方法不生成稠密的BEV网格，而是直接使用稀疏的3D查询（Query）与多视角图像特征交互，从而绕过稠密特征图的构建

优势：降级计算消耗；感知范围远；可达150米甚至更远（Dense只有前后50米左右）；

## 2. DETR3D

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/WangYueFt/detr3d',GitHub %}
{% btn 'https://arxiv.org/abs/2110.06922', CORL 2021 %}
<!-- markdownlint-enable MD034 -->

![detr3d-1.png](https://img.wblv66.top/end-to-end/detr3d-1.png)

### 2.1 图像特征提取

使用ResNet-FPN骨干网络对图像进行特征提取，得到多尺度2D特征图

### 2.2 2D到3D特征变换

1. 维护一组稀疏的、可学习的3D目标查询，queries
2. 每一个3D query会通过子网络预测出参考点，作为bbox的三维中心点坐标
3. 通过相机外参将参考点变换到相机2D平面上
4. 利用双线性插值采样得到2D图像特征，如果3D点投影到了图像外则过滤掉
5. 对特征进行聚合，用多头自注意力机制更新queries

### 2.3 缺点

1. 3D参考点难学，将3D参考点投影回相机平面时，如果参考点预测不准会导致投影回的位置位于目标区域外，会采样到无效特征
2. 参考点限制了特征提取范围
3. 特征采样过程复杂

## 3. PETR

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/megvii-research/PETR',GitHub %}
{% btn 'https://arxiv.org/abs/2203.05625', ECCV 2022 %}
<!-- markdownlint-enable MD034 -->

创新点：解决了DETR3D中将参考点投影回2D的缺点，此论文给特征点增加了3D坐标属性

![petr-1.png](https://img.wblv66.top/end-to-end/petr-1.png)

### 3.1 2D图像特征提取

通过backbone从图像中提取特征

### 3.2 3D坐标生成

在视锥空间中进行深度估计，并采用线性增加的离散化方法。随后利用相机的内外参将视锥空间中的点云变换到3D空间中

### 3.3 3D位置编码

将3D坐标通过多层感知机（MLP）转成位置编码并与2D图像特征相加

### 3.4 Transformer解码

在3D空间中在$[0,1]$范围内均匀初始化一组可学习的3D锚点，通过MLP生成3D目标查询query。将3D感知特征压平作为key和value，与锚点进行交互

## 4. PETRv2

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/megvii-research/PETR',GitHub %}
{% btn 'https://arxiv.org/abs/2206.01256', ICCV 2023 %}
<!-- markdownlint-enable MD034 -->

![petr-2.png](https://img.wblv66.top/end-to-end/petr-2.png)

### 4.1 引入了历史帧

`PETR`只看单帧，无法估计物体速度，v2引入了历史帧$t-1$。其中$t-1$时刻的3D坐标会根据车辆运动姿态变换到$t$帧坐标系下，然后将对其的两帧3D坐标拼接，同时也将两帧的2D特征图拼接

### 4.2 特征引导位置编码

![petr-3.png](https://img.wblv66.top/end-to-end/petr-3.png)

v2中将value和key分开输出，从2D特征得到value。将2D图像特征与3D位置编码进行加权，从而产生与图像内容绑定的3D位置感知特征，作为key

这样使得图像特征中包含的“隐式深度信息”能够实时修正3D位置编码，显著提高了系统对相机抖动、安装误差等外参噪声的鲁棒性

### 4.3 定义多种query

根据不同任务的需求定义了多种query，分别用于3D目标检测、BEV分割、3D车道线检测

---
参考文章

[DETR3D原理分析与代码解读](https://zhuanlan.zhihu.com/p/587380480)
