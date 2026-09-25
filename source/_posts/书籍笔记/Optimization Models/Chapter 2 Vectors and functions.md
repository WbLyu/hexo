---
title: Chapter 2 Vectors and functions
date: 2025-09-13 10:39:05
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
cover: https://img.wblyu.top/images/6661b2a111684b5520f13c5a76e4c2f3.avif
---

## 1. 向量基础

### 1.1 向量

**向量可以被视为数字的集合(collection)**，通常写为列排列

$x_i$被称为向量$\mathbf{x}$的第$i$个元素(element)/条目(entry)/分量(component)，元素的数量为$\mathbf{x}$的维度

向量中的元素为实数(real)时，i.e. $x_i \in \mathbb{R}$，向量为实数向量，i.e. $\mathbf{x} \in \mathbb{R}^n$；若向量中的元素为复数(complex)时，i.e. $x_i \in \mathbb{C}$，向量为复数向量，i.e. $\mathbf{x} \in \mathbb{C}^n$

当我们不在乎向量是行向量(row)还是列向量(column)时，可以直接使用$\mathbf{x}=(x_1,x_2 \cdots, x_n)$来表示向量

### 1.2 向量空间

**向量可以被视为空间中的点**  

向量空间(vector space),$\mathcal{X}$是通过为向量配备加法和标量乘法的操作而获得的，最常见的向量空间为$\mathcal{X} = \mathbb{R}^n$

如果$\mathcal{V}$是向量空间$\mathcal{X}$的一个非空子集，并且$\mathcal{V}$在加法和标量乘法下是**封闭的**(closed)，那么$\mathcal{V}$是$\mathcal{X}$的子空间(subspace)。

加法和标量乘法下的**封闭性**可以表述为：对于任意标量$\alpha,\beta$有

$$
x,y \in \mathcal{V} \Rightarrow \alpha x + \beta y \in \mathcal{V}
$$

> 子空间必须包含原点

线性组合(linear combination)的形式如下

$$
\alpha_1 \mathbf{x}^{(1)} + \alpha_2 \mathbf{x}^{(2)} + \alpha_3 \mathbf{x}^{(3)} + \cdots \alpha_m \mathbf{x}^{(m)}, \alpha_i \in \mathbb{R}
$$
向量集合$\mathcal{S}$中的向量组成的所有线性组合会形成一个子空间，称为由$\mathcal{S}$生成的子空间，或者称为$\mathcal{S}$的张成，记为$span(\mathcal{S})$

1. 由单向量$\mathcal{S}=\{ x^{(1)} \}$生成的子空间是一条过原点的直线
2. 由不共线的两个向量$\mathcal{S}=\{ x^{(1)},x^{(2)} \}$生成的子空间是一个过原点的平面

当两个子空间的交集只有零向量的时候，i.e. $\mathcal{X}\cap \mathcal{Y} = \mathbf{0}$，那么这两个子空间的和称为直和(direct sum)，定义为$\mathcal{X} \oplus \mathcal{Y}$。子空间的和并非单纯的元素合并而是基合并后进行线性组合形成的子空间

如果向量集合中的任何一个向量都无法表示为其他向量的线性组合，那么这个集合是线性无关的(linearly independent)，充要条件为

$$
\sum_{i=1}^m\alpha_i \mathbf{x}_i = \mathbf{0}\Longrightarrow \alpha = 0
$$
包含$m$个元素的向量集合$\mathcal{S} = \{\mathbf{x}_1, \cdots, \mathbf{x}_m \}$，它可以生成一个子空间$span(\mathcal{S})$。假设最后一个元素可以写成集合中其他元素的线性组合，那么去掉这个元素后生成的子空间是一样的，i.e. $span(\mathcal{S}) = span(\mathcal{S} \setminus \mathbf{x}_m)$。重复这个步骤直到集合中的向量都是线性无关的，得到的集合为$\mathcal{B} = \{\mathbf{x}_1, \cdots , \mathbf{x}_d \}, d \le m$，这样的**集合**称为$span(\mathcal{S})$的基(basis)，元素数量$d$称为$span(\mathcal{S})$的维数(dimension)

一个子空间可以有无限个不同的基，但任何基中的元素数量是固定的，并且等于子空间的维度。如果我们得到了子空间的基，那么我们可以用基中元素的线性组合表达子空间中的所有向量。$\mathbb{R}^n$中的标准基写为$\{ \mathbf{e}_1, \cdots, \mathbf{e}_n  \}$，$\mathbf{e}_i$中第$i$个元素为$1$其余全为$0$

仿射集(affine sets)被定义为子空间的平移

$$
 \mathcal{A} = \{ \mathbf{x} \mid \mathbf{x} = \mathbf{v} + \mathbf{y}, \mathbf{v} \in \mathcal{V} \}
$$
其中$\mathbf{y}$是给定的点，$\mathcal{V}$是给定的子空间.仿射集必定经过$\mathbf{y}$

一个直线可以由两个元素描述：一个是直线上的点和一个表示直线方向的向量

