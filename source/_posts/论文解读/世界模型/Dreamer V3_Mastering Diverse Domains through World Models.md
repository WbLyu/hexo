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