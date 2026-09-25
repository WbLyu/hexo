---
title: "RDA: AnAccelerated Collision Free Motion Planner for Autonomous Navigation in Cluttered Environments"
date: 2026-04-28 15:06:49
# updated:
# tags:
#     - 
categories: 
          - 论文解读
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
cover: https://img.wblyu.top/images/41a135c158e9d95418bb61d79b22bfb8.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hanruihua/RDA-planner',GitHub %}
{% btn 'https://ieeexplore.ieee.org/abstract/document/10036019',TRO %}
{% btn 'https://arxiv.org/pdf/2210.00192.pdf',Arxiv %}
{% btn 'https://youtu.be/qUNMQQRhNFo?si=OidPlofLygk0Ints',YouTube %}
{% btn 'https://www.bilibili.com/video/BV1zT411d7aL',Bilibili %}
{% btn 'https://github.com/hanruihua/rda_ros',ROS %}
<!-- markdownlint-enable MD034 -->

此论文以OBCA为基础，具体解释请参考{% post_link 论文解读/机器人模块化/"Optimization-Based Collision Avoidance"  OBCA%}

## 3. 问题陈述

### 3.1 障碍物模型

障碍物可以看成凸集，用锥不等式表示
$$
\mathbb{O}_m = \left\{ \bm{o} \in \mathbb{R} ^{O_m} \mid \bm{D}_m \bm{o} \preceq_{\mathcal{O}_m} \bm{b}_m \right\}
$$
其中$m$代表障碍物的序号

### 3.2 机器人模型

可以将机器人本体看成一个紧凑的凸集，初始状态用锥不等式表示，对初始状态进行旋转和平移便可以得到不同时刻的占用空间表示
$$
\begin{gather*}
\mathbb{C} = \left\{ \bm{z} \in \mathbb{R} ^{n_r} \mid \bm{Gz} \preceq_{\mathcal{K}_r}\bm{h}  \right\} \\
\mathbb{Z}_t(\bm{s}_t) = \left\{ \bm{R}_t(\bm{s}_t)\bm{z} + \bm{p}(\bm{s}_t) \mid \bm{z} \in \mathbb{C} \right\}
\end{gather*}
$$
其中$n_r$表示机器人工作空间的维度

旋转矩阵中包含三角函数，是非线性的，需要对旋转矩阵进行一阶泰勒展开
$$
R(\phi) =
\begin{bmatrix}
\cos \phi & -\sin \phi \\
\sin \phi & \cos \phi
\end{bmatrix}\\
\begin{align*}
R(\phi) = & R(\phi_0)  + \left . \frac{\partial R}{\partial \phi} \right | _{\phi = \phi _0}(\phi - \phi _0) \\
= & R(\phi_0) - \bm{J} \phi _0 + \bm{J} \phi
\end{align*}
$$
式中$\bm{J}$为旋转矩阵对航向角的雅可比矩阵
$$
\bm{J} =
\begin{bmatrix}
-\sin \phi _0 & -\cos \phi _0 \\
\cos \phi _0 & -\sin \phi _0
\end{bmatrix}
$$

### 3.3 避碰

机器人和障碍物的最小距离表示为
$$
\operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{O}) = \min \left\{ \lVert \bm{e} \rVert_2 \mid (\mathbb{Z}_t(\bm{s}_t) + \bm{e}) \cap \mathbb{O} \neq \emptyset \right\}
$$
结合机器人模型和障碍物模型，可以得到
$$
\begin{align*}
  \operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{O})
  = \min _{\bm{z},\bm{o}} \ &  \lVert \bm{R}(\bm{s}_t)\bm{z}+\bm{p}(\bm{s}_t) - \bm{o} \rVert_2 \\
  \text{s.t.} \ & \bm{Do} \preceq _{\mathcal{O}_m} \bm{b}, \\
  & \bm{Gz} \preceq _{\mathcal{K}_r} \bm{h}
\end{align*}
$$

