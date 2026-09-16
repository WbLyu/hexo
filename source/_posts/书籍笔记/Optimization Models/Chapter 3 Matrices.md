---
title: Chapter 3 Matrices
date: 2025-09-28 10:43:55
# updated:
# tags:
#     - 
categories:
          - 书籍笔记
          - Optimization Models
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

## 1. 矩阵基础

### 1.1 将矩阵视为数字的数组

矩阵(Matrix)是数组的矩形数组，形式为

$$
\bm{A}=
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{bmatrix}
$$
这个矩阵有$m$行(rows)$n$列(columns)，若是元素为实数，我们可以说$\bm{A} \in \mathbb{R}^{m,n}$；若是元素为复数，我们可以说$\bm{A} \in \mathbb{C}^{m,n}$。矩阵的每一行都是行向量，每一列都是列向量。矩阵的转置(transposition)操作是将矩阵的行列交换

$$
[\bm{A}^\top]_{ij} = [\bm{A}]_{ji}
$$
符号$[\bm{A}]_{ij}$(有时候简写为$\bm{A}_{ij}$)代表矩阵第$i$行$j$列的元素。$\mathbb{R}^{m,n}$中的零矩阵表示为$\bm{0}_{m,n}$，或者直接简写为$\bm{0}$

矩阵的数乘(multiplication by a scalar)被定义为矩阵中的每个元素都与标量相乘；矩阵的加法(两个矩阵大小相同)被定义为矩阵对应位置的元素相加。定义了这些运算后，我们可以将$\mathbb{R}^{m,n}$看作一个向量空间

### 1.2 矩阵乘积

如果两个矩阵的尺寸符合，他们才可以相乘。i.e. $\bm{A} \in \mathbb{R}^{m,n}, \bm{B} \in \mathbb{R}^{n,p}$，矩阵的乘法$\bm{AB} \in \mathbb{R}^{m,p}$被定义为

$$
[\bm{AB}]_{ij} = \sum^n_{k=1}\bm{A}_{ik}\bm{B}_{kj}
$$
矩阵乘法是非交换的(non-commutative)，这意味着一般情况下$\bm{AB} \neq \bm{BA}$

$n \times n$单位矩阵(identity matrix)表达为$\bm{I}_n$(也可以简写为$\bm{I}$)，它是对角(diagonal)元素为$1$其他元素为$0$的矩阵。单位矩阵满足$\bm{AI}_n=\bm{A}$，$\bm{A}$有$n$行；$\bm{I}_n\bm{B}=\bm{B}$，$\bm{B}$有$n$列

矩阵可以看成一组行向量的组合，也可以看成一组列向量的组合

$$
\bm{A} = [ \bm{a}_1 \quad \bm{a}_2 \quad \cdots \quad \bm{a}_n ],\text{or }
\bm{A} = \left[
\begin{array}{c}
\bm{\alpha}_{1}^\top \\
\bm{\alpha}_{2}^\top  \\
\vdots  \\
\bm{\alpha}_{m}^\top
\end{array}
\right]
$$

其中$\bm{a}_1,\cdots,\bm{a}_n \in \mathbb{R}^m$表示$\bm{A}$的列，即**列向量**；$\bm{\alpha}_1^\top,\cdots,\bm{\alpha}_n^\top \in \mathbb{R}^n$表示$\bm{A}$的行，即**行向量**

因此矩阵乘积可以写为

$$
\bm{AB} = \bm{A}
[ \bm{b}_1 \quad \cdots \quad \bm{b}_p ]  = [ \bm{Ab}_1 \quad \cdots \quad \bm{Ab}_p ]
$$

$$
\bm{AB} = \left[
\begin{array}{c}
\bm{\alpha}_{1}^\top \\
\vdots  \\
\bm{\alpha}_{m}^\top
\end{array}
\right] \bm{B}  = \left[
\begin{array}{c}
\bm{\alpha}_{1}^\top \bm{B}\\
\vdots  \\
\bm{\alpha}_{m}^\top\bm{B}
\end{array}
\right]
$$

