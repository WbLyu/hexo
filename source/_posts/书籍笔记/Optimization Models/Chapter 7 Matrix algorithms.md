---
title: Chapter 7 Matrix algorithms
date: 2025-12-23 16:34:30
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

## 1. 计算特征值和特征向量

### 1.1 幂迭代法(The power iteration method)

在本节中，我们概述了一种计算可对角化矩阵的特征值和特征向量的技术。幂迭代(Power Iteration，PI)方法可能是计算矩阵一个特征值/特征向量对的最简单方法。它的收敛速度相对较慢，并且存在一些局限性。然而，我们在这里介绍它，因为它构成了许多其他更精细的特征值计算算法的基础。还有许多其他计算特征值和特征向量的技术，其中一些是为具有特殊结构的矩阵设计的，例如稀疏矩阵、带状矩阵或对称矩阵

设$\bm{A} \in \mathbb{R} ^{n,n}$，假设$\bm{A}$可对角化，并记$\lambda _1 ,\cdots , \lambda _n$为$\bm{A}$的特征值，按模递减顺序排列，即$\lvert \lambda _1 \rvert > \lvert \lambda _2 \rvert \geq  \cdots  \geq \lvert \lambda _n \rvert$（注意我们假设$\lvert \lambda _1 \rvert$严格大于$\lvert \lambda _2 \rvert$，即$\bm{A}$有一个主导特征值）。由于$\bm{A}$可对角化，我们可以将其写为$\bm{A} = \bm{U \Lambda U}^{-1}$，其中我们可以在不失一般性的情况下假设构成$\bm{U}$列的特征向量$\bm{u}_1 , \cdots , \bm{u}_n$已归一化，使得$\lVert \bm{u}_i \rVert_2 = 1$。我们有$\bm{A}^k = \bm{U} \bm{\Lambda}^k \bm{U}^{-1}$，那么
$$
\bm{A}^k \bm{U} = \bm{U\Lambda}^k
$$
现在令$\bm{x} \in \mathbb{C} ^n$为随机选择的试验向量，且$\lVert \bm{x} \rVert ^2 =1$。由于$\bm{U}$的列彼此线性无关，它们可以张成整个$\mathbb{C} ^{n}$。可以定义$\bm{x} = \bm{Uw}$，并考虑
$$
\bm{A}^k \bm{x} = \bm{A}^k\bm{Uw} = \bm{U\Lambda}^k \bm{w} = \sum_{i=1}^{n} w_i \lambda_i^k \bm{u}_i
$$
请注意，如果随机选择$\bm{x}$，那么$\bm{w}$的第一个元素$w_1$以概率$1$非零。将前面的表达式乘以和除以$\lambda _1^k$，我们可以得到
$$
\bm{A}^k \bm{x} = \lambda _1^k \sum_{i=1}^{n} w_i \left(  \frac{\lambda _i}{\lambda _1} \right)^k \bm{u}_i = w_1 \lambda _1^k \left( \bm{u}_1 + \sum_{i=2}^{n} \frac{w_i}{w_1} \left( \frac{\lambda _i}{\lambda _1} \right)^k  \bm{u}_i \right)
$$
也就是说，$\bm{A}^k \bm{x}$在$\bm{u}_1$的方向上有一个分量$\alpha _k \bm{u}_1$，并且在$\bm{u}_2,\cdots ,\bm{u}_n$的方向上有一个分量$\alpha _k \bm{z}$，即
$$
\bm{A}^k \bm{x} = \alpha _k \bm{u}_1 + \alpha _k \bm{z}, \alpha _k = w_1 \lambda _1^k \in \mathbb{C} , \bm{z} = \sum_{i=2}^{n} \frac{w_i}{w_1} \left( \frac{\lambda _i}{\lambda _1} \right)^k  \bm{u}_i
$$
对于$\bm{z}$分量的大小，设$\beta _i = w_i / w_1$，我们有
$$
\begin{align*}
\lVert \bm{z} \rVert_2 =& \left \lVert \sum_{i=2}^{n} \beta _i \left( \frac{\lambda _i}{\lambda _1} \right)^k  \bm{u}_i \right \rVert_2 \leq \sum_{i=2}^{n} \left \lVert  \beta _i \left( \frac{\lambda _i}{\lambda _1} \right)^k  \bm{u}_i \right \rVert_2 \\

=& \sum_{i=2}^{n}  \lvert  \beta _i \rvert \left \lvert \frac{\lambda _i}{\lambda _1} \right \rvert^k \lVert \bm{u}_i \rVert_2 = \sum_{i=2}^{n}  \lvert  \beta _i \rvert \left \lvert \frac{\lambda _i}{\lambda _1} \right \rvert^k \\