差速机器人的状态空间模型为
$$
\begin{bmatrix}
x_{t+1} \\
y_{t+1} \\
\theta_{t+1}
\end{bmatrix}
=
\begin{bmatrix}
x_t \\
y_t \\
\theta_t
\end{bmatrix}
+
\begin{bmatrix}
\cos (\theta_t) \Delta t & 0 \\
\sin (\theta_t) \Delta t & 0 \\
0 &  \Delta t \\
\end{bmatrix}
\begin{bmatrix}
v_t \\
\psi_t
\end{bmatrix}
$$
用函数表达为
$$
\begin{gather*}
\bm{s}_{t+1} = \bm{s}_t + f(\bm{s}_t,\bm{u}_t) \Delta t \\
f(\bm{s}_t,\bm{u}_t) = [v_t \cos(\theta _t) , v_t \sin(\theta _t), \psi_t]
\end{gather*}
$$
此模型为一个非线性模型，为了简化，需要使用一阶泰勒展开对 函数进行线性化，在$(\bm{s}_r,\bm{u}_r)$即参考状态和参考输入处展开
$$
\bm{s}_{t+1} = \bm{s}_t + f(\bm{s}_r,\bm{u}_r) \Delta t + \left. \frac{\partial f}{\partial \bm{s}} \right|_{\bm{s}=\bm{s}_r,\bm{u}=\bm{u}_r}(\bm{s}_t - \bm{s}_r) \Delta t + \left. \frac{\partial f}{\partial \bm{u}} \right|_{\bm{s}=\bm{s}_r,\bm{u}=\bm{u}_r}(\bm{u}_t - \bm{u}_r) \Delta t
$$
偏导矩阵如下
$$
\begin{gather*}
\left. \frac{\partial f}{\partial \bm{s}} \right|_{\bm{s}=\bm{s}_r,\bm{u}=\bm{u}_r} =
\begin{bmatrix}
\frac{\partial f_1}{\partial x} & \frac{\partial f_1}{\partial y} & \frac{\partial f_1}{\partial \theta} \\
\frac{\partial f_2}{\partial x} & \frac{\partial f_2}{\partial y} & \frac{\partial f_2}{\partial \theta} \\
\frac{\partial f_3}{\partial x} & \frac{\partial f_3}{\partial y} & \frac{\partial f_3}{\partial \theta} \\
\end{bmatrix} =
\begin{bmatrix}
0 & 0 & -v_r \sin (\theta _r) \\
0 & 0 & v_r \cos (\theta _r) \\
0 & 0 & 0 \\
\end{bmatrix} \\
\left. \frac{\partial f}{\partial \bm{u}} \right|_{\bm{s}=\bm{s}_r,\bm{u}=\bm{u}_r} =
\begin{bmatrix}
\frac{\partial f_1}{\partial v} & \frac{\partial f_1}{\partial \psi}  \\
\frac{\partial f_2}{\partial v} & \frac{\partial f_2}{\partial \psi}  \\
\frac{\partial f_3}{\partial v} & \frac{\partial f_3}{\partial \psi}  \\
\end{bmatrix} =
\begin{bmatrix}
\cos (\theta _r) & 0  \\
\sin (\theta _r) & 0  \\
0 & 1 \\
\end{bmatrix}
\end{gather*}
$$
因此
$$
\begin{align*}
x_{t+1} = & x_{t} + [v_r \cos (\theta_r)- v_r \sin (\theta _r) \theta_t +\cos (\theta _r) v_t + v_r \sin (\theta _r) \theta_r - \cos (\theta _r) v_r ]\Delta t \\
= & x_{t} + [- v_r \sin (\theta _r) \theta_t +\cos (\theta _r) v_t + v_r \sin (\theta _r) \theta_r]\Delta t \\
y_{t+1} = & y_{t} + [v_r \sin (\theta_r) + v_r \cos (\theta _r) \theta_t +\sin (\theta _r) v_t - v_r \cos (\theta _r) \theta_r - \sin (\theta _r) v_r ]\Delta t \\
= & y_{t} + [ v_r \cos (\theta _r) \theta_t +\sin (\theta _r) v_t - v_r \cos (\theta _r) \theta_r ]\Delta t \\
\theta_{t+1} = & \theta_{t} + [\psi_r + \psi_t - \psi_r ]\Delta t \\
= & \theta_{t} + \psi_t \Delta t \\
\end{align*}
$$
写成状态空间方程为
$$
\begin{bmatrix}
x_{t+1} \\
y_{t+1} \\
\theta_{t+1}
\end{bmatrix}
=
\begin{bmatrix}
1 & 0 & -v_r \sin (\theta _r) \Delta t \\
1 & 0 & v_r \cos (\theta _r) \Delta t \\
0 & 0 & 1
\end{bmatrix}

