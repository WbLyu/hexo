---
title: 'TD-MPC2: Scalable, Robust World Models for Continuous Control'
date: 2026-09-28 15:29:44
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
---

## 1. 引言

基于互联网规模的数据集训练大模型，催生了能够胜任广泛语言与视觉任务的通用模型。但是把具身智能也做成像大语言模型那样的大规模预训练很困难。作者认为这主要受制于

1. 行为克隆通常依赖近专家轨迹（数据）
2. 缺乏能吃下“大规模未经筛选数据”的可扩展连续控制算法（算法）

行为克隆即让策略模仿数据里的动作，但是它本身无法筛选这个动作是好动作还是坏动作，因此它的效果依赖于数据质量，因此基于行为克隆的方法依赖大规模专家或人工遥操作数据，但是这些专家数据数量稀少，可用数据的规划被严重限制

如果我们放弃行为克隆，那么便需要算法自己从参差不齐的数据集中提取高质量行为。但是传统的强化学习算法扩展性太差，主要针对单任务，每个任务都要调一套超参数。若是盲目增大模型规模和数据量往往会导致性能下降，难以扩展到大量异构连续控制任务。因此需要实现一个鲁棒、可扩展、多任务连续控制算法，只需要一个模型和一套超参数便能适应不同任务、不同机器人、不同数据。

作者提出的`TD-MPC2`便是想解决后者从而绕过前者

## 2. TD-MPC2

`TD-MPC2`由以下五个部分组成

$$
\begin{aligned}
& \text{Encoder} && z=h(s,e) \\
& \text{Latent dynamics} && z'=d(z,a,e) \\
& \text{Reward} && \hat{r}=R(z,a,e) \\
& \text{Terminal value} && \hat{q}=Q(z,a,e) \\
& \text{Policy prior} && \hat{a}=p(z,e)
\end{aligned}
$$

其中$s$为观测/状态，$z$为潜空间表征，$a$为动作，$e$为可学习的任务嵌入用以告诉多任务世界模型当前正在处理哪个任务。这个模型省去了显示重建/解码观测的步骤，不选择观测作为监督信号。

> 这篇论文将整个过程看成完全可观测马尔可夫决策过程（Markov Decision Process, MDP），而非`PlaNet`/`Dreamer`系列的部分可观测MDP过程。因此后验/编码器中无需获取历史信息，只根据当前的观测便能计算出潜空间表征，这便需要输入的信息足够充分

### 2.1 世界模型训练

世界模型部分的损失函数为

$$
\mathcal L(\theta) = \mathbb E_{(s,a,r,s')_{0:H}\sim\mathcal B} \left[ \sum_{t=0}^{H}\lambda^t \left( \underbrace{ \left\|z'_t-\operatorname{sg}(h(s'_t))\right\|_2^2 }_{\text{Joint-embedding prediction}} + \underbrace{ \operatorname{CE}(\hat r_t,r_t) }_{\text{Reward prediction}} + \underbrace{ \operatorname{CE}(\hat q_t,q_t) }_{\text{Value prediction}} \right) \right]
$$

这里联合优化了$h,d,R,Q$，即编码器、潜空间动力学、奖励和回报

**第一项：Joint-embedding prediction**

这里是为了让先验与后验尽量接近。这里对后验使用了$sg$但这并不是说不对后验进行优化，而只是在这里不传播梯度

只保证预测的潜空间表征比较精准还不够，因为它可能学到许多和任务无关的信息，还需要加入任务相关的监督信号

**第二项：Reward prediction**

选取未来轨迹时需要考虑获得的回报，因此需要保证预测的奖励比较精确，进行奖励回归。最直观的方式是选择`MSE`，但是作者考虑到不同任务的奖励尺度并不一致，因此将标量回归转为多分类形式，即变成一组分类变量，类似`Dreamer V2/V3`