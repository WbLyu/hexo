---
title: "VAD: Vectorized Scene Representation for Efficient Autonomous Driving"
date: 2026-07-17 19:35:09
# updated:
# tags:
#     - 
categories: 
          - 论文解读
          - 端到端
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
cover: https://img.wblyu.top/images/800c76d57e1f31c5b4a1f862ce59929f.avif
---
<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hustvl/VAD',GitHub %}
{% btn 'https://arxiv.org/abs/2303.12077',ICCV 2023 %}
<!-- markdownlint-enable MD034 -->

## 1. 简介

本文贡献

1. 将场景建模为向量化表示，舍弃了传统的稠密删格化表示和人工设计的后处理
2. 通过查询交互和矢量化规划约束，隐式和显式地利用矢量化场景信息来提高规划安全性
3. 性能好，设计简洁推理速度快

![vad-1.png](https://img.wblyu.top/end-to-end/vad-1.png)

## 2. 相关工作

## 3. 方法

![vad-1.png](https://img.wblyu.top/end-to-end/vad-2.png)

<!-- 1. 首先使用ResNet50（backbone）从输入的多帧多视角图片提取图片特征，然后使用FPN（neck）融合多尺度特征，最后借助BEVFormer的编码器得到BEV特征
2. 使用一组map query从个BEV特征中提取信息得到map向量和更新后的map query
3. 使用一组agent query从个BEV特征和更新后的map query中提取信息得到agent向量和更新后的agent query。并使用MLP从agent query中解码得到agent的属性
4. ego query先与agent query进行注意力交互 -->

1. 首先从输入的多帧多视角图片中得到BEV特征
2. 使用一组map query从个BEV特征中提取信息得到map向量和更新后的map query，具体见3.1
3. 使用一组agent query从个BEV特征和更新后的map query中提取信息得到motion向量和更新后的agent query，具体见3.1
4. ego query与agent query和map query进行注意力交互，并接收上层的驾驶指令和自车状态（可选），最终输出自车轨迹，具体见3.2
5. 自车轨迹会和map向量、motion向量一起输入到规划约束中，以此计算loss，具体见3.3

### 3.1 向量化场景学习

**向量化map**

得到的除了map向量和map query之外，还有每个map类别的置信度，用来计算loss。map的类别包括：车道线、道路边界、人行横道。map向量的尺寸为$\hat{V}_m \in \mathbb{R}^{N_m \times N_p \times 2}$。其中$N_m$代表向量的数量，$N_p$代表每个向量的点数，$2$代表横、纵坐标

**向量化agent motion**

得到的除了motion向量和agent query之外，还有每个agent的属性以及预测多条运动轨迹的置信度，用来计算loss。agent的属性包括：位置、朝向、类别置信度（轿车、卡车、自行车等）、尺寸等。motion向量的尺寸为$\hat{V}_a \in \mathbb{R}^{N_a \times N_k \times T_f \times 2}$。其中$N_a$代表agent的数量，$N_k$代表运动模态的种类，$T_f$代表预测的时间步

### 3.2 通过交互规划

**ego与agent交互**

首先随机初始化ego query $Q_{ego}$，将agent query视为key和value，二者传入Transformer的解码器。ego的位置$p_{ego}$和agent的位置$p_{a}$通过单层MLP编码后分别称为query的位置嵌入和key的位置嵌入，公式写为
$$
\begin{gathered}
Q_{ego}^{'}= \operatorname{TransformerDecoder}(q,k,v,q_{pos},k_{pos}) \\
q=Q_{ego},k=v=Q_a \\
q_{pos} = \operatorname{PE_1}(p_{ego}),k_{pos} = \operatorname{PE_1}(p_{a})
\end{gathered}
$$

**ego与map交互**

采用类似的方式令更新后的ego query $Q_{ego}^{'}$与map query $Q_m$交互。唯一不同的是这次使用不同的MLP来编码ego的位置$p_{ego}$和map元素的位置$p_{m}$，公式写为
$$
\begin{gathered}
Q_{ego}^{''}= \operatorname{TransformerDecoder}(q,k,v,q_{pos},k_{pos}) \\
q=Q_{ego}^{'}k=v=Q_m \\
q_{pos} = \operatorname{PE_2}(p_{ego}),k_{pos} = \operatorname{PE_2}(p_{m})
\end{gathered}
$$

**规划头**

因为VAD舍弃了高精地图，因此导航时需要一个高位驾驶指令$c$，通常使用三种指令：左转、右转和直行。因此规划头接收 更新的ego query $Q_{ego}^{'},Q_{ego}^{''}$、驾驶指令$c$以及可选的输入———自车当前的状态信息$s_{ego}$。规划头会输出规划出的轨迹$\hat{V}_{ego} \in \mathbb{R} ^{T_f \times 2}$，规划头基于简单的MLP，公式写为

$$
\begin{gathered}
\hat{V}_{ego}= \operatorname{PlanHead}(f_t = f_{ego},cmd=c) \\
f_{ego} = [Q_{ego}^{'},Q_{ego}^{''},s_{ego}]
\end{gathered}
$$

### 3.3 向量规划约束

![vad-3.png](https://img.wblyu.top/end-to-end/vad-3.png)

**ego-agent碰撞约束**

此约束是避免自车与其他参与者发生碰撞。首先使用阈值$\epsilon_a$剔除掉低置信度的agent，对每个agent只选择置信度最大的轨迹。自车只需要在横向上保持较小的安全距离$\delta _X$但是需要在纵向上保持较大的安全距离$\delta _Y$，自车规划出的轨迹在不同时刻与最近agent的距离记为$d_a^{it}$，其中$t$为不同时间点，$i$为横纵两种方向，公式为

$$
\begin{gathered}
\mathcal{L}_{col} = \frac{1}{T_f} \sum_{t=1}^{T_f} \sum_{i}^{} \mathcal{L}_{col}^{it} ,i \in \{X,Y\} \\
\mathcal{L}_{col}^{it} = 
\left\{
\begin{array}
{ll}\delta _i - d_a^{it} & \text{if }d_a^{it} < \delta _i \\
0 & \text{otherwise}
\end{array}
\right.
\end{gathered}
$$

**ego-boundary越界约束**

此约束是让自车远离道路边界。依旧首先使用阈值$\epsilon_m$剔除掉低置信度的map元素（道路边界），自车规划出的轨迹在不同时刻与最近地图边界线的距离记为$d_{bd}^{t}$

$$
\begin{gathered}
\mathcal{L}_{bd} = \frac{1}{T_f} \sum_{t=1}^{T_f} \mathcal{L}_{bd}^{it} \\
\mathcal{L}_{bd}^{it} = 
\left\{
\begin{array}
{ll}\delta _{bd} - d_{bd}^{t} & \text{if }d_{bd}^{t} < \delta _{bd} \\
0 & \text{otherwise}
\end{array}
\right.
\end{gathered}
$$

**ego-车道方向约束**

此约束是让自车不会逆行。依旧首先使用阈值$\epsilon_m$剔除掉低置信度的map元素（车道），在$\delta _{dir}$范围内寻找最近的车道向量$\hat{v}_m$

$$
\mathcal{L}_{dir} = \frac{1}{T_f} \sum_{t=1}^{T_f} F_{ang}(\hat{v}_m^t,\hat{v}_{ego}^t)
$$

其中$\hat{v}_{ego}^t$是规划出的第$t-1$个路径点指向第$t$个路径点；$F_{ang}$是计算向量夹角

### 3.4 端到端学习

**map loss**

采用曼哈顿距离来计算预测map点与真实map点之间的回归损失；并采用focal损失来计算map类别的损失。map的总体损失记为$\mathcal{L}_{map}$

**motion loss**

对于agent首先采用$\ell _1$损失计算预测agent属性（位置、朝向、尺寸等）的回归损失，并使用focal损失计算agent类别的损失。

对于motion，每个agent预测了$N_k$条motion，选择最终位移误差最小的motion作为代表性预测motion。然后计算该代表性motion与真实motion之间的$\ell _1$损失作为motion回归损失，同时采用focal损失作为多模态运动分类损失。总体损失记为$\mathcal{L}_{mot}$

**模仿学习损失**

计算预测轨迹和真实轨迹的$\ell _1$损失
$$
\mathcal{L}_{imi}=\frac{1}{T_f} \sum_{T_f}^{t=1} \lVert V_{ego}^t - \hat{V}_{ego}^t \rVert_1
$$


总损失是各损失的加权和
$$
\mathcal{L} = \omega _1 \mathcal{L}_{map} + \omega _2 \mathcal{L}_{mot} + \omega _3 \mathcal{L}_{col} + \omega _4 \mathcal{L}_{bd} + \omega _5 \mathcal{L}_{dir} + \omega _6 \mathcal{L}_{imi}
$$

## 4. 实验

在`nuScenes`上进行开环测试，在`carla`上进行闭环测试

代码分为`VAD-Tiny`和`VAD-Base`


## 5. 总结