\leq & \left \lvert \frac{\lambda _2}{\lambda _1} \right \rvert^k \sum_{i=2}^{n}\lvert  \beta _i \rvert
\end{align*}
$$
最后的不等式是由特征值模的大小顺序得出的。由于$\lvert \lambda _2 / \lambda _1  \rvert < 1$，我们有$\bm{z}$分量的大小在$k \to \infty$时趋于零，收敛速率由比值$\lvert \lambda _2 \rvert / \lvert \lambda _1 \rvert$决定。因此$\bm{A}^k \bm{x} \to \alpha _k \bm{u}_1$，这意味着随着$k \to \infty$，$\bm{A}^k \bm{x}$趋向于与$\bm{u}_1$平行。因此，通过对向量$\bm{A}^k \bm{x}$进行归一化，我们得到
$$
\lim_{k \to \infty} \frac{\bm{A}^k \bm{x}}{\lVert \bm{A}^k \bm{x} \rVert_2} = \bm{u}_1
$$
定义
$$
x(k) = \frac{\bm{A}^k \bm{x}}{\lVert \bm{A}^k \bm{x} \rVert_2}
$$
并且还注意到$x(k) \to \bm{u}_1$意味着$\bm{A}x(k) \to \bm{Au}_1 = \lambda _1 \bm{u}_1$，因此$\bm{x}^\dagger(k)\bm{A} x(k) \to \lambda _1 \bm{u}^\dagger _1 \bm{u}_1$（$\dagger$表示厄米共轭，因为$\bm{u}_i$向量可以是复数值的）。因此，回想一下$\bm{u}^\dagger _1 \bm{u}_1 = \lVert \bm{u}_1 \rVert_2^2 = 1$，我们有
$$
\lim_{k \to \infty}  \bm{x}^\dagger(k)\bm{A} x(k) = \lambda _1
$$
也就是说，乘积$\bm{x}^\dagger(k)\bm{A} x(k)$会收敛到$\bm{A}$的模最大的特征值
$$
\begin{align*}
    &x^\dagger (k)\bm{A} x(k) \\
    =& \frac{(\bm{A}^k \bm{x})^\dagger\bm{A} (\bm{A}^k \bm{x})}{ \lVert \bm{A}^k \bm{x} \rVert_2^2} \\
    =& \frac{(\alpha _k \bm{u}_1 + \alpha _k \bm{z})^\dagger \bm{A} (\alpha _k \bm{u}_1 + \alpha _k \bm{z})}{(\alpha _k \bm{u}_1 + \alpha _k \bm{z})(\alpha _k \bm{u}_1 + \alpha _k \bm{z})} \\
    =& \frac{( \bm{u}_1 +  \bm{z})^\dagger \bm{A} (\bm{u}_1 +  \bm{z})}{( \bm{u}_1 +  \bm{z})( \bm{u}_1 +  \bm{z})}  \\
    =& \frac{\bm{u}^\dagger _1 \bm{A} \bm{u}_1 + \bm{u}^\dagger _1 \bm{A} \bm{z} + \bm{z}^\dagger \bm{A} \bm{u}_1 + \bm{z}^\dagger \bm{A} \bm{z}}{\bm{u}^\dagger _1  \bm{u}_1 + \bm{u}^\dagger _1  \bm{z} + \bm{z}^\dagger  \bm{u}_1 + \bm{z}^\dagger \bm{z}}  \\
    =& \frac{\bm{u}^\dagger _1 \lambda _1 \bm{u}_1 + \bm{u}^\dagger _1 \bm{A} \bm{z} + \bm{z}^\dagger \lambda _1 \bm{u}_1 + \bm{z}^\dagger \bm{A} \bm{z}}{1 + \bm{u}^\dagger _1  \bm{z} + \bm{z}^\dagger  \bm{u}_1 + \bm{z}^\dagger \bm{z}}  \\
    =& \frac{ \lambda _1 + \bm{u}^\dagger _1 \bm{A} \bm{z} + \bm{z}^\dagger \lambda _1 \bm{u}_1 + \bm{z}^\dagger \bm{A} \bm{z}}{1 + \bm{u}^\dagger _1  \bm{z} + \bm{z}^\dagger  \bm{u}_1 + \bm{z}^\dagger \bm{z}}
\end{align*}
$$
其他项中$\bm{u}_1$和$\bm{A}$均不会随$k$而变化，而$\bm{z}$中含有$\left( \lambda _i / \lambda _1 \right)^k$，因此$k \to \infty$时$\bm{z} \to \bm{0}$。因此$x^\dagger (k)\bm{A} x(k)$会收敛到$\lambda _1$，收敛速度由$\lvert \lambda _2 \rvert / \lvert \lambda _1 \rvert$比例决定，并且以线性速度收敛

以上推理提出了以下迭代算法

