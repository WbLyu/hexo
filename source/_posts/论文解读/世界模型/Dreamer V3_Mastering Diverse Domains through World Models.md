---
title: "Dreamer V3: Mastering Diverse Domains through World Models"
date: 2026-09-25 19:08:47
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
cover: https://img.wblyu.top/images/f7db7b4e1b6877c23a7515c77ded63f1.avif
---

## 2. 世界模型

此论文将世界模型建模为RSSM，并将潜状态显示表示为随机部分$z_t$和确定部分$h_t$，并加入了episode是否继续的标志$c_t \in \left\{ 0,1 \right\}$，完整公式为

$$
\text{Sequence model: }h_t = f_\phi (h_{t-1},z_{t-1},a_{t-1}) \\
\text{Encoder: }z_t \sim q_\phi (z_t \mid h_t,x_t) \\
\text{Dynamics predictor: }\hat{z}_t \sim p_\phi (\hat{z}_t \mid  h_t) \\
\text{Reward predictor: }\hat{r}_t \sim p_\phi (\hat{r}_t \mid  h_t,z_t) \\
\text{Continue predictor: }\hat{c}_t \sim p_\phi (\hat{c}_t \mid  h_t,z_t) \\
\text{Decoder: }\hat{x}_t \sim p_\phi (\hat{x}_t \mid  h_t,z_t) \\
$$

其中的$\hat{\square}$用以区分真实变量和想象变量，观测为$x_t$。$q_\phi (z_t \mid h_t,x_t)$对应后验；$p_\phi (\hat{z}_t \mid  h_t)$对应先验；与`V2`不同，这里并不使用折扣因子来预测回合结束，而是引入了标志变量

### 2.1 损失函数

论文中将世界模型部分的损失函数定义为

$$
\mathcal L(\phi) = \mathbb E_{q_\phi} \left[ \sum_{t=1}^{T} \left( \beta_{\mathrm{pred}}\mathcal L_{\mathrm{pred}} + \beta_{\mathrm{dyn}}\mathcal L_{\mathrm{dyn}} + \beta_{\mathrm{rep}}\mathcal L_{\mathrm{rep}} \right) \right]
$$

**第一项：Prediction loss**

展开为

$$
\mathcal L_{\mathrm{pred}} = -\log p_\phi(x_t|h_t,z_t) -\log p_\phi(r_t|h_t,z_t) -\log p_\phi(c_t|h_t,z_t)
$$

注意这里的变量不含$\hat{\square}$，也就是说这里的目标是让网络输出相应真实值的概率最大、

> 这一项是为了保证潜状态能够编码到有用的环境信息。如果潜状态什么都不编码，那么KL散度为$0$，看起来指标很好但是没有意义

**第二和第三项：Dynamics loss,Representation loss**

展开为

$$
\begin{gathered}
\mathcal L_{\mathrm{dyn}} = \max \left( 1, D_{\mathrm{KL}} \left[ \operatorname{sg} \left( q_\phi(z_t|h_t,x_t) \right) \| p_\phi(z_t|h_t) \right] \right) \\
\mathcal L_{\mathrm{rep}} = \max \left( 1, D_{\mathrm{KL}} \left[ q_\phi(z_t|h_t,x_t) \| \operatorname{sg} \left( p_\phi(z_t|h_t) \right) \right] \right)
\end{gathered}
$$

这里的想法与`V2`一致，尽量多让先验去逼近后验，少让后验逼近先验；`Dynamics loss`是为了让先验能学会预测后验；`Representation loss`是为了让先验容易预测。相比`V2`增加了$\mathcal L_{\mathrm{dyn}}=\max(1,\mathrm{KL})$，这里的$1$指$1 nat \approx 1.44 bits$。这意味着当KL已经足够小之后，就不要再逼它继续变小。如果一味想让KL归零，会导致模型忽略新的观测信息

### 2.2 模型细节

这里的潜状态和`V2`一样，都是离散变量，同样使用了针对`Straight-Through Gradient`操作实现了采样梯度传递

