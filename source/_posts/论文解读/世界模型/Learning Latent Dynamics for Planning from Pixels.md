---
title: Learning Latent Dynamics for Planning from Pixels
date: 2026-08-29 21:41:37
# updated:
# tags:
#     - 
categories: 
            - 论文解读
            - 世界模型
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

## 2. 潜空间规划

变量说明

| 类别 | 符号 | 真实变量/虚拟变量 |
| --- | --- | --- |
| 真实观测 | $o$ | 真实变量 |
| 真实动作 | $a$ | 真实变量 |
| 真实奖励 | $r$ | 真实变量 |
| 潜状态 | $s_t$ | 无法直接获取世界状态，需要通过模型对世界状态进行推断，是虚拟的 |
| 预测动作 | $\hat{a}$ | 预测出的未来动作 |
| 重建观测 | $\hat{o}$ | 预测出的未来观测 |
| 预测奖励 | $\hat{r}$ | 预测出的未来奖励 |

观测函数

$$
\hat{o}_t \sim p(\hat{o}_t \mid s_t)
$$

通过潜空间中的未来世界状态，对相应的观测进行重建，但是未来的观测并不参与规划，只用来指导训练过程

转移函数

$$
s_t \sim p(s_t \mid s_{t-1},a_{t-1})
$$

根据上一时刻的潜状态和动作，预测下一时刻潜状态，即所谓的`world dynamics`，世界动力学

奖励函数

$$
\hat{r}_t \sim p(\hat{r}_t \mid s_t)
$$

预测未来状态会获取的奖励，用于评价一个动作序列好不好

编码器

$$
q(s_t \mid o_{\leq t},a_{<t})
$$

通过过去的观测和过去的动作，估计当前的潜状态

## 3. 潜在动力学模型

### 3.1 随机模型(Stochastic model)

指latent state被建模为随机变量，即模型输出的是概率分布

$$
\begin{gathered}
s_t \sim p(s_t \mid s_{t-1},\hat{a}_{t-1}) \\
\hat{o}_t \sim p(\hat{o}_t \mid s_t) \\
\hat{r}_t \sim p(\hat{r}_t \mid s_t)
\end{gathered}
$$

如果这些模型都是`线性高斯模型`，那么可以利用`卡尔曼滤波`，根据当前的真实观测计算出当前潜状态的分布，即状态后验分布。可以理解为现在已经看到真实$o_t$了，再反过来判断$s_t$。

但是`PlaNet`中这些模型都是非线性的神经网络，所以无法精确算出当前潜状态到底是什么概率分布。因此作者另外训练一个编码器$q$，去近似这个后验分布，与`变分推断`类似

$$
q(s_{1:T} \mid o_{1:T},a_{1:T-1}) = \prod_{t=1}^{T} q(s_t \mid s_{t-1},a_{t-1},o_t)
$$

将整条轨迹的后验变成随时间的逐步递推

> 需要区分$p(s_t\mid s_{t-1},a_{t-1})$和$q(s_t\mid s_{t-1},a_{t-1},o_t)$，分别为先验和后验

$$
\underbrace{p(s_t\mid s_{t-1},a_{t-1})}_{\text{prior：未看到 }o_t\text{ 时的预测}}
$$

$$
\underbrace{q(s_t\mid s_{t-1},a_{t-1},o_t)}_{\text{approximate posterior：看到 }o_t\text{ 后的状态推断}}.
$$

### 3.2 确定模型(Deterministic model)

确定性模型表示为

$$
\begin{gathered}
h_t = f(h_{t-1},\hat{a}_{t-1}) \\
\hat{o}_t \sim p(\hat{o}_t \mid h_t) \\
\hat{r}_t \sim p(\hat{r}_t \mid h_t)
\end{gathered}
$$

代表下一个状态是一个确定的值而非一个分布

### 3.3 循环状态空间模型(Recurrent State Space Model, RSSM)

确定性模型无法很好地表示多个可能性的未来，训练时为了最小化误差可能会`平均未来`。而且planner很容易利用模型误差。

概率性模型每一步都要经过一次随机采样，很难可靠地在多个时间步中保存信息。

最终将两者结合，将潜状态拆分为$(h_t,s_t)$，模型变为

$$
\begin{gathered}
h_t = f(h_{t-1},s_{t-1},a_{t-1}) \\
s_t \sim p(s_t \mid h_t) \\
\hat{o}_t \sim p(\hat{o}_t \mid h_t,s_t) \\
\hat{r}_t \sim p(\hat{r}_t \mid h_t,s_t)
\end{gathered}
$$

编码器变为

$$
q(s_{1:T} \mid o_{1:T},a_{1:T-1}) = \prod_{t=1}^{T} q(s_t \mid h_t,o_t)
$$

## 4. 潜变量多步预测约束(Latent Overshooting)

标准证据下界(Evidence Lower Bound, ELBO) 每一步都从编码器输出的**后验状态出发**，训练一次状态转移，因此它**只接受一步预测监督**；但planning时模型必须从当前状态出发连续预测很多步，中间没有真实观测纠正。由于**模型容量有限**（神经网络能表达的函数复杂度是有限的）且**分布族受限**（模型里很多分布被假定为特定分布），模型在一步预测时表现良好，并不意味着在多步预测同样表现良好。因此文章直接从较早的后验出发，连续预测多步，并让得到的多步先验与未来真实观测对应的后验对齐，从而显式训练长期潜动力学。
