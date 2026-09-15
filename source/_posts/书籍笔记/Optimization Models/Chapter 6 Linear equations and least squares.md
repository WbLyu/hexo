---
title: Chapter 6 Linear equations and least squares
date: 2025-12-21 16:05:21
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

我们在这里介绍线性方程以及一种用于表示它们的标准形式$\bm{Ax} = \bm{y}$，其中$\bm{x} \in \mathbb{R} ^n$为未知变量，$\bm{A} \in \mathbb{R} ^{m,n}$为系数矩阵，$\bm{y} \in \mathbb{R} ^m$为已知向量。实际上，求解一组线性方程 $\bm{Ax} = \bm{y}$的问题也可以解释为一个优化问题，即相对于$\bm{x}$最小化$\lVert \bm{Ax} - \bm{y} \rVert_2$

## 1. 动机和示例

如前面的例子所示，通用的线性方程可以用向量形式表示为
$$
\bm{Ax} = \bm{y}
$$
其中$\bm{x} \in \mathbb{R} ^n$为未知变量，$\bm{A} \in \mathbb{R} ^{m,n}$为系数矩阵，$\bm{y} \in \mathbb{R} ^m$为已知向量。

我们预期，根据$\bm{A}$和$\bm{y}$的大小和性质，上述系统可能没有解，或者有唯一解，或者有无限多种可能的解。在后一种情况下，解的集合实际上构成$\mathbb{R} ^n$的一个子空间；在第一种情况（无解）下，我们将引入合适的近似解概念

## 2. 线性方程组的解集

### 2.1 定义与特性

线性方程组的解集定义为
$$
\mathcal{S} \coloneqq \left\{ \bm{x} \in \mathbb{R} ^n \colon \bm{Ax} = \bm{y} \right\}
$$
设$\bm{a}_1,\cdots ,\bm{a}_n \in \mathbb{R} ^m$表示矩阵$\bm{A}$的列，即$\bm{A} = [ \bm{a}_1 \quad \cdots \quad \bm{a}_n ]$，注意矩阵乘积$\bm{Ax}$只是$\bm{A}$ 的各列的线性组合，其系数由$\bm{x}$给出
$$
\bm{Ax} = x_1 \bm{a}_1+ \cdots +x_n \bm{a}_n
$$
我们回想一下，根据定义，矩阵的秩空间是由它的列生成的子空间，因此，无论$\bm{x}$系数的值为何，向量$\bm{Ax}$总是位于$\mathcal{R}(\bm{A})$中。由此可得，每当$\bm{y} \not\in \mathcal{R}(\bm{A})$时，方程组不存在解（即它们不可行(infeasible)），因此解集$\mathcal{S}$是空的。等价地，方程组有解当且仅当$\bm{y} \in \mathcal{R}(\bm{A})$，也就是说当且仅当$\bm{y}$是$\bm{A}$的列的线性组合。这个条件可以通过秩检验来检查
$$
\operatorname{rank}([\bm{A} \quad \bm{y}]) = \operatorname{rank}(\bm{A})
$$
假设接下来上述条件得到满足，因此存在一个解$\bar{\bm{x}}$，使得$\bm{y} = \bm{A} \bar{\bm{x}}$。接下来我们将证明解集是仿射集：注意方程组存在另一个解$\bm{x} \neq \bar{\bm{x}}$当且仅当
$$
\bm{A}(\bm{x} - \bar{\bm{x}}) = \bm{0}
$$
因此$\bm{x} - \bar{\bm{x}}$必须位于$\bm{A}$的零空间$\mathcal{N}(\bm{A})$中。因此方程组的所有可能解的形式为$\bm{x} = \bar{\bm{x}} + \bm{z}$，其中$\bm{z} \in \mathcal{N}(\bm{A})$。也就是说，解集$\mathcal{S}$是通过平移$\bm{A}$的零空间得到的仿射集合$\mathcal{S} = \left\{ \bm{x} = \bar{\bm{x}} + \bm{z} \colon \bm{z} \in \mathcal{N}(\bm{A})\right\}$。由此也可得出，当且仅当$\mathcal{N}(\bm{A}) = \left\{ \bm{0} \right\}$，解$\bar{\bm{x}}$才是唯一的