论文为解决训练早期时KL散度损失容易出现突增的问题，在先验和后验输出混入了$1 \%$的`uniform`。

正常的分布为

$$
p=\operatorname{softmax}(\text{logits})
$$

经过处理后

$$
p' = 0.99p + 0.01u
$$

这样不仅可以避免它们变成完全确定的分布，还能保证概率永远有一个概率下界不会为零，提高数值稳定。

## 3. 行为模型

行为模型定义为

$$
\begin{aligned}
&\text{Actor: } && a_t \sim \pi _{\theta}(a_t \mid s_t) \\
&\text{Critic: } && v_{\theta}(R_t \mid s_t)
\end{aligned}
$$

注意这里`Critic`的输出不再是数值了，而是变成了分布。对其取期望得到$v_t = \mathbb{E}\left[ v_{\theta}(\cdot \mid s_t) \right] $

### 3.1 Actor loss

论文将actor的损失函数定义为

$$
\mathcal L_{\text{actor}}(\theta) = -\sum_{t=1}^{T} \operatorname{sg} \left( \frac{ R_t^\lambda-v_t }{ \max(1,S) } \right) \log\pi_\theta(a_t|s_t) - \eta \mathcal H[\pi_\theta(a_t|s_t)]
$$

公式中的第一部分与`V2`的思想一致，即采用`REINFORCE`，来增强选择回报高的动作几率。但这里增加了$\max(1,S)$，这里是了解决跨任务时回报的尺度差距过的问题。同时这里不再区分离散动作和连续动作，统一都采用`REINFORCE`

文章中将$S$定义为：

$$
S = \operatorname{EMA} \left( \operatorname{Per}(R^\lambda,95) - \operatorname{Per}(R^\lambda,5), 0.99 \right)
$$

也就是说，它先看当前 batch 中的$R^\lambda_t$，然后计算出$95\%$分位数和$5\%$分位数，然后对做差结果进行指数移动平均(EMA)，防止突然变化过大

$$
S_t = 0.99S_{t-1} + 0.01S_{\text{current}}
$$

- 这里使用的$\max (1,S)$，是为了实现只允许把过大的梯度尺度压下来，不允许把小信号人为放大，防止放大噪声
- 这里计算$S$使用的是$R^\lambda$而不是$R_t^\lambda-v_t$是为了保留当前回报超过平均值的信息

第二项与`V2`完全一致，是熵正则化（Entropy Regularization），是为了让输出较为均匀，用在这里是为了鼓励模型去进行探索

> 在`Dreamer V1/V2`的`Actor`中都曾使用`dynamics backprop`作为连续动作中损失函数的一部分，即梯度会从奖励沿世界模型传导到Actor。`V3`的早期版本也曾使用，但是最终删去这一项，是因为**模型预测准确并不等于它对动作的导数也准确**，这促使`V3`转为优化`REINFORCE`项

### 3.2 Critic loss

作者考虑到回报可能是多峰的，而且不同任务的回报数值尺度可能跨很多个数量级，因此`Critic`的输出并不是简单的标量或者正态分布，反而使用类别分布（categorical distribution）和指数间隔分箱（exponentially spaced bins）

损失函数设定为

$$
\mathcal L_{\text{critic}}(\psi) = -\sum_t \log p_\psi(R_t^\lambda \mid s_t) 
$$

即最大化$R_t^\lambda$出现的概率，其中

$$
R_t^\lambda = r_t + \gamma c_t((1-\lambda)v_t+\lambda R_{t+1}^\lambda),R_T^\lambda = v_T
$$

作者考虑到奖励难以预测的问题，采用了想象和真实双损失，并使用$\beta _{\text{val}}=1,\beta_{\text{repval}}=0.3$将它们融合。对于真实损失，它的奖励是采用真实数据集中的数据，回报不能选用真实的回报，因为数据集中的动作是先前的`Actor`输出的（off-policy），但是`Critic`想要学习的是现在的`Actor`输出的动作（on-policy）获得的回报，因此不能完全使用真实采集到的数据