$$
\mathcal{L} = \{ \mathbf{x} \mid \mathbf{x} = \mathbf{x}_0 + \mathbf{v} \}
$$

## 2. 范数和内积

### 2.1 欧几里得长度和一般的$L_p$范数

向量的欧几里得长度是对所有元素的平方和取平方根，它代表了从原点到达点$\mathbf{x}$的直线距离。当沿着正交网格从原点到达点$\mathbf{x}$的时候，距离为向量所有元素的绝对值之和

由于向量空间中由不同的长度度量，由此产生了向量范数(norm)的概念

范数是一个具有特殊性质的实值函数，它将向量映射为一个实数$\lVert \mathbf{x} \rVert$，它满足的特殊性质如下
$$
\begin{gather*}
\forall \mathbf{x} \in \mathcal{X} ,\lVert \mathbf{x} \rVert \ge 0 ,and\lVert \mathbf{x} \rVert = 0 \text{ if and only if } \lVert \mathbf{x} \rVert = \mathbf{0} \\
\forall \mathbf{x}, \mathbf{y} \in \mathcal{X} ,\lVert \mathbf{x}+\mathbf{y} \rVert \le \lVert \mathbf{x} \rVert + \lVert \mathbf{y} \rVert (\text{triangle inequality}) \\
\forall \mathbf{x} \in \mathcal{X} ,\lVert \alpha \mathbf{x} \rVert = \lvert \alpha \rvert \lVert \mathbf{x} \rVert
\end{gather*}
$$
$L_p$范数被定义为

$$
\lVert \mathbf{x} \rVert \coloneqq \left(\sum_{k=1}^n \lvert x_k \rvert ^p\right)^{1/p}
$$
如果$p=2$我们便得到了欧几里得长度

$$
\lVert \mathbf{x} \rVert_2 \coloneqq \sqrt{\sum_{k=1}^n x_k^2}
$$
如果$p=1$我们便得到了在正交网格中的长度

$$
\lVert \mathbf{x} \rVert_1 \coloneqq \sum_{k=1}^n \lvert x_k \rvert
$$
如果$p=\infty$我们便得到了最大绝对值范数

$$
\lVert \mathbf{x} \rVert_\infty \coloneqq \max_{k=1,\dots,n} \lvert x_k \rvert
$$
除了范数函数外，还有一些函数可以表示向量的大小，如基数函数(cardinality function)，表示非零元素的个数

