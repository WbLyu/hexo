---
title: "OptNet: Differentiable Optimizationasa Layerin Neural Networks"
date: 2026-06-14 18:57:42
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
cover: https://img.wblyu.top/images/18fc344896a05bd265c3b29738efee70.avif
---

此论文通过隐式方法将优化问题表达为神经网络中的一层，它的内部不是传统意义上的神经元堆叠，不是包含全连接层、激活函数等结构，而是一个特殊的“可学习的可微优化层”

通过理论推导得到它的前向传播和反向传播的公式表达，并不需要定义它的内部结构

## 2. 相关研究

使用神经网络解决受限类别的优化问题的整体思路一般可以分为四种

**基于能量的学习方法(Energy-based learning methods)**

总体思路为：在训练过程中将能量函数在观测数据流形附近调低，而在其他地方调高。缺点：一些问题中可能没有参测数据；可能会出现不稳定问题

**解析法(Analytically)**

如果能找到优化问题的解析解，那么梯度一般也可以解析地计算出来。缺点：大多数问题没有解析解

**展开(Unrolling)**

将优化问题的迭代求解过程近似展开为神经网络的结构。缺点：展开操作会增加网络的复杂性和深度；对于有约束的问题可能难以展开

**最小化操作求导(Argmin differentiation)**

类似本文的操作，对`argmin`问题进行微分


## 3. OptNet：在神经网络中解决优化问题

本文重点研究二次规划问题
$$
\begin{align*}
\min _z \ & \frac{1}{2} z^\top Qz + q^\top z \\
\text{s.t.} \ & Az = b,Gz \leq h
\end{align*}
$$

其中$z \in \mathbb{R} ^n$是优化变量，$Q \in \mathbb{R} ^{n,n} \succeq 0$，$q \in \mathbb{R} ^n$，$A \in \mathbb{R} ^{m,n}$，$b \in \mathbb{R} ^m$，$G \in \mathbb{R} ^{p,n}$，$h \in \mathbb{R} ^p$

### 3.1 反向传播

拉格朗日函数可以写为
$$
L(z,\nu,\lambda) = \frac{1}{2} z^\top Qz + q^\top z+ \nu ^\top (Az - b)+ \lambda ^\top (Gz-h)
$$

其中$\nu$和$\lambda \geq 0$是对偶变量。可以写出它的KKT条件（分别为平稳性条件、原始可行性和互补松弛性）
$$
\begin{gather*}
Qz^* + q + A^\top \nu ^* + G^\top \lambda^* =0  \\
Az^*-b=0 \\
D(\lambda ^*)(Gz^*-h) = 0
\end{gather*}
$$

其中$D(\cdot)$表示由向量展开为对角矩阵，$z^*,\nu ^*,\lambda ^*$代表最优原始变量和最优对偶变量

对这些条件求微分得到
$$
\begin{gather*}
\Delta Q z^* + Q \Delta z^* + \Delta q + \Delta A^\top \nu ^* + A^\top \Delta \nu^* + \Delta G^\top \lambda ^* + G^\top \Delta \lambda ^* =0 \\
\Delta A z^* + A \Delta z^* - \Delta b =0 \\
D(Gz^*-h)\Delta \lambda ^* +D(\lambda ^*)(\Delta G z^* + G \Delta z^* - \Delta h)= 0
\end{gather*}
$$

写成矩阵形式为

$$
\begin{bmatrix}
Q && G^\top && A^\top \\
D(\lambda ^*)G &&  D(Gz ^*-h) && 0 \\
A && 0 && 0  
\end{bmatrix}
\begin{bmatrix}
\Delta z^* \\
\Delta \lambda^* \\
\Delta \nu^* \\
\end{bmatrix}
=
\begin{bmatrix}
- \Delta q - \Delta A^\top \nu ^* - \Delta G^\top \lambda ^* -\Delta Q z^* \\
-D(\lambda ^*)\Delta G z^* + D(\lambda ^*) \Delta h \\
- \Delta A z^* + \Delta b
\end{bmatrix}
$$

KKT条件是优化问题的必要条件，即如果$x^∗$是最优解，则它必须满足KKT条件

对于凸优化问题，KKT条件是充要条件，即满足KKT条件的解一定是最优解

这一层的输入为$z_i$，部分参数是由$z_i$决定的，优化变量为$z$，输出为$z^*$，参数为$q,b,h,Q,A,G$。想要进行反向传播，需要计算得到损失对于这些参数的梯度

**式(7)的推导**

将KKT条件的矩阵形式写为紧凑形式
$$
K
\begin{bmatrix}
\Delta z^* \\
\Delta \lambda^* \\
\Delta \nu^* \\
\end{bmatrix}
=r
$$

