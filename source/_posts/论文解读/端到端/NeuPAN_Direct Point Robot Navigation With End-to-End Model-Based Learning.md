---
title: "NeuPAN: Direct Point Robot Navigation With End-to-End Model-Based Learning"
date: 2026-04-22 21:46:17
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
cover: https://img.wblyu.top/images/02f3235bb4553eda52ae1c734162daf6.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hanruihua/neupan',GitHub %}
{% btn 'https://ieeexplore.ieee.org/abstract/document/10938329',TRO %}
{% btn 'https://arxiv.org/pdf/2403.06828.pdf',Arxiv %}
{% btn 'https://youtu.be/SdSLWUmZZgQ',YouTube %}
{% btn 'https://www.bilibili.com/video/BV1Zx421y778',Bilibili %}
{% btn 'https://hanruihua.github.io/neupan_project',Website %}
{% btn 'https://github.com/hanruihua/neupan_ros',ROS %}
<!-- markdownlint-enable MD034 -->

代码解读请参考{% post_link 代码解读/端到端/NeuPAN代码解读  NeuPAN代码解读%}

## 3. 问题陈述

### 3.1 机器人运动学

### 3.2 机器人模型

可以将机器人本体看成一个紧凑的凸集，初始状态用锥不等式表示为
$$
\mathbb{C} = \left\{ \bm{x} \in \mathbb{R} ^n \mid \bm{Gx} \preceq_{\mathcal{K}}\bm{h}  \right\}
$$

具体解释请参考{% post_link 论文解读/机器人模块化/"Optimization-Based Collision Avoidance"  OBCA%}

由于机器人在不断运动，因此给定状态$\bm{s}_t$，第$t$帧的占用空间表示为凸紧集$\mathbb{Z}_t$
$$
\mathbb{Z}_t(\bm{s}_t) = \left\{ \bm{R}_t(\bm{s}_t)\bm{x} + \bm{t}_t(\bm{s}_t) \mid \bm{x} \in \mathbb{C} \right\}
$$

本质上是对$\mathbb{C}$进行旋转和平移

### 3.3 点级碰撞规避约束

这篇文章使用点来表示障碍物，而非占据栅格或是锥不等式来拟合障碍物，因此机器人与障碍物的最小距离可以表示为
$$
\begin{align*}
&\operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{P}_t) \\
=& \min _{\bm{e}} \ \left\{ \lVert \bm{e} \rVert_2 \mid (\mathbb{Z}_t(\bm{s}_t) + \bm{e} \cap \mathbb{P}_t) \neq \emptyset \right\}  \\
=& \min \ \left\{ \bm{D}^1_{t}(\mathbb{Z}_t(\bm{s}_t),\bm{p}_t^1),\dots, \bm{D}^M_{t}(\mathbb{Z}_t(\bm{s}_t),\bm{p}_t^M) \right\}
\end{align*}
$$
式中$\bm{e}$代表让两个集合接触的最小平移向量；$\bm{D}^i_{t}(\mathbb{Z}_t(\bm{s}_t),\bm{p}_t^i)$代表机器人与点的最小距离

计算机器人与点的最小距离是一个凸优化问题
$$
\begin{align*}
\min _{\bm{x}} \ &\lVert \bm{R}_t(\bm{s}_t) \bm{x} + \bm{t}_t(\bm{s}_t) - \bm{p}^i_t \rVert \\
\text{s.t.} \ & \bm{Gx} \preceq _{\mathcal{K}} \bm{h}
\end{align*}
$$

### 3.4 目标函数

MPC控制的目标是让机器人尽量以期望速度沿着期望轨迹运动
$$
C_0(\mathcal{S},\mathcal{U}) = \sum_{h=t}^{t+H} (\lVert \bm{q} \circ (\bm{s}_{h+1}-\bm{s}_{h+1}^\diamondsuit)  \rVert_2^2 + \lVert \bm{p} \circ (\bm{u}_{\text{speed},h}-\bm{u}_{\text{speed}}^\diamondsuit)  \rVert_2^2)
$$
其中$\left\{ \bm{q},\bm{p} \right\}$是权重系数，分别影响机器人尽量沿期望轨迹和尽量保持期望速度

### 3.5 问题表述