> **命题6.1（线性方程的解集）**：线性方程
> $$
> \bm{Ax} = \bm{y},\bm{A} \in \mathbb{R} ^{m,n}
> $$
> 当且仅当$\operatorname{rank}([\bm{A} \quad \bm{y}]) = \operatorname{rank}(\bm{A})$时，才有解。当满足此存在条件时，所有解的集合是仿射集合
> $$
> \mathcal{S} = \left\{ \bm{x} = \bar{\bm{x}} + \bm{z} \colon \bm{z} \in \mathcal{N}(\bm{A})\right\}
> $$
> 其中$\bar{\bm{x}}$是满足$\bm{A}\bar{\bm{x}} = \bm{y}$的任何向量。特别地，如果满足方程组满足存在条件，并且 $\mathcal{N}(\bm{A}) = \left\{ \bm{0} \right\}$，则方程组有唯一解

### 2.2 欠定系统(underdetermined)、超定系统(overdetermined)和方阵系统

我们简要讨论线性方程组中可能出现的三种典型情况，即未知数多于方程数（欠定）、方程数多于未知数（超定）、以及方程数与未知数相等的情况。这三种情况是在假设矩阵A为满秩的前提下讨论的。对于满秩矩阵，下列定理成立（也可参见之前在Chapter 6.4.3 推论4.3中给出的等价结果）。

> **定理 6.1**：以下两个命题成立
>
> 1. 当且仅当$\bm{A}^\top \bm{A}$可逆时，矩阵$\bm{A} \in \mathbb{R} ^{m,n}$才是列满秩（即$\operatorname{rank}(\bm{A}) = n$）
> 2. 当且仅当$\bm{A} \bm{A}^\top$可逆时，矩阵$\bm{A} \in \mathbb{R} ^{m,n}$才是行满秩（即$\operatorname{rank}(\bm{A}) = m$）

> **证明**
>
> $\bm{A}^\top \bm{A} \succeq 0$当且仅当半正定矩阵是可逆的，它实际上才是正定矩阵。$\bm{A}^\top \bm{A} \succeq 0$是正定矩阵充要条件是它为列满秩。定理中第二点的证明也遵循类似的思路

超定系统(Overdetermined systems)：当系统$\bm{Ax} = \bm{y}$的方程数量多于未知数数量时，即矩阵$\bm{A}$的行数多于列数（瘦矩阵）$m > n$，这个系统被称为超定系统。假设$\bm{A}$是列满秩的，即$\operatorname{rank}(\bm{A}) = n$，则$\mathcal{R}(\bm{A}) = \mathbb{R} ^n$。由公式$\operatorname{dim}\mathcal{N}(\bm{A}) + \operatorname{rank}(\bm{A}) = n$,可知$\operatorname{dim}\mathcal{N}(\bm{A}) = 0$，因此该系统要么有唯一解，要么无解。实际上，超定系统最常见的情况是$\bm{y} \not\in  \mathcal{R}(\bm{A})$，因此没有解。在这种情况下，引入近似解的概念通常是有用的，即求一个解，使某个适当的$\bm{Ax}$与$\bm{y}$之间的不匹配度量达到最小，如在第Section 6.3.1 节中进一步讨论的那样

欠定系统(Underdetermined systems)：如果系统$\bm{Ax} = \bm{y}$中未知数多于方程数，即矩阵$\bm{A}$的列数多于行数（宽矩阵）$n > m$，则称该系统为欠定系统。假设$\bm{A}$为行满秩，即$\operatorname{rank}(\bm{A}) = m$，则$\mathcal{R}(\bm{A}) = \mathbb{R} ^m$。由公式$\operatorname{dim}\mathcal{N}(\bm{A}) + \operatorname{rank}(\bm{A}) = n$,可知$\operatorname{dim}\mathcal{N}(\bm{A}) = n-m >0$。因此，这个线性方程组是可解的，且具有无限多的可能解，解的集合具有$n-m$维。在所有可能的解中，通常感兴趣的是选出一个具有最小范数的特定解：这一问题在第Section6.3.2节中有详细讨论

