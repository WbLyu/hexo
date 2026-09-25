---
title: Chapter 4 Symmetric matrices
date: 2025-10-12 21:27:29
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
cover: https://img.wblyu.top/images/05f61424112c094afb08279d63af2361.avif
---

## 1. 基础

### 1.1 定义和例子

当方阵$\bm{A} \in \mathbb{R} ^{n,n}$满足$\bm{A} = \bm{A}^\top$的时候则称这个矩阵为对称(symmetric)矩阵。$n \times n$的对称矩阵组成的集合是$\mathbb{R} ^{n,n}$的子空间，记作$\mathcal{S}^{n}$

样本协方差矩阵(sample covariance matrix)是对称矩阵，给定$m$个点$\bm{x}^{(1)},\cdots,\bm{x}^{(m)} \in \mathbb{R}^n$，则样本协方差矩阵写为

$$
\Sigma \coloneqq \frac{1}{m} \sum_{i=1}^{m}(\bm{x}^{(i)} -  \hat{\bm{x}})(\bm{x}^{(i)} -  \hat{\bm{x}})^\top
$$

其中$\hat{\bm{x}}$是点的样本均值

$$
\hat{\bm{x}} \coloneqq \frac{1}{m} \sum_{i=1}^{m}\bm{x}^{(i)}
$$

协方差矩阵$\Sigma$很明显是一个对称矩阵，当计算标量积(scalar product)的样本方差(sample variance)时会出现。比如定义$s_i \coloneqq w^\top \bm{x}^{(i)},i = 1,\cdots,m$，那么向量$\bm{x}$的样本均值为

$$
\hat{\bm{s}} = \frac{1}{m}(s_1+\cdots+s_m)= \bm{w}^\top \hat{\bm{x}}
$$

样本方差为

$$
\sigma ^2 = \sum_{i=1}^{m}(w^\top \bm{x}^{(i)} - \hat{\bm{s}})^2 = \sum_{i=1}^{m}\big(\bm{w}^\top (\bm{x}^{(i)} - \hat{\bm{x}})\big)^2 = \bm{w}^\top \Sigma \bm{w}
$$

一个二阶可微的函数$f \colon \mathbb{R} ^n \rightarrow \mathbb{R}$在点$x \in \operatorname{dom} f$处的海森(Hessian)矩阵是包含该点函数二阶导数的矩阵。海森矩阵的元素为

$$
\bm{H}_{ij} = \frac{\partial^2 f(x)}{\partial x_i \partial x_j},  1 \leq i,j \leq n
$$
海森矩阵也经常写为$\nabla^2f(x)$。由于二阶导数与求导的顺序无关，因此对于每一对$(i, j)$，都有$\bm{H}_{ij} = \bm{H}_{ji}$，因此海森矩阵总是对称矩阵

考虑一个二次函数(quadratic function)（多项式函数的单项最高次数为二）

$$
q(x) = x_1^2 + 2x_1x_2+3x_2^2+4x_1+5x_2+6
$$
它的海森矩阵可以写为

$$
\bm{H} = \left[ \frac{\partial^2 q(x)}{\partial x_i \partial x_j} \right]_{1 \leq i,j \leq 2} =
\begin{bmatrix}
    \frac{\partial^2 q(x)}{\partial x_1^2 } & \frac{\partial^2 q(x)}{\partial x_1  \partial x_1} \\
    \frac{\partial^2 q(x)}{\partial x_2x_1 } & \frac{\partial^2 q(x)}{\partial x_2^2 }
\end{bmatrix} =
\begin{bmatrix}
    2 & 2 \\
    2 & 6
\end{bmatrix}
$$
对于二次函数来说，海森矩阵是一个常数，与$x$点的取值无关。函数$q(x)$的二次项也可以写为
$$
x_1^2 + 2x_1x_2+3x_2^2 = \frac{1}{2} \bm{x}^\top \bm{H} \bm{x}
$$
因此**二次函数可以写为包含海森矩阵的二次项和仿射项的和**

$$
q(x) = \frac{1}{2} \bm{x}^\top \bm{H} \bm{x} + \bm{c}^\top \bm{x} + d,\quad  \bm{c}^\top = [ 4 \quad 5 ],\quad d = 6
$$
考虑指数之和的对数函数(log-sum-exp) $\operatorname{lse} \colon \mathbb{R} ^n \rightarrow \mathbb{R}$

$$
\operatorname{lse}(\bm{x}) = \ln \sum_{i=1}^{n} \mathrm{e}^{x_i}
$$
首先定义$\bm{z} = [\mathrm{e}^{x_1} \cdots \mathrm{e}^{x_n}],\quad Z = \sum_{i=1}^{n} z_i$，那么我们可以确定$x$点处的梯度$\nabla \operatorname{lse}(\bm{x}) = [\tfrac{\partial f(x)}{\partial x_1} \cdots \tfrac{\partial f(x)}{\partial x_n}]^\top$，定义$g_i(\bm{x})$为梯度的第$i$项

$$
\nabla \operatorname{lse}(\bm{x}) =  \frac{1}{Z} \bm{z}
$$

$$
g_i(\bm{x}) = \frac{\partial f(x)}{\partial x_i} = \frac{\partial \ln Z}{\partial z_i} \frac{\partial  z_i}{\partial x_i} = \frac{z_i}{Z}
$$

再次求梯度

$$
\frac{\partial g_i(\bm{x})}{\partial x_i} = \frac{z_i}{Z} - \frac{z_i^2}{Z^2}
$$
对于$i \neq j$

$$
\frac{\partial g_i(\bm{x})}{\partial x_j} = - \frac{z_iz_j}{Z^2}
$$
因此

$$
\nabla ^2 \operatorname{lse}(x) =
\begin{bmatrix}

\frac{Zz_1-z_1^2}{Z^2} & \frac{-z_1z_2}{Z^2} \\

\frac{-z_2z_1}{Z^2} & \frac{Zz_2-z_2^2}{Z^2}

\end{bmatrix}

= \frac{1}{Z^2}\big( Z\operatorname{diag}(z)-zz^\top \big)
$$
假设给出$d$个线性无关的向量$\bm{x}^{(1)},\cdots,\bm{x}^{(d)} \in \mathbb{R}^n$和另一个向量$\bm{x} \in \mathbb{R}$，我们计算$\bm{x}$向$\bm{x}^{(1)},\cdots,\bm{x}^{(d)}$张成子空间的投影$\bm{x}^*$，根据Section 2.3.2.3，投影可以写为

$$
\bm{x}^* =\sum_{i=1}^{d} \alpha_i \bm{x}^{(i)}  = \bm{X} \bm{\alpha},\bm{X}=[\bm{x}^{(1)},\cdots,\bm{x}^{(d)}]
$$

