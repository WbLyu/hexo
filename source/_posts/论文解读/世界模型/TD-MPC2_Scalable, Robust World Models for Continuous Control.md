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
cover: https://img.wblyu.top/images/a16a8fe2a19defabaac44f64e9cd2b96.avif
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
& \text{Policy prior} && \hat{a} \sim p(z,e)
\end{aligned}
$$

其中$s$为观测/状态，$z$为潜空间表征，$a$为动作，$e$为可学习的任务嵌入用以告诉多任务世界模型当前正在处理哪个任务。这个模型省去了显示重建/解码观测的步骤，不选择观测作为监督信号。

1. Encoder和Latent dynamics函数$h,d$输出确定性向量
2. Reward和Terminal value函数$R,Q$输出分类分布，而且不执行采样操作
3. Policy prior函数$p$输出连续高斯分布，并执行采样操作

> 这篇论文将整个过程看成完全可观测马尔可夫决策过程（Markov Decision Process, MDP），而非`PlaNet`/`Dreamer`系列的部分可观测MDP过程。因此后验/编码器中无需获取历史信息，只根据当前的观测便能计算出潜空间表征，这便需要输入的信息足够充分

### 2.1 世界模型训练

世界模型部分的训练目标函数为（取负为损失函数）

$$
\mathcal L(\theta) = \mathbb E_{(s,a,r,s')_{0:H}\sim\mathcal B} \left[ \sum_{t=0}^{H}\lambda^t \left( \underbrace{ \left\|z'_t-\operatorname{sg}(h(s'_t))\right\|_2^2 }_{\text{Joint-embedding prediction}} + \underbrace{ \operatorname{CE}(\hat r_t,r_t) }_{\text{Reward prediction}} + \underbrace{ \operatorname{CE}(\hat q_t,q_t) }_{\text{Value prediction}} \right) \right]
$$

这里联合优化了$h,d,R,Q$，即编码器、潜空间动力学、奖励和回报

**第一项：Joint-embedding prediction**

这里是为了让先验与后验尽量接近。这里对后验使用了$sg$但这并不是说不对后验进行优化，而只是在这里不传播梯度

只保证预测的潜空间表征比较精准还不够，因为它可能学到许多和任务无关的信息，还需要加入任务相关的监督信号

**第二、三项：Reward/Value prediction**

这里的操作与`Dreamer V3`一致，如先采用`symlog`操作将这两项变换到压缩空间中，对标签在`log`空间中放置等距分箱并将标签转为`two-hot`，然后采用交叉熵来计算`two-hot`的误差

> 若是`one-hot target`，$CE = -\log p_k$；但若是`two-hot target`,$CE = -\sum_{i}^{} y_i \log p_i$。所以这里不使用$-\log$的写法是为了表述更加准确

`Value prediction`的目标值展开为

$$
q_t = r_t + \gamma \bar{Q}(z'_t,p(z'_t))
$$

这本质上是单步`TD learning`，这里的$\bar{Q}$和$Q$并不相同，它是对$Q$进行指数移动平均（EMA）的结果。同时本文章不只训练一个$Q$，而是训练5个彼此独立的$Q$和对应的$\bar{Q}$。在计算target时从五个$\bar{Q}$中随机抽取两个，并选取二者中的较小值。这样可以防止估计过大或估计过小

### 2.2 策略模型训练

策略模型部分的训练目标函数为（取负为损失函数）

$$
\mathcal L_p(\theta) = \mathbb E_{(s,a)_{0:H}\sim\mathcal B} \left[ \sum_{t=0}^{H} \lambda^t \left[ \alpha Q(z_t,p(z_t))  - \beta\mathcal H(p(\cdot|z_t)) \right] \right]
$$

其中

$$
z_0=h(s_0) \\
z_{t+1}=d(z_t,a_t)
$$

其中第一项是为了最大化Q值（预期回报）；第二项是为了最大化策略熵，即让输出较为均匀，与`V2/V3`的熵正则化的思想一致

**关键细节**

1. 这里只有策略$p$的参数被更新，其余部分冻结
2. 这里虽然写为$Q(z_t,p(z_t))$，但实际是从$p(z_t)$输出的分布中采样动作，采样的梯度可以通过重参数技巧实现
3. 公式中出现的$z_{t+1}=d(z_t,a_t)$和$Q(z_t,p(z_t))$动作来源不同，前者来自经验回放（replay buffer），后者来自策略网络采样。也就是说**latent rollout使用的是回放动作**
4. 为了平衡Q项与熵项之间的尺度平衡，设置了参数$\alpha , \beta$。可以固定一项，并使用**移动统计（moving statistics）或者熵目标（entropy target）** 来更改另一项。论文中使用移动统计来微调$\alpha$，同时也提及两种方式没有显著差异

### 2.3 网络架构

`TD-MPC2`的世界模型并未使用RSSM，因此不包含GRU或者RNN。中间层采用`MLP + LayerNorm + Mish`

由于在多步预测中要递推使用动力学模型，容易出现梯度爆炸，论文提出了`SimNorm`

$$
z^\circ=\operatorname{SimNorm}(z)
$$

本质上是将潜状态投影到由多个单纯形（simplices）构成的表示空间，使它的数值范围受到约束。至于单纯形，先看一个三维概率单纯形，它可以表示为：

$$
\Delta^2 = \left\{ g\in\mathbb R^3: g_i\geq0,\  \sum_{i=1}^{3}g_i=1 \right\}
$$

在二维情形中，单纯形是一条线段；在三个坐标的情形中，可以看成一个三角形。

我们用小向量举例，拆解SimNorm。假设：

$$
z=[2,1,0,\;3,2,1].
$$

令$V=3, L=2,\tau=1$，分别为每组维度、分组数量和Softmax 温度参数

因此第一组$z^{(1)}=[2,1,0]$经过 Softmax为

$$
g_1\approx[0.665,0.245,0.090]
$$

第二组$z^{(2)}=[3,2,1]$经过 Softmax为

$$
g_2\approx[0.665,0.245,0.090]
$$

最后拼接：

$$
z^\circ= [0.665,0.245,0.090,\; 0.665,0.245,0.090]
$$

本质就是分组，并对组里进行Softmax。论文特别强调，SimNorm 可以让表示倾向于稀疏（sparsity），但不施加硬性的离散约束。是因为Softmax中温度越低，概率越集中。因此，对于低温度，SimNorm 可能形成一个或少数几个元素占主导的表示。**作者认为，这样可以诱导稀疏性，同时避免直接使用离散表示带来的限制**

### 2.4 模型预测控制

此论文只是将Policy prior输出的动作分布作为参考，但是具体选择动作时依靠的是MPC的思想，即根据当前状态预测多个时间步，寻找最高回报的序列，但每次只执行第一个动作。论文中选择MPPI（Model Predictive Path Integral）作为优化器。它是基于采样、无导数的方法，它不直接对动作做梯度下降，而是维护一个用于生成候选动作序列的概率分布，通过采样后评价，不断更新这个分布，让它越来越倾向于产生高回报的动作序列

$$
(\mu^*,\sigma^*) = \arg\max_{\mu,\sigma} \mathbb E_{A\sim\mathcal N(\mu,\operatorname{diag} (\sigma^2))} \left[ \sum_{k=0}^{H-1} \gamma^k R(z_k,a_k) + \gamma^H Q(z_H,a_H) \right]
$$

其中$z_{k+1} = d(z_k,a_k)$。公式中的第一部分是预测时间步内的奖励，第二部分是终端价值即剩余的长期价值。论文中将动作的分布设置为高斯分布，并且不同时刻有各自的均值和方差

**关键细节**

1. MPPI的一部分候选动作序列来自规划高斯分布，另一部分来自 Policy prior
2. MPPI将上次的规划均值向前移动一位并在最后补零，作为热启动（Warm-start）方式，以加快规划速度