直接点机器人导航问题被表述为以下在预测范围$\mathcal{H}$上的模型预测感知与控制（MPPC）优化问题
$$
\begin{align*}
P : \min _{ \left\{ \mathcal{S},\mathcal{U} \right\} \in \mathcal{F} } \ &C_0(\mathcal{S},\mathcal{U}) \\
\text{s.t.} \ & \operatorname{dist} (\mathbb{Z}_h(\bm{s}_h),\mathbb{P}_h) \geq d_{\min} , \forall h \in \mathcal{H}
\end{align*}
$$

技术挑战：内部层的距离计算涉及到大量点级约束，数量可能达到数千。现有的方法将其转换为凸集、体素或网格来减少约束。然而，这会导致求解精度下降

## 4. NEUPAN系统架构

### 4.1 数学解释

根据机器人与点的最小距离的强对偶性，可以把它转化为拉格朗日对偶问题（推导过程为了简洁省略$\bm{s}_t$和$^i_t$）
$$
\begin{align*}
D_t^i = \min _{\bm{x},\bm{y}} \ & \lVert \bm{y} \rVert_2 \\
\text{s.t.} \ &  \bm{Gx} \preceq _{\mathcal{K}} \bm{h} \\
&\bm{Rx} + \bm{t} - \bm{p} - \bm{y} = 0 \\
= \max _{\bm{\mu},\bm{\lambda}} \min _{\bm{x},\bm{y}} \ & \lVert \bm{y} \rVert_2 + \bm{\mu}^\top(\bm{Gx}-\bm{h}) + \bm{\lambda}^\top(\bm{Rx} + \bm{t} - \bm{p} - \bm{y}) \\
\text{s.t.} \ & \bm{\mu} \succeq _{\mathcal{K}^*} 0 \\
= \max _{\bm{\mu},\bm{\lambda}} \min _{\bm{y}} \ &  \lVert \bm{y} \rVert_2 - \bm{\lambda }^\top \bm{y} + \min _{\bm{x}} \ \bm{\mu}^\top \bm{Gx} + \bm{\lambda}^\top\bm{Rx} -\bm{\mu} ^\top \bm{h} +\bm{\lambda}^\top \bm{t} - \bm{\lambda} ^\top \bm{p} \\
\text{s.t.} \ & \bm{\mu} \succeq _{\mathcal{K}^*} 0 \\
= \max _{\bm{\mu},\bm{\lambda}} \ & -\bm{\mu} ^\top \bm{h} +\bm{\lambda} ^\top (\bm{t} - \bm{p}) \\
\text{s.t.} \ & \bm{\mu} \succeq _{\mathcal{K}^*} 0 \\
& \lVert \bm{\lambda} \rVert_* \preceq 1 \\
& \bm{\mu}^\top \bm{G} + \bm{\lambda}^\top\bm{R} = 0 \\
\end{align*}
$$
点$\bm{p}$可以变换到机器人坐标系中，即先反向平移再反向旋转
$$
\begin{align*}
\max _{\bm{\mu},\bm{\lambda}} \ & -\bm{\mu} ^\top \bm{h} +\bm{\lambda} ^\top (\bm{t} - \bm{p}) \\
= \max _{\bm{\mu},\bm{\lambda}} \ & -\bm{\mu} ^\top \bm{h} -\bm{\lambda} ^\top \bm{RR}^\top(\bm{p} - \bm{t})  \\
= \max _{\bm{\mu},\bm{\lambda}} \ & -\bm{\mu} ^\top \bm{h} -\bm{\lambda} ^\top \bm{R} \widetilde{\bm{p}}  \\
= \max _{\bm{\mu},\bm{\lambda}} \ & \bm{\mu} ^\top(\bm{G} \widetilde{\bm{p}} - \bm{h}) \\
\end{align*}
$$

其中最后一步变换用到了等式约束的条件，最终的形式可以写为
$$
\begin{align*}
D_t^i = \max _{\bm{\mu}_t^i,\bm{\lambda}_t^i} \ & \bm{\mu}_t^{i\top}(\bm{G} \widetilde{\bm{p}}_t^i(\bm{s}_t) - \bm{h}) \\
\text{s.t.} \ & \bm{\mu}_t^i \succeq _{\mathcal{K}^*} 0 ,\quad \lVert \bm{\lambda}_t^i \rVert_* \preceq 1  \\
& \bm{\mu}_t^{i\top} \bm{G} + \bm{\lambda}_t^{i\top}\bm{R}(\bm{s}_t) = 0  \\
\end{align*}
$$
其中$\widetilde{\bm{p}}_t^i = \bm{R}_t(\bm{s}_t)^\top \left[ \bm{p}_t^i -  \bm{t}_t(\bm{s}_t)  \right]$。并且$\bm{\mu}_t^i$定义了边是否与碰撞相关；$\bm{\lambda}_t^i$决定了了分离超平面的法向量，证明如下