其中$\bm{\alpha}$是一个系数向量，必须满足$\left\langle \bm{x},\bm{x}^{(k)} \right\rangle = \left\langle  \bm{x}^*,\bm{x}^{(k)}\right\rangle$,可以写为所谓的Gram线性方程

$$
\begin{bmatrix}
\bm{x}^{(1) \top} \bm{x}^{(1)} & \cdots &  \bm{x}^{(1) \top} \bm{x}^{(d)} \\
\vdots  & \ddots  &  \vdots  \\
\bm{x}^{(d) \top} \bm{x}^{(1)} & \cdots &  \bm{x}^{(d) \top} \bm{x}^{(d)}
\end{bmatrix}

\begin{bmatrix}
\alpha_1 \\
\vdots \\
\alpha_d
\end{bmatrix}

=

\begin{bmatrix}
\bm{x}^{(1) \top} \bm{x} \\
\vdots \\
\bm{x}^{(d) \top} \bm{x}
\end{bmatrix}
$$

左侧的系数矩阵是一个对称矩阵，被称为Gram矩阵，满足$\bm{G} = \bm{X}^\top \bm{X} \in \mathcal{S}^{n}$

### 1.2 二次函数

二次函数$q \colon \mathbb{R} \rightarrow \mathbb{R}$是关于$x$的二阶多元多项式，包含所有不超过二次的单项式的线性组合的函数。因此，这样的函数可以表示为

$$
q(x) = \sum_{i=1}^{n} \sum_{j=1}^{n} a_{ij}x_i x_j + \sum_{i=1}^{n}c_i x_i + d
$$

其中$a_{ij}$是二次单项式的系数，$c_i$是一次项单项式的系数，$d$是常数项，上面表达式在矩阵形式下有更加紧凑的表达

$$
q(x) = \bm{x}^\top \bm{A} \bm{x} + \bm{c}^\top \bm{x} + d
$$

注意，$\bm{x}^\top \bm{A} \bm{x}$是标量，所以它等于自身的转置，即$\bm{x}^\top \bm{A} \bm{x} = \bm{x}^\top \bm{A}^\top  \bm{x}$，因此

$$
\bm{x}^\top \bm{A} \bm{x} = \frac{1}{2}\bm{x}^\top (\bm{A} + \bm{A}^\top) \bm{x}
$$

其中$\bm{H} = \bm{A} + \bm{A}^\top$是一个对称矩阵，更一般的表达可以写为

$$
q(x) = \frac{1}{2}\bm{x}^\top \bm{H} \bm{x} + \bm{c}^\top \bm{x} + d = \frac{1}{2}
\begin{bmatrix}
  \bm{x} \\
  1
\end{bmatrix}^\top

\begin{bmatrix}
  \bm{H} & \bm{c}\\
  \bm{c}^\top & 2d
\end{bmatrix}

\begin{bmatrix}
  \bm{x} \\
  1
\end{bmatrix}
$$

二次型(quadratic form)是没有线性项和常数项的二次函数

$$
q(x) = \frac{1}{2}\bm{x}^\top \bm{H} \bm{x},\bm{H} \in \mathcal{S}^n
$$

注意二次函数的海森矩阵是常数，$\nabla^2q(\bm{x}) = \bm{H}$

一个一般的、二阶可微的函数可以通过泰勒级数展开，在点$\bm{x}_0$的邻域内用一个二次函数进行局部近似，详见第Section3.2.2

$$
f(\bm{x}) \approx q(\bm{x}) = f(\bm{x}_0) + \nabla f(\bm{x}_0)^\top (\bm{x}-\bm{x}_0) + \frac{1}{2}(\bm{x}-\bm{x}_0)^\top \nabla^2 f(\bm{x}_0)(\bm{x}-\bm{x}_0)
$$

通过参数替换可以将上式写成标准的二次函数形式

有两种特殊情况：对角矩阵和并矢矩阵。对角矩阵是对称矩阵的一种特殊形式，与对角矩阵$\operatorname{diag}(\bm{a})$相关的二次项为

$$
q(\bm{x}) = \bm{x}^\top  \operatorname{diag}(\bm{a}) \bm{x} = \sum_{i=1}^{n}a_i x_i^2
$$

也就是说，$q(\bm{x})$是纯平方的线性组合。即在和中不出现 $x_i x_j$类型的交叉乘积项

另一类重要的对称矩阵是对称并矢矩阵，即由以下形式的向量积形成的矩阵

$$
\bm{A} = \bm{a}\bm{a}^\top =
\begin{bmatrix}
    a_1^2 & a_1a_2 &  \cdots & a_1a_n \\
    a_2a_1 & a_2^2 &  \cdots & a_2a_n \\
    \vdots  & \vdots &  \ddots & \vdots \\
    a_na_1 & \cdots &  \cdots & a_n^2
\end{bmatrix}
$$

并矢是秩为一的矩阵，与并矢相关的二次型具有如下形式

$$
q(\bm{x}) = \bm{x}^\top  \bm{a} \bm{a}^\top  \bm{x} = (\bm{x}^\top  \bm{a}) (\bm{a}^\top  \bm{x}) = (\bm{a}^\top  \bm{x}) (\bm{a}^\top  \bm{x}) = (\bm{a}^\top  \bm{x})^2
$$

也就是说，它是关于$\bm{x}$的线性形式的平方。因此，与一个并矢相关的二次型总是非负的

## 2. 谱定理(The spectral theorem)

矩阵的谱，指矩阵所有特征值的集合

### 2.1 对称矩阵的特征值分解

我们回顾一下Section3.3中方阵特征值和特征向量的定义。设$\bm{A}$为一个$n \times n$矩阵。如果存在一个非零向量$\bm{u}$使得

$$
\bm{Au} = \lambda \bm{u}
$$

向量$\bm{u}$被称为与特征值$λ$相关的特征向量。如果$\lVert \bm{u} \rVert_2=1$，那么特征向量被称为已归一化。在这种情况下，我们可以得到$\bm{u}^\dagger\bm{Au} = \lambda \bm{u}^\dagger\bm{u}=\lambda$。这里的$^\dagger$代表厄米共轭(Hermitian conjugate)，即先转置再取共轭

$\bm{u}$的解释是它定义了一个方向，在此方向上，由$\bm{A}$定义的线性映射表现得就像标量乘法一样。缩放的量由$\lambda$给出

$\bm{A}$的特征值是特征多项式的根

$$
p_{\bm{A}}(\lambda) = \det (\lambda \bm{I}-\bm{A})
$$

因此对于一般的矩阵，特征值可以是实数或复数（以复共轭对出现），同样，相应的特征向量可以是实数或复数。然而，对于对称矩阵来说，特征值和特征向量均为实数。而且对于每个不同的特征值$\lambda _i$，特征空间$\mathcal{\phi}_i = \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$的维数与该特征值的代数重数相同

