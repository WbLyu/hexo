---
title: 'Latent World Models for Autonomous Driving: A Taxonomy and Survey'
date: 2026-10-21 20:22:28
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

端到端架构通常缺乏显性因果建模（causal modeling）并且在分布外的泛化能力通常较弱，因此需要转向面向集成系统的架构（integrated systems-oriented architectures），世界模型在其中发挥了内部预测器的作用

显式世界模型（explicit world models）存在如下问题

- 计算成本高和存在实时延迟
- 会产生感知上冗余的噪声，给下游决策模块带来显著的认知负担
- 优先考虑视觉保真度而非动力学准确性

隐式世界模型可以解决以上问题，并且它比较灵活，它的损失函数可以自主设计，引导模型去提取高维语义特征例如因果关系和行为模式等

## 2. 基础

### 2.1 问题定义

论文先从 POMDP(部分观测马尔可夫决策过程) 出发，定义信念状态：

$$
b_t=p(s_t\mid o_{0:t},a_{0:t-1})
$$

这里的$s_t$是真实物理状态，$b_t$是对真实物理状态的后验概率分布。但是完整维护$b_t$非常困难，论文希望用一个紧凑的潜状态$z_t$近似保留其中对任务有用的信息

论文将核心LWM定义为：一种方法能将历史观测（以及在适用情况下的动作信息）编码为潜在状态，支持时间一致的潜在推演（rollout），并将预测的潜在表示映射为任务相关输出。对于仅学习静态表示、在不进行rollout的情况下执行开环轨迹预测，或生成像素级视频的方法，被视为**LWM相关方法**，而非**核心LWM方法**。这里的静态表示学习主要关注如何从观测中提取有用的特征，而不显式学习潜状态随时间连续演化的动力学关系

论文提到单帧高维观测无法完全表征物理系统的动力学特性，因此模型必须聚合历史上下文。定义编码器的一般形式为

$$
z_t=E_\theta(o_t,z_{t-1},a_{t-1})
$$

为了刻画由环境扰动和多智能体交互引起的不确定性，论文将潜在转移建模为条件分布，一般形式为

$$
\hat z_{t+1}\sim p_\phi(\cdot\mid z_t,a_t)
$$

论文使用任务头作为解码器的通用表示，它可以输出后续任务需要的信息，在不同的论文中可能为奖励、价值或碰撞风险等，一般形式为

$$
\hat y_{t+1}=H_\psi(\hat z_{t+1})
$$

### 2.2 对齐目标

这里的对齐（alignment）是指约束潜空间中预测结果的训练目前，也就是训练时的损失函数，作者将其分为

- Feature：希望模型能准确预测未来潜特征（先验与后验一致）
- Value：希望潜状态包含决策相关信息（任务价值或代价）
- Behavior：希望潜状态包含建模多智能体交互所需信息

**价值对齐**

一般形式的损失函数定义为

$$
\mathcal L_{\text{feature}}
=
\underbrace{\operatorname{Dist}\left(
\hat z_{t+1},
\operatorname{sg}\left[
E_\theta(o_{t+1},z_t,a_t)
\right]
\right)}_{\text{特征预测误差}}
+
\underbrace{\lambda\mathcal R(\hat z_{t+1})}_{\text{正则化}}
$$

这里使用$\operatorname{sg}$是因为目标函数不应加入反向传播。这里的正则化是通用表示，主要为了维持特征空间信息量，抑制低方差及平凡常数，减少表示坍塌（Representation Collapse）

**价值对齐**