![algorithm1.png](https://img.wblv66.top/optimization-models/algorithm1.png)

算法总结：

1. $\bm{x}$可以任取，只需要满足$\lVert \bm{x} \rVert_2=1$便可以
2. 不断对$\bm{x}$左乘$\bm{A}$并归一化便可以趋近于特征向量$\bm{u} _1$
3. 在迭代的过程中$x^\dagger \bm{A} x$也会趋近于标量$\lambda _1$
4. 这里在求解$\lambda _1$时不需要再次对向量归一化，因为$\lambda _1$并不参与迭代，它的取值不会影响迭代速度

幂迭代的一个主要优点是该算法主要依赖于矩阵与向量的乘法，因此可以利用$\bm{A}$的任何特殊结构，例如稀疏性。幂迭代方法的两个主要缺点是

1. 它只能求出一个特征值（模最大的那个）及其对应的特征向量
2. 它的收敛速度取决于$\lvert \lambda _2 \rvert / \lvert \lambda _1 \rvert$，因此当该比值接近$1$时，性能可能会很差。克服这些问题的一种方法是对矩阵 A 的适当移位版本应用幂迭代算法，后续将进行讨论

### 1.2 移位-逆幂法

给定一个复标量$\sigma$，以及$\bm{A} \in \mathbb{R} ^{n,n}$可对角化，考虑矩阵
$$
\bm{B}_{\sigma } = (\bm{A} - \sigma \bm{I})^{-1}
$$
根据谱映射定理，见Section 3.7.2 ，$\bm{B}_{\sigma }$与$\bm{A}$有相同的特征向量，且$\bm{B}_{\sigma }$的特征值为$\mu _i = (\lambda _i - \sigma )^{-1}$，其中$\lambda _i,i=1,\cdots ,n$是$\bm{A}$的特征值。$\bm{B}_{\sigma }$的最大模特征值 $\mu _{\max}$现在对应于在复平面上最接近$\sigma$的$\lambda _i$。将幂法应用于$\bm{B}_{\sigma }$，我们因此可以得到最接近所选$\sigma$的特征值$\lambda _i$以及相应的特征向量。移位-逆幂法如下所示

![algorithm2.png](https://img.wblv66.top/optimization-models/algorithm2.png)

算法总结：

1. $\sigma$选取要尽可能接近目标特征值，这样经过移位$\lambda -\sigma$后，数值变为最小，再取逆后数值变为最大
2. $\bm{B}_{\sigma }$与$\bm{A}$有相同的特征向量，因此不断左乘$\bm{B}_{\sigma }$得到的特征向量也是$\bm{A}$的特征向量
3. 由于最终要求解的是$\bm{A}$的特征值，因此对特征向量左乘的矩阵是$\bm{A}$

移位-逆幂法相对于幂迭代法的优势在于，我们现在可以快速（但仍然是线性速度）收敛到任意所需的特征值，只需选择一个足够接近目标特征值的移位$\sigma$。然而，移位-逆幂法要求预先已知目标特征值的一个较好的近似值。如果事先不知道这样的良好近似值，该方法的一个变体是先用一个粗略的近似值$\sigma$启动算法，然后在某个时刻，当获得了特征向量的合理近似后，动态修改移位$\sigma$，重复这个过程，不断迭代地改进$\sigma$。这个思想将在下一段中讨论

### 1.3 瑞利商(Rayleigh quotient)迭代

假设在移位-逆幂算法的某一步中，我们有一个近似特征向量$\bm{x}(k) \neq \bm{0}$。那么，我们寻找某个近似特征值$\sigma _k$，即一个近似满足特征值/特征向量方程的标量
$$
\bm{x}(k) \sigma _k \approx \bm{Ax}(k)
$$
这里所谓近似是指我们寻找$\sigma _k$，使得方程残差的平方范数最小，即$\min \lVert \bm{x}(k) \sigma _k - \bm{Ax}(k) \rVert$。通过要求该函数对$\sigma _k$的导数为零，我们得到
$$
\begin{align*}
   \frac{\partial \big(\bm{x}(k) \sigma _k - \bm{Ax}(k))^\dagger (\bm{x}(k) \sigma _k - \bm{Ax}(k)\big)}{\partial \sigma_k} &= 0 \\
   \frac{\partial \big(\sigma _k \bm{x}^\dagger (k) \bm{x}(k) \sigma _k   - 2\bm{x}^\dagger (k)\bm{A} \bm{x}(k) \sigma _k \big)}{\partial \sigma_k} &= 0 \\
   \frac{\bm{x}^\dagger (k)\bm{A} \bm{x}(k)}{\bm{x}^\dagger (k) \bm{x}(k)} &= \sigma _k
\end{align*}
$$
这被称为瑞利商(Rayleigh quotient)，参见Section第4.3.1节。如果我们按照在移位-逆幂算法中自适应地选择移位，就得到了所谓的瑞利商迭代法，如下所示。与幂迭代方法不同，瑞利商迭代法可以被证明**具有局部二次收敛性**，也就是说，在经过一定次数迭代后，第$k+1$次迭代中解的收敛差距与第$k$次迭代中解的差距的平方成正比

![algorithm3.png](https://img.wblv66.top/optimization-models/algorithm3.png)

算法总结：

1. 瑞利商迭代法需要先使用幂迭代算法或者移位-逆幂算法迭代一定次数，以得到近似的特征向量值
2. 这里在求解$\sigma _k$时需要再次对向量归一化，因为浮点数运算是有精度误差。如果归一化，这些微小的误差会在不断迭代中不断放大

### 1.4 使用幂迭代计算特征值分解

矩阵$\bm{A} \in \mathbb{R} ^{m,n}$的奇异值分解的因子可以通过计算两个对称矩阵$\bm{AA}^\top$和$\bm{A}^\top \bm{A}$的谱分解来获得。事实上，我们在Section 5定理 5.1 的证明中已经看到，$\bm{V}$因子是来自$\bm{A}^\top \bm{A}$谱分解的特征向量矩阵
$$
\bm{A}^\top \bm{A} = \bm{V \Lambda}_n \bm{V}^\top
$$
并且$\bm{U}$因子的列是$\bm{AA}^\top$的特征向量矩阵
$$
\bm{AA}^\top = \bm{U \Lambda}_m \bm{U}^\top
$$
$\bm{\Lambda }_n$和$\bm{\Lambda }_m$是对角矩阵，其前$r$个对角元素是平方奇异值$\sigma_i^2,i=1,\cdots ,r$其余对角元素为零

接下来，我们将概述如何使用幂迭代法来确定与矩阵最大奇异值对应的左奇异向量和右奇异向量。基本思路是对对称矩阵$\bm{A}^\top \bm{A}$和$\bm{AA}^\top$应用幂迭代，但以隐式方式进行，从而绕过对该矩阵的显式计算，因为该矩阵通常是稠密的
$$
\begin{align*}
    \bm{u}(k+1) &= \frac{\bm{A}\bm{v}(k)}{\lVert \bm{A}\bm{v}(k) \rVert_2} \\
    \bm{v}(k+1) &= \frac{\bm{A}^\top \bm{u}(k+1)}{\lVert \bm{A}^\top \bm{u}(k+1) \rVert_2}
\end{align*}
$$
消去$\bm{u}(k+1)$可以得到
$$
\bm{v}(k+1) = \frac{\bm{A}^\top \bm{A} \bm{v}(k)}{\lVert \bm{A}^\top \bm{A} \bm{v}(k) \rVert_2}
$$
因此$\bm{v}(k)$的序列对应于对$\bm{A}^\top \bm{A}$应用幂迭代；同样，$\bm{u}(k)$的序列对应于对$\bm{AA}^\top$应用幂迭代。因此，下面的算法计算矩阵$\bm{A}$的最大奇异值$\sigma _1$，以及相关的左奇异向量$\bm{u}_1$和右奇异向量$\bm{v}_1$($\sigma = \bm{u}_1^\top \bm{A} \bm{v}_1$)，前提是有占优特征值

然后，这种技术可以递归地应用于矩阵$\bm{A}$的紧凑版本，以确定其他奇异值及其对应的左奇异向量和右奇异向量。更准确地说，我们定义矩阵
$$
\bm{A}_i = \bm{A}_{i-1} - \sigma _i \bm{u}_i \bm{v}_i^\top , i = 1,\cdots ,r; \bm{A}_0 = \bm{A},\sigma _0 = 0
$$
其中$\bm{r} = \operatorname{rank}(\bm{A})$，并对$\bm{A}_i$应用以下算法，以获得$\bm{A}$的紧凑奇异值分解的所有项（假设奇异值彼此相差较大）

![algorithm4.png](https://img.wblv66.top/optimization-models/algorithm4.png)

算法总结：

1. 本质上是通过对$\bm{A}^\top \bm{A}$应用幂迭代法来求解$\bm{v}(k)$
2. 对$\bm{v}(k)$左乘$\bm{A}^\top$并归一化便可以得到$\bm{u}(k+1)$
3. 对矩阵不断重复$- \sigma _i \bm{u}_i \bm{v}_i^\top$便可以求出所有$\bm{u}$和$\bm{v}$

## 2. 解方阵系统的线性方程组

在本节中，我们讨论求解形式为$\bm{A} \bm{x} = \bm{y}$的线性方程组的数值方法，其中$\bm{A} \in \mathbb{R} ^{n,n}$，$\bm{A}$可逆。一般的矩形情况可以通过奇异值分解处理参考Section 6.4.3 节

### 2.1 对角系统

我们首先考虑线性方程组可能具有的最简单的结构，即对角结构。一个方阵(square)、对角(diagonal)、非奇异(nonsingular)的线性方程组的形式是
$$
\begin{bmatrix}
        a_{11} & 0 & \cdots & 0 \\
        0 & a_{22} & 0 & \vdots \\
        \vdots & \vdots & \ddots & \vdots \\
        0 & \cdots & 0 & a_{nn}
\end{bmatrix}
\bm{x} =
\begin{bmatrix}
        y_1 \\
        y_2 \\
        \vdots \\
        y_n
\end{bmatrix}
$$
其中$a_{11},a_{22},\cdots ,a_{nn} \leq 0$。很明显，这样一个系统的唯一解可以直接写出
$$
\bm{x} =
\begin{bmatrix}
    y_1 / a_{11} \\
    y_2 / a_{22} \\
    \vdots \\
    y_n / a_{nn}
\end{bmatrix}
$$

### 2.2 三角系统

另一种方阵非奇异系统的解很容易获得的情况是$\bm{A}$矩阵具有三角结构
$$
\bm{A} =
\begin{bmatrix}
    a_{11} & a_{12} & \cdots  & a_{1n} \\
    0 & a_{22} & \cdots  & a_{2n} \\
    \vdots & \vdots & \ddots &  \vdots \\
    0 & \cdots & 0 &  a_{nn}
\end{bmatrix}
$$
或者形式为
$$
\bm{A} =
\begin{bmatrix}
    a_{11} & 0 & \cdots  & 0 \\
    a_{12} & a_{22} & \cdots  & 0 \\
    \vdots & \vdots & \ddots &  \vdots \\
    a_{n1} & a_{n2} & \cdots &  a_{nn}
\end{bmatrix}
$$
假设$a_{11},a_{22},\cdots ,a_{nn} \neq 0$。例如，考虑下三角情况
$$
\begin{bmatrix}
    a_{11} & 0 & \cdots  & 0 \\
    a_{12} & a_{22} & \cdots  & 0 \\
    \vdots & \vdots & \ddots &  \vdots \\
    a_{n1} & a_{n2} & \cdots &  a_{nn}
\end{bmatrix}
\bm{x} =
\begin{bmatrix}
        y_1 \\
        y_2 \\
        \vdots \\
        y_n
\end{bmatrix}
$$
可以通过所谓的前向代入法(forward substitution)得到解：从第一个方程开始，得到$x_1 = y_1 / a_{11}$，然后将该值代入第二个方程，我们得到
$$
a_{21}x_1 + a_{22}x_2 = a_{21} y_1 / a_{11} + a_{22}x_2 = y_2
$$
因此，我们得到$x_2 = \frac{y_2- a_{21} y_1 / a_{11}}{a_{22}}$。接下来，我们将$x_1,x_2$代入第三个方程以求得 $x_3$，然后以同样的方式继续，最终得到$x_n$。如下所示

![algorithm5.png](https://img.wblv66.top/optimization-models/algorithm5.png)

算法总结：

1. 外层循环是遍历每一个未知数
2. 内层循环是减去每一个已知数

对于上三角系统的求解，也可以很容易地设计出类似的算法，如下所示

> **备注7.1（运算计数）**：通过反向代入求解三角系统所需的代数运算（除法、乘法和加减法）的总数很容易确定。在每一步$i=n,\dots ,1$中，算法各执行$n − i$次乘法和加法运算，还有一次除法运算。因此，总运算量为
> $$
> \sum_{i=n}^{1} 2(n-i)+1 = n^2
> $$

### 2.3 高斯消元法(Gaussian elimination)

三角形非奇异系统的解非常容易求得。对于一个一般的非奇异但可能不是三角形的矩阵可以通过适当的操作转化为等价的上三角系统，然后使用反向代入(backward substitution)求解得到的三角系统。这种迭代三角化技术被称为高斯消元法

考虑一个方形非奇异系统
$$
\begin{bmatrix}
    a_{11} & a_{12} & \cdots & a_{1n} \\
    a_{21} & a_{22} & \cdots & a_{2n} \\
    \vdots & \vdots & \ddots & \vdots \\
    a_{n1} & a_{n2} & \cdots & a_{nn} \\
\end{bmatrix}
\bm{x} =
\begin{bmatrix}
        y_1 \\
        y_2 \\
        \vdots \\
        y_n
\end{bmatrix}
$$
从$j=2$，用方程$j$减去方程$1$乘以$a_{j1} / a_{11}$（假设$a_{11} \neq 0$）来替代每个方程，从而得到等价的方程组
$$
\begin{bmatrix}
a_{11} & a_{12} & a_{13} & \cdots & a_{1n} \\
0 & a_{22}^{(1)} & a_{23}^{(1)} & \cdots & a_{2n}^{(1)} \\
0 & a_{32}^{(1)} & a_{33}^{(1)} & \cdots & a_{3n}^{(1)} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
0 & a_{n2}^{(1)} & a_{n3}^{(1)} & \cdots & a_{nn}^{(1)}
\end{bmatrix}
\bm{x} =
\begin{bmatrix}
y_1 \\
y_2^{(1)} \\
y_3^{(1)} \\
\vdots \\
y_n^{(1)}
\end{bmatrix}
$$
共重复$n − 1$次，最终可以确定一个与原系统等价的上三角形式的系统
$$
\begin{bmatrix}
a_{11} & a_{12} & a_{13} & \cdots & a_{1n} \\
0 & a_{22}^{(1)} & a_{23}^{(1)} & \cdots & a_{2n}^{(1)} \\
0 & 0 & a_{33}^{(2)} & \cdots & a_{3n}^{(2)} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
0 & 0 & 0 & \cdots & a_{nn}^{(n-1)}
\end{bmatrix}
\bm{x} =
\begin{bmatrix}
y_1 \\
y_2^{(1)} \\
y_3^{(2)} \\
\vdots \\
y_n^{(n-1)}
\end{bmatrix}
$$
然后可以通过反向代入法求解系统

> **备注7.2（带选主元的消元）**：注意，如果在消去中遇到对角元素为零，上述方法将会失败，因为无法用该元素进行除法。在实际中，如果该元素的绝对值非常小，也会出现问题。可以对算法进行修改，引入部分或完全选主元
>
> 完全选主元的思路非常简单：在过程的第$k$阶段，我们寻找绝对值最大的元素$a_{ij}^{(k-1)},i>k,j \geq k$。该元素称为主元，并将矩阵的行和列进行交换，使其进入$(k,k)$位置；然后消元阶段按之前描述的方法进行，并重复此过程。注意，当交换矩阵的两行时，向量$\bm{y}$中的元素也需要相应地交换。同样地，当交换矩阵的两列时，相应的$x$元素也需要交换
>
> 部分选主元的工作方式类似，但只在元素所在列的下方元素中搜索主元，因此在此情况下只需要交换两行。选主元增加了求解所需的数值工作量，因为每个阶段都需要进行主元搜索，同时还需要进行内存管理操作以交换行（在完全选主元的情况下还需交换列）

下面的算法描述了带部分主元的高斯消元法

![algorithm7.png](https://img.wblv66.top/optimization-models/algorithm7.png)

接下来我们计算通过高斯消元法解方阵系统所需的基本操作次数。首先考虑高斯消元过程，我们看到在该过程的第一次迭代中，需要$2n+1$次操作来更新矩阵的第二行（$1$次除法和$n$次乘法和减法运算以求出行的新的元素）。因此，为了将第一列中第一个元素以下的所有元素置零，并更新从第二行开始的所有行，需要$(n-1)(2n+1)$次操作。接下来，我们需要$(n-2)(2n-1)$次操作以将第二列置零并更新矩阵；对于第三列，我们需要$(n-3)(2n-3)$次操作，依此类推。这些操作的总和为
$$
\begin{align*}
    & \sum_{i=1}^{n-1} \big(n-i\big)\big(2(n-i+1)+1\big) \\
    =& \sum_{i=1}^{n-1} (n-i)(2n-2i+3) \\
    =& \sum_{k=1}^{n-1} k(2k+3) \\
    =& 2\sum_{k=1}^{n-1} k^2 + 3 \sum_{k=1}^{n-1} k \\
    =&  \frac{n(n-1)(2n-1)}{3} + \frac{3n(n-1)}{2} \\
    =& \sim \frac{2}{3} n^3
\end{align*}
$$
这里的符号$\sim$表示多项式中的首项，这种表示法比通常的$O(\cdot)$表示法更具信息性，因为它指出了首项的系数。我们最终需要对变换后的三角系统应用反向代入，这将额外需要$n^2$次运算。这不会改变主导的复杂度项，因此求解一个一般的非奇异系统所需的总运算次数为$\sim \frac{2}{3} n^3$

## 3. $\bm{Q} \bm{R}$分解

$\bm{Q} \bm{R}$分解是一种线性代数操作，它将一个矩阵分解为一个正交分量，该分量是矩阵列空间的基，以及一个三角分量。在$\bm{Q} \bm{R}$分解中，矩阵$\bm{A} \in \mathbb{R} ^{m,n}$，其中$m \geq n$，且$\operatorname{rank}(\bm{A})$，因此被分解为
$$
\bm{A} = \bm{Q} \bm{R}
$$
其中$\bm{Q} \in \mathbb{R} ^{m,n}$具有正交列（即$\bm{Q}^\top \bm{Q} = \bm{I}_n$），并且$\bm{R} \in \mathbb{R} ^{n,n}$是上三角矩阵。计算$\bm{Q} \bm{R}$分解的方法有很多，包括 Householder 变换法、改进的 Gram–Schmidt 算法以及快速 Givens 方法。这里，我们描述基于改进的 Gram–Schmidt 算法(modified Gram–Schmidt, MGS)的方法

### 3.1 改进的Gram–Schmidt过程

我们回忆一下Section第2.3.3节，当给定一组线性无关向量$\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(n)}\right\}$时，Gram–Schmidt(GS)过程会构造一个与原始向量组具有相同张成空间的正交归一向量组$\left\{ \bm{q}^{(1)},\cdots , \bm{q}^{(n)}\right\}$，具体如下：对于$k = 1,\cdots n$
$$
\begin{gather*}
\bm{\zeta}^{(k)} = \bm{a}^{(k)} - \sum_{i=1}^{k-1} \left\langle \bm{a}^{(k)}, \bm{q}^{(i)} \right\rangle\bm{q}^{(i)}   \\
\bm{q}^{(k)}= \frac{\bm{\zeta}^{(k)}}{\lVert \bm{\zeta}^{(k)} \rVert}
\end{gather*}
$$
设$\mathcal{S}_{k-1} = \operatorname{span}\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(n)}\right\}$，并设其正交补记为$\mathcal{S}_{k-1}^\perp$。在上述方程中，GS 过程计算$\bm{a}^{(k)}$在$\mathcal{S}_{k-1}$上的投影，然后从$\bm{a}^{(k)}$中减去它，从而得到$\bm{a}^{(k)}$在$\mathcal{S}_{k-1}^\perp$上的投影。容易看出，上述方程中的投影运算可以用矩阵形式表示如下
$$
\begin{gather*}
\bm{\zeta}^{(k)} = \mathcal{P}_{\mathcal{S}_{k-1}^\perp} \bm{a}^{(k)} \\
\mathcal{P}_{\mathcal{S}_{k-1}^\perp} = \bm{I} - \mathcal{P}_{\mathcal{S}_{k-1}} \\
\mathcal{P}_{\mathcal{S}_{k-1}} = \sum_{i=1}^{k-1} \bm{q}^{(i)} \bm{q}^{(i)\top}
\end{gather*}
$$
其中$\mathcal{P}_{\mathcal{S}_{0}} = 0,\mathcal{P}_{\mathcal{S}_{0}}^\perp = \bm{I}$。此外，**正交投影矩阵$\mathcal{P}_{\mathcal{S}_{k-1}^\perp} = \bm{I} - \mathcal{P}_{\mathcal{S}_{k-1}}$可以表示为投影到各个$\bm{q}^{(1)},\cdots ,\bm{q}^{(k-1)}$的正交子空间的初等投影的乘积**，即
$$
\begin{gather*}
\mathcal{P}_{\mathcal{S}_{k-1}^\perp} = \mathcal{P}_{\bm{q}^{(k-1) ^\perp}} \cdots \mathcal{P}_{\bm{q}^{(1) ^\perp}},k>1 \\
\mathcal{P}_{\bm{q}^{(i) ^\perp}} =\bm{I} - \bm{q}^{(i)} \bm{q}^{(i)\top}
\end{gather*}
$$
这个事实可以很容易地直接验证：例如取$k=3$（一般情况可以通过相同的论证得出）
$$
\begin{align*}
&\mathcal{P}_{\bm{q}^{(2) ^\perp}}\mathcal{P}_{\bm{q}^{(1) ^\perp}} \\
=& (\bm{I} - \bm{q}^{(2)} \bm{q}^{(2)\top})(\bm{I} - \bm{q}^{(1)} \bm{q}^{(1)\top}) \\
=& \bm{I} - \bm{q}^{(2)} \bm{q}^{(2)\top} - \bm{q}^{(1)} \bm{q}^{(1)\top} + \bm{q}^{(2)} \bm{q}^{(2)\top} \bm{q}^{(1)} \bm{q}^{(1)\top} \\
=& \bm{I} - \bm{q}^{(2)} \bm{q}^{(2)\top} - \bm{q}^{(1)} \bm{q}^{(1)\top} \\
=& \bm{I} - \mathcal{P}_{\mathcal{S}_{2}} \\
=& \mathcal{P}_{\mathcal{S}_{2}^\perp}
\end{align*}
$$
在 MGS 中，每个$\bm{\zeta}^{(k)} = \mathcal{P}_{\bm{q}^{(k-1) ^\perp}} \cdots \mathcal{P}_{\bm{q}^{(1) ^\perp}} \bm{I} \bm{a}^{(k)}$按如下方式递归计算（注意以下计算的是一个$\bm{\zeta}$）
$$
\begin{align*}
\bm{\zeta}^{(k)}(1) &= \bm{a}^{(k)}, \\
\bm{\zeta}^{(k)}(2) &= \mathcal{P}_{\bm{q}^{(1)\perp}} \bm{\zeta}^{(k)}(1) = \left(\bm{I} - \bm{q}^{(1)} \bm{q}^{(1)\top}\right) \bm{\zeta}^{(k)}(1) \\
&= \bm{\zeta}^{(k)}(1) - \bm{q}^{(1)} \bm{q}^{(1)\top} \bm{\zeta}^{(k)}(1), \\
\bm{\zeta}^{(k)}(3) &= \mathcal{P}_{\bm{q}^{(2)\perp}} \bm{\zeta}^{(k)}(2) = \bm{\zeta}^{(k)}(2) - \bm{q}^{(2)} \bm{q}^{(2)\top} \bm{\zeta}^{(k)}(2), \\
&\ \ \vdots \quad \vdots \quad \vdots \\
\bm{\zeta}^{(k)}(k) &= \mathcal{P}_{\bm{q}^{(k-1)\perp}} \bm{\zeta}^{(k)}(k-1) \\
&= \bm{\zeta}^{(k)}(k-1) - \bm{q}^{(k-1)} \bm{q}^{(k-1)\top} \bm{\zeta}^{(k)}(k-1).
\end{align*}
$$
虽然两种公式（ GS 和 MGS ）在数学上是等价的，但后者在数值上被证明更稳定。接下来将 MGS 过程形式化为一个算法

![algorithm8.png](https://img.wblv66.top/optimization-models/algorithm8.png)

对于较大的$m,n$，计算工作主要由算法的最内层循环支配：计算$r_{ij} = \bm{q}^{(i)\top} \bm{\zeta}^{(j)}$需要$m$次乘加运算（实际是$m$次乘法和$m-1$次加法），而计算$\bm{\zeta}^{(j)} = \bm{\zeta}^{(j)} - r_{ij}\bm{q}^{(i)}$需要$m$次乘减运算，因此每个内层循环总计$4m$次操作。因此，算法的总体操作计数大约为
$$
\sum_{i=1}^{n} \sum_{j=i+1}^{n} 4m = \sum_{i=1}^{n} (n-i)4m = \big( n^2 - \frac{n(n+1)}{2} \big)4m \sim 2mn^2
$$
接下来我们将展示 MGS 算法实际上提供了$\bm{A}$的$\bm{Q} \bm{R}$分解中的$\bm{Q}$和$\bm{R}$因子。设$\bm{a}^{(1)},\cdots ,\bm{a}^{(n)}$表示$\bm{A}$的各列。由于$\bm{\zeta}^{(1)} = \bm{a}^{(1)}$，并且对于$j >1$
$$
\bm{\zeta}^{(j)} = \bm{a}^{(j)} - \sum_{i=1}^{j-1} \bm{q}^{(i)} \bm{q}^{(i)\top} \bm{a}^{(j)}
$$
现在设$r_{jj} = \lVert \bm{\zeta}^{(j)} \rVert,r_{ij} = \bm{q}^{(i)\top} \bm{a}^{(j)}$，并回忆$\bm{q}^{(j)}= \bm{\zeta}^{(j)} / r_{jj}$。前面的方程变为
$$
r_{jj} \bm{q}^{(j)} = \bm{a}^{(j)} - \sum_{i=1}^{j-1} r_{ij} \bm{q}^{(i)}
$$
那也就是说
$$
\bm{a}^{(j)} = r_{jj} \bm{q}^{(j)} + \sum_{i=1}^{j-1} r_{ij} \bm{q}^{(i)}
$$
这给出了所需的分解$\bm{A} = \bm{Q} \bm{R}$，其中
$$
[\bm{a}^{(1)} \cdots \bm{a}^{(n)}] = [\bm{q}^{(1)} \cdots \bm{q}^{(n)}]
\begin{bmatrix}
r_{11} & r_{12} & \cdots & r_{1n} \\
     0 & r_{22} & \cdots & r_{2n} \\
     \vdots & \vdots & \ddots & \vdots \\
     0 & 0 & \cdots & r_{nn} \\
\end{bmatrix}
$$
以上推理构成了以下事实的构造性证明

> **定理7.1（$\bm{Q} \bm{R}$分解）**：任意矩阵$\bm{A} \in \mathbb{R} ^{m,n}$，且$m \geq n$，$\operatorname{rank}(\bm{A}) = n$，都可以分解为$\bm{A} = \bm{Q} \bm{R}$，其中$\bm{R} \in \mathbb{R} ^{n,n}$为上三角矩阵且对角线元素为正，$\bm{Q} \in \mathbb{R} ^{m,n}$的列向量标准正交（即满足$\bm{Q}^\top \bm{Q} = \bm{I}_n$）

### 3.2 针对秩亏矩阵的 MGS 和$\bm{Q} \bm{R}$分解

在标准的 GS 过程中，我们假设向量$\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(n)}\right\},\bm{a}^{(i)} \in \mathbb{R} ^m$是线性无关的，也就是说矩阵$\bm{A} = [\bm{a}^{(1)} \cdots  \bm{a}^{(n)}] \in \mathbb{R} ^{m,n}$是列满秩的。接下来，我们讨论如何将 GS 过程和$\bm{Q} \bm{R}$分解推广到$\bm{A}$不满秩的情况，即$\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(n)}\right\}$线性相关时。在这种情况下，令$k \leq n$为最小整数，使得向量$\bm{a}^{(k)}$可以表示为前面向量$\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(k-1)}\right\}$的线性组合（前$k-1$个向量线性无关，前$k$个向量线性相关），即
$$
\bm{a}^{(k)} = \sum_{i=1}^{k-1} \tilde{\alpha }_i \bm{a}^{(i)}
$$
$\tilde{\alpha }_i$为标量。可知$\left\{ \bm{q}^{(1)},\cdots , \bm{q}^{(k-1)}\right\}$张成的子空间与 $\left\{ \bm{a}^{(1)},\cdots , \bm{a}^{(k-1)}\right\}$相同，我们也有
$$
\bm{a}^{(k)} = \sum_{i=1}^{k-1} \alpha_i \bm{q}^{(i)}
$$
$\alpha_i$为标量。由于向量$\bm{q}^{(j)},j=1,\dots,k-1$是标准正交的
$$
\left\langle \bm{a}^{(k)}, \bm{q}^{(j)} \right\rangle = \sum_{i=1}^{k-1}\alpha_i \left\langle \bm{q}^{(i)}, \bm{q}^{(j)} \right\rangle = \alpha _j
$$
因此，根据$\bm{\zeta}^{(k)} = \bm{a}^{(k)} - \sum_{i=1}^{k-1} \left\langle \bm{a}^{(k)}, \bm{q}^{(i)} \right\rangle\bm{q}^{(i)}$可以得到$\bm{\zeta}^{(k)} = \bm{0}$，因此标准程序无法继续。然而，广义程序通过丢弃所有满足$\bm{\zeta}^{(k')} = \bm{0}$的对应向量$\bm{a}^{(k')} ,k' \geq k$，来继续进行，直到程序终止，或者找到一个$\bm{\zeta}^{(k')} \neq \bm{0}$的向量$\bm{a}^{(k')}$。在这种情况下，对应的标准向量$\bm{q}^{(k')}$被加入标准正交集合中，并继续迭代该过程。终止时，该修改后的过程返回一组$r = \operatorname{rank}(\bm{A})$个正交向量$\left\{ \bm{q}^{(1)},\cdots , \bm{q}^{(r)}\right\}$，它们形成$\mathcal{R}(\bm{A})$的标准正交基