> **定理4.1（对称矩阵的特征值分解）**：设$\bm{A} \in \mathbb{R}^{n,n}$是对称矩阵。令$\lambda _i,i=1, \cdots,k \leq n$是$\bm{A}$的互异特征值。进一步记$\mu _i,i = 1, \cdots, k$，表示$\lambda _i$的代数重数，并记$\mathcal{\phi}_i = \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$。那么，对所有$i = 1, \cdots , k$ 有
>
> 1. $\lambda _i \in \mathbb{R}$
> 2. $\mathcal{\phi}_i \perp \mathcal{\phi}_j,i \neq j$
> 3. $\dim \mathcal{\phi}_i = \mu _i$

> **证明**
>
> **第一点**
>
> 让$\lambda ,\bm{u}$为$\bm{A}$的任意特征值和特征向量对。则
> $$
> \bm{Au} = \lambda \bm{u}
> $$
> 对两边取厄米共轭
> $$
> \bm{u}^\dagger \bm{A}^\dagger = \lambda ^\dagger \bm{u}^\dagger
> $$
> 对第一个方程左乘$\bm{u}^\dagger$，对第二个方程右乘$\bm{u}$可以得到
> $$
> \begin{gather*}
> \bm{u}^\dagger\bm{Au} = \lambda \bm{u}^\dagger\bm{u} \\
> \bm{u}^\dagger \bm{A}^\dagger \bm{u} = \lambda ^\dagger \bm{u}^\dagger \bm{u}
> \end{gather*}
> $$
> 已知$\bm{u}^\dagger\bm{u} = \lVert \bm{u} \rVert^2_2 \neq 0$，因为$\bm{A}$为实数那么$\bm{A}^\dagger = \bm{A}^\top$，将上式相减可以得到
> $$
> \bm{u}^\dagger (\bm{A}-\bm{A}^\top ) \bm{u} = (\lambda - \lambda ^\dagger )\lVert \bm{u} \rVert^2_2
> $$
> 因为$\bm{A}$是对称矩阵，所以$\bm{A} - \bm{A}^\top = \bm{0}$，可以得到
> $$
> \lambda - \lambda ^\dagger =0
> $$
> 这意味着$\lambda$一定为实数。注意，相关的特征向量$\bm{u}$也总可以选择为实向量。如果一个复向量$\bm{u}$满足$\bm{Au} = \lambda \bm{u}$，且$\bm{A},\lambda$为实数，那么我们也有$\operatorname{Re}(\bm{Au}) = \bm{A}\operatorname{Re}(\bm{u}) = \lambda \operatorname{Re}(\bm{u})$，这意味着$\operatorname{Re}(\bm{u})$是与$\lambda$相关联的特征向量
>
> **第二点**
>
> 令$\bm{v}_i \in \mathcal{\phi}_i,\bm{v}_j \in \mathcal{\phi}_j,i \neq j$因为$\bm{Av}_i = \lambda _i \bm{v}_i,\bm{Av}_j = \lambda _j \bm{v}_j$，我们可以得到
>
> $$
> \bm{v}_j^\top \bm{Av}_i = \lambda _i \bm{v}_j^\top\bm{v}_i
> $$
> 并且
>
> $$
> \bm{v}_j^\top \bm{Av}_i =  \bm{v}_i^\top \bm{A}^\top \bm{v}_j = \bm{v}_i^\top \bm{A} \bm{v}_j = \lambda _j \bm{v}_i^\top\bm{v}_j = \lambda _j \bm{v}_j^\top\bm{v}_i
> $$
> 将两式相减可以得到
>
> $$
> (\lambda _i - \lambda _j) \bm{v}_j^\top\bm{v}_i = 0
> $$
> 由于假设$\lambda _i \neq \lambda _j$，因此必须有$\bm{v}_j^\top\bm{v}_i = 0$，即$\bm{v}_j$和$\bm{v}_i$是正交的
>
> **第三点**
>
> 令$\lambda$为$\bm{A}$的特征值，令$\mu \geq 1$为它的代数重数，令$v$为$\mathcal{\phi}_i = \mathcal{N}(\lambda_i \bm{I}_n − \bm{A})$的维数。一般情况下，$v \leq \mu$，也就是说，几何重数（即特征空间的维数）不大于代数重数，参见Section3.3.5
>
> 接下来我们将证明，对于对称矩阵，实际上有 $ν = \mu$。
>
> 设$\bm{B}$为对称的$m \times m$矩阵，$\lambda$是$\bm{B}$的一个特征值，$\bm{u}$为$\bm{B}$对应的单位范数特征向量，即$\bm{Bu} = \lambda \bm{u}$， $\lVert \bm{u} \rVert^2 = 1$。取$\bm{Q}$为一个矩阵，其列为$\mathcal{R}(\bm{u})$的正交补的正交基，因此$\bm{U} = [\bm{u} \quad \bm{Q}] \in \mathbb{R} ^{m,m},\bm{Q} \in \mathbb{R} ^{m,m-1}$是一个正交矩阵，满足$\bm{U}^\top \bm{U} = \bm{I}_m$。由此我们可以得到
> $$
> \begin{gather*}
> \bm{u}^\top \bm{B} = \lambda \bm{u}^\top \\
> \bm{u}^\top \bm{Q} = \bm{Q}^\top \bm{u} = \bm{0}
> \end{gather*}
> $$
> 那么
>
> $$
> \bm{U}^\top \bm{BU} =
> \begin{bmatrix}
> \lambda & \bm{0} \\
> \bm{0} & \bm{B}_1
> \end{bmatrix},
> \bm{B}_1 = \bm{Q}^\top \bm{BQ} \in \mathcal{S}^{m-1}
> $$
> 现在对$\bm{A} \in \mathcal{S}^n$应用此结论：因为$\bm{A}$为对称矩阵，因此特征向量可以选择为实向量，故存在一个正交矩阵$\bm{U}_1 = [\bm{u}_1 \quad \bm{Q}_1] \in \mathbb{R} ^{n,n}$，使得$\bm{Au}_1 = \lambda \bm{u}_1$，并且
>
> $$
> \bm{U}^\top_1 \bm{AU}_1 =
> \begin{bmatrix}
> \lambda & \bm{0} \\
> \bm{0} & \bm{A}_1
> \end{bmatrix},
> \bm{A}_1 = \bm{Q}^\top_1 \bm{AQ}_1 \in \mathcal{S}^{n-1}
> $$
> 现在，如果$\lambda  = 1$，我们就完成了证明，因为我们找到了一个$\mathcal{\phi}$的一维子空间（这个子空间是$\mathcal{R}(\bm{u}_1)$）。如果$\lambda  \geq 1$，那么由于$\bm{U}^\top_1 \bm{AU}_1$矩阵具有块对角结构并且与$\bm{A}$相似，我们可以得到$\lambda$是$\bm{A}_1$的一个特征值，重数为$\mu − 1$，参见Section2.3.5。因此，我们将相同的推理应用到对称矩阵$\bm{A}_1 \in \mathcal{S}^{n-1}$：存在一个正交矩阵$\bm{U}_2 = [\hat{\bm{u}}_2\quad \bm{Q}_2] \in \mathbb{R}^{n-1,n-1}$，使得$\bm{A}_1\hat{\bm{u}}_2 = \lambda \hat{\bm{u}}_2$，$\lVert \hat{\bm{u}}_2 \rVert^2 = 1$
> $$
> \bm{U}_2^\top \bm{A}_1 \bm{U}_2 =
> \begin{bmatrix}
> \lambda & \bm{0} \\
> \bm{0} & \bm{A}_2
> \end{bmatrix},
> \bm{A}_2 = \bm{Q}^\top_2 \bm{A}_1 \bm{Q}_2 \in \mathcal{S}^{n-2}
> $$
> 接下来可以得到
> $$
> \bm{u}_2 = \bm{U}_1
> \begin{bmatrix}
> 0 \\
> \hat{\bm{u}}_2
> \end{bmatrix}
> $$
> 是矩阵$\bm{A}$的单位范数特征向量并且和$\bm{u}_1$正交，证明如下
> $$
> \bm{Au}_2 = \bm{U}_1
> \begin{bmatrix}
> \lambda & \bm{0} \\
> \bm{0} & \bm{A}
> \end{bmatrix}
> \bm{U}_1 ^\top\bm{U}_1
> \begin{bmatrix}
> 0 \\
> \hat{\bm{u}}_2
> \end{bmatrix}
> = \bm{U}_1
> \begin{bmatrix}
> 0 \\
> \bm{A}\hat{\bm{u}}_2
> \end{bmatrix}
> = \bm{U}_1
> \begin{bmatrix}
> 0 \\
> \lambda\hat{\bm{u}}_2
> \end{bmatrix}
> =\lambda \bm{u}_2
> $$
> 此外
> $$
> \lVert \bm{u}_2 \rVert^2 = \bm{u}_2^\top \bm{u}_2 =
> \begin{bmatrix}
> 0 \\
> \hat{\bm{u}}_2
> \end{bmatrix}^\top
> \bm{U}_1^\top \bm{U}_1
> \begin{bmatrix}
> 0 \\
> \hat{\bm{u}}_2
> \end{bmatrix}
> =\lVert \hat{\bm{u}}_2 \rVert^2 =1
> $$
>
> $$
> \bm{u}_1^\top \bm{u}_2 = \bm{u}_1^\top [\bm{u}_1 \bm{Q}_1]\begin{bmatrix}
> 0 \\
> \hat{\bm{u}}_2
> \end{bmatrix} =0
> $$
>
> 因此$\bm{u}_2$与$\bm{u}_1$正交。如果$\lambda=2$，那么证明就完成了，因为我们已经找到了$\mathcal{\phi}$的二维正交标准基$\bm{u}_2$与$\bm{u}_1$。如果$\lambda>2$，我们对矩阵$\bm{A}_2$应用同样的推理迭代，并找到一个与$\bm{u}_2,\bm{u}_1$正交的特征向量$\bm{u}_3$。我们可以以这种方式继续，直到达到$\mu$，此时我们以由恰好 $\mu$个向量组成的$\mathcal{\phi}$的正交标准基结束该证明过程