方阵系统(Square systems)：当方程组$\bm{Ax} = \bm{y}$的方程数量等于未知数数量时，该系统称为方阵系统，即矩阵$\bm{A}$为方阵$n = m$。如果一个方阵是满秩的，那么它是可逆的，并且逆矩阵$\bm{A}^{-1}$是唯一的，满足$\bm{A}^{-1}\bm{A = \bm{I}}$。在满秩方阵$\bm{A}$的情况下，线性系统的解是唯一的，形式上写作$\bm{x} = \bm{A}^{-1}\bm{y}$。然而，需要注意的是，解$\bm{x}$很少通过实际求$\bm{A}^{-1}$并与$\bm{y}$相乘来计算。有关计算非奇异线性方程组解的数值方法，请参见Section第 7.2 节

## 3. 最小二乘(Least-squares)和最小范数解

### 3.1 近似解：最小二乘法

当$\bm{y} \not\in \mathcal{R}(\bm{A})$时，线性方程组是无解的。在超定方程组的情况下，这种情况经常发生。然而，在这种情况下，确定方程组的近似解可能是有意义的，即找到一个使得残差向量$\bm{r} \coloneqq \bm{Ax} - \bm{y}$尽可能“较小”的解。衡量残差大小的自然方法是使用范数：因此我们希望确定$\bm{x}$，使得残差的范数最小化。在本节中，我们特别讨论最常见的情况，即用于衡量残差的范数选择标准欧几里得范数，此时问题变为
$$
\min _{\bm{x}} \lVert \bm{Ax}-\bm{y} \rVert _2
$$
由于函数$z^2$在$z \geq 0$时单调递增，因此之前的问题也等价于最小化欧几里得范数的平方
$$
\min _{\bm{x}} \lVert \bm{Ax}-\bm{y} \rVert _2^2
$$
从后者表述中得出了线性方程最小二乘(least-squares,LS)解的名称，即一种使方程残差平方和最小的解
$$
\lVert \bm{Ax}-\bm{y} \rVert _2^2 = \sum_{i=1}^{m}(\bm{a}_i^\top \bm{x} - \bm{y}_i)^2
$$
其中$\bm{a}_i^\top$表示$\bm{A}$的第$i$行。