\begin{bmatrix}
x_t \\
y_t \\
\theta_t
\end{bmatrix}
+
\begin{bmatrix}
\cos (\theta_r) \Delta t & 0 \\
\sin (\theta_r) \Delta t & 0 \\
0 &  \Delta t \\
\end{bmatrix}

\begin{bmatrix}
v_t \\
\psi_t
\end{bmatrix}
+
\begin{bmatrix}
v_r \sin (\theta _r) \theta_r \Delta t \\
- v_r \cos (\theta _r) \theta_r \\
0
\end{bmatrix}
$$

### 3.4 问题表述

MPC的目标是在满足约束的情况下最小化凸且光滑的成本函数。路径跟踪的目标是让机器人尽量以期望速度沿着期望轨迹运动
$$
C_0(\left\{ \bm{s}_t , \bm{u}_t \right\} )= \sum_{h=0}^{N} (\lVert \bm{Q} \circ (\bm{s}_{t}-\bm{s}_{t}^\diamondsuit)  \rVert_2^2 + \lVert \bm{P} \circ (\bm{v}_{t}-\bm{v}_{t}^\diamondsuit)  \rVert_2^2)
$$
其中$\left\{ \bm{Q},\bm{P} \right\}$是权重系数，分别影响机器人尽量沿期望轨迹和尽量保持期望速度

MPC优化问题可以表述为
$$
\begin{align*}
P_0 : \min _{ \left\{ \bm{s}_t , \bm{u}_t \right\} } \ &C_0(\left\{ \bm{s}_t , \bm{u}_t \right\}) \\
\text{s.t.} \ & \bm{s}_{t+1} = \bm{A}_t \bm{s}_t + \bm{B}_t \bm{u}_t + \bm{c}_t, \\
& \bm{u}_{\min} \preceq \bm{u}_t \preceq \bm{u}_{\max}, \\
& \bm{a}_{\min} \preceq \bm{u}_{t+1}-\bm{u}_t \preceq \bm{a}_{\max}, \\
&\operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{O}_m) \geq d_{\text{safe}}
\end{align*}
$$

### 3.5 目前的挑战

1. 最后一项距离约束是碰撞避免的充分条件，但不是必要条件，因此在实现过程中很容易出现无解的情况
2. 障碍物数量可能很大，那么计算量会很大

## 4. RDA无碰撞运动规划器

### 4.1 $l_1$正则化

为了解决第一个挑战，将$d_{\text{safe}}$被替换为向量变量 $d =[d_1,\cdots,d_N]^\top \in \mathbb{R} ^N$。每个$d_t$由$d_{\max}$上界和$d_{\min}$下界限制。此外还需要修改优化的目标函数，否则可能会导致所有$d_t$全取为下界以满足约束。因此，在目标函数上增加了$l_1$正则化，即$C_1(\bm{d}) = - \eta \lVert \bm{d} \rVert_1 = -\eta \sum_{t=0}^{N}d_t$，其中$\eta$为正的权重系数。这样便可以在满足无碰撞约束的前提下尽可能增大$d_t$

$l_1$的限定区域是包含凸点的即四个顶点，最优解更容易落在凸点上，此时部分分量最小，部分分量最大，所以最终的$\bm{d}$更加容易变得稀疏。因为MPC在远时刻处预测的误差较大，因此更容易触发碰撞，为了满足约束很可能会导致$d_t$较低。所以最终的结果很可能：近时刻生成较大的$d_t$，而在远时刻生成较小的$d_t$。**注意**这只是倾向性结果，并非必然结果，有可能障碍物很少，$d_t$全取为最大值

### 4.2 通过交替方向乘子法实现并行计算

令$\bm{y}=\bm{Rz}+\bm{p} - \bm{o}$，无碰撞约束的拉格朗日对偶问题可以写为

