---
title: RDA代码解读
date: 2026-04-29 20:47:01
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

## 1. 重要函数

`def is_convex_and_ordered(self, points: NDArray[np.float64]) -> tuple[bool, str]`

这个函数的作用是判断按照顺序排列的顶点是否构成凸集，并判断点是顺时针排列"CW"还是逆时针排列"CCW"

实现思路：按顺序取三个点$o,a,b$，判断$\overrightarrow{oa}$和$\overrightarrow{ob}$的叉积，如果所有叉积同号则说明$a$点在$\overrightarrow{ob}$的外侧，那么所有内角都为凸角，同时根据叉积的正负还可以判断点是顺时针排列（负）还是逆时针排列（正）

`def gen_inequal_global(self, vertex: NDArray[np.float64])-> tuple[NDArray[np.float64], NDArray[np.float64]]`

此函数的作用是根据顶点生成半空间不等式$\bm{Ax} \leq \bm{b}$

实现思路：先判断顶点的凸性和排列顺序，统一为逆时针排列。随后按顺序遍历相邻的两个顶点，计算半空间表达式

每个超平面可以表达为$\bm{a}^\top (\bm{x} - \bm{x}_0) = 0$，即与$\bm{x}_0$的连线与$\bm{a}$垂直的点，因此$\bm{a}$为法向量；$\bm{x}_0$为超平面上的点。变换后为$\bm{a}^\top \bm{x}  =\bm{b}$，变为不等号即得到半空间

计算半空间的过程

1. 求直线向量$\bm{v} = \bm{p}_2 - \bm{p}_1 = (x_2 - x_1 , y_2 - y_1)$，向量指向逆时针方向
2. 令$\bm{v}$与$\bm{a}$的叉乘结果为负，可以求连线右侧的法向向量。注意，对于凸多边形，由于表达式是$\leq$，因此法向量必须指向多边形外侧
3. 用$\bm{a}^\top \bm{p}_1$求解$\bm{b}$

`def cone_para_array(self, array: cp.Variable, cone_flag: cp.Variable)-> cp.constraints.nonpos.Inequality`

此函数的作用是构建约束$\bm{\lambda}_{t,m} \succeq _{\mathcal{O}^*_m} 0$

此函数将非负象限锥和二阶锥的情况都放进一个约束中，因为优化问题是提前建立好的，在运动前无法确定第$n$个障碍物到底是哪种类型，因此都需要考虑进去

`def pre_process(self, state, ref_path, cur_index, **kwargs):`

1. 利用上个时刻计算出的最优控制量序列，以当前状态为起始点，根据运动学方程预测一步，得到将旋转矩阵和运动学方程线性化需要的参考状态
2. 利用参考速度和预测的时间间隔计算出距离间隔，对稀疏的轨迹插值得到稠密的参考轨迹

`def control(self, state, ref_speed=5, obstacle_list=[], **kwargs):`

1. 调用`pre_process()`函数得到参考状态和参考轨迹
2. 将障碍物的表达方式转为RDA求解器的输入格式
3. 调用`iterative_solve()`函数求解最优控制量

`def iterative_solve(self,nom_s,nom_u,ref_states,ref_speed,obstacle_list,**kwargs,):`

1. 根据`pre_process()`得到的参考状态和上个时刻计算出的最优控制量序列为状态相关的优化参数赋初始值
2. 根据障碍物数据为障碍物相关的优化参数赋初始值
3. 反复调用`rda_solver()`进行迭代求解，直至满足终止条件或迭代次数达到最大

`def rda_solver():`

利用ADMM求解优化问题

1. 求解变量为$\bm{s},\bm{u},\bm{d}$的优化问题`su_prob`
2. 将求解出的最优值传入作为参数的$s,u,d$中
3. 为联合参数$\lambda^\top D$和$\lambda^\top b$赋值
4. 对每一个障碍物求解以$\bm{\lambda},\bm{\mu}$为变量的优化问题`LamMuZ_prob`
5. 将求解出的最优值传入作为参数的$\lambda ,\mu$中
6. 为联合参数$Dp$和$DR$赋值
7. 更新$\xi$和$\zeta$

## 2. 优化问题构建

**加粗代表变量**

### 2.1 `construct_su_prob`

将$s,u,d$视为变量

优化问题为
$$
\begin{align*}
\min \ & (\operatorname{cost}_{nav} + \operatorname{cost}_{su}) \\
\text{s.t.} \ & \operatorname{constraints}_{nav} \cap \operatorname{constraints}_{su}
\end{align*}
$$

- `nav_cost_cons`

约束包含
$$
\begin{align*}
& \operatorname{constraints}_{nav}:\\
& \bm{s}_{t+1} = A_t \bm{s}_t + B_t \bm{u}_t + C_t, \forall t \\
& \lVert \bm{v}_{t+1} - \bm{v}_t \rVert \leq  a_{\max}, \forall t \\
& \lVert \bm{u}_t \rVert \leq  u_{\max},\forall t \\
& \bm{s}_0 = s_0
\end{align*}
$$

代价函数为

$$
\begin{align*}
& \operatorname{cost}_{nav} : \\
& Q_t \sum_{t=0}^{N} \lVert \bm{s}_t - s'_t \rVert_2^2 + P_t \sum_{t=0}^{N} (\bm{v}_t - v'_t) ^2
\end{align*}
$$

- `update_su_cost_cons`