$$
\begin{gathered}
R_t^{\lambda,\rm imag} = \hat r_{t+1} + \gamma \left[ (1-\lambda)v_{t+1} + \lambda R_{t+1}^{\lambda,\rm imag} \right] \\
R_t^{\lambda,\rm replay} = r_{t+1}^{\rm real} + \gamma \left[ (1-\lambda) R_{t+1}^{\lambda,\rm imag} + \lambda R_{t+1}^{\lambda,\rm replay} \right] 
\end{gathered}
$$

由于$R_t^\lambda$中包含`Critic`自己的预测，因此训练目标会随自身参数更新而变化，形成`moving target`。因此本文通过EMA维护一个额外的`slow Critic` 。计算损失时仍然使用最新的`Critic`，但是损失时会加入额外的正则，令最新的`Critic`不会偏离`slow Critic`过远

> `V2`中为了解决这个问题使用的是TD Learning方法，并使用slow Critic来构造target，是直接让target慢下来。这篇文章换了另一个思路——限制当前`Critic`别变太快。这样便不会损失return的及时性

作者还注意到，训练初期如果随机初始化`Reward predictor`和`Critic`可能产生较大的预测奖励，从而延迟学习的开始。因此，本文对这两个部分采用零初始化

> 虽然`Critic`离散化处理了，但是仍然可以表示连续的回报，因为中间会进行期望操作

## 4. 稳健预测

由于同一个模型要同时面对不同任务里相差几个数量级的观测、reward和return，如果直接拿原始数值做回归，很容易出现某些任务梯度特别大、另一些任务信号又特别小。作者因此用了两层处理

1. 先用 symlog/symexp 压缩数值尺度
2. 对于噪声更大的 reward 和 return，再进一步用 symexp two-hot categorical predict

### 4.1 symlog / symexp

作者定义为

$$
\begin{gathered}
\operatorname{symlog}(x) = \operatorname{sign}(x)\log(|x|+1) \\
\operatorname{symexp}(x) = \operatorname{sign}(x)\left(e^{|x|}-1\right)
\end{gathered}
$$


因为 reward、return等变量可能是负数，因此作者没有使用`log`函数，而是从双对称对数族中选取的函数。`symlog`在零附近近似恒等映射，因此对小数值影响很小，但会显著压缩大数值。

论文中对观测$x$的输入使用`symlog`，而对观测的输出使用`symexp`（计算损失的时候还不需要使用`symexp`变换回去）

### 4.2 symexp two-hot categorical predict

reward和Critic的输出皆为分布，但它们的分布形式是特殊设计的使用的是类别分布，但这里的类别分布和`V2`的并不一样。这里是现在压缩空间中均匀取点如$-20,\cdots ,0,\cdots ,20$，得到一系列分箱(bins)，也就是说这些分箱在`log`空间中是连续的，但是在普通空间中需要执行`exp`操作变化回去

$$
B=\operatorname{symexp}([-20,\cdots ,0,\cdots ,20])
$$

这里的分箱便对应类别分布中的类别，也就是说**网络预测目标值位于不同bin上的概率**

而对于真实的监督信号来说，需要从标量变成分类标签，于是便需要利用到`tow hot`。

假设某个真实target $y=8$，它刚好落在两个相邻 bins $b_k=5, b_{k+1}=10$之间。如果用普通 one-hot，只能选$5$或者$10$。但这样会丢失$y=8$的精确信息。所以这里用 two-hot：

$$
\begin{gathered}
q_k = \frac{b_{k+1}-y} {b_{k+1}-b_k} \\
q_{k+1} = \frac{y-b_k} {b_{k+1}-b_k}
\end{gathered}
$$

代入得到$q_k=0.4,q_{k+1}=0.6$。于是 target 变成$q=[0,\ldots,0.4,0.6,\ldots,0]$。由于只有两个元素非零，所以叫two-hot

因此在计算损失时只需计算目标值和输出值的交叉熵（cross entropy）