令上一层传回来的梯度为
$$
g= \frac{\partial \ell}{\partial z^*}
$$

那么微分可以写为
$$
\Delta \ell = g^\top \Delta z^*
$$

定义
$$
e =
\begin{bmatrix}
g \\
0 \\
0
\end{bmatrix}
$$

那么
$$
\Delta \ell = e^\top
\begin{bmatrix}
\Delta z^* \\
\Delta \lambda^* \\
\Delta \nu^* \\
\end{bmatrix}
$$

结合紧凑版KKT条件，上式可以进一步写为
$$
\Delta \ell = e^\top K^{-1} r
$$

为了避免显式求解$e^\top K^{-1}$，引入变量
$$
d =
\begin{bmatrix}
d_z \\
d_\lambda \\
d_\nu \\
\end{bmatrix}
$$

它满足
$$
K^\top d = -e
$$
这里$K^\top$为

$$
K^\top =
\begin{bmatrix}
Q && G^\top D(\lambda ^*) && A^\top \\
G &&  D(Gz ^*-h) && 0 \\
A && 0 && 0  
\end{bmatrix}
$$

展开$d= (K^\top)^{-1} (-e)$就可以得到论文中式(7)的形式

**式(8)的推导**

因为用$d$取代了$(K^\top)^{-1} (-e)$，因此$\Delta \ell$可以表示为
$$
\Delta \ell = -d^\top r
$$

展开为
$$
\begin{aligned}
\Delta \ell &= d_z^T \Delta Q z^* + d_z^T \Delta q + d_z^T \Delta G^T \lambda^* + d_z^T \Delta A^T \nu^* \\
&\quad + d_\lambda^T D(\lambda^*) \Delta G z^* - d_\lambda^T D(\lambda^*) \Delta h \\
&\quad + d_\nu^T \Delta A z^* - d_\nu^T \Delta b
\end{aligned}
$$

下面逐项拆解梯度

**对$q$的梯度**

含$\Delta q$的项为
$$
d_z^T \Delta q
$$
因此
$$
\frac{\partial \ell }{\partial q} = d_z
$$
**对$b$的梯度**

含$\Delta b$的项为
$$
- d_\nu^T \Delta b
$$
因此
$$
\frac{\partial \ell }{\partial b} = -d_{\nu}
$$

**对$h$的梯度**

含$\Delta h$的项为
$$
- d_\lambda^T D(\lambda^*) \Delta h
$$
因为 $D(\lambda^\star)$ 是对角矩阵，所以
$$
- d_\lambda^T D(\lambda^*) \Delta h = -(D(\lambda^*)d_\lambda)^\top \Delta h
$$
因此
$$
\frac{\partial \ell }{\partial h} = -D(\lambda^*)d_\lambda
$$

**对$Q$的梯度**

含$\Delta Q$的项为
$$
d_z^T \Delta Q z^*
$$

利用迹运算
$$
d_z^T \Delta Q z^* = \operatorname{tr}(d_z^T \Delta Q z^*) = \operatorname{tr}(z^* d_z^T \Delta Q )
$$
因此正常应该为
$$
\frac{\partial \ell }{\partial Q} =  d_z z^{*T}
$$
但为了结果保持对称性，梯度写为
$$
\frac{\partial \ell }{\partial Q} = \frac{1}{2} (d_z z^{*T} + z^* d_z^T)
$$

**对$A$的梯度**

含$\Delta A$的项为
$$
d_z^T \Delta A^T \nu^* + d_\nu^T \Delta A z^*
$$
因此
$$
\frac{\partial \ell }{\partial A} =d_\nu z^{*T} + \nu^* d_z^T
$$

**对$G$的梯度**

含$\Delta G$的项为
$$
d_z^T \Delta G^T \lambda^* + d_\lambda^T D(\lambda^*) \Delta G z^*
$$
因此
$$
\frac{\partial \ell }{\partial G} =D(\lambda^*)d_\lambda z^{*T} + \lambda^* d_z^T
$$

这样便得到了式(8)的形式

这样不需要显示求解显式求解$e^\top K^{-1}$，而是通过求解
$$
K^\top d = -e
$$
得到$d$的值，继而求得反向传播时的参数梯度

### 3.2 正向传播

由于传统求解器`Gurobi`和`CPLEX`只能运行在cpu上，在进行批量运算时耗时较长，作者根据原始-对偶内点法开发了能跑在gpu上的求解器`qpth`，具体公式推导不再展开

值得一提的是，在正向传播时会顺便把反向传播时需要的`d`求出，所以计算耗时主要集中在正向传播，反向传播开销极低