$$
\begin{align*}
& \max _{\bm{\lambda }, \bm{\mu },\bm{\xi}} \min _{\bm{y},\bm{o},\bm{z}} \ \lVert \bm{y} \rVert_2 + \bm{\lambda }^\top (\bm{Do}-\bm{b})+ \bm{\mu }^\top (\bm{Gz}-\bm{h}) + \bm{ \xi}^\top (\bm{Rz}+\bm{p} - \bm{o} - \bm{y})\\
= & \max _{\bm{\lambda }, \bm{\mu },\bm{\xi}} \  \min _{\bm{y}} \ (\lVert \bm{y} \rVert - \bm{\xi }^\top \bm{y}) + \min _{\bm{o}} \ (\bm{\lambda }^\top \bm{Do} - \bm{\xi }^\top \bm{o}) + \min _{\bm{z}} \ (\bm{\mu }^\top \bm{Gz} - \bm{\xi}^\top \bm{Rz}) -\bm{\lambda }^\top \bm{b} - \bm{\mu}^\top \bm{h} +  \bm{\xi}^\top \bm{p}
\end{align*}
$$
为了保证内层的极小化结果是有限的，需要令$\lVert \bm{\xi}\rVert_* \leq 1$，$\bm{\xi}-\bm{D}^\top \bm{\lambda } = 0$，$\bm{G}^\top \bm{\mu} - \bm{R}^\top \bm{\xi} = 0$，因此可以将$\bm{\xi}=\bm{D}^\top \bm{\lambda }$代入原式

因为$\mathbb{O}$和$\mathbb{C}$具有非空相对内部，具有强对偶性。因此原问题与对偶问题等价
$$
\begin{align*}
  \operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{O}_m) = \max _{\bm{\lambda }_{t,m},\bm{\mu}_{t,m}} \ & \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{p}_t(\bm{s}_t) - \bm{\lambda}_{t,m}^\top \bm{b}_m - \bm{\mu}_{t,m}^\top \bm{h} \\
  \text{s.t.} \ & \lVert \bm{D}_m^\top \bm{\lambda}_{t,m} \rVert_* \leq 1, \\
  & \bm{\mu}_{t,m}^\top \bm{G} + \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{R}_t(\bm{s}_t)= 0, \\
  & \bm{\lambda}_{t,m} \succeq _{\mathcal{O}^*_m} 0, \\
  & \bm{\mu}_{t,m} \succeq _{\mathcal{K}_r^*} 0
\end{align*}
$$
其中$t$代表时刻，$m$代表障碍物的序号。因此
$$
\begin{align*}
  &\operatorname{dist} (\mathbb{Z}_t(\bm{s}_t),\mathbb{O}_m) \geq d_t  \Leftrightarrow\\
    &\exists  \bm{\mu}_{t,m} \succeq _{\mathcal{K}_r^*} 0 , \bm{\lambda}_{t,m} \succeq _{\mathcal{O}^*_m} 0 : \\
   & \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{p}_t(\bm{s}_t) - \bm{\lambda}_{t,m}^\top \bm{b}_m - \bm{\mu}_{t,m}^\top \bm{h} \geq d_t , \\
   &\lVert \bm{D}_m^\top \bm{\lambda}_{t,m} \rVert_* \leq 1 , \quad \bm{\mu}_{t,m}^\top \bm{G} + \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{R}_t(\bm{s}_t)= 0
\end{align*}
$$
具备避障功能的模型预测控制可以改写为

$$
\begin{align}
  \min_{\substack{\left\{ \bm{s}_t , \bm{u}_t , d_t \right\} \\  \left\{ \bm{\lambda}_{t,m} , \bm{\mu}_{t,m} , z_{t,m} \right\}} } \ & C_0(\left\{ \bm{s}_t , \bm{u}_t \right\}) + C_1(\bm{d})  \\
  \text{s.t.} \ & \bm{s}_{t+1} = \bm{A}_t \bm{s}_t + \bm{B}_t \bm{u}_t + \bm{c}_t, \\
  & \bm{u}_{\min} \preceq \bm{u}_t \preceq \bm{u}_{\max}, \quad \bm{a}_{\min} \preceq \bm{a}_t \preceq \bm{a}_{\max}, \\
  & d_t \in [d_{\min }, d_{\max}], \\
  & z_{t,m} \geq 0, \\
  & \lVert \bm{D}_m^\top \bm{\lambda}_{t,m} \rVert_* \leq 1, \\
  & \bm{\lambda}_{t,m} \succeq _{\mathcal{O}^*_m} 0, \quad \bm{\mu}_{t,m} \succeq _{\mathcal{K}_r^*} 0,\\
  & H_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m}) = 0, \\
  & I_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m},d_t,z_{t,m}) = 0
 \end{align}