$$
\operatorname{card}( \mathbf{x} ) \coloneqq \sum_{k=1}^n\mathbb{I}(x_k \neq 0),\quad\text{where}\quad\mathbb{I}(x_k \neq 0) \coloneqq \left\{
\begin{array}
{ll}1 & \text{if }x_k \neq 0 \\
0 & \text{otherwise}
\end{array}\right.
$$
向量的基数也经常被称为$L_0$范数，写为$\lVert \mathbf{x} \rVert_0$，但它并不是严格意义上的范数，因为它不满足范数的性质

单位$L_p$范数球(norm ball)是指由所有$L_p$范数小于等于$1$的向量组成的集合

$$
\mathcal{B}_p = \{ \mathbf{x} \mid  \lVert \mathbf{x} \rVert _p \le 1 \}
$$
![2.11](https://img.wblyu.top/optimization-models/2.11.png "2.11")

$L_2$范数类似由于一个球，因此它是旋转不变的，这意味着一个固定长度的向量如果任意旋转，将保持相同的$L_2$范数

实数向量空间的内积(inner product)是一个实值函数，将两个向量映射为一个标量，记为$\langle \mathbf{x},\mathbf{y} \rangle$，内积满足以下条件：$\text{for any }\mathbf{x},\mathbf{y},\mathbf{z} \in \mathcal{X} \text{and scalar }\alpha$

$$
\begin{gather*}
 \langle \mathbf{x},\mathbf{y} \rangle \ge 0; \\
 \langle \mathbf{x},\mathbf{x} \rangle = 0 \text{ if and only if }\mathbf{x} = \mathbf{0}; \\
 \langle \mathbf{x} + \mathbf{y},\mathbf{z}\rangle = \langle \mathbf{x},\mathbf{z} \rangle + \langle \mathbf{y},\mathbf{z} \rangle; \\
  \langle \alpha\mathbf{x},\mathbf{y} \rangle = \alpha \langle \mathbf{x},\mathbf{y} \rangle; \\
  \langle \mathbf{x},\mathbf{y} \rangle= \langle \mathbf{y},\mathbf{x} \rangle.
\end{gather*}
$$
配备了内积操作的向量空间被称为内积空间(inner product space)

标准内积是两个向量的“行列”积

$$
\langle \mathbf{x},\mathbf{y} \rangle =  \mathbf{x} ^\top \mathbf{y} = \sum^n_{k=1} x_k y_k
$$
除了标准内积，我们还可以定义其他内积，并且在矩阵空间中内积也有很好的定义

在内积空间中$\sqrt{\langle \mathbf{x},\mathbf{x} \rangle}$是一个范数，经常被简写为$\lVert \mathbf{x} \rVert$

$$
 \lVert \mathbf{x} - \mathbf{y} \rVert^2_2 = \left( \mathbf{x} - \mathbf{y} \right)^\top \left( \mathbf{x} - \mathbf{y} \right) = \mathbf{x}^\top \mathbf{x} + \mathbf{y}^\top \mathbf{y} - 2 \mathbf{x}^\top \mathbf{y}
$$
标准向量积和两个向量的夹角有关，定义$\theta$为$\mathbf{0} \mathbf{x}$和$\mathbf{0} \mathbf{y}$的夹角，通过几何关系可以得到

$$
 \cos \theta = \frac{\mathbf{x} ^\top \mathbf{y}}{\lVert \mathbf{x} \rVert_2 \lVert \mathbf{y} \rVert_2}
$$
当两个向量内积为$0$时说明两个线是正交的(orthogonal)；当$\theta$为$0^\circ$或者$\pm180^\circ$时两直线平行(parallel)，这时标准内积的绝对值最大，为二者绝对值的乘积

通过推导可以得到$\mathbf{x} ^\top \mathbf{y}=\lVert \mathbf{x} \rVert \lVert \mathbf{y} \rVert \cos\theta$，由于$\lvert \theta \rvert \le 1$，因此可以得到柯西不等式(Cauchy–Schwarz inequality)

$$
\lvert \mathbf{x} ^\top \mathbf{y} \rvert \le \lVert \mathbf{x} \rVert \lVert \mathbf{y} \rVert
$$
将这个不等式推广到$L_p$范数称为霍尔德不等式(Holder)：$\text{for any }p,q \le 1 \text{ such that } 1/p + 1/q = 1, \text{ it holds that}$

$$
\lvert \mathbf{x} ^\top \mathbf{y} \rvert \le \sum^n_{k=1} \lvert x_k y_k \rvert \le \lVert \mathbf{x} \rVert_p \lVert \mathbf{y} \rVert_p
$$
考虑到一个非零向量$\mathbf{y} \in \mathbb{R}^n$，寻找某个向量$\mathbf{x} \in \mathcal{B}_p$（在$L_p$范数下的单位球）使得内积$\mathbf{x}^\top\mathbf{y}$ 最大化的问题-，即

$$
 \max_{ \lVert \mathbf{x} \rVert_p \le 1} \mathbf{x}^\top\mathbf{y}
$$
当$p=2$时最优解可以从几何意义$\mathbf{x} ^\top \mathbf{y}=\lVert \mathbf{x} \rVert \lVert \mathbf{y} \rVert \cos\theta$中得到，即$\mathbf{x}$与$\mathbf{y}$对齐(aligned)/平行(parallel)，同时范数取最大值$1$时为最优解。唯一解是

$$
\mathbf{x}_2^*=\frac{\mathbf{y}}{\lVert \mathbf{y} \rVert}
$$
此时最大值为$\max_{ \lVert \mathbf{x} \rVert_2 \le 1} \mathbf{x}^\top\mathbf{y} =\lVert \mathbf{y} \rVert_2$

当$p=\infin$时最优解可以从定义$\mathbf{x} ^\top \mathbf{y} = \sum^n_{k=1} x_k y_k$中得到，由于$\mathbf{x}$中的每个元素的绝对值都小于等于$1$，那么令$x_i = \mathrm{sgn}\left( y_i \right)$可以使求和为最大值，此时$x_iy_i=\lvert y_i \rvert$，最优解为

$$
\mathbf{x}_{\infin}^*=\mathrm{sgn}\left( \mathbf{y} \right)
$$
此时最大值为$\max_{ \lVert \mathbf{x} \rVert_{\infin} \le 1} \mathbf{x}^\top\mathbf{y} =\sum_{i=1}^n\lvert y_i \rvert = \lVert \mathbf{y} \rVert_1$。最优解并非唯一，因为$y_i=0$时任意$x_i \in \left[ -1,1 \right]$都能满足最优目标

当$p=1$时内积定义$\mathbf{x} ^\top \mathbf{y} = \sum^n_{k=1} x_k y_k$可以被解释为$y_i$的加权平均，其中$x_i$是权重且绝对值相加为$1$。首先找到绝对值最大的$y_i$，将它的索引设为$m$，也就是说对于所有$i=1,\dots,n$有$\lvert y_i \rvert \le \lvert y_m \rvert$，最优解为

$$
\left[ \mathbf{x}^*_1 \right]_i = \left\{
\begin{array}
{ll}\operatorname{sgn}\left( y_i \right) & \text{if }i = m \\
0 & \text{otherwise}
\end{array}\right. ,\quad i=1,\dots,n
$$
此时最大值为$\max_{ \lVert \mathbf{x} \rVert_{1} \le 1} \mathbf{x}^\top\mathbf{y} \max_i\lvert y_i \rvert = \lVert \mathbf{y} \rVert_{\infin}$。最优解并非唯一，因为当$\mathbf{y}$有多个相同最大绝对值的元素时$m$可以选择这些元素的任意索引

---

未完待续