### 2.2 谱定理

结合**定理4.1**（对称矩阵的特征空间维数与特征值重数相同；对称矩阵各个特征空间彼此正交）和**定理3.4**（如果矩阵特征空间维数与特征值重数相同那么它与对角矩阵相似，且实现相似的变换矩阵由特征空间的基组成，对角矩阵的对角线为特征值），我们很容易得出任何对称矩阵都与对角矩阵正交相似。这在以下所谓的对称矩阵谱定理中有所说明

> **定理4.2（谱定理）**：设 $\bm{A} \in \mathbb{R}^{n,n}$为对称矩阵，设$\lambda_i \in \mathbb{R},i=1,\cdots,n$为$\bm{A}$的特征值（按重数计数）。那么，存在一组正交归一向量$\bm{u}_i \in \mathbb{R}^n,i=1,\cdots,n$，使得$\bm{Au}_i = \lambda_i \bm{u}_i$。等价地，存在一个正交矩阵$\bm{U} = [\bm{u}_1,\cdots,\bm{u}_n]$（i.e.,$\bm{UU}^\top = \bm{U}^\top\bm{U} = \bm{I}_n$）使得
> $$
> \bm{A} = \bm{U \Lambda U}^\top =\sum_{i=1}^n \lambda_i\bm{u}_i \bm{u}_i^\top,\Lambda=\operatorname{diag}(\lambda_1,\cdots,\lambda_n)
> $$
>

谱定理还表明，任何对称矩阵都可以分解为简单的秩一矩阵（并矢）$\bm{u}_i\bm{u}_i^\top$的加权和，其中权重由特征值 $\lambda_i$给出

## 3. 谱分解与优化

在本节中，我们将说明如何利用对称矩阵的谱分解来解决特定类型的优化问题，即那些涉及在欧几里得球上对二次型进行最大化或最小化的问题

### 3.1 特征值的变分刻画

我们首先把对称矩阵的特征值表示为某些优化问题的最优值。由于$\bm{A}\in \mathbb{S}^n$的特征值是实数，我们可以将它们按降序排列：
$$
\lambda_{\max}(\bm{A}) = \lambda_{1}(\bm{A}) \geq   \lambda_{2}(\bm{A}) \geq \cdots \geq \lambda_{n}(\bm{A}) = \lambda_{\min}(\bm{A})
$$
极值特征值是$\bm{A}$在单位欧几里得球面上诱导的二次型所达到的最小值和最大值。对于$\bm{x} \neq \bm{0}$，下面的比值被称为瑞利商(Rayleigh quotient)
$$
\frac{\bm{x}^\top \bm{Ax}}{\bm{x}^\top \bm{x}}
$$

> **定理4.3（瑞利商）**：对于$\bm{A}\in \bm{S}^n$，有
> $$
> \lambda_{\min}(\bm{A}) \leq \frac{\bm{x}^\top \bm{Ax}}{\bm{x}^\top \bm{x}} \leq \lambda_{\max}(\bm{A}),\forall \bm{x}\neq \bm{0}
> $$
> 另外
> $$
> \begin{gather*}
> \lambda_{\max}(\bm{A}) = \max_{\bm{x}: \lVert \bm{x} \rVert _2 = 1}\bm{x}^\top \bm{Ax} \\
> \lambda_{\min}(\bm{A}) = \min_{\bm{x}: \lVert \bm{x} \rVert _2 = 1}\bm{x}^\top \bm{Ax}
> \end{gather*}
> $$
> 最大值和最小值分别在$\bm{x} = \bm{u}_1$和 $\bm{x} = \bm{u}_n$处取得，其中$\bm{u}_1$和$\bm{u}_n$是$\bm{A}$的单位范数特征向量，分别对应最大、最小特征值