> 根据KKT中的互补松弛性
> $$
> \bm{\mu}^\top(\bm{Gx}-\bm{h}) = 0
> $$
> 即当边与碰撞无关时，$\bm{x}$位于锥不等式的内部，此时$(\bm{Gx}-\bm{h})$不为零，则$\bm{\mu}_t^i$为零；相反，当边与碰撞无关时，$\bm{x}$位于锥不等式的边界，此时$(\bm{Gx}-\bm{h})$为零，则$\bm{\mu}_t^i$为正数
>
> 令对偶目标为正
> $$
> (\bm{G}^\top \bm{\lambda})^\top \bm{x} = \lambda^\top (\bm{Gx}) \leq \bm{\lambda}^\top \bm{h} <  \bm{\lambda}^\top \bm{G} \widetilde{\bm{p}}
> $$
> 这说明$\bm{G}^\top \bm{\lambda}$定义的超平面分离了$x$和$\widetilde{\bm{p}}$

基于以上直觉，将$\mathcal{M} = \left\{ \bm{\mu}_t^i \in \mathbb{R} ^l\right\}$和$\mathcal{L} = \left\{ \bm{\lambda}_t^i \in \mathbb{R} ^n\right\}$定义为隐式距离特征，即神经网络的中间量，并且满足约束下的所有隐式距离特征的集合可以表示为$\left\{ \mathcal{M} , \mathcal{L} \right\} \in \mathcal{G}$

通过将约束转为罚函数的方式，可以将原问题P重新表述为等价形式Q
$$
\begin{gather*}
Q: \min _{ \left\{ \mathcal{S},\mathcal{U} \right\} \in \mathcal{F},  \left\{ \mathcal{M},\mathcal{L} \right\} \in \mathcal{G} } \underbrace{C_0(\mathcal{S},\mathcal{U}) + C_r(\mathcal{S},\mathcal{M},\mathcal{L})}_{C_{e2e}(\mathcal{S},\mathcal{U},\mathcal{M},\mathcal{L})} \\
\begin{aligned}
    C_r(\mathcal{S},\mathcal{M},\mathcal{L}) = &\frac{\rho _1}{2} \sum_{h=t}^{t+H} \sum_{i=0}^{M} \lVert \min (I(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i),0) \lVert_2^2 \\
    &+ \frac{\rho _2}{2}\sum_{h=t}^{t+H} \sum_{i=0}^{M} \lVert E(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i) \lVert_2^2
\end{aligned} \\
I(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i) = -\bm{\mu}_h^{i \top} \bm{h} +\bm{\lambda}_h^{i \top} (\bm{t}_h(\bm{s}_h) - \bm{p}_h^i) - d_{min} \\
E(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i) = \bm{\mu}_h^{i\top} \bm{G} + \bm{\lambda}_h^{i\top}\bm{R}(\bm{s}_h)
\end{gather*}
$$
$I(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i)$代表$D_t^i$的目标函数的惩罚项；$E(\bm{s}_h,\bm{\mu}_t^i,\bm{\lambda}_t^i)$代表$D_t^i$的等式约束的惩罚项

### 4.2 NeuPAN系统

给定时刻$t$的一组障碍点$\mathbb{P}_t = \left\{ \bm{p}_t^1,\dots,\bm{p}_t^M \right\}$及其相关速度$\mathbb{V}_t = \left\{ \bm{v}_t^1,\dots,\bm{v}_t^M \right\}$，在全局坐标系统中，时域$H$内的点流应为
$$
\mathbb{PF}_t =
\begin{bmatrix}
\bm{p}_t^1 & \cdots & \bm{p}_t^M \\
\vdots & \ddots & \vdots \\
\bm{p}_{t+H}^1 & \cdots & \bm{p}_{t+H}^M
\end{bmatrix}
$$

增加近端项（靠近参考点）有两个用处

1. 保证前后两次规划的轨迹不要相差太大，保证平滑性
2. 公式中存在线性化处理，真实状态和预测状态相差较小才能保证线性化的准确性

以此产生的问题：机器人遇到突发情况无法正确响应