约束包含
$$
\begin{align*}
& \operatorname{constraints}_{su}:\\
& R'_t - (J' \phi')_t + J'_t \bm{\theta}_t  - \bm{R}_t =0, \forall t \\
& \bm{d}_t \in [d_{\min }, d_{\max}], \forall t \\
& \bm{I}_{t,m} = (\lambda D)_{t,m}\bm{s}_t-(\lambda b)_{t,m} - \mu _{t,m}^\top h - \bm{d}_t + \zeta _{t,m},\forall t,m \\
& \bm{H}_{t,m} = \mu _{t,m}^\top G +(\lambda D)\bm{R}_t+ \xi _{t,m} ,\forall t,m
\end{align*}
$$

代价函数为

$$
\begin{align*}
& \operatorname{cost}_{su} : \\
&-\eta \sum_{t=0}^{N}\bm{d}_t +\frac{\rho_1}{2} \sum_{t=0}^{N} \sum_{m=0}^{M} \lVert \min(\bm{I}_{t,m} , 0)  \rVert_2^2 + \frac{\rho_2}{2} \sum_{t=0}^{N} \sum_{m=0}^{M} \lVert \bm{H}_{t,m}  \rVert_2^2
\end{align*}
$$
这里在计算$I_{t,m}$的代价函数时使用了$\min(\bm{I}_{t,m} , 0)$，这是为了惩罚大于零的情况，本质上是将约束从$=0$放松为$\geq 0$，因为安全距离适当变大是可接受的，这样可以加快计算速度

### 2.2 `construct_LamMuZ_prob`

将$\lambda ,\mu$视为变量

优化问题为
$$
\begin{align*}
\forall m \\
\min \ & \operatorname{cost}_m \\
\text{s.t.} \ & \operatorname{constraints}_m
\end{align*}
$$

`LamMuZ_cost_cons`

约束包含
$$
\begin{align*}
& \operatorname{constraints}_{m}:\\
& \lVert D_{t,m}^\top \bm{\lambda}_{t,m}  \rVert_* \leq 1, \forall t,m \\
& \bm{\lambda}_{t,m} \succeq _{\mathcal{O}^*_m} 0, \forall t \\
& \bm{\mu}_{t,m} \succeq _{\mathcal{K}^*_r} 0, \forall t \\
& \bm{I}_{t,m} = \bm{\lambda}_{t,m}^\top  (D p)_{t,m}-\bm{\lambda}_{t,m}^\top b_{t,m} - \bm{\mu} _{t,m}^\top h - d_t + \zeta _{t,m},\forall t,m \\
& \bm{H}_{t,m} = \bm{\mu} _{t,m}^\top G +\bm{\lambda}_{t,m}^\top(D R)_t+ \xi _{t,m} ,\forall t,m
\end{align*}
$$

代价函数为

$$
\begin{align*}
& \operatorname{cost}_m : \\
& \frac{\rho_1}{2} \sum_{t=0}^{N} \lVert \min(\bm{I}_{t,m} , 0)  \rVert_2^2 + \frac{\rho_2}{2} \sum_{t=0}^{N} \lVert \bm{H}_{t,m}  \rVert_2^2
\end{align*}
$$

### 2.3 更新$\xi$和$\zeta$

$$
\begin{gather*}
\xi_{t,m}^{k+1} = \xi_{t,m}^{k} + (\mu_{t,m}^k)^\top G + (\lambda_{t,m}^k)^\top D_m R_t(s_t^k) \\
\zeta_{t,m}^{k+1} = \zeta_{t,m}^{k} + (\lambda_{t,m}^k)^\top D_m p_t(s_t^k) - (\lambda_{t,m}^k)^\top b_m - (\mu_{t,m}^k)^\top h - d_t^k
\end{gather*}

$$

### 2.4迭代终止条件

需要
$$
\begin{gather*}
\sum_{t}^{}\sum_{m}^{} \lVert \bm{\lambda}_{t,m}^{k+1} - \bm{\lambda}_{t,m}^{k}  \rVert_2^2 + \lVert \bm{\mu}_{t,m}^{k+1} - \bm{\mu}_{t,m}^{k}  \rVert_2^2 \leq \epsilon \\
\sum_{t}^{}\sum_{m}^{} \lVert H_{t,m}  \rVert_2^2 \leq \epsilon
\end{gather*}
$$
实际中，变量值只会保存为最新值，上个时刻的值与对应参数的值一致。注意此刻$H_{t,m}$是参数，不是变量，因此终止条件写为
$$
\begin{gather*}
\sum_{t}^{}\sum_{m}^{} \lVert \bm{\lambda}_{t,m}^{k+1} - \lambda_{t,m}^{k}  \rVert_2^2 + \lVert \bm{\mu}_{t,m}^{k+1} - \mu_{t,m}^{k}  \rVert_2^2 \leq \epsilon \\
\sum_{t}^{}\sum_{m}^{} \lVert (\mu_{t,m}^k)^\top G + (\lambda_{t,m}^k)^\top D_m R_t(s_t^k) \rVert_2^2 \leq \epsilon
\end{gather*}
$$

## 3. 存在的问题

1. 插值方法过于简单，可以利用`scipy`库提供的**三次样条曲线插值**`CubicSpline`或者**三次埃尔米特样条曲线插值**`CubicHermiteSpline`
2. 当程序第一次启动时应该使用参考轨迹上的点作为状态参考