> **证明**
>
> 证明基于对称矩阵的谱定理以及欧几里得范数在正交变换下的不变性。设$\bm{A}= \bm{U \Lambda U}^\top$为$\bm{A}$的谱分解，其中$\Lambda$的对角线为按顺序排列的特征值，$\bm{U}$为正交矩阵。定义$\overline{\bm{x}} \coloneqq \bm{U}^\top \bm{x}$
> $$
> \bm{x}^\top \bm{Ax} = \bm{x}^\top \bm{U \Lambda U}^\top\bm{x} = \overline{\bm{x}}^\top\bm{\Lambda}\overline{\bm{x}} = \sum_{i=1}^n \lambda_i \overline{x}_i^2
> $$
> 注意到
> $$
> \lambda_{\min} \sum_{i=1}^n \overline{x}_i^2 \leq \sum_{i=1}^n \lambda_i \overline{x}_i^2 \leq \lambda_{\max} \sum_{i=1}^n \overline{x}_i^2
> $$
> 考虑到$\sum_{i=1}^{n} \overline{x}_i^2 = \lVert \overline{\bm{x}} \rVert^2_2 =\lVert \bm{U}^\top \bm{x} \rVert^2_2 =\lVert \bm{x} \rVert^2_2$参考Section3.4.6
> $$
> \lambda_{\min} \lVert \bm{x} \rVert_2^2 \leq \bm{x}^\top \bm{Ax} \leq \lambda_{\max} \lVert \bm{x} \rVert_2^2
> $$
> 由此可以得出第一个结论。此外，很容易验证，上述不等式中的上界和下界实际上分别在$\bm{x} = \bm{u}_1$（$\bm{U}$的第一列）和$\bm{x} = \bm{u}_n$（$\bm{U}$的最后一列）处取得(代入既可证明)

### 3.2 极大极小原理(Minimax principle)

**定理4.3**实际上是更一般原理的一个特例，这一原理称为对称矩阵特征值的极小极大原理。我们先陈述一下结果

> **定理4.4（庞加莱不等式）**：设$\bm{A} \in \mathcal{S}^n$并且设$\mathcal{V}$为$\mathbb{R} ^n$的任意$k$维子空间，$1 \leq k \leq n$。**存在**向量$\bm{x},\bm{y}\in \mathcal{V}$满足$\lVert \bm{x} \rVert_2 = \lVert \bm{y} \rVert_2 = 1$，使得
> $$
> \bm{x}^\top \bm{Ax} \leq \lambda _k(\bm{A}),\bm{y}^\top \bm{Ay} \geq \lambda _{n-k+1}(\bm{A})
> $$

> **证明**
>
> 设$\bm{A} = \bm{U \Lambda U}^\top$为$\bm{A}$的谱分解，并记$\mathcal{Q} = \mathcal{R}(\bm{U}_k)$为由$\bm{U}_k = [\bm{u}_k,\cdots \bm{u}_n]$的列生成的子空间。由于$\mathcal{Q}$的维度为$n − k + 1$，而$\mathcal{V}$的维度为$k$，因此交集$\mathcal{V} \cap \mathcal{Q}$必然非空（否则直和$\mathcal{V} \oplus \mathcal{Q}$的维度将大于$n$）。然后取一个单位范数向量$\bm{x} \in \mathcal{V} \cap \mathcal{Q}$。则$\bm{x} = \bm{U}_k \bm{\xi}$，对于某个满足$\lVert \bm{\xi} \rVert_2 = 1$的$\bm{\xi}$使得
> $$
> \bm{x}^\top \bm{Ax} = \bm{\xi}^\top \bm{U}_k^\top \bm{U \Lambda U}^\top \bm{U}_k \bm{\xi} = \sum_{i=k}^{n} \lambda _i(\bm{A})\xi _i^2 \leq \lambda _k(\bm{A})\sum_{i=k}^{n} \xi_i^2 = \lambda _k(\bm{A})
> $$
> 这证明了第一个命题。第二个命题可以通过同理证明，只需将相同的推理应用到$-\bm{A}$
>
从庞加莱不等式可以推导出接下来所述的极小极大原理，这也被称为特征值的变分刻画

> **推论4.1（极大极小原理）**：设$\bm{A} \in \mathcal{S}^n$，且设$\mathcal{V}$表示$\mathbb{
> R} ^n$的一个子空间。则对于$k \in \{1, \cdots ,n \}$，有
> $$
> \begin{align*}
>  \lambda_k(\bm{A}) &= \max _{\dim \mathcal{V}=k} \min _{\bm{x} \in \mathcal{V}, \lVert \bm{x} \rVert_2 = 1 } \bm{x}^\top \bm{Ax} \\
> &=  \min _{\dim \mathcal{V}=n-k+1} \max _{\bm{x} \in \mathcal{V}, \lVert \bm{x} \rVert_2 = 1 } \bm{x}^\top \bm{Ax}
> \end{align*}
> $$

> **证明**
>
> 根据庞加莱不等式，如果$\mathcal{V}$是$\mathbb{R} ^n$ 的任意$k$维子空间，那么存在$\bm{x} \in \mathcal{V},\lVert \bm{x} \rVert_2 = 1$满足$\bm{x}^\top \bm{Ax} \leq \lambda _k(\bm{A})$，即$\min _{\bm{x} \in \mathcal{V},\lVert \bm{x} \rVert_2 = 1} \bm{x}^\top \bm{Ax} \leq \lambda _k(\bm{A})$。特别地，如果我们取$\mathcal{V}$为$\left\{ \bm{u}_1,\cdots ,\bm{u}_k\right\}$张成的空间，则可以实现等号（参考**定理4.4**的证明过程），从而证明第一个结论。第二个结论通过将第一个结论应用于矩阵$-\bm{A}$得出