最终矩阵的乘积可以看成多个并矢的和（参考[4.7节](#4-7-并矢)）
$$
\bm{AB} =  \sum_{i=1}^n \bm{a}_i \bm{\beta}_i^\top
$$
矩阵的乘积定义同样使用矩阵与向量的乘积
$$
\bm{Ab} = \sum_{k=1}^n \bm{a}_k b_k
$$
$\bm{Ab}$的结果是一个向量，可以看成是对矩阵$\bm{A}$中的列向量进行线性组合，系数为$\bm{b}$中的元素。同样地，我们可以定义向量左乘矩阵

$$
\bm{c}^\top \bm{A} = \sum_{k=1}^m  c_k \bm{\alpha}_k^\top
$$
定义$\bm{C}=\bm{AB}$，根据矩阵与向量乘积的定义，$\bm{C}=[\bm{Ab}_1 \quad \cdots \quad \bm{Ab}_p]$可以进一步拆分

$$
\bm{C}=[\bm{Ab}_1 \quad \cdots \quad \bm{Ab}_p] = [ \sum_{k=1}^n \bm{a}_k b_{1k} \quad \cdots \quad  \sum_{k=1}^n \bm{a}_k b_{pk}]
$$
其中$b_{ij}$为向量$\bm{b}_i$的第$j$个元素，**因此矩阵$\bm{C}$的每一列都可以看成是对$\bm{A}$的列向量进行线性组合得到的**。同样地，$\bm{C}=[\bm{\alpha}_{1}^\top \bm{B} \quad \cdots \quad \bm{\alpha}_{m}^\top\bm{B} ]^\top$可以进一步拆分

$$
\bm{C} = \left[
\begin{array}{c}
\bm{\alpha}_{1}^\top \bm{B}\\
\vdots  \\
\bm{\alpha}_{m}^\top\bm{B}
\end{array}
\right] = \left[
\begin{array}{c}
\sum_{k=1}^m  \alpha_{1k} \bm{\beta}_k^\top\\
\vdots  \\
\sum_{k=1}^m  \alpha_{mk} \bm{\beta}_k^\top
\end{array}
\right]
$$
其中$\alpha_{ij}$为向量$\bm{\alpha}_{i}^\top$的第$j$个元素，**因此矩阵$\bm{C}$的每一行都可以看成是对$\bm{B}$的行向量进行线性组合得到的**。

矩阵乘积的转置满足

$$
( \bm{A}_1 \bm{A}_2 \cdots \bm{A}_p )^\top = \bm{A}_p^\top \cdots \bm{A}_2^\top  \bm{A}_1^\top
$$

### 1.3 块矩阵乘积

只要保证块(block)大小一致，矩阵代数可以推广到块。首先考虑矩阵$\bm{A}$与向量$\bm{x}$的乘积，其中矩阵和向量都是分块的

$$
\begin{gather*}

\bm{A} = [ \bm{A}_1 \quad \bm{A}_2 ],\bm{x} = \left[
\begin{array}{c}
\bm{x}_1 \\
\bm{x}_2
\end{array}
\right] \\

\bm{Ax}= \bm{A}_1\bm{x}_1 + \bm{A}_2\bm{x}_2

\end{gather*}
$$

从符号上看这就像是行向量与列向量的内积。矩阵与矩阵相乘也可以进行类似展开

$$
\bm{AB} = [ \bm{A}_1 \quad \bm{A}_2] \left[
\begin{array}{c}
\bm{B}_1 \\
\bm{B}_2
\end{array}
\right] = \bm{A}_1\bm{B}_1 + \bm{A}_2\bm{B}_2
$$

### 1.4 矩阵空间和内积

对于向量空间$\mathbb{R}^{m,n}$，可以赋予一个标准内积

$$
\langle \bm{A},\bm{B} \rangle = \operatorname{trace} ( \bm{A}^\top \bm{B} )
$$
其中$\operatorname{trace}(\bm{X})$是方阵的迹(trace)，定义为方阵主对角线上元素的和。这个内积引出了所谓的Frobenius范数

$$
\sqrt{ \langle \bm{A} , \bm{A} \rangle} = \sqrt{ \operatorname{trace}\bm{AA}^\top} = \lVert\bm{A}\rVert_F \coloneqq \sqrt{\sum_{ij} a_{ij}^2}
$$
我们的选择与向量情况下的选择是一致的。实际上，上述内积表示的是通过将矩阵$\bm{A},\bm{B}$的所有列依次首尾相连展开得到的两个向量之间的标量积；因此，Frobenius范数就是矩阵向量化形式的欧几里得范数。

迹运算符是一个线性运算符，同时还有许多性质

$$
\begin{gather*}

\operatorname{trace}  \bm{A}  = \operatorname{trace} \bm{A}^\top \\

\operatorname{trace} \bm{AB} = \operatorname{trace} \bm{BA}
\end{gather*}
$$

## 2. 矩阵和线性映射

### 2.1 矩阵，线性和仿射映射

我们可以将矩阵解释为从输入空间到输出空间的作用的线性映射（向量值函数，即输出为向量）或者操作。我们回顾一下线性映射：当任意点$\bm{x},\bm{z} \in \mathcal{X}$和任意标量$\lambda,\mu \in \mathcal{Y}$满足$f( \lambda \bm{x} + \mu \bm{z} ) = \lambda f(\bm{x}) + \mu f(\bm{z})$那么映射$f:\mathcal{X}\rightarrow \mathcal{Y}$为线性。任意线性映射$f:\mathbb{R}^n\rightarrow \mathbb{R}^m$都可以用一个矩阵$\bm{A}\in\mathbb{R}^{m,n}$表示

![3.3](https://img.wblyu.top/optimization-models/3.3.png "3.3")

放射映射就是简单地在线性方程上加一个常数项，因此任意放射映射$f:\mathbb{R}^n\rightarrow \mathbb{R}^m$都可以表示为

$$
f( \bm{x} ) = \bm{A}\bm{x} + \bm{b}
$$
其中$\bm{A} \in \mathbb{R}^{m,n},\bm{b} \in \mathbb{R}^{m}$

将向量的每个元素按某个标量因子 进行缩放的线性映射，可以用对角矩阵来描述

### 2.2 非线性方程的近似

一个非线性映射（在该点可微）在给定点$\bm{x}_0$的邻域内(neighborhood)可以被近似为一个仿射映射

$$ f ( \bm{x} ) = f ( \bm{x}_0 ) + J_f ( \bm{x}_0 ) ( \bm{x}-\bm{x}_0 + o ( \lVert \bm{x} - \bm{x}_0 \rVert )  ) $$

当$\bm{x} \rightarrow \bm{x}_0$时$o ( \lVert \bm{x} - \bm{x}_0 \rVert )$比一阶(first order)收敛更快，$J_f$是雅可比矩阵，定义为

$$
 J_f ( \bm{x}_0 ) \coloneqq
\begin{bmatrix}
    \frac{\partial f_1 }{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n} \\
    \vdots & \ddots & \vdots \\
    \frac{\partial f_m }{\partial x_1} & \cdots & \frac{\partial f_m}{\partial x_n}
\end{bmatrix}_{ \bm{x} = \bm{x}_0 }
$$
因此对于接近$\bm{x}_0$的$\bm{x}$，变分$\delta_f ( \bm{x} ) \coloneqq f ( \bm{x} ) - f ( \bm{x}_0 )$可以用雅可比矩阵定义的线性映射来一阶近似

一个在$\bm{x}_0$处二阶可微的标量值函数（即输出为标量）可以使用梯度和二阶导数矩阵（海森矩阵）进行二阶局部近似

$$
f \approx f ( \bm{x}_0 ) + \Delta f ( \bm{x}_0 )^\top ( \bm{x} -\bm{x}_0 ) + \frac{1}{2}  ( \bm{x} -\bm{x}_0 )^\top \Delta^2 f ( \bm{x}_0 ) ( \bm{x} -\bm{x}_0 )
$$
其中$\Delta^2 f ( \bm{x}_0 )$是海森矩阵(Hessian)定义为

$$
 \Delta^2 f ( \bm{x}_0 ) \coloneqq
\begin{bmatrix}
    \frac{\partial ^2 f}{\partial  x_1^2} & \cdots & \frac{\partial ^2 f}{\partial  x_1 \partial x_n} \\
    \vdots & \ddots & \vdots \\
    \frac{\partial ^2 f}{\partial  x_n \partial x_1} & \cdots & \frac{\partial ^2 f}{\partial x_n^2}
\end{bmatrix}_{\bm{x}= \bm{x}_0}
$$
在这种情况下，$f$在局部通过由Hessian矩阵定义的二次函数进行近似

### 2.3 值域，秩和零空间

考虑一个矩阵$\bm{A}$对它的列向量进行线性组合，得到的集合称为$\bm{A}$的值域(range)或者为列空间，被写为$\mathcal{R} ( \bm{A} )$

$$
\mathcal{R} ( \bm{A} ) = \{ \bm{A} \bm{x} \mid  \bm{x} \in \mathbb{R}^n \}
$$
列空间是一个子空间。$\mathcal{R} ( \bm{A} )$的维数称为$\bm{A}$的秩(rank)，记作$\operatorname{rank}( \bm{A} )$根据定义，秩表示$\bm{A}$线性无关的列数量，根据证明秩也等于线性无关的行数量。因此矩阵的秩等于它转置的秩

$$
\operatorname{rank} ( \bm{A} )  = \operatorname{rank} ( \bm{A}^\top )
$$

> **证明**
>
> 假设$\bm{A} \in \mathbb{R}^{m,n}$的列秩为$c$，行秩为$r$，尝试将它拆分为$\bm{BC}$两个矩阵，其中$\bm{B}$矩阵由$\bm{A}$中线性独立的列向量组成，因为$\bm{A}$的每一列都可以通过$\bm{B}$中的列向量线性组合得到，根据矩阵乘积的定义得知拆分是合理的。此时$\bm{B}\in\mathbb{R}^{m,c},\bm{C}\in\mathbb{R}^{c,n}$。同时$\bm{A}$的每一行都可以看成由$\bm{C}$矩阵中的行向量线性组合得到的，因此$\bm{A}$的行空间维数不大于$\bm{C}$的行数，i.e. $r \leq c$
>
> 用同样的方式对$\bm{A}$的转置进行推导，可以得到$\bm{A}$转置的行空间维数$c$不大于列空间维数$r$，i.e. $c \leq r$。将两个结论对比只能取$r=c$。行秩等于列秩得到了证明

因此我们可以提出一个约束

$$
0 \leq \operatorname{rank} ( \bm{A} )   \leq \min ( m,n )
$$
矩阵$\bm{A}$的零空间(nullspace)是输入空间中被映射到$\bm{0}$的向量组成的集合，记作$\mathcal{N} ( \bm{A} )$

$$
 \mathcal{N} ( \bm{A} ) = \{ \bm{x} \mid  \bm{A} \bm{x} = \bm{0} \}
$$
零空间也是一个子空间

### 2.4 线性代数的基本理论

线性代数基本定理建立了矩阵的零空间与其转置的值域之间的重要联系。首先我们可以发现$\bm{A}^\top$值域中的任意向量都和$\bm{A}$零空间的任意向量正交，i.e. $\bm{x}^\top \bm{z} = 0,\forall \bm{x} \in \mathcal{R} ( \bm{A}^\top ), \forall \bm{z}\in \mathcal{N} ( \bm{A} )$。根据值域的定义，$\mathcal{R} ( \bm{A}^\top )$中的所有向量都可以写为$\bm{A}$中的行向量的线性组合，因此

$$
\bm{x}^\top \bm{z} = ( \bm{A}^\top \bm{y} )^\top \bm{z} = \bm{y}^\top \bm{A} \bm{z} =  \bm{y}^\top (\bm{A}  \bm{z}) = 0
$$
因此$\mathcal{R} ( \bm{A}^\top )$和$\mathcal{N} ( \bm{A} )$是正交子空间，i.e. $\mathcal{N}(\bm{A}) \perp \mathcal{R}(\bm{A}^\top)$或者写为$\mathcal{N}(\bm{A}) = \mathcal{R}(\bm{A}^\top)^\perp$。回顾Section 2.2.3，子空间和其正交补的直和等于整个空间

$$
\mathbb{R}^n = \mathcal{N}(\bm{A}) \oplus \mathcal{N}(\bm{A})^\perp = \mathcal{N}(\bm{A}) \oplus \mathcal{R}(\bm{A}^\top)
$$
同样的我们可以证明$\bm{z}^\top \bm{x} = 0,\forall \bm{x} \in \mathcal{R} (\bm{A}), \forall \bm{z}\in \mathcal{N} (\bm{A}^\top)$，因此$\mathcal{N}(\bm{A}^\top) \perp \mathcal{R}(\bm{A})$，输出空间可以分解为

$$
 \mathbb{R}^m = \mathcal{R}(\bm{A}) \oplus \mathcal{R}(\bm{A})^\perp = \mathcal{R}(\bm{A}) \oplus \mathcal{N}(\bm{A}^\top)
$$

> **定理3.1（线性代数基本定理）**：对于任意矩阵$\bm{A} \in \mathbb{R}^{m,n}$，有$\mathcal{N}(\bm{A}^\top) \perp \mathcal{R}(\bm{A}),\mathcal{N}(\bm{A}) \perp \mathcal{R}(\bm{A}^\top)$，因此
> $$
> \begin{gather*}
> \mathcal{R}(\bm{A}^\top) \oplus \mathcal{N}(\bm{A}) = \mathbb{R}^n \\
> \mathcal{R}(\bm{A}) \oplus \mathcal{N}(\bm{A}^\top) = \mathbb{R}^m
> \end{gather*}
> $$
> 并且
> $$
> \begin{gather*}
> \dim\mathcal{N}(\bm{A}) + \operatorname{rank}{A} = n \\
> \dim\mathcal{N}(\bm{A}^\top) + \operatorname{rank}{A} = m
> \end{gather*}
> $$

因此，我们可以将任意向量$\bm{x}$分解为两个互相正交的向量的和，一个在$\bm{A}^\top$的值域中，另一个在$\bm{A}$的零空间中：

$$
\bm{x}  = \bm{A}^\top\bm{y} + \bm{z},\bm{z} \in \mathcal{N}(\bm{A})
$$
类似地，我们可以将任意向量$\bm{x}$分解为两个互相正交的向量的和，一个在$\bm{A}$的值域中，另一个在$\bm{A}^\top$的零空间中：

$$
 \bm{x}  = \bm{A}\bm{\phi } + \bm{\zeta},\bm{\zeta} \in \mathcal{N}(\bm{A}^\top)
$$
![3.4](https://img.wblyu.top/optimization-models/3.4.png "3.4")

## 3. 行列式、特征值和特征向量

### 3.1 矩阵对直线的作用

我们首先讨论，一个线性映射$\bm{A}$如何作用于通过原点的直线（一维子空间）。考虑一个非零向量$\bm{u}\in \mathbb{R}^n$以及从原点出发原点并经过$\bm{u}$的直线，即集合$\mathcal{L} = \{ \bm{x}\mid  \bm{x} = \alpha\bm{u}, \alpha \in \mathbb{R}\}$。当矩阵作用于属于直线上的向量时，它会将该点旋转(rotate)一个固定角度$\theta_u$，并将它的长度按固定量$\gamma_u$放大或缩小(shrink/amplify)。旋转角度$\theta_u$和长度增益$\gamma_u$对于直线上的每个点都是恒定值

$$
\lVert \bm{y} \rVert_2 = \lVert \bm{Ax} \rVert_2 = \lvert \alpha \rvert \lVert \bm{Au} \rVert_2 = \frac{\lVert\bm{Au} \rVert_2}{\lVert \bm{u} \rVert_2} \lvert \alpha \rvert \lVert \bm{u} \rVert = \frac{\lVert \bm{Au}\rVert_2}{\lVert \bm{u} \rVert_2} \lVert \bm{x} \rVert_2
$$
长度增益为$\gamma_u=\tfrac{\lVert \bm{Au}\rVert_2}{\lVert \bm{u} \rVert_2}$，对于旋转角度

$$
\cos \theta_u = \frac{\bm{y}^\top \bm{x}}{\lVert \bm{x} \rVert_2 \lVert \bm{y} \rVert_2} = \frac{\bm{x}^\top \bm{A}^\top \bm{x}}{\lVert \bm{x} \rVert_2 \lVert \bm{y} \rVert_2} = \frac{\alpha^2 \bm{u}^\top \bm{A}^\top \bm{u}}{\gamma_u \alpha^2 \lVert \bm{u} \rVert^2_2} = \frac{ \bm{u}^\top \bm{A}^\top \bm{u}}{\gamma_u \lVert \bm{u} \rVert^2_2}
$$
这二者都仅仅取决于直线的方向$\bm{u}$，而不取决于直线上的实际点

当$\lVert \bm{x} \rVert_2$保持不变且方向$\bm{u}$扫描所有可能的方向时，$\bm{x}$会沿圆周移动，而图中显示了相应的$\bm{y}$的轨迹

![3.5](https://img.wblyu.top/optimization-models/3.5.png "3.5")

通过数值实验可以发现，在这个例子中存在两个输入方向$\bm{u}(1)$、$\bm{u}(2)$，它们在由$\bm{A}$定义的映射下是角度不变的即角度$\theta_u$为零（或 $\pm 180^\circ$），此时$\bm{A}$在这些直线上表现为标量乘法

![3.6](https://img.wblyu.top/optimization-models/3.6.png "3.6")

### 3.2 行列式和单位立方体的变化

对于一个$2 \times 2$的矩阵

$$
\bm{A} =
\begin{bmatrix}
    a_{11} & a_{12} \\
    a_{21} & a_{22}
\end{bmatrix}
$$
这个矩阵的行列式(determinant)被定义为

$$
\det \bm{A} \coloneqq a_{11}a_{22} - a_{12}a_{21}
$$
要求解一般矩阵的行列式，首先要定义标量$a$的行列式$\det a = a$，然后应用拉普拉斯行列式展开(Laplace’s determinant expansion)来计算

$$
\det (\bm{A}) = \sum_{j=1}^n(-1)^{i+j}a_{ij}\det \bm{A}_{(i,j)}
$$
其中$i$是任意一行，$\bm{A}_{(i,j)}$表示通过删除$\bm{A}$的第$i$行和第$j$列得到的一个$(n−1) \times (n−1)$子矩阵

假设我们将线性映射$\bm{y} = \bm{Ax}$应用于$\mathbb{R}^2$中单位正方形顶点的四个向量，变换后的点构成一个平行四边形的顶点

![3.6](https://img.wblyu.top/optimization-models/3.6 "3.6")

单位正方形的面积为一。通过验证可以知道变换后的四边形（即平行四边形）的面积等于矩阵行列式的绝对值。可以证明，在一般维数$n$中，**矩阵$\bm{A}$的行列式的绝对值仍然描述了单位超立方体通过$\bm{A}$变换得到的平行多面体的体积**

行列式是定义在**方阵**上的实值函数，矩阵的行列式有以下性质

1. 交换矩阵的两行或者两列会改变行列式的符号
2. 行列式在矩阵的每一行/列上都是线性的
3. 单位矩阵的行列式为1

当变换后的立方体体积为零时，也就是**行列式为零时**，此时矩阵为奇异矩阵(singular)。此时**矩阵某一行（或某一列）是另一行（或另一列）的倍数，列（和行）不再是线性无关的**，并且矩阵具有非平凡的零空间（零空间不只有原点）。这意味着存在输入空间中的方向，沿着这些方向所有输入向量都被$\bm{A}$映射为零，可以证明

$$
\bm{A} \in \mathbb{R}^{n,n}\text{ is singular }\Leftrightarrow\det \bm{A}=0\boldsymbol{\Leftrightarrow}\mathcal{N}(\bm{A})\text{ is not equal to }\{0\}.
$$
对于任意方阵$\bm{A},\bm{B}\in \mathbb{R}^{n,n}$有如下性质

$$
\begin{gather*}
    \det \bm{A} = \det \bm{A}^\top \\
    \det \bm{AB} = \det \bm{BA} = \det \bm{A} \det \bm{B} \\
    \det \alpha\bm{A} = \alpha^n\det \bm{A}
\end{gather*}
$$
对于分块上三角(upper block-triangular)矩阵

$$
\bm{X} =\begin{bmatrix}
    \bm{X}_{11} & \bm{X}_{12} \\
    \bm{X}_{21} & \bm{X}_{22}
\end{bmatrix}
$$
有如下结论

$$
\det \bm{X} =  \det \bm{X}_{11} + \det \bm{X}_{22}
$$
对于分块下三角(lower block-triangular)矩阵也有类似结论

### 3.3 矩阵的逆

对于一个非奇异矩阵$\bm{A}$，我们定义它的逆矩阵(inverse matrix)$\bm{A}^{-1}$定义为满足以下条件的唯一矩阵

$$
\bm{AA}^{-1} = \bm{A}^{-1}\bm{A} = \bm{I}_n
$$
矩阵求逆有以下性质
$$
\begin{gather*}
    (\bm{AB})^{-1}=\bm{B}^{-1}\bm{A}^{-1} \\
    (\bm{A}^\top)^{-1} = (\bm{A}^{-1})^\top \\
    \det \bm{A} = \det \bm{A}^\top = \frac{1}{\det \bm{A}^{-1}}
\end{gather*}
$$
对于非方阵或是奇异方阵不存在常规意义的逆矩阵，但是可以定义广义逆矩阵(generalized inverse)/伪逆矩阵(pseudoinverse)。对于一般矩阵$\bm{A}\in \mathbb{R}^{m,n}$，如果满足

$$
\begin{gather*}
 \bm{A}^{li}\bm{A} = \bm{I}_n,m \geq n \\
 \bm{A}\bm{A}^{ri} = \bm{I}_m,n \geq m \\
\end{gather*}
$$
则$\bm{A}^{li}$被称为$\bm{A}$的左逆,$\bm{A}^{ri}$被称为$\bm{A}$的右逆

如果$\bm{AA}^{pi} \bm{A} = \bm{A}$，则称矩阵$\bm{A}^{pi}$为$\bm{A}$的伪逆。左逆、右逆和伪逆将在Chapter 5中进一步讨论

根据逆矩阵的定义可以初步得出推论：

1. 矩阵可逆是行列式不为零的充要条件；
2. 矩阵可逆是特征值全不为零的充要条件；

> **证明**
>
> 1. 矩阵可逆则行列式不为零
>
> 由可逆的定义，存在$\bm{A}^{-1}$使得$\bm{AA}^{-1}=\bm{I}$，对等式两边取行列式
> $$
\begin{align*}
   \det (\bm{AA}^{-1}) &= \det (\bm{I}) \\
   \det (\bm{A})\det (\bm{A}^{-1})  &= 1 \\
\end{align*}
> $$
> 若行列式为零，则左边为$0$，与等式右边$1$矛盾
>
> 2. 行列式不为零则矩阵可逆
>
> 对于任意n阶方阵$\bm{A}$，其伴随矩阵$\bm{A}^\ast$满足
> $$
> \bm{AA}^\ast = \bm{A}^\ast\bm{A} = \det (\bm{A})\bm{I}
> $$
> 因为行列式不为零，将两边都除以$\det (\bm{A})$
> $$
> \bm{A}\frac{\bm{A}^\ast}{\det (\bm{A})}=  \frac{\bm{A}^\ast}{\det (\bm{A)}}\bm{A}  = \bm{I}
> $$
> $\tfrac{\bm{A}^\ast}{\det (\bm{A})}$即为逆矩阵
>
> 3. 矩阵可逆$\Leftrightarrow$特征值全不为零
>
> 根据Section3.3.5中的结论可知特征值之积等于行列式，矩阵可逆则行列式不为零，那么特征值之积便不为零，那么特征值全不为零；反之亦然

结合Section3.3.2中关于奇异矩阵的结论，我们可以得到更加全面的结论

> **结论**
>
> 对于$\bm{A} \in \mathbb{R}^{n,n}$有
>
> 矩阵奇异 $\Leftrightarrow$ 特征值为零 $\Leftrightarrow$ 零空间不平凡（零空间不只有零点） $\Leftrightarrow$ 矩阵不可逆 $\Leftrightarrow$ 存在特征值为零
>
> 矩阵非奇异 $\Leftrightarrow$ 特征值不为零 $\Leftrightarrow$ 零空间平凡（零空间只有零点） $\Leftrightarrow$ 矩阵可逆 $\Leftrightarrow$ 特征值全不为零

### 3.4 相似矩阵

如果存在一个非奇异矩阵$\bm{P}\in \mathbb{R}^{n,n}$，使得两个矩阵$\bm{A},\bm{B}\in \mathbb{R}^{n,n}$满足如下条件，则称它们是相似(similar)的

$$
\bm{B} = \bm{P}^{-1}\bm{AP}
$$
相似矩阵是同一线性映射在不同空间基的不同表现。考虑原空间的线性映射

$$
\bm{y} = \bm{Ax}
$$
由于$\bm{P}$是非奇异的，其列向量是线性无关的，因此它们代表了$\mathbb{R}^n$的一组基。向量$\bm{y}$和$\bm{x}$可以在该基下表示为$\bm{P}$列向量的线性组合

$$
\begin{gather*}
    \bm{A}\tilde{\bm{y}} = \bm{y} \\
    \bm{A}\tilde{\bm{x}} = \bm{x}
\end{gather*}
$$
线性映射在新基下表达为

$$
\bm{y} = \bm{Ax} \quad \Rightarrow \quad \tilde{\bm{y}}= \bm{P}^{-1}\bm{AP} \tilde{\bm{x}} = \bm{B} \tilde{\bm{x}}
$$

### 3.5 特征向量和特征值

我们前面在研究矩阵对直线的作用时提到过，矩阵会对对直线上的点（向量）进行旋转和放缩，我们现在将视角从$\mathbb{R}^n$扩大到$\mathbb{C}^n$。特征向量(eigenvector)只是$\mathbb{C}^n$中在矩阵作用下角度不变的方向，特征值(eigenvalue)是对点放缩的系数。更准确地说，如果存在$\lambda \in \mathbb{C}$是矩阵$\bm{A} \in \mathbb{R}^{n,n}$的特征值，且$\bm{u} \in \mathbb{C}^n$是对应的特征向量，则下式成立

$$
\bm{Au}  = \lambda \bm{u}, \bm{u} \neq \bm{0}
$$
或者等价形式

$$
 (\lambda \bm{I}_n - \bm{A}) \bm{u} = \bm{0}, \bm{u} \neq \bm{0}
$$
方程表明为了使$(\lambda , \bm{u})$成为特征值/特征向量对，必须满足以下条件：

1. $\lambda$的取值要使矩阵$\lambda \bm{I}_n - \bm{A}$奇异
2. $\bm{u}$位于$\lambda \bm{I}_n - \bm{A}$的零空间中

由于$\lambda \bm{I}_n - \bm{A}$当且仅当其行列式为零时是奇异的，因此特征值可以很容易地被描述为满足下述方程的实数或复数

$$
 \det (\lambda \bm{I}_n - \bm{A}) = 0
$$
$p(\lambda ) \coloneqq \det (\lambda \bm{I}_n - \bm{A})$是关于$\lambda$的$n$次多项式，被称为矩阵$\bm{A}$的特征多项式(characteristic polynomial)。因此，矩阵的特征值就是特征多项式的根。其中一些特征值确实可以是特征多项式的“重根”。此外，一些特征值可能是复数，具有非零的虚部，在这种情况下，它们成共轭复数对出现。下列定理成立

> **定理3.2（代数学基本定理）**：任意矩阵$\bm{A} \in \mathbb{R}^{n,n}$都有$n$个特征值，按重数计算。

我们称不考虑重数的特征值为互异特征值(distinct eigenvalues)，每个互异特征值都有一个对应的代数重数(algebraic multiplicity)$\mu_i \geq 1$，定义为该特征值作为特征多项式根出现的次数。因此$\sum_{i=1}^{k} \mu_i = n$

对于每个互异特征值都对应一个由与该特征值相关的特征向量组成的整个子空间$\mathcal{V}_i \coloneqq \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$，称为特征空间。属于不同特征空间的特征向量是线性无关的

> **定理3.3**：设$\lambda_i$是矩阵$\bm{A}$的互异特征值。设$\mathcal{V}_i = \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$，并且令$\bm{u}^{(i)}$为任意非零向量，使得$\bm{u}^{(i)} \in \mathcal{V}_i$。则这些$\bm{u}^{(i)}$线性无关

> **证明**
>
> **首先证明两个向量是线性无关的**
>
> 假设最初$\bm{u}^{(i)} \in \mathcal{V}_j,j \neq i$。这意味着$\bm{Au}^{(i)} = \lambda _j \bm{u}^{(i)} = \lambda _i \bm{u}^{(i)}$，因此$\lambda_i = \lambda_j$，但这是不可能的，因为这些$\lambda$是互异的。假设矛盾，所以任意两个向量是线性无关的
>
> 但是向量组中任意两个向量线性无关，向量组不一定线性无关，因此**还需要证明整个特征向量组是线性无关的**
>
> 为了反证法的目的，假设存在一个$\bm{u}^{(i)}$（例如不失一般性，取第一个，$\bm{u}^{(1)}$可以表示为其他特征向量的线性组合：
> $$
>  \bm{u}^{(1)} = \sum_{i=2}^{k} \alpha_i \bm{u}^{(i)}
> $$
> 然后我们有两个恒等式
>
> $$
> \begin{gather*}
> \lambda_1\bm{u}^{(1)} = \sum_{i=2}^{k} \alpha_i \lambda_1\bm{u}^{(i)} \\
> \lambda_1\bm{u}^{(1)} = \bm{A}\bm{u}^{(1)} = \sum_{i=2}^{k} \alpha_i \bm{A}\bm{u}^{(i)} = \sum_{i=2}^{k} \alpha_i \lambda_i\bm{u}^{(i)}
> \end{gather*}
> $$
> 比较两个方程可以得到
>
> $$
>  \sum_{i=2}^{k} \alpha_i (\lambda_i- \lambda_1)\bm{u}^{(i)} = \bm{0}
> $$
> 其中$\lambda_i - \lambda _1 \neq 0$，因为根据假设，特征值是互异的。这意味着$\sum_{i=2}^{k}\alpha _i \bm{u}^{(i)}$为零，所以$\bm{u}^{(2)},\cdots , \bm{u}^{(k)}$是线性相关的。因此至少有一个向量，比如说不失一般性，$\bm{u}^{(2)}$，可以表示为其他向量$\bm{u}^{(3)},\cdots , \bm{u}^{(k)}$的线性组合。在此基础上，通过重复最初的推理，我们也会得出$\bm{u}^{(3)},\cdots , \bm{u}^{(k)}$是线性相关的。以此类推，我们最终会得出$\bm{u}^{(k-1)}, \bm{u}^{(k)}$是线性相关的结论。根据我们前面的证明，这是不可能的。因此，我们得出假设与事实矛盾，从而该命题得证
>
> 这部分将整个特征向量组是线性无关的证明推导成任意两个向量是线性无关的

得益于特征值和特征向量，一个方阵可以被表示为与一个分块三角矩阵相似，即具有以下形式的矩阵

$$
\begin{bmatrix}
\bm{A}_{11} & \bm{A}_{12} & \cdots & \bm{A}_{1p} \\
\bm{0}      & \bm{A}_{22} & \cdots & \bm{A}_{2p} \\
\vdots      & \ddots      & \ddots & \vdots \\
\bm{0}      & \cdots      & \bm{0} & \bm{A}_{pp} \\
\end{bmatrix}
$$
其中对角线上的矩阵为方阵

设$v_i$为$\mathcal{V}_i$的维数，并设一个矩阵$\bm{U}^{(i)}=[\bm{u}_1^{(i)}\quad \dots \quad \bm{u}_{v_i}^{(i)}]$，其列为$\mathcal{V}_i$的一组基。在不失一般性的情况下，该矩阵可以选择为列标准正交的矩阵。实际上，可以先选任意一组基，并对该基应用Gram–Schmidt正交化过程（见Section2.3.3），即可得到标准正交基。通过这种选择，有$\bm{U}^{(i)\top}  \bm{U}^{(i)} = \bm{I}_{v_i}$。进一步设$\bm{Q}^{(i)}$为一个$n \times  (n − v_i)$矩阵，其列标准正交并张成与$\mathcal{R}(\bm{U}^{(i)})$ 正交的子空间

> **推论3.1**：任意矩阵$\bm{A} \in \mathbb{R}^{n,n}$都与一个分块三角矩阵相似，该矩阵在对角线上具有块$\lambda _i \bm{I}_{v_i}$，其中$\lambda _i$是$\bm{A}$的一个互异特征值，$v_i$是对应特征空间的维数

> **证明**
>
> 符合矩阵$\bm{P}_i \coloneqq [\bm{U}^{(i)} \quad \bm{Q}^{(i)}]$是一个正交矩阵（$\bm{P}_i$的列向量形成一个覆盖整个$\mathbb{C}^n$空间的标准正交(orthonormal)基，参考Section3.4.6[4.6节](#4-6-矩阵对直线的作用)），因此它是可逆(invertible)的，并且$\bm{P}_i^{-1} = \bm{P}_i^\top$，参考Section3.4.6[4.6节](#4-6-矩阵对直线的作用)。因为$\bm{AU}^{(i)}=\lambda_i \bm{U}^{(i)}$，可以得到
>
> $$
> \begin{gather*}
> \bm{U}^{(i)\top}\bm{AU}^{(i)}=\lambda_i \bm{U}^{(i)\top}\bm{U}^{(i)} = \lambda_i \bm{I}_{v_i}\\
> \bm{Q}^{(i)\top}\bm{AU}^{(i)}=\lambda_i \bm{Q}^{(i)\top}\bm{U}^{(i)} = \bm{0}
> \end{gather*}
> $$
> 因此可以得到
>
> $$
> \bm{P}_i^{-1} \bm{A} \bm{P}_i = \bm{P}_i^\top \bm{A} \bm{P}_i =
> \begin{bmatrix}
> \lambda_i \bm{I}_{v_i} & \bm{U}^{(i)\top}\bm{AQ}^{(i)} \\
> \bm{0} & \bm{Q}^{(i)\top}\bm{AQ}^{(i)}
> \end{bmatrix}
> $$
> 证明完成

由于**相似矩阵具有相同的特征值集合（包括重数）**，并且**分块上三角矩阵的特征值集合是对角块特征值的并集**，观察上式可以发现左上角矩阵特征值的重数为$v_i$，因此总体的特征值重数$\mu_i$必须总是满足$v_i \leq \mu_i$，最终可以得出结论：**互异特征值对应的特征空间维数总是小于等于特征值重数**

> **证明**
>
> **1. 相似矩阵具有相同的特征值集合（包括重数）**
>
> 证明核心为：相似矩阵的特征多项式相等。设$\bm{A},\bm{B} \in \mathbb{R}^{n,n}$为相似矩阵，即$\bm{B}=\bm{P}^{-1}\bm{A}\bm{P}$，$\bm{B}$的特征多项式为
> $$
> \begin{align*}
> f_{\bm{B}}(\lambda) &= \det(\lambda \bm{I}-\bm{B})\\
> &= \det(\lambda \bm{I}-\bm{P}^{-1}\bm{A}\bm{P}) \\
> &= \det(\bm{P}^{-1}\bm{P}\lambda \bm{I}-\bm{P}^{-1}\bm{P}\bm{P}^{-1}\bm{A}\bm{P}) \\
> &= \det \big(\bm{P}^{-1}(\bm{P} \lambda\bm{I})-\bm{P}^{-1}\bm{A}\bm{P}\big) \text{与单位矩阵相乘可以使用交换律} \\
> &= \det \big(\bm{P}^{-1}(\lambda\bm{I}\bm{P} )-\bm{P}^{-1}\bm{A}\bm{P}\big) \\
> &= \det \big(\bm{P}^{-1}(\lambda\bm{I} - \bm{A} )\bm{P}\big) \\
> &= \det (\bm{P}^{-1})\det(\lambda\bm{I} - \bm{A} )\det(\bm{P}) \\
> &= \det (\bm{P}^{-1}\bm{P})\det(\lambda\bm{I} - \bm{A} ) \\
> &=\det(\lambda\bm{I} - \bm{A}) \\
> &=f_{\bm{A}}(\lambda)
> \end{align*}
> $$
> **2. 分块上三角矩阵的特征值集合是对角块特征值的并集**
>
> 核心证明为：上三角矩阵特征多项式可拆分成对角块特征多项式连乘。定义上三角矩阵
> $$
> \bm{M}=
> \begin{bmatrix}
> \bm{A}_{11} & \bm{A}_{12} & \cdots & \bm{A}_{1k} \\
> \bm{0} & \bm{A}_{22} & \cdots & \bm{A}_{2k} \\
> \vdots & \vdots & \ddots & \vdots \\
> \bm{0} & \bm{0} & \cdots & \bm{A}_{kk} \\
> \end{bmatrix}
> $$
> 则需证明$f_{\bm{M}}(\lambda) = f_{\bm{A}_{11}}(\lambda)f_{\bm{A}_{22}}(\lambda)\cdots f_{\bm{A}_{kk}}(\lambda)$。要证明上述特征多项式等式，只需引入核心引理：**分块上三角矩阵的行列式 = 其所有对角块行列式的乘积**，即：$\det(M) = \det(A_{11}) \cdot \det(A_{22}) \cdot \dots \cdot \det(A_{kk})$。这个可通过归纳法证明
> $$
> \lambda \bm{I}-\bm{M}=
> \begin{bmatrix}
> \lambda \bm{I}-\bm{A}_{11} & -\bm{A}_{12} & \cdots & -\bm{A}_{1k} \\
> \bm{0} & \lambda \bm{I}-\bm{A}_{22} & \cdots & -\bm{A}_{2k} \\
> \vdots & \vdots & \ddots & \vdots \\
> \bm{0} & \bm{0} & \cdots & \lambda \bm{I}-\bm{A}_{kk} \\
> \end{bmatrix}
> $$
> 对$\lambda \bm{I}-\bm{M}$应用此结论，可得到$\det(\lambda \bm{I}-\bm{M}) = \det(\lambda \bm{I}-\bm{A}_{11}) \cdot \det(\lambda \bm{I}-\bm{A}_{22}) \cdot \dots \cdot \det(\lambda \bm{I}-\bm{A}_{kk} )$，即$f_{\bm{M}}(\lambda) = f_{\bm{A}_{11}}(\lambda)f_{\bm{A}_{22}}(\lambda)\cdots f_{\bm{A}_{kk}}(\lambda)$

对于特征值我们有结论：**特征值之和等于迹，特征值之积等于行列式**

> **证明**
>
> 证明需要用到**韦达定理的推广定理**
>
> 1. 所有根之和为$n-1$次项系数与$n$次项系数之比的相反数
> 2. 所有根之积为常数项与$n$次项系数之比再乘以$(-1)^n$
>
> 设$\bm{A} \in \mathbb{R} ^{n,n}$，其特征多项式为
> $$
> f_{\bm{A}}(\lambda ) =
> \begin{vmatrix}
> \lambda - a_{11} & -a_{12} & \cdots & -a_{1n} \\
> -a_{21} & \lambda -a_{22} & \cdots & -a_{2n} \\
> \vdots & \vdots & \ddots  & \vdots \\
> -a_{n1} & -a_{n2} & \cdots & \lambda -a_{nn}
> \end{vmatrix}
> $$
> 特征多项式的常数项等于多项式在$0$处的值，即
> $$
> f(0) = \lvert -\bm{A} \rvert  = (-1)^n\lvert \bm{A} \rvert
> $$
> 因为行列式中，只有主对角线元素含有$\lambda$，因此在行列式的所有乘积项中，除了主对角线的$n$个元素的乘积，其余的乘积项中$\lambda$的次数不会超过$n-2$次。所以$f_{\bm{A}}(\lambda )$中$\lambda ^n$和$\lambda ^{n-1}$的系数只需考虑$(\lambda - a_{11})(\lambda -a_{22})\cdots(\lambda -a_{nn})$项。因此$\lambda ^n$的系数为$1$，$\lambda ^{n-1}$的系数为$-\sum_{i=1}^{n}a_{ii}$，根据韦达定理知
> $$
> \begin{gather*}
> \lambda _1 + \lambda _2 + \cdots +\lambda _n = \sum_{i=1}^{n}a_{ii} = \operatorname{trace} (\bm{A}) \\
> \lambda _1 \lambda _2 \cdots \lambda _n = \lvert \bm{A} \rvert
> \end{gather*}
> $$

### 3.6 可对角化矩阵

在某些假设下，$\bm{A} \in \mathbb{R} ^{n,n}$与一个对角矩阵相似，即$\bm{A}$是可对角化的(diagonalizable)。（并非所有方阵都是可对角化的。但是可以证明，总存在一个任意小的加法扰动使其可对角化）

> **定理3.4**： 设$\lambda_i$是矩阵$\bm{A} \in \mathbb{R} ^{n,n}$的互异特征值，设$\mu _i$为对应的代数重数，定义$\mathcal{V}_i = \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$，定义$\bm{U}^{(i)}=[\bm{u}_1^{(i)}\quad \dots \quad \bm{u}_{v_i}^{(i)}]$的列为$\mathcal{V}_i$的一组基，那么$v_i \coloneqq \dim \mathcal{V}_i$，可以得到$v_i \leq \mu_i$。如果$v_i = \mu_i$那么$\bm{U}=[\bm{U}^{(1)}\quad \dots \quad \bm{U}^{(k)}]$是可逆的，并且$\bm{A} = \bm{U} \bm{\Lambda} \bm{U}^{-1}$，其中
> $$
> \Lambda =
> \begin{bmatrix}
> \lambda _1 \bm{I}_{\mu _1} & \bm{0} & \cdots & \bm{0} \\
> \bm{0} & \lambda _2 \bm{I}_{\mu _2} & \cdots & \bm{0} \\
> \vdots & \vdots & \ddots & \vdots \\
> \bm{0} & \cdots & \bm{0} & \lambda _k \bm{I}_{\mu _k}
> \end{bmatrix}
> $$

> **证明**
>
> $v_i \leq \mu_i$已经在前文证明了。现在令$v_i = \mu_i$。因为向量$\bm{u}_1^{(i)},\dots,\bm{u}_{v_i}^{(i)}$是特征空间的基，因此它们是线性无关的。此外，根据定理3.3，不同特征值对应的特征空间中的基是线性无关的。这意味着整个集合$\{ \bm{u}_j^{(i)} \}_{i=1,\dots,k;j=1,\dots,v_i}$是线性无关的。那么矩阵$\bm{U}$是满秩的。由于对所有$i$有$v_i = \mu_i$，那么$\sum_{i=1}^{k}v_i =\sum_{i=1}^{k}\mu_i$，此时$\bm{U} \in \mathbb{R}^{n,n}$是方阵，且是满秩故而可逆
>
> 对于每个$i = 1,\dots, k$，我们有$\bm{Au}_j^{(i)}=\lambda _i \bm{u}_j^{(i)}$，可以将同一个特征值下的等式写进一个矩阵
>
> $$
> \bm{AU}_j^{(i)}=\lambda _i \bm{u}_j^{(i)}
> $$
> 再将不同特征值的等式写进一个矩阵
>
> $$
>  \bm{AU} = \bm{U \Lambda }
> $$
> 将等式两边同时右乘$\bm{U}^{-1}$，可得到所证

## 4. 具有特殊结构和性质的矩阵

### 4.1 方阵

方阵(square matrix)是指行数和列数相同的矩阵

### 4.2 稀疏矩阵

非正式地说，如果矩阵中的大多数元素为零，则称其为稀疏矩阵(sparse matrix)。在处理稀疏矩阵时，可以获得若干计算效率的提高。例如，可以仅存储其非零元素。此外，通过仅处理矩阵的非零元素，像加法和乘法这样的操作也可以高效地进行

### 4.3 对称矩阵

对称矩阵(symmetric matirx)是满足$\bm{A} = \bm{A}^\top$的方阵。一个对称的$n \times n$矩阵由主对角线及其上方的元素决定，对角线下方的元素是上方元素的对称副本。因此，对称矩阵的“自由”元素的数量是

$$
n+(n-1)+\cdots+1 = \frac{n(n+1)}{2}
$$
对称矩阵在Chapter4进一步讨论

### 4.4 对角矩阵

对角矩阵(diagonal matrices)是指除对角线上以外的元素全为0的方阵。一个$n \times n$的对角矩阵可以表示为$\bm{A} = \operatorname{diag}(\bm{a})$，其中$\bm{a}$是一个包含$\bm{A}$对角元素的$n$维向量

$$
\bm{A} = \operatorname{diag}(a_1,\cdots,a_n) =
\begin{bmatrix}
a_1&&\\
&\ddots&\\
&&a_n
\end{bmatrix}
$$
通常对角线以外的零元素省略不写。易证，**对角矩阵的特征值就是对角线上的元素**。此外，**对角矩阵的行列式值为对角线上的元素乘积**，因此**当且仅当对角线上元素全不为$0$时矩阵是非奇异的**。非奇异对角矩阵的逆矩阵非常简单，是

$$
\bm{A}^{-1} = \begin{bmatrix}
\tfrac{1}{a_1} &&\\
&\ddots&\\
&&\tfrac{1}{a_n}
\end{bmatrix}
$$

### 4.5 三角矩阵

三角矩阵(triangular matrix)是指所有在对角线之上或之下的元素都为零的方阵。特别地，上三角矩阵(upper-triangular matrix)为

$$
 A=
\begin{bmatrix}
a_{11} & \cdots & a_{1n} \\
 & \ddots & \vdots \\
 & & a_{nn}
\end{bmatrix}
$$
下三角矩阵(lower-triangular matrix)为

$$
 A=\begin{bmatrix}
a_{11}&& \\
\vdots & \ddots & \\
a_{n1} & \cdots & a_{nn}
\end{bmatrix}
$$
与对角矩阵类似，**三角矩阵的特征值是对角线上的元素**，并且**行列式值为对角线上的元素乘积**。两个上（resp. 下）三角矩阵的乘积仍然是上（resp. 下）三角矩阵。非奇异上（resp. 下）三角矩阵的逆矩阵仍然是上（resp. 下）三角矩阵

### 4.6 正交矩阵

正交矩阵(orthogonal matrix)是列向量能够组成$\mathbb{R} ^n$空间中的标准正交基的方阵，所以对正交矩阵$\bm{U}=[\bm{u}_1\cdots \bm{u}_n]$有

$$
 \bm{u}_i^\top \bm{u}_j = \left\{
\begin{array}
{ll}1 & \mathrm{if}\quad i=j, \\
0 & \mathrm{otherwise}.
\end{array}\right.
$$
因此$\bm{U}^\top \bm{U} = \bm{U} \bm{U}^\top = \bm{I}_n$，还可以得到$\bm{U}^\top = \bm{U}^{-1}$。正交矩阵保持长度和角度。对于任意向量$\bm{x}$

$$
\lVert \bm{Ux} \rVert_2^2 = (\bm{Ux})^\top(\bm{Ux}) = \bm{x}^\top \bm{U}^\top \bm{Ux} = \bm{x}^\top \bm{x} =  \lVert \bm{x} \rVert_2^2
$$
因此，$\bm{x} \rightarrow \bm{Ux}$保持长度不变。此外，正交映射还保持角度不变：如果$\bm{x},\bm{y}$是两个单位范数向量，则它们之间的角度$\theta$满足$\cos \theta = \bm{x}^\top \bm{y}$，而旋转后的向量$\bm{x}^\prime=\bm{Ux}$、$\bm{y}^\prime=\bm{Uy}$之间的角度$\theta ^\prime$满足$\cos \theta ^\prime=(\bm{x}^\prime )^\top y^\prime = \bm{x}^\top \bm{y}$，因此旋转前后两个向量的夹角是相同的。反之亦然：任何保持长度和夹角不变的方阵都是正交的。此外，一个矩阵在前后分别乘以正交矩阵不会改变Frobenius范数（以及在Section 3.6.3正式定义的$L_2$诱导范数）

$$
\lVert \bm{UAV} \rVert_F = \lVert \bm{A} \rVert_F
$$
矩阵可以看成对直线的旋转，而正交矩阵可以写成三角函数形式
$$
\bm{U}(\theta) = \begin{bmatrix}
    \cos \theta  & -\sin \theta \\
    \sin \theta  & \cos  \theta
\end{bmatrix}
$$
这个矩阵看成角度$\theta$的逆时针旋转

### 4.7 并矢

如果矩阵$\bm{A} \in \mathbb{R} ^{m,n}$可以表示为$\bm{A} = \bm{uv}^\top$的形式，其中$\bm{u} \in \mathbb{R} ^m$且$\bm{v} \in \mathbb{R} ^n$，则称$\bm{A}$为并矢(dyad)。如果$\bm{u}$和$\bm{v}$的维度相同，则$\bm{A}$是方阵。二次型作用于输入向量 x ∈ Rn 的方式如下：

并矢的每一行(resp. 每一列)都是$\bm{v}$(resp. $\bm{u}$)的缩放版本，缩放的系数由向量$\bm{u}$(resp. $\bm{v}$)给出。而矩阵与向量的乘积可以看成对矩阵列元素的线性组合。综上，并矢与向量的乘积可以看成对$\bm{u}$的缩放

$$
 \bm{Ax} = (\bm{uv}^\top )\bm{x}=(\bm{v}^\top \bm{x})\bm{u}
$$
并矢与向量的乘积输出总是指向相同的方向$\bm{u}$，无论输入$\bm{x}$是什么。因此输出总是$\bm{u}$的一个简单缩放版本。缩放的量取决于$\bm{v}^\top \bm{x}$

如果$\bm{u}$和$\bm{v}$都非零，则并矢的秩为一，因为它的值域是由$\bm{u}$生成的直线。一个方形并矢只有一个非零特征值$\lambda = \bm{v}^\top\bm{u}$，对应的特征向量为$\bm{u}$。我们总可以对并矢进行归一化：

$$
 \bm{A} = \bm{uv}^\top = (\lVert \bm{u} \rVert_2 \lVert \bm{v} \rVert_2) \frac{\bm{u}}{\lVert \bm{u} \rVert_2} \frac{\bm{v}^\top }{\lVert \bm{v} \rVert_2} = \sigma \tilde{\bm{u}} \tilde{\bm{v}}^\top
$$
其中$\sigma$为两个向量的范数乘积，$\lVert \tilde{\bm{u}} \rVert_2 = \lVert \tilde{\bm{v}} \rVert_2 = 1$

### 4.8 块结构矩阵

任何矩阵都能被划分为块或子矩阵
$$
 \bm{A} = \begin{bmatrix}
    \bm{A}_{11} & \bm{A}_{12}\\
    \bm{A}_{21} & \bm{A}_{22}
\end{bmatrix}
$$
当$\bm{A}$为方阵，且$\bm{A}_{12} = \bm{0},\bm{A}_{21} = \bm{0}$（这里的$\bm{0}$指的是维度合适的全零矩阵块）时，$\bm{A}$称为块对角矩阵
$$
\bm{A} = \begin{bmatrix}
    \bm{A}_{11} & \bm{0}\\
    \bm{0} & \bm{A}_{22}
\end{bmatrix}
$$
矩阵$\bm{A}$的特征值集合$\lambda (\bm{A})$是$\bm{A}_{11}$和$\bm{A}_{22}$的特征值集合的并集
$$
\lambda (\bm{A}) = \lambda (\bm{A}_{11}) \cup \lambda (\bm{A}_{22}),\bm{A} \text{ is block diagonal}
$$
此外，当且仅当对角块可逆时块对角矩阵整体可逆，并且有
$$
\begin{bmatrix}
    \bm{A}_{11} & \bm{0}\\
    \bm{0} & \bm{A}_{22}
\end{bmatrix}^{-1}
=
\begin{bmatrix}
    \bm{A}_{11}^{-1} & \bm{0}\\
    \bm{0} & \bm{A}_{22}^{-1}
\end{bmatrix}
$$
如果矩阵$\bm{A}$为方阵，且$\bm{A}_{21} = \bm{0}$，则称其为分块上三角矩阵；如果$\bm{A}_{12} = \bm{0}$，则称其为分块下三角矩阵
$$
\begin{gather*}
\bm{A} = \begin{bmatrix}
    \bm{A}_{11} & \bm{0}\\
    \bm{A}_{21} & \bm{A}_{22}
\end{bmatrix},\text{block lower triangular} \\
\bm{A} = \begin{bmatrix}
    \bm{A}_{11} & \bm{A}_{12}\\
    \bm{0} & \bm{A}_{22}
\end{bmatrix},\text{block upper triangular}
\end{gather*}
$$
同样，对于分块三角矩阵，$\bm{A}$的特征值是对角块特征值的并集，即
$$
\lambda (\bm{A}) = \lambda (\bm{A}_{11}) \cup \lambda (\bm{A}_{22}),\bm{A} \text{ is block triangular}
$$
非奇异块三角矩阵的逆可以表示如下
$$
\begin{gather*}
\begin{bmatrix}
\bm{A}_{11} & \bm{0} \\
\bm{A}_{21} & \bm{A}_{22}
\end{bmatrix}^{-1}
=
\begin{bmatrix}
\bm{A}_{11}^{-1} & \bm{0} \\
-\bm{A}_{22}^{-1}\bm{A}_{21}\bm{A}_{11}^{-1} & \bm{A}_{22}^{-1}
\end{bmatrix} \\

\begin{bmatrix}
\bm{A}_{11} & \bm{A}_{12} \\
\bm{0} & \bm{A}_{22}
\end{bmatrix}^{-1}
=
\begin{bmatrix}
\bm{A}_{11}^{-1} & -\bm{A}_{11}^{-1}\bm{A}_{12}\bm{A}_{22}^{-1} \\
\bm{0} & \bm{A}_{22}^{-1}
\end{bmatrix}
\end{gather*}
$$
这两个公式都可以通过直接验证$\bm{A} \bm{A}^{-1} = \bm{I}$和$\bm{A}^{-1} \bm{A} = \bm{I}$来证明。对于非奇异全块矩阵的逆，也存在两个等效的公式。定义
$$
\begin{gather*}
\bm{S}_1 \coloneqq \bm{A}_{11}-\bm{A}_{12}\bm{A}_{22}^{-1}\bm{A}_{21} \\

\bm{S}_2 \coloneqq \bm{A}_{22}-\bm{A}_{21}\bm{A}_{11}^{-1}\bm{A}_{12}
\end{gather*}
$$
那么
$$
\begin{align*}
\begin{bmatrix}
\bm{A}_{11} & \bm{A}_{12} \\
\bm{A}_{21} & \bm{A}_{22}
\end{bmatrix}
^{-1}
&=
\begin{bmatrix}
\bm{S}_{1}^{-1} & -\bm{A}_{11}^{-1}\bm{A}_{12}\bm{S}_{2}^{-1} \\
-\bm{A}_{22}^{-1}\bm{A}_{21}\bm{S}_{1}^{-1} & \bm{S}_{2}^{-1}
\end{bmatrix} \\
&=
\begin{bmatrix}
\bm{S}_{1}^{-1} & -\bm{S}_{1}^{-1}\bm{A}_{12}\bm{A}_{22}^{-1} \\
-\bm{S}_{2}^{-1}\bm{A}_{21}\bm{A}_{11}^{-1} & \bm{S}_{2}^{-1}
\end{bmatrix}
\end{align*}
$$
可以通过使用一个方便的矩阵恒等式（称为矩阵求逆引理(matrix inversion lemma)或Woodbury公式）展开$\bm{S}_{1}$和$\bm{S}_{2}$块的逆，从而得到进一步等价的表达式
$$
\left( \bm{A}_{11} - \bm{A}_{12}\bm{A}_{22}^{-1}\bm{A}_{21} \right)^{-1}
=
\bm{A}_{11}^{-1} + \bm{A}_{11}^{-1}\bm{A}_{12}\left( \bm{A}_{22} - \bm{A}_{21}\bm{A}_{11}^{-1}\bm{A}_{12} \right)^{-1}\bm{A}_{21}\bm{A}_{11}^{-1}.
$$

### 4.9 秩一扰动

当$\bm{A}_{12}$和$\bm{A}_{21}$是向量时，即将一个秩为一的矩阵（即并矢）加到$\bm{A}_{11}$上，上述方程会出现一个特殊情况。具体来说，对于$\bm{A}_{12} = \bm{u} \in \mathbb{R} ^n,\bm{A}_{21}^\top = \bm{v} \in \mathbb{R} ^n$并且$\bm{A}_{22} = -1$，上述公式变为
$$
(\bm{A}_{11} + \bm{u}\bm{v}^\top)^{-1} = \bm{A}_{11}^{-1} - \frac{\bm{A}_{11}^{-1}\bm{u}\bm{v}^\top \bm{A}_{11}^{-1}}{1+\bm{v}^\top \bm{A}_{11}^{-1} \bm{u}}
$$
这个公式使我们能够基于$\bm{A}_{11}$本身的逆，轻松计算 $\bm{A}_{11}$的秩一扰动的逆

另一个有趣的性质是，秩一的扰动无法使矩阵的秩改变超过一个单位

> **引理3.1（秩一扰动的秩）**：设$\bm{A} \in \mathbb{R} ^{m,n}$且$\bm{q} \in \mathbb{R} ^m, \bm{p}\in \mathbb{R} ^n$
> $$
> \lvert \operatorname{rank} (\bm{A}) - \operatorname{rank} (\bm{A}+\bm{q} \bm{p}^\top ) \rvert \leq 1
> $$

> **证明**
>
> 我们接下来展示$\operatorname{rank} (\bm{A}) \leq \operatorname{rank} (\bm{A}+\bm{q} \bm{p}^\top ) +1$；对称条件$\operatorname{rank} (\bm{A}+\bm{q} \bm{p}^\top ) \leq \operatorname{rank} (\bm{A}) +1$ 可以通过相同的论证方法证明，只需交换$\bm{A}$和$\bm{A}+\bm{q} \bm{p}^\top$矩阵的角色。由于秩与矩阵的值域子空间的维度相同，我们需要证明的是
> $$
> \dim \mathcal{R}(\bm{A}) \leq \dim \mathcal{R}(\bm{A}+\bm{q} \bm{p}^\top ) +1
> $$
> 根据线性代数基本定理，$\dim \mathcal{R}(\bm{A}) + \dim \mathcal{N}(\bm{A}^\top ) = m$，前述条件也等价于
> $$
> \dim \mathcal{N}(\bm{A}^\top +\bm{p} \bm{q}^\top) \leq \dim \mathcal{N}(\bm{A}^\top )+1
> $$
> 我们通过反证法证明上式：设$v \coloneqq \dim \mathcal{N}(\bm{A}^\top)$，并为达到反证的目的，假设
> $$
> \dim \mathcal{N}(\bm{A}^\top +\bm{p} \bm{q}^\top) > v+1
> $$
> 那么将存在$v+2$个线性无关的向量$\bm{v}_1,\cdots ,\bm{v}_{v+2}$，它们都属于$\bm{A}^\top +\bm{p} \bm{q}^\top$的零空间，即$(\bm{A}^\top +\bm{p} \bm{q}^\top) \bm{v}_i = \bm{0},i=1,\cdots ,v+2$，这意味着
> $$
> \bm{A}^\top \bm{v}_i = - \alpha _i \bm{p} , \alpha _i \coloneqq \bm{q}^\top \bm{v}_i , i=1,\cdots ,v+2
> $$
> 现在，至少有一个标量$\alpha _i$必须非零，否则对于$i=1,\cdots ,v+2$会有$\bm{A}^\top \bm{v}_i = \bm{0}$，这将与$\dim \mathcal{N}(\bm{A}^\top) = v$的事实矛盾，从而结果将立即得到证明。然后讨论至少有一个标量$\alpha _i$非零的情况。假设不失一般性，$\alpha _1 \neq 0$，并定义向量$\bm{w}_i = \bm{v}_{i+1} - ( \alpha_{i+1}/\alpha_1 )\bm{v}_1,  i = 1, \cdots, v+1$。然后可以直接验证
> $$
> \bm{A}^\top \bm{w}_i = \bm{A}^\top \bm{v}_{i+1} - \frac{\alpha_{i+1}}{\alpha_1} \bm{A}^\top \bm{v}_1 = -\alpha_{i+1}\bm{p} + \alpha_{i+1}\bm{p} = \bm{0}, i = 1, \cdots, v + 1.
> $$
> 那么我们就会有$v+1$个属于$\bm{A}^\top$的零空间的线性无关向量$\bm{w}_i$，这与事实相矛盾，因为$\dim \mathcal{N}(\bm{A}^\top) = v$

## 5. 矩阵分解

理论和数值线性代数中的很大一部分内容致力于矩阵分解问题。也就是说，给定一个矩阵 A ∈ Rm,n，将该矩阵表示为具有特殊结构的两个或多个矩阵的乘积。通常，一旦矩阵适当分解，就可以方便地得到若干感兴趣的数值，后续计算也会大大简化。例如，已知任何方阵 A 都可以表示为一个正交矩阵与一个三角矩阵的乘积，即 A = QR，其中 Q 是正交矩阵，R 是上三角矩阵。一旦获得这种分解，我们就可以立即评估 A 的秩，这仅仅是 R 对角线上非零元素的数量。同样，我们也可以方便地求解类似 Ax = b 类型的线性方程组中的未知向量 x，这将在第 6.4.4.1 节中进一步讨论。从矩阵 A 定义的线性映射来看，分解可以解释为将该映射分解为一系列连续阶段的过程，例如见图 3.12。

### 5.1 正交—三角分解（Orthogonal-triangular decomposition）($\bm{Q} \bm{R}$)

任何方阵$\bm{A} \in \mathbb{R} ^{n,n}$都可以分解为
$$
\bm{A} = \bm{Q} \bm{R}
$$
其中$\bm{Q}$是一个正交矩阵，$\bm{R}$是一个上三角矩阵。若$\bm{A}$是非奇异矩阵，则当要求$\bm{R}$的对角元素为正数时，分解因子$\bm{Q},\bm{R}$是唯一确定的

如果$\bm{A} \in \mathbb{R}^{m,n}$是矩形的，且$m \geq n$，若矩阵$\bm{A}$满秩，可以分解为
$$
\bm{A} = \bm{Q} \bm{R}
$$
其中$\bm{Q} \in \mathbb{R} ^{m,n}$有正交列，$\bm{R} \in \mathbb{R} ^{n,n}$是上三角的

$\bm{Q} \bm{R}$分解的另一种完整形式使用$\bm{Q}$矩阵中的所有$m$列：在$\bm{q}^{(1)}\cdots  \bm{q}^{(n)}$的基础上添加$m-n$个正交列，以完成$\mathbb{R} ^m$的一组正交基
$$
\bm{A} = \bm{Q}
\begin{bmatrix}
\bm{R}_1 \\
\bm{0}_{m-n,n}
\end{bmatrix}
$$
其中$\bm{Q} \in \mathbb{R} ^{m,m}$是正交的，$\bm{R}_1 \in \mathbb{R} ^{n,n}$是上三角的

若矩阵$\bm{A}$非满秩，可以分解为
$$
\bm{A} = \bm{Q} \bm{R} , \bm{R} =
\begin{bmatrix}
    \bm{R}_{11} & \bm{R}_{12} & \cdots & \bm{R}_{1r} \\
    \bm{0} & \bm{R}_{22} & \cdots & \bm{R}_{2r} \\
    \vdots  & \vdots & \ddots & \vdots \\
    \bm{0} & \bm{0} & \cdots & \bm{R}_{rr} \\
\end{bmatrix}
$$
其中$\bm{Q} \in \mathbb{R} ^{m,r},r = \operatorname{rank}(\bm{A})$，$\bm{R} \in \mathbb{R} ^{r,n}$是分块上三角矩阵

$\bm{Q} \bm{R}$分解在Section 7.3 节中有详细讨论，具体应用在Section  6.4.4.1  节中有详细讨论

### 5.2 奇异值分解（Singular value decomposition，SVD）

任何非零的$\bm{A} \in \mathbb{R} ^{m,n}$都可以分解为
$$
\bm{A}= \bm{U} \tilde{\bm{\Sigma}} \bm{V}^\top
$$
其中$\bm{V} \in \mathbb{R} ^{n,n},\bm{U} \in \mathbb{R} ^{m,m}$是正交矩阵，且
$$
\tilde{\bm{\Sigma}} =
\begin{bmatrix}
    \Sigma & \bm{0}_{r,n-r} \\
    \bm{0}_{m-r,r} & \bm{0}_{m-r,n-r}
\end{bmatrix}
, \Sigma  = \operatorname{diag}(\sigma _1 ,\cdots ,\sigma _r)
$$
其中$r$是$\bm{A}$的秩，标量$\sigma _i > 0, i =1,\cdots ,r$被称为$\bm{A}$的奇异值。$\bm{U}$的前$r$列$\bm{u}_1,\cdots ,\bm{u}_r$（或者$\bm{V}$的$\bm{v}_1,\cdots ,\bm{v}_r$）被称为左（或者右）奇异向量，并满足
$$
\begin{gather*}
\bm{A} \bm{v}_i = \sigma _i \bm{u}_i \\
\bm{A}^\top \bm{u}_i = \sigma _i \bm{v}_i
\end{gather*}
$$
其中$i=1,\cdots,r$。奇异值分解(SVD)是数值线性代数中的一个基本分解，因为它揭示了由矩阵$\bm{A}$描述的线性映射的所有相关信息，例如值域、零空间和秩。SVD 在Section 5.1 节中有详细讨论

### 5.3 可对角化矩阵的特征值分解（Eigenvalue decomposition）

一个可对角化的方阵$\bm{A} \in \mathbb{R} ^{n,n}$可以分解为
$$
\bm{A} = \bm{U} \bm{\Lambda} \bm{U}^{-1}
$$
其中$\bm{U} \in \mathbb{C} ^{n,n}$是一个可逆矩阵，其列包含$\bm{A}$的特征向量，$\bm{\Lambda}$是一个对角矩阵，其对角线包含$\bm{A}$的特征值$\lambda _1,\cdots ,\lambda _n$。对于一般矩阵，这些特征值可以是实数或复数，复数特征值成共轭复数对出现（Section见第3.3.6节）。$\bm{U}$的列$\bm{u}_1,\cdots ,\bm{u}_n$称为$\bm{A}$的特征向量，并满足
$$
\bm{A} \bm{u}_i = \lambda _i \bm{u}_i,i=1,\cdots,n
$$
实际上，这些关系可以紧凑地写成$\bm{A} \bm{U} = \bm{\Lambda} \bm{U}$，这等价于$\bm{A} = \bm{U} \bm{\Lambda} \bm{U}^{-1}$

### 5.4 对称矩阵的谱分解（Spectral decomposition）