上述问题有一个有趣的几何解释：由于向量$\bm{Ax}$位于$\mathcal{R}(\bm{A})$中，该问题相当于确定$\mathcal{R}(\bm{A})$中距离$\bm{y}$最近的点$\tilde{\bm{y}} = \bm{Ax}$。投影定理Section2.3节（定理 2.2）则告诉我们，这个点是$\bm{y}$在子空间$\mathcal{R}(\bm{A})$上的正交投影，如下图所示
![6.7.png](https://img.wblv66.top/optimization-models/6.7.png)

因此，我们可以应用Section 定理 2.2 来找到问题的显式解，如以下命题所示

> **命题6.2（线性方程的最小二乘近似解）**：设$\bm{A} \in \mathbb{R} ^{m,n}$，$\bm{y} \in \mathbb{R} ^m$。最小二乘问题
> $$
> \min _{\bm{x}} \lVert \bm{Ax} - \bm{y} \rVert_2
> $$
> 至少有一个解。此外，上式的任何解$\bm{x}^* \in \mathbb{R} ^n$都是以下线性方程组（法方程）的解
> $$
> \bm{A}^\top  \bm{Ax}^* = \bm{A}^\top \bm{y}
> $$
> 反之亦然。此外，如果$\bm{A}$是满列秩（即$\operatorname{rank}(\bm{A}) = n$），则上式的解是唯一的，并且其解为
> $$
> \bm{x}^* = (\bm{A}^\top \bm{A})^{-1}\bm{A}^\top \bm{y}
> $$

> **证明**
>
> 对于任意$\bm{y} \in \mathbb{R} ^m$，根据定理 2.2，存在一个唯一的点$\tilde{\bm{y}} \in \mathcal{R} (A)$，其与$\bm{y}$的距离最小，并且该点满足$(\bm{y} - \tilde{\bm{y}}) \in \mathcal{R}(\bm{A})^\perp \equiv \mathcal{N}(\bm{A^\top })$，即
> $$
> \bm{A}^\top (\bm{y} - \tilde{\bm{y}}) = \bm{0}
> $$
> 由于$\tilde{\bm{y}} \in \mathcal{R}(\bm{A})$，因此一定存在一个$\bm{x}$使得$\tilde{\bm{y}} = \bm{Ax}$，从而证明了解的存在性。然后，将$\tilde{\bm{y}} = \bm{Ax}$代入先前的正交条件，我们得到
> $$
> \bm{A}^\top  \bm{Ax} = \bm{A}^\top \bm{y}
> $$
> 最后，如果$\bm{A}$列满秩，那么根据Section定理6.1，$\bm{A}^\top \bm{A}$是可逆的，因此唯一解的形式得证

> **备注6.1（法方程(Normal equations)与最优性）**：法方程无非就是优化问题的最优性条件
> $$
> \min _{\bm{x}} f(\bm{x})
> $$
> 其中$f(\bm{x}) = \lVert \bm{Ax}- \bm{y} \rVert_2^2$。Section 8.4 节看到的，当函数可微、凸，并且问题没有约束时，最优点由条件$\nabla f(\bm{x}) = \bm{0}$来表征。在我们的例子中，函数$f$在$\bm{x}$处的梯度很容易看出为$\nabla f(\bm{x}) = \bm{A}^\top(\bm{Ax} - \bm{y})$

### 3.2 欠定情况：最小范数解

接下来我们考虑矩阵$\bm{A}$的列数多于行数的情况$m < n$。假设$\bm{A}$是行满秩的，因此系统有无限多个解，并且解的集合为$\mathcal{S}_{\bar{\bm{x}}} = \left\{ \bm{x} \colon  \bm{x} = \bar{\bm{x}} + \bm{z} ,\bm{z} \in \mathcal{N} \right\}$，其中$\bar{\bm{x}}$是任意满足$\bm{A} \bar{\bm{x}} = \bm{y}$的向量。我们感兴趣的是从解集合$\mathcal{S}_{\bar{\bm{x}}}$中挑选出具有最小欧几里得范数的解$\bm{x}^*$。也就是说，我们要解决的问题是
$$
\min _{\bm{x} \colon \bm{Ax} = \bm{y}} \lVert \bm{x} \rVert_2
$$
这等价于$\min _{\bm{x} \in \mathcal{S}_{\bar{\bm{x}}}} \lVert \bm{x} \rVert_2$。 可以直接应用Section推论 2.1：唯一解$\bm{x}^*$必须与$\mathcal{N}(\bm{A})$正交，或者说，$\bm{x}^* \in \mathcal{R}(\bm{A}^\top )$，这意味着$\bm{x}^* = \bm{A}^\top \xi$，对于某个合适的 $\xi$。由于$\bm{x}^*$必须能解这个方程组，因此必须有$\bm{Ax}^* = \bm{y}$，即$\bm{AA}^\top \xi  = \bm{y}$。由于$\bm{A}$是行满秩的，$\bm{AA}^\top$可逆，那么方程的唯一解为$\xi = (\bm{AA}^\top )^{-1}\bm{y}$。最终，这给出了该方程组的唯一最小范数解
$$
x^* = \bm{A}^\top (\bm{AA}^\top )^{-1}\bm{y}
$$
之前的讨论完成了以下命题的证明

> **命题6.3（最小范数解）**：设$\bm{A} \in \mathbb{R} ^{m,n},m \leq n$，且为满秩，$\bm{y} \in \mathbb{R} ^m$。在线性方程组$\bm{Ax} = \bm{y}$的解中，存在唯一一个具有最小欧几里得范数的解。该解为
> $$
> x^* = \bm{A}^\top (\bm{AA}^\top )^{-1}\bm{y}
> $$

### 3.3 最小二乘法与伪逆

对于$\bm{A} \in \mathbb{R} ^{m,n}, \bm{y}\in \mathbb{R} ^m$，考虑最小二乘问题
$$
\min _{\bm{x}} \lVert   \bm{Ax} - \bm{y} \rVert_2
$$
在假设线性方程组$\bm{Ax} = \bm{y}$存在解的前提下，这些方程组的任何解也是最小二乘问题的一个极小值点，反之，最小二乘问题的任何极小值点也是线性方程组的一个解。因此，从某种意义上说，考虑最小二乘问题比考虑线性方程组$\bm{Ax} = \bm{y}$更通用，因为即便线性方程组没有解，最小二乘问题仍然可能有解；而当解集非空时，最小二乘问题与$\bm{Ax} = \bm{y}$有相同的解集。进一步注意，当$\bm{A}$具有非平凡零空间时，最小二乘问题会有多个（无限多个）解。实际上，最小二乘问题的所有解都是法方程$\bm{A}^\top  \bm{Ax}^* = \bm{A}^\top \bm{y}$的解，而当且仅当$\mathcal{N}(\bm{A}^\top \bm{A}) = \mathcal{N}(\bm{A})$非平凡时这些方程才有多个解

在所有可能的法方程$\bm{A}^\top  \bm{Ax}^* = \bm{A}^\top \bm{y}$的解中，我们感兴趣的是找到唯一的最小范数解（注意，由于$\mathcal{R}(\bm{A}^\top  \bm{A}) = \mathcal{R}(\bm{A}^\top)$，这些方程总至少有一个解）。根据Section推论2.1，我们知道唯一的最小范数解$\bm{x}^*$必须与$\mathcal{N}(\bm{A})$正交，或者换句话说，必须属于$\mathcal{R}(\bm{A}^\top)$。因此，$\bm{x}^*$由以下两个条件唯一确定

1. 它必须属于$\mathcal{R}(\bm{A}^\top)$（满足范数最小）
2. 它必须满足正规方程$\bm{A}^\top  \bm{Ax}^* = \bm{A}^\top \bm{y}$（满足最小二乘）

我们声称，这样的解可以通过 Moore–Penrose 广义逆简单表示如下
$$
\bm{x}^* = \bm{A}^\dagger \bm{y}
$$
> **证明**
> 设$\bm{A} = \bm{U}_r \bm{\Sigma } \bm{V}_r^\top$是紧凑型奇异值分解。则根据Section5.2.3 Moore-Penrose伪逆表示为$\bm{A}^\dagger  = \bm{V}_r \bm{\Sigma }^{-1} \bm{U}_r^\top$，因此得到$\bm{x}^* = \bm{A}^\dagger \bm{y} = \bm{V}_r \bm{\Sigma }^{-1} \bm{U}_r^\top\bm{y} = \bm{V}_r \bm{\xi }$，因此$\bm{x}^* \in \mathcal{R}(\bm{V}_r)$，但是我们有$\mathcal{R}(\bm{V})_r = \mathcal{R}(\bm{A}^\top )$，条件一可以满足
>
> 另外
> $$
> \begin{align*}
> \bm{A}^\top \bm{A} \bm{x}^* &= \bm{A}^\top \bm{A} \bm{A}^\dagger \bm{y} = \bm{V}_r \bm{\Sigma} \bm{U}_r^\top \bm{U}_r \bm{\Sigma} \bm{V}_r^\top \bm{V}_r \bm{\Sigma}^{-1} \bm{U}_r^\top \bm{y} \\
> &= \bm{V}_r \bm{\Sigma} \bm{U}_r^\top \bm{y} = \bm{A}^\top \bm{y}
> \end{align*}
> $$
> 这表明条件二也得到了满足，因此$\bm{x}^* = \bm{A}^\dagger \bm{y}$为最小二乘问题提供了最小范数的唯一解。总结如下推论

> **推论6.1（最小二乘问题的解集）**：最小二乘问题的最优解集
> $$
> \bm{p}^* = \min _{\bm{x}} \lVert \bm{Ax} - \bm{y} \rVert_2
> $$
> 能够表示为
> $$
> \mathcal{X}_{\text{opt}} = \bm{A}^\dagger \bm{y} + \mathcal{N}(\bm{A})
> $$
> 其中$\bm{A}^\dagger \bm{y}$是最优集合中的最小范数点。最优值$\bm{p}^*$是$\bm{y}$在$\mathcal{R}(\bm{A})$的正交补上的投影的范数：对于$\bm{x}^* \in \mathcal{X}_{\text{opt}}$
> $$
> \bm{p}^* = \lVert \bm{y} - \bm{Ax}^* \rVert_2 = \lVert (\bm{I}_m - \bm{AA}^\dagger )\bm{y}\rVert_2 = \lVert \bm{P}_{\mathcal{R}(\bm{A})^\perp}\bm{y}\rVert_2
> $$
> 其中矩阵$\bm{P}_{\mathcal{R}(\bm{A})^\perp}$是投影到$\mathcal{R}(\bm{A})^\perp$的投影算子，参考Section5.2.4 公式 (5.12) 所定义。如果$\bm{A}$是满列秩的，则解是唯一的，且等于
> $$
> \bm{x}^* = \bm{A}^\dagger \bm{y} = (\bm{A}^\top \bm{A})^{-1}\bm{A}^\top \bm{y}
> $$

### 3.4 最小二乘问题的解释

最小二乘问题可以根据应用背景给出多种不同解释

1. 线性方程的近似解

给定一个线性方程组$\bm{Ax} = \bm{y}$，该方程组可能不可解，我们放宽要求，寻找一个近似解$\bm{x}$，使其近似满足方程组，即$\bm{Ax} \approx \bm{y}$。在最小二乘法中，近似解要求方程的残差向量$\bm{r} = \bm{Ax} - \bm{y}$的欧几里得范数最小

1. 投影到$\mathcal{R}(\bm{A})$

给定一个点$\bm{y} \in \mathbb{R} ^m$，最小二乘问题寻求一个系数向量$\bm{x}$，使得$\bm{A}$的列$\bm{a}_n ,\cdots , \bm{a}_n$的线性组合能够以最佳方式近似$\bm{y}$，即在$\mathcal{R}(\bm{A})$中的投影。最小二乘解$\bm{x}^*$给出了该线性组合的最优系数，使得
$$
\bm{y} = \bm{Ax}^* = \bm{x}^*_1 \bm{a}_1 + \cdots +\bm{x}^*_n \bm{a}_n
$$
是$\bm{y}$在由$\bm{A}$的列所生成的子空间上的投影

1. 线性回归

记 A 的行向量为$\alpha _i^\top,i = 1,\cdots, m$，则最小二乘问题可以重写为
$$
\min _{\bm{x}} \sum_{i=1}^{m} (\bm{\alpha }_i^\top \bm{x} - \bm{y}_i)^2
$$
也就是说，给定输出点$\bm{y}_i$和输入点$\bm{\alpha }_i$，其中$i = 1,\cdots ,m$，我们试图用输入点的线性函数$f(\bm{\alpha }_i) = \bm{\alpha }_i^\top \bm{x}$来近似输出点，这里的$\bm{x}$是定义线性函数的参数

二维中的一个经典例子是用直线拟合数据。给定标量输出观测值$y_i \in \mathbb{R}$，和输入观测值$\xi _i \in \mathbb{R}$，$i = 1 ,\cdots ,m$，我们寻求一个仿射函数
$$
f(\xi ) = x_1 \xi + x_2 = \bm{a}^\top \bm{x}, \bm{a} =
\begin{bmatrix}
    \xi \\
    1
\end{bmatrix},
\bm{x} =
\begin{bmatrix}
    x_1 \\
    x_2
\end{bmatrix}
$$
$x_1$是直线的斜率，$x_2$是与垂直轴的交点，在最小二乘意义下近似输出
$$
\min _{\bm{x}} \sum_{i=1}^{m}(x_1 \xi _i + x_2 - y_i)^2 = \min _{\bm{x}} \sum_{i=1}^{m} (\bm{a}^\top \bm{x} - y_i)^2
$$