矩阵增益(matrix gain)给定一个矩阵$\bm{A} \in \mathbb{R} ^{m,n}$，我们考虑与$\bm{A}$相关的线性函数，该函数将输入向量$\bm{x} \in \mathbb{R} ^n$映射到输出向量$\bm{y} \in \mathbb{R} ^m$
$$
\bm{y} = \bm{Ax}
$$
给定一个向量范数，矩阵增益或算子范数定义为输出的大小（范数）与输入的大小（范数）之比$\lVert \bm{Ax} \rVert / \lVert \bm{x} \rVert$的最大值，参见Section3.6。特别地，相对于欧几里得范数的增益定义为
$$
\lVert \bm{A} \rVert_2 = \max _{\bm{x} \neq \bm{0}} \frac{\lVert \bm{Ax} \rVert_2}{\lVert \bm{x} \rVert_2}
$$
并且它通常被称为$\bm{A}$的谱范数(spectral norm)。在欧几里得范数下，输入输出比的平方是
$$
\frac{\lVert \bm{Ax} \rVert_2^2}{\lVert \bm{x} \rVert_2^2} = \frac{\bm{x}^\top (\bm{A}^\top \bm{A})\bm{x}}{\bm{x}^\top \bm{x}}
$$
根据**定理4.3**，我们可以看到该量分别被对称矩阵$\bm{A}^\top \bm{A} \in \mathcal{S}^n$的最大特征值和最小特征值上下界定：
$$
\lambda_{\min }(\bm{A}^\top \bm{A}) \leq  \frac{\lVert \bm{Ax} \rVert_2^2}{\lVert \bm{x} \rVert_2^2} \leq \lambda_{\max }(\bm{A}^\top \bm{A})
$$
（顺便注意，一个矩阵$\bm{A}^\top \bm{A}$的所有特征值$\lambda _i(\bm{A}^\top \bm{A}),i=1,\cdots n$都是非负的，因为$\bm{A}^\top \bm{A}$是一个半正定矩阵，下一节中将讨论此点）。我们还从**定理4.3**中知道，当$\bm{x}$分别等于$\bm{A}^\top \bm{A}$的最大和最小特征值对应的特征向量时等号成立。因此
$$
\lVert \bm{A} \rVert_2 = \max _{\bm{x} \neq \bm{0}} \frac{\lVert \bm{Ax} \rVert_2}{\lVert \bm{x} \rVert_2} = \sqrt[]{\lambda _{\max }(\bm{A}^\top \bm{A})}
$$
极大极小原理的一个重要结果是将矩阵$\bm{A},\bm{B}$的有序特征值与$\bm{A}+\bm{B}$的有序特征值进行比较的下列结论

> **推论4.2**：令$\bm{A},\bm{B} \in \mathcal{S}^n$，对每个$k=1,\cdots ,n$我们有
> $$
> \lambda _k(\bm{A}) + \lambda _{\min }(\bm{B}) \leq \lambda _k(\bm{A}+\bm{B}) \leq \lambda _k(\bm{A})+\lambda _{\max }(\bm{B})
> $$

> **证明**
>
> 根据**推论4.1**我们可以得到
> $$
> \begin{align*}
> \lambda _k(\bm{A}+\bm{B})& = \min _{\dim \mathcal{V} = n -k +1} \max _{\bm{x} \in \mathcal{V}, \lVert \bm{x} \rVert_2 =1}(\bm{x}^\top \bm{Ax} + \bm{x}^\top \bm{Bx}) \\
> &\geq \min _{\dim \mathcal{V} = n -k +1} \max _{\bm{x} \in \mathcal{V}, \lVert \bm{x} \rVert_2 =1}\bm{x}^\top \bm{Ax} +\lambda _{\min }(\bm{B}) \qquad \text{放缩}\\
> &= \lambda _k(\bm{A})+\lambda _{\min }(\bm{B})
>\end{align*}
>$$
> 这证明了左边的不等式；右边的不等式可以通过类似的推理得到

**推论4.2**的一个特殊情形出现在当对称矩阵$\bm{A} \in \mathcal{S}^n$施加扰动，即加入一个秩为一的矩阵$\bm{B}=\bm{qq}^\top$时。由于$\lambda _{\max}(\bm{qq}^\top )=\lVert \bm{q} \rVert_2^2$并且$\lambda _{\min }(\bm{qq}^\top )=0$（参考Section3.4.7），我们可以得到
$$
\lambda _k (\bm{A}) \leq \lambda _k(\bm{A}+\bm{qq}^\top )\leq \lambda _k(\bm{A})+\lVert \bm{q} \rVert_2^2,k=1,\cdots ,n
$$

## 4. 半正定矩阵

### 4.1 定义

一个对称矩阵$\bm{A} \in \mathcal{S}^n$其关联的二次型非负，则被称为半正定(positive semidefinite, PSD)，
$$
\bm{x}^\top \bm{Ax} \geq 0, \forall \bm{x} \in \mathbb{R} ^n
$$
如果
$$
\bm{x}^\top \bm{Ax} > 0, \forall  0 \neq \bm{x} \in \mathbb{R} ^n
$$
那么$\bm{A}$被称为正定(positive definite, PD)。为了表示一个对称的半正定/正定矩阵，我们使用符号$\bm{A} \succ 0$ /$\bm{A} \succeq 0$。如果$-\bm{A} \succeq 0$，我们说$\bm{A}$是半负定的(negative semidefinite, NSD)，记作$\bm{A} \preceq 0$；同样地，如果$-\bm{A} \succ 0$，我们说$\bm{A}$是负定的(negative definite, ND)，记作$\bm{A} \prec 0$。可以看出，当且仅当一个半正定矩阵是可逆的，它实际上才是正定矩阵
> **证明**
>
> 根据**定理4.3**有
> $$
> \lambda _{\min }(\bm{A}) = \frac{\bm{x}^\top \bm{Ax}}{\lVert \bm{x} \rVert_2^2} \vert _{\bm{x} = \bm{u}_n}
> $$
> $\bm{A}$为半正定则$\bm{x}^\top \bm{Ax} \geq 0$，那么$\lambda _{\min }(\bm{A}) \geq 0$，即所有特征值均大于等于零
>
> 同理，$\bm{A}$为正定则$\bm{x}^\top \bm{Ax} > 0$，那么$\lambda _{\min }(\bm{A}) > 0$，即所有特征值均大于零
>
> 参考Section3.3.3，矩阵可逆则特征值全不为零。那么半正定矩阵（特征值大于等于零）+矩阵可逆（特征值不为零）=矩阵正定（特征值大于零）

在$\mathbb{R} ^{n,n}$中，实半正定矩阵集合记作
$$
\mathcal{S}^n_+ = \left\{ \bm{A} \in \mathcal{S}^n : \bm{A} \succeq  0 \right\}
$$
相似地，$\mathcal{S}^n_{++}$代表$\mathbb{R} ^{n,n}$中正定矩阵的集合

> **备注4.1（PSD矩阵的主子矩阵）**：设$\mathcal{I} = \left\{ i_1 , \cdots ,i_m \right\}$是下标集合$\left\{ 1,\cdots ,n \right\}$的一个子集，并记$\bm{A}_{\mathcal{I}}$为从$\bm{A} \in \mathbb{R} ^{n,n}$中取出下标属于$\mathcal{I}$的行和列所得的子矩阵（这称为$\bm{A}$的$m \times m$维主子矩阵）
> $$
> \bm{A} \succeq 0 \Rightarrow \bm{A}_{\mathcal{I}} \succeq 0 , \forall \mathcal{I}
> $$
> 同样地，$\bm{A} \succ 0$意味着$\bm{A}_{\mathcal{I}} \succ 0$。这一点能够成立，是因为形成$\bm{x}_{\mathcal{I}}^\top \bm{A}_{\mathcal{I}} \bm{x}_{\mathcal{I}}$相当于向量$\bm{x}$形成$\bm{x}^\top \bm{Ax}$时$\bm{x}$的元素$x_i$只有在$i \in \mathcal{I}$时才非零。根据这个结论我们可以知道$\bm{A} \succeq 0$意味着对角元素$a_{ii} \geq 0,i = 1,\cdots, n$（每一个对角线上的元素都是一个主子矩阵）；同样地，$\bm{A} \succ 0$意味着$a_{ii} > 0,i = 1,\cdots, n$