$$
其中
$$
\begin{gather*}
    H_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m}) = \bm{\mu}_{t,m}^\top \bm{G} + \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{R}_t(\bm{s}_t) \\
    I_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m},d_t,z_{t,m}) = \bm{\lambda}_{t,m}^\top \bm{D}_m \bm{p}_t(\bm{s}_t) - \bm{\lambda}_{t,m}^\top \bm{b}_m - \bm{\mu}_{t,m}^\top \bm{h} - d_t - z_{t,m}
\end{gather*}
$$
为了将距离的不等式转换为等式，新加入了变量$z_{t,m}$，即$\dots \geq d_t \Leftrightarrow \exists z_{t,m} \geq 0 : \dots - d_t - z_{t,m}=0$。**我觉得这里是多余的，保留不等式形式就可以**



采用交替方向乘子法(ADMM)解决这个双凸优化问题，其中每次迭代都包括更小的凸子问题，并且与不同障碍物相关的对偶变量会并行更新以加快计算速度。缩放形式的增广拉格朗日函数可以表示为
$$
\begin{align*}
& \mathcal{L}(\left\{ \bm{s}_t,\bm{u}_t,d_t \right\}, \left\{ \bm{\lambda }_{t,m},\bm{\mu }_{t,m},z_{t,m} \right\} , \left\{ \bm{\xi}_{t,m} , \bm{\zeta}_{t,m} \right\} ) \\
= & C_0(\left\{ \bm{s}_t ,\bm{u}_t \right\} ) +C_1(\bm{d}) + J(\left\{ \bm{s}_t,\bm{u}_t,d_t \right\} ) \\
& + \sum_{t=0}^{N} \sum_{m=1}^{M} Q_{t,m}(\bm{\lambda }_{t,m},\bm{\mu }_{t,m},z_{t,m}) \\
& + \frac{\rho}{2} \sum_{t=0}^{N} \sum_{m=1}^{M} \lVert I_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m},d_t,z_{t,m}) + \bm{\zeta}_{t,m} \rVert_2^2 \\
& + \frac{\rho}{2} \sum_{t=0}^{N} \sum_{m=1}^{M} \lVert H_{t,m}(\bm{s}_t,\lambda_{t,m},\mu_{t,m}) + \bm{\xi}_{t,m} \rVert_2^2
\end{align*}
$$
其中$\bm{\xi}_{t,m}$和$\bm{\zeta}_{t,m}$是对应等式约束$H$和$I$的对偶变量。这里$J(\left\{ \bm{s}_t,\bm{u}_t,d_t \right\} )$是约束(2)–(4)的指示函数，即如果约束被满足，函数值取为零，否则取为正无穷。类似地，$Q_{t,m}(\bm{\lambda }_{t,m},\bm{\mu }_{t,m},z_{t,m})$是(5)–(7)中第$(t, m)$个约束的指示函数。这里之所以使用指示函数而不是变为增广拉格朗日处理是因为这些约束都是简单约束，可以使用投影简单处理；而$H$和$I$中包含旋转和平移矩阵，是非线性函数，难以简单处理

由于约束(2)的存在，$C_0,C_1,J$三项在不同$t$之间是耦合的，而后三项则可相对于 t 和 m 分解。因此，我们将原始变量分为两组：1) $\{\bm{s}_t, \bm{u}_t, \bm{d}_t\}$；2) $\{\bm{\lambda}_{t,m}, \bm{\mu}_{t,m}, \bm{z}_{t,m}\}$。可以利用`ADMM`方法求解这个问题

1. 将$\bm{s}_t, \bm{u}_t, \bm{d}_t$作为变量优化这个问题
2. 对每一个障碍物,并行求解将$\bm{\lambda}_{t,m}, \bm{\mu}_{t,m}, \bm{z}_{t,m}$作为变量的优化问题
3. 对每一个障碍物,并行更新$\xi ,\zeta$
4. 反复重复这个过程直到满足终止条件

具体算法请参考{% post_link 代码解读/机器人模块化/RDA代码解读  RDA代码解读%}

---
参考资源

[交替方向乘子法](https://zhuanlan.zhihu.com/p/106896627)

[机器人中的数值优化](https://www.shenlanxueyuan.com/course/745)

[差速轮小车MPC轨迹跟踪器设计与实现](https://zhuanlan.zhihu.com/p/666458669)
