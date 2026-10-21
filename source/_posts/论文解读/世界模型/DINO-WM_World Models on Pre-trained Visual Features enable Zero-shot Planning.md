---
title: 'DINO-WM: World Models on Pre-trained Visual Features enable Zero-shot Planning'
date: 2026-10-12 20:41:29
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

现有方法的策略为：训练完成后，在部署期间便以前馈方式运行——将观测映射为动作（端到端），而无需优化或推理。这种方法的成功要依赖于训练时的场景能够覆盖部署时遇到的场景，但这样是不现实的

一种可行的改进是只训练动力学模型，在执行时就只需针对特定任务进行优化，这种动力学模型便是世界模型。世界模型分为**在线**和**离线**两种范式

在线世界模型在训练时需要不断与环境进行交互，但是这样只能针对特定任务，丧失了泛化性；离线世界模型直接使用提前采集好的轨迹进行训练，但是这种方式在解决下游任务（规划）时仍然需要辅助信息，如专监演示、结构化关键点等，这些会限制使用时的通用性。因此离线世界模型的核心问题是**是否存在不会损害其通用性的替代辅助信息**。即有没有一种替代性的辅助知识，既能够帮助世界模型学习和规划，又不必依赖具体任务？

论文中给出的解决方式是：使用预训练`DINOv2`的`Patch Features`，`DINOv2`已通过大规模图像数据预训练，能够提供丰富的空间与语义表示。也就是说它利用的额外知识是从大规模视觉数据中学习到的通用视觉先验

> 论文提出的方法只达到了任务级别的泛化，即同一个环境中可以执行不同的任务。但是没达到环境级别的泛化，切换为不同环境或者不同的机器人时，需要重新训练（主要瓶颈在转移模型而非观测模型）

## 2. DINO World Models

### 2.1 世界模型

论文中的世界模型由以下部分组成

$$
\begin{aligned}
\text{Observation model:} \quad &z_t = \operatorname{enc}_{\theta}(z_t \mid o_t) \\
\text{Transition model:} \quad &z_{t+1} = p_{\theta}(z_{t+1} \mid z_{t-H:t},a_{t-h:t}) \\
\text{Decoder model} \quad &\hat{o}_{t} = q_{\theta}(o_{t} \mid z_{t})
\end{aligned}
$$

其中的$z_t$表示潜状态，同时也是图像特征；$o_t$为图像观测。这里的观测重建/编码器并非必须的，同时论文中的消融实验发现加上观测重建损失后规划效果反而更差。因此论文在训练和规划时都不需要进行观测重建，极大节约了计算资源

通过与之前的工作对比，可以发现观测模型只采用当前时刻的观测，同时论文中还提及部分观测马尔可夫决策过程，说明观测并不完全。这意味着**潜状态并不存储完整的历史信息**，它只是图像特征。论文通过转移模型中的$H$长度历史长度获取历史信息，试图通过有限长度的历史窗口来近似实现马尔可夫性

`DINO-WM`仅使用离线轨迹提供的信息，而同期的在线世界模型还需要任务相关的信息如奖励、折扣系数等

#### 2.1.1 观测模型

以往工作中观测模型总是针对当前任务从头学习一个良好的观测模型，这种方式效率低下，而且往往并不可行。因为感知是一项通用任务，能够从大规模互联网数据中受益。因此本论文采用预训练的`DINOv2`作为观测模型。在训练和规划时观测模型会保持冻结（frozen）

`DINOv2`将图像划分为多个Patch（图像块），并为每个Patch提取一个特征向量，这里的每个Patch特征还通过Transformer融合了其他Patch的上下文信息。设一张图像对应$N$个Patch，而每个Patch对应一个$E$维特征向量，那么最终的输出是图像块嵌入（Patch Embeddings）$z \in \mathbb{R}^{N \times E}$

#### 2.1.2 转移模型

论文选择`ViT`架构作为转移模型，同时针对这篇论文进行进一步修改

**删除Tokenization Layer**

传统`ViT`的第一步需要把图像转换为Patch Tokens，但是这篇论文已经将`DINOv2`作为观测模型，不需要对图像进行处理，而是直接接收Patch Embeddings

**将动作输入Transformer**

首先利用一个动作编码网络$\phi$（本质是多层感知机），将动作映射为$K$维特征，然后将编码后的动作复制$N$次，再拼接到每个 Patch特征后面。这样，每个Patch Token都知道当前机器人执行的动作是什么

**将本体感知输入Transformer**

对于机器人关节位置、速度，自身运动状态等本体感知信息（proprioceptive），采用和动作输入类似的方式拼接到Pathch特征中

**因果注意力掩码**

作者采用帧级别的因果注意力掩码，在每一帧中Patch Tokens仅能访问当前及历史帧

**帧级别自回归**

每一步预测整张图像的全部Patch特征，而不是逐个预测Patch Token，减少串行计算开销

**Teacher Forcing**

训练时使用真实历史特征，而不是模型自身预测出来的历史特征。也就是说训练$\hat z_3$时使用$z_0,z_1,z_2$而不是$z_0,\hat z_1,\hat z_2$

损失函数

$$
\mathcal L_{\mathrm{pred}} = \left\| p_\theta\left( \operatorname{enc}_\theta(o_{t-H:t}), \phi(a_{t-H:t}) \right) - \operatorname{enc}_\theta(o_{t+1}) \right\|^2
$$

如果提供本体感知信息，也可以加入损失中，但是一定不包含动作损失

#### 2.1.3 面向可解释性的解码器

为了有助于可视性和可解释性，设置了解码器。它是由转职卷积层组成的，将整个图片的Patch特征转换为图像。损失函数为

$$
\mathcal L_{\mathrm{rec}}(\psi) = \left\| q_\psi(\operatorname{enc}(o_t))-o_t \right\|^2
$$

可以看出损失梯度和转移模型是无关的，所以二者可以分别独立训练

论文中还对比了在转移模型损失函数中是否增加Decoder Loss的效果，发现增加Decoder Loss后效果反而下降

### 2.2 视觉规划

Planning的输入是当前观测$o_0$和目标观测$o_g$，planning的输出是动作序列$A = \left\{ a_0,a_1,\cdots ,a_{T-1} \right\}$，算法在执行时会将输入的观测转变为潜状态$z_0,z_g$。在最后选择动作时采用了MPC的思想，即只选择前$k$个动作

论文中没有奖励值，为了衡量动作序列的好坏，设置了

$$
C = \lVert \hat{z}_T - z_g \rVert^2
$$

这里的$\hat{z}_T$是根据动作序列利用世界模型进行想象得到的潜状态，预测得到的潜状态与目标潜状态越接近则说明这组动作可能让机器人达到目标。这里还潜藏一个假设：**DINOv2 特征之间的欧氏距离，能够合理反映环境状态之间的差异**

论文中通过交叉熵方法（Cross-Entropy Method，CEM）优化动作序列，这是一种基于采样的优化算法，具体过程为

1. 先构造一个动作序列的采样分布$A\sim\mathcal N(\mu,\Sigma)$
2. 随机采样候选动作序列
3. 借助世界模型计算$C$来衡量动作的好坏
4. 将表现最好的前$K$组动作序列称为Elite Samples（精英样本）
5. 更新均值与方差
6. 重复采样与更新

论文经过测试发现CEM方法的表现要优于GD（梯度下降）