这个过程提供了一种广义的$\bm{Q} \bm{R}$分解，因为$\bm{A}$的每一列都可以表示为$\bm{Q} = [\bm{q}^{(1)}\cdots  \bm{q}^{(r)}]$列的线性组合，并且非零系数的数量是非递减的。具体而言，$\bm{A}$的第一块$n_1 \geq 1$列被表示为$\bm{q}^{(1)}$的线性组合，$\bm{A}$的第二块$n_2 \geq 1$列被表示为$\bm{q}^{(1)},\bm{q}^{(2)}$的线性组合，依此类推，直到$\bm{A}$的第$r$块$n_r$列被表示为$\bm{q}^{(1)},\cdots,\bm{q}^{(r)}$的线性组合，其中$n_1 + n_2 + \cdots +n_r = n$。用公式表示为
$$
\bm{A} = \bm{Q} \bm{R} , \bm{R} =
\begin{bmatrix}
    \bm{R}_{11} & \bm{R}_{12} & \cdots & \bm{R}_{1r} \\
    \bm{0} & \bm{R}_{22} & \cdots & \bm{R}_{2r} \\
    \vdots  & \vdots & \ddots & \vdots \\
    \bm{0} & \bm{0} & \cdots & \bm{R}_{rr} \\
\end{bmatrix}
,\bm{R}_{ij} \in \mathbb{R} ^{1,n_j}
$$
矩阵$\bm{R}$是分块上三角形式。然后可以重新排列$\bm{R}$的列，使得$\bm{R}_{ii}$第一个元素所在的列移到第$i$列，构造上三角矩阵。这可以写成
$$
\bm{A}=\bm{Q} \bm{R} \bm{E}^\top , \bm{R} = [\tilde{\bm{R}} \quad \bm{M}]
$$
其中$\bm{E}$是一个合适的列置换矩阵（注意置换是初等变换，因此矩阵是正交的），$\tilde{\bm{R}} \in \mathbb{R} ^{r,r}$是上三角且可逆的，$\bm{M} \in \mathbb{R} ^{r,n-r}$

$\bm{Q} \bm{R}$分解的另一种完整形式使用$\bm{Q}$矩阵中的所有$m$列：在$\bm{q}^{(1)}\cdots  \bm{q}^{(r)}$的基础上添加$m-r$个正交列，以完成$\mathbb{R} ^m$的一组正交基。因此，在$\bm{R}$矩阵中附加$m-r$个全零的尾行，以得到
$$
\bm{A}=\bm{Q} \bm{R} \bm{E}^\top ,\bm{Q} \in \mathbb{R} ^m,\bm{Q}^\top \bm{Q} = \bm{I}_m, \bm{R} =
\begin{bmatrix}
    \tilde{\bm{R}} & \bm{M} \\
    \bm{0}_{m-r,r} & \bm{0}_{m-r,n-r}
\end{bmatrix}
$$