### 4.2 半正定矩阵的特征值

如果将一个半正定矩阵$\bm{B}$加到矩阵$\bm{A} \in \mathcal{S}^m$上，矩阵$\bm{A}$的特征值不会减少。如果$\bm{B} \succeq 0$，那么$\lambda _{\min }(\bm{B}) \geq 0$，根据**推论4.2**可以得出
$$
\bm{B} \succeq 0 \Rightarrow \lambda _k(\bm{A}+\bm{B}) \geq \lambda _k(\bm{A})+\lambda _{\min }(\bm{B}) \geq \lambda _k(\bm{A}) ,k=1,\cdots, n
$$

### 4.3 全等变化

> **定理4.5**：设$\bm{A} \in \mathcal{S}^n,\bm{B}\in \mathbb{R} ^{n,m}$并且考虑其乘积
> $$
> \bm{C} = \bm{B}^\top \bm{AB} \in \mathcal{S}^m
> $$
>
> 1. $\bm{A} \succeq 0 \Rightarrow \bm{C} \succeq 0$
> 2. 如果$\bm{A} \succ 0$，那么$\operatorname{rank}\bm{B} = m \Leftrightarrow  \bm{C} \succ 0$
> 3. 如果$\bm{B}$是方阵并且可逆，那么$\bm{A} \succ 0 /\bm{A} \succeq 0 \Leftrightarrow \bm{C} \succ 0/\bm{C} \succeq 0$

> **证明**
>
> **第一点**
>
> 对于所有$\bm{x}\in \mathbb{R} ^m$有
> $$
> \bm{x}^\top \bm{Cx} = \bm{x}^\top \bm{B}^\top \bm{ABx} = \bm{z}^\top \bm{Az} \geq 0
> $$
> 令$\bm{z} = \bm{Bx}$，因此$\bm{C} \succeq 0$
>
> **第二点**
>
> 注意到，由于$\bm{A} \succ 0$，那么$\bm{x} \neq \bm{0}$时，$\bm{z} \neq \bm{0}$必成立$\Leftrightarrow \bm{C} \succ 0$，因为当$\bm{z}= \bm{0}$时$\bm{z}^\top \bm{Az} > 0$不一定成立。故需要$\bm{Bx} \neq \bm{0}$对所有$\bm{x} \neq \bm{0}$成立，即$\operatorname{dim}\mathcal{N}(\bm{B}) = 0$时。根据**定理3.1**，有$\dim \mathcal{N}(\bm{B}) + \operatorname{rank}(\bm{B}) = m$，由此可得结论
>
> **第三点**
>
> 根据第二点可知，$\bm{A} \succ 0 \Rightarrow \bm{C} \succ 0$。为了证明$\bm{C} \succ 0 \Rightarrow \bm{A} \succ 0$，先令$\bm{C} \succ 0$，并为了反证法假设$\bm{A} \nsucc 0$。则存在$\bm{z} \neq \bm{0}$使得$\bm{z}^\top \bm{Az} \leq  0$。由于$\bm{B}$可逆，令$\bm{x} = \bm{B}^{-1}\bm{z}$，则
> $$
> 0 \geq  \bm{z}^\top \bm{Az} =\bm{x}^\top \bm{B}^\top \bm{ABx} =\bm{x}^\top \bm{Cx}  
> $$
> 这与$\bm{C} \succ 0$C矛盾。使用类似的论证可以证明$\bm{A} \succeq 0 \Leftrightarrow \bm{C} \succeq 0$

当$\bm{B}$是方阵且可逆时，$\bm{C} = \bm{B}^\top \bm{AB} \in \mathcal{S}^m$定义了所谓的合同变换( congruence transformation)，并且$\bm{A},\bm{C}$称为合同矩阵。对称矩阵$\bm{A}\in \mathcal{S}^n$的惯性(inertia) $\operatorname{In}(\bm{A}) = (\operatorname{npos}(A), \operatorname{nneg}(A), \operatorname{nzero}(A))$被定义为一个非负整数三元组，分别表示$\bm{A}$正特征值的数量、负特征值的数量和零特征值的数量（计入重数）。可以证明，当且仅当（等价于充要条件）矩阵$\bm{A}\in \mathcal{S}^n$和$\bm{C}\in \mathcal{S}^n$是合同矩阵时，它们才具有相同的惯性

由于**单位矩阵是正定的**，那么将**定理4.5**中的$\bm{A}$设为单位矩阵可以得到以下推论

> **推论4.3**：对于任意矩阵$\bm{A} \in \mathbb{R} ^{m,n}$，有如下结论
>
> 1. $\bm{A}^\top \bm{A} \succeq 0$并且$\bm{AA}^\top \succeq 0$
> 2. $\bm{A}^\top \bm{A} \succ 0 \Leftrightarrow \bm{A}$是列满秩矩阵，即$\operatorname{rank}\bm{A} = n$
> 3. $\bm{AA}^\top \succ 0 \Leftrightarrow \bm{A}$是行满秩矩阵，即$\operatorname{rank}\bm{A} = m$

> **定理4.6（通过合同进行联合对角化）**：设$\bm{A}_1,\bm{A}_2 \in \mathcal{S}^n$，并且存在某些标量$\alpha 1, \alpha _2$使得
> $$
> \bm{A} = \alpha _1 \bm{A}_1 + \alpha _2 \bm{A}_2 \succ 0
> $$
> 那么存在一个非奇异矩阵$\bm{B} \in \mathbb{R} ^{n,n}$，使得$\bm{B}^\top \bm{A}_1 \bm{B}$和$\bm{B}^\top \bm{A}_2 \bm{B}$都是对角矩阵

这说明当两个对称矩阵的线性组合满足正定，那么他们可以通过适当的合同变换同时“对角化”

