---
title: "Model Predictive Control via Probabilistic Inference: A tutorial and survey"
date: 2026-07-03 14:24:37
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
cover: https://img.wblyu.top/images/6ba77b3e89b7c6e0aa1930240934fbd7.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hungpham2511/toppra',GitHub %}
{% btn 'https://doi.org/10.1016/j.arcontrol.2026.101052', Annual Reviews in Control %}
<!-- markdownlint-enable MD034 -->


## 2. 

我们是想通过求解最优控制问题得到最优控制输入序列$\bm{u}_{0:T-1}^*$和对应的状态序列$\bm{x}_{0:T}^*$

$$
\begin{align*}
\min _{\bm{x}_{0:T},\bm{u}_{0:T-1}} \ & J(\bm{x}_{0:T},\bm{u}_{0:T-1}) \\
\text{s.t.} \ &  \bm{x}_{t+1}=f(\bm{x}_t,\bm{u}_t),\forall t \in \left\{ 0,\cdots ,T-1 \right\} 
\end{align*}
$$
$J$代表代价函数，$\bm{x}_t$和$\bm{u}_t$分别代表时间步$t$时的状态和控制输入。当给定$\bm{x}_0$和$f$后，$\bm{x}_{0:T}$可由$\bm{u}_{0:T-1}$前向滚动求出。因此`PI-MPC`只注重对$\bm{u}_{0:T-1}$的优化

当$f$或者$J$函数具有高度非线性/非凸/不可微/考虑随即动力学时，经典的梯度方法往往会陷入局部最优解甚至无法使用。当数值优化的方法不可用时，我们仅剩的计算密集型方法是**基于采样的方法**

为了提高采样效率，论文引入了概率推理框架，即近似最优控制输入的概率分布，简称为**最优控制分布**。这种方法从分布中生成控制序列，而不是在随机样本中搜索出单个最佳序列。除了提高效率之外还有如下好处

1. 计算易于并行化
2. 自然地表示了行为中的随机变异性，保持了分布的多样性，避免收敛到局部最优解
3. 当$f$和$J$函数为可微时，可以把整个框架放入Pytorch中

### 2.3 基于概率推断的（probabilistic inference-based，PI）MPC框架

该方案涉及两个关键步骤

1. 从最优控制问题中推导出最优控制分布
2. 根据该最优控制分布生成作用于系统的控制输入

因此产生了两个基本问题

1. 怎样表示最优控制分布，其特征是什么
2. 如何从最优控制分布中生成应用于系统的控制输入