> **证明**
>
> 不失一般性地假设$\alpha _2 > 0$。由于$\bm{A} \succ 0,\bm{I}_n \succ 0$那么$\bm{B}_1$零空间平凡，又$\bm{B}_1$为方阵，那么它可逆，故$\bm{A}$与单位矩阵合同，即存在某个非奇异矩阵$\bm{B}_1$使得$\bm{B}_1^\top \bm{AB}_1 = \bm{I}_n$。由于$\bm{B}_1^\top \bm{A}_1 \bm{B}_1$是对称的，根据谱定理，存在一个正交矩阵$\bm{W}$使得$\bm{B}_1^\top \bm{A}_1 \bm{B}_1 = \bm{WDW}^\top$，变换可得$\bm{W}^\top \bm{B}_1^\top \bm{A}_1 \bm{B}_1\bm{W} = \bm{D}$，其中$\bm{D}$为对角矩阵。取$\bm{B} = \bm{B}_1 \bm{W}$，我们可以得到
> $$
> \begin{gather*}
> \bm{B}^\top \bm{AB} = \bm{W}^\top \bm{B}_1^\top \bm{AB}_1\bm{W} = \bm{W}^\top \bm{I}_n \bm{W}  = \bm{I} \\
> \bm{B}^\top \bm{A}_1 \bm{B} = \bm{D}
> \end{gather*}
> $$
> 由于$\bm{A}_2 = (\bm{A} - \alpha _1 \bm{A}_1) / \alpha _2$，因此$\bm{B}_1^\top \bm{A}_2 \bm{B}_1$也是对角矩阵，证明完成

从**定理4.6**的证明过程，我们可以得到以下推论

> **推论4.4**：设$\bm{A} \succ 0$且$\bm{C} \in \mathcal{S}^n$。则存在一个非奇异矩阵$\bm{B}$，使得$\bm{B}^\top \bm{CB}$为对角矩阵，且$\bm{B}^\top \bm{AB} = \bm{I}_n$

### 4.4 矩阵平方根和Cholesky分解

设$\bm{A} \in \mathcal{S}^n$，那么
$$
\begin{align*}
  \bm{A} \succeq 0 \Leftrightarrow \exists \bm{B} \succeq 0 \colon \bm{A} = \bm{B}^2 \\
  \bm{A} \succ 0 \Leftrightarrow \exists \bm{B} \succ 0 \colon \bm{A} = \bm{B}^2 \\
\end{align*}
$$
实际上，任何$\bm{A} \in  \mathcal{S}^n$都可以进行谱分解$\bm{A} = \bm{U \Lambda U}^\top$，其中$\bm{U}$是正交矩阵，$\bm{\Lambda} = \operatorname{diag}(\lambda _1, \cdots , \lambda _n)$，因为$\bm{A} \succeq  0$，因此$\lambda _i \geq 0,i=1,\cdots ,n$。定义$\Lambda ^{1/2} = \operatorname{diag}(\sqrt{\lambda _1},\cdots ,\sqrt{\lambda _n})$并且$\bm{B} = \bm{U \Lambda}^{1/2}\bm{U}^\top$，我们可以得到
$$
\bm{B}^2 = \bm{U \Lambda}^{1/2}\bm{U}^\top \bm{U \Lambda}^{1/2}\bm{U}^\top = \bm{U \Lambda}\bm{U}^\top = \bm{A}
$$
此时$\bm{B}$最小的特征值仍然为负，故而$\bm{B}\succeq 0$。相反，如果对于某个对称矩阵$\bm{B}$有$\bm{A} = \bm{B}^\top \bm{B} = \bm{B}^2$，那么根据**推论4.3**可得$\bm{A} \succeq 0$，第一个等式的证明完成。第二个等式的证明类似。此外，可以证明两式中的**矩阵$\bm{B}$是唯一(unique)的，该矩阵称为$\bm{A}$的平方根矩阵(square-root)：$\bm{B} = \bm{A}^{1/2}$**

如果设$\bm{B} = \Lambda ^{1/2}\bm{U}^\top$并将前面的推理重复一遍，我们也可以得出结论
$$
\begin{align*}
  \bm{A} \succeq 0 \Leftrightarrow \exists \bm{B}  \colon \bm{A} = \bm{B}^\top \bm{B} \\
  \bm{A} \succ 0 \Leftrightarrow \exists \bm{B} \text{非奇异} \colon \bm{A} = \bm{B}^2 \\
\end{align*}
$$
根据定义可知$\bm{B}$为方阵，根据**定理4.5**可证明第二个等式。从上式可知，**只有当矩阵$\bm{A}$与单位矩阵相合同的时候，$\bm{A}$才是正定的**

进一步注意，每个方阵$\bm{B}$有一个QR分解：$\bm{B} = \bm{QR}$，其中$\bm{Q}$是正交矩阵，$\bm{R}$是上三角矩阵，其秩与$\bm{B}$同（见Section 7.3）。那么，对于任意$\bm{A} \neq \bm{0}$我们有
$$
\bm{A} = \bm{B}^\top \bm{B} = \bm{R}^\top \bm{Q}^\top \bm{QR} = \bm{R}^\top \bm{R}
$$
也就是说，**任何PSD矩阵都可以分解为$\bm{R}^\top \bm{R}$的形式，其中$\bm{R}$是上三角矩阵。此外，$\bm{R}$可以选择为非负对角线元素。如果$\bm{A}\succ 0$，那么这些对角线元素为正。在这种情况下，这种分解是唯一的，称为$\bm{A}$的Cholesky分解**

利用矩阵平方根，我们可以证明以下结果，它将$\bm{B}$和$\bm{AB}$的特征值联系起来，其中$\bm{B}$为对称矩阵，且$\bm{A}\succ 0$

> **推论4.5**：设$\bm{A},\bm{B} \in \mathcal{S}^n$，且$\bm{A} \succ 0$。则矩阵$\bm{AB}$可对角化，具有纯实特征值，并且其惯性与$\bm{B}$相同

> **证明**
>
> 设$\bm{A}^{1/2}\succ 0$为矩阵$\bm{A}$的平方根。那么
> $$
> \bm{A}^{-1/2}\bm{ABA}^{1/2} = \bm{A}^{1/2}\bm{BA}^{1/2}
> $$
> 通过观察可以得知，$\bm{AB}$与$\bm{A}^{1/2}\bm{BA}^{1/2}$是相似的，因此二者有相同的特征值。由于后者为对称矩阵，因此它的特征值为实数，并且它是可对角化的，即$\bm{A}^{1/2}\bm{BA}^{1/2} = \bm{U \Lambda}\bm{U}^\top$，那么$\bm{AB} = \bm{A}^{1/2}\bm{U \Lambda}\bm{U}^\top \bm{A}^{-1/2} = (\bm{A}^{1/2}\bm{U}) \bm{\Lambda}(\bm{A}^{1/2}\bm{U})^{-1}$，所以$\bm{AB}$是可对角化的。此外，$\bm{A}^{1/2}\bm{BA}^{1/2}$与$\bm{B}$是合同的，因此它具有与$\bm{B}$相同的惯性。因此，$\bm{AB}$具有与$\bm{B}$相同的惯性

### 4.5 正定矩阵与椭球体(ellipsoids)

---
未完待续
