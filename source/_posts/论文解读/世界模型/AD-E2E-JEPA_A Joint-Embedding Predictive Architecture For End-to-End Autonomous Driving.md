---
title: 'AD-E2E-JEPA: A Joint-Embedding Predictive Architecture For End-to-End Autonomous Driving'
date: 2026-11-02 20:49:04
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
cover: https://img.wblyu.top/images/702bb3bd3bbe3f80bbc730f836bcc1e3.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/HaoranZhuExplorer/AD-E2E-JEPA',GitHub %}
{% btn 'https://arxiv.org/abs/2609.34085',arXiv %}
<!-- markdownlint-enable MD034 -->

论文存在的问题：

1. 没有显式优化安全性，没有考虑驾驶安全性
2. 输出的目标是目标点的观测，这在实际使用中是无法获取的

论文的价值：

1. 将机器人领域的 JEPA-WM 引入自动驾驶
2. 通过Proj显著降低了计算成本，并引入 SIGReg 缓解表示坍塌
3. 证明世界模型预训练得到的 Proj 能够提升下游模仿学习性能

## 1. 引言

**现有的端到端自动驾驶方法仍严重依赖模仿学习**：训练出来的反应式策略接收观测到的感知上下文并模仿人类驾驶轨迹，而未显式建模驾驶环境的底层动力学。此外，人类驾驶示范可能次优且含有噪声，这可能限制模仿学习所提供的监督质量

一个可行的改进方向是：为自动驾驶智能体配备世界模型，以捕捉环境的底层动态。动作条件世界模型可以通过rollout来预测不同候选动作下可能的未来状态，使智能体能够评估备选轨迹并选择最能实现期望目标的动作。这为超越直接模仿人类演示的规划与决策提供了原则性基础

现有的基于JEPA的世界模型在规划效率与性能之间面临显著权衡：它们要么计算高效但规划不准确，要么规划准确但每个场景需要超过一分钟的规划时间。

![ad-e2e-jepa-1.png](https://img.wblyu.top/world-models/ad-e2e-jepa-1.png)

## 3. 方法

### 3.1 一般端到端自动驾驶任务

**这里仅考虑前向相机**。在每个时间步$t$，驾驶智能体观察一个由**历史图像-位姿对**组成的上下文窗口$(\mathbf I_{t-K:t},\mathbf P_{t-K:t})$，其中

$$
\begin{gathered}
\mathbf I_j\in\mathbb R^{3\times H\times W}\\
\mathbf P_j=
\begin{bmatrix}
x_j\\y_j\\\theta_j
\end{bmatrix}
\end{gathered}
$$

> 特别需要注意，论文采用以当前车辆位姿为参考的局部坐标系，因此$\mathbf P_t=[0,0,0]^\top$，并且历史车辆位姿都被转换到这个坐标系中

端到端自动驾驶任务希望模型根据历史观测输出未来车辆轨迹

$$
\hat{\mathbf P}_{t+1:t+F}=
f_\phi
(
\mathbf I_{t-K:t},
\mathbf P_{t-K:t}
)
$$

这里的轨迹由离散的位姿组成$\hat{\mathbf P}_{t+1:t+F}=\{ \hat P_{t+1}, \hat P_{t+2}, \ldots, \hat P_{t+F} \}$

### 3.2 世界模型架构

#### 3.2.1 JEPA-WM 面向端到端自动驾驶的适配

作者将已有的`JEPA-WM`适配到自动驾驶。

| 模块 | 采用的方法 |
| --- | --- |
| 视觉编码器 | DINOv3 ViT-L |
| Predictor | Transformer |
| 动作条件注入 | AdaLN |
| 位置编码 | RoPE |
| 长时域训练 | 可选 Rollout Training |

论文将动作定义为

$$
\mathbf a_t=
\operatorname{Relative}(\mathbf P_t,\mathbf P_{t+1})
=
\begin{bmatrix}
\Delta x_{t\rightarrow t+1}\\
\Delta y_{t\rightarrow t+1}\\
\Delta\theta_{t\rightarrow t+1}
\end{bmatrix}
$$

可以看出这里的动作并不是油门或方向盘转角等操控指令，而是两个相邻时刻之间的相对位姿变化。

论文将历史图像和下一时刻图像分别输入冻结的 DINOv3中用以提取特征

$$
s_{t-K:t+1} = \operatorname{Enc} ( \mathbf I_{t-K:t+1} ), \quad s_j\in\mathbb R^{N_p\times D}
$$

其中$N_p$是图像Patch 数量，$D$是每个 Patch 的特征维度。

> 注意，论文是逐帧独立使用 DINOv3 编码图像，并没有使用视频编码器一次性编码所有历史帧


论文将潜特征预测定义为

$$
\hat s_{t-K+1:t+1} = \operatorname{Pred} \left( s_{t-K:t}, E_a(a_{t-K:t}) \right)
$$

这里采用的是整个历史窗口向前平移一个时间步的预测方式。其中的$E_a$表示动作编码器

Baseline训练损失

$$
\mathcal L_{\mathrm{pred}} = \operatorname{MSE} \left( \hat s_{t-K+1:t+1}, s_{t-K+1:t+1} \right)
$$

这里的真实目标是下一时间的图像经过冻结 DINOv3 得到的特征

> 编码器被冻结，监督目标传递梯度

### 3.2.2 此论文的改进

JEPA-WM 虽然能够在高维潜空间中预测未来，但大量 Patch 会让多步 Rollout 的计算成本非常高。况且，世界模型在规划时还需要对数百条候选轨迹分别预测未来，进一步加重了计算负担。

因此，作者加入了一个 Projector：

$$
z_{t-K:t+1} = \operatorname{Proj}(s_{t-K:t+1})
$$

Projector 使用两层卷积。把 Patch 从$16 \times 32$压缩到$4 \times 8$，把 Token 维度从$1024$压缩到$256$

> Projector 并不是专门针对规划阶段设计的一个后处理模块，而是直接参与世界模型训练

预测也是在压缩后的空间进行的

$$
\hat z_{t-K+1:t+1} = \operatorname{Pred}' \left( z_{t-K:t}, E_a(a_{t-K:t}) \right)
$$

损失函数变为

$$
\mathcal L_{\mathrm{pred}}^{\mathrm{proj}} = \operatorname{MSE} \left( \hat z_{t-K+1:t+1}, \operatorname{sg}(z_{t-K+1:t+1}) \right)
$$

这里增加了$\operatorname{sg}(\cdot)$是因为DINO v3 虽然冻结了，但是新接入的 Projector 仍可以学习更新，所以还需增加梯度停止操作，防止监督分支将梯度传播到 Projector

作者希望压缩后的潜特征既能够用于预测，又不至于全部退化成相似向量（表示坍塌），因此加入了 SIGReg。它的思想是鼓励特征的分布接近$z\sim\mathcal N(0,I)$，而当特征为常数时方差接近于零，因此，一个坍塌到常数的表示显然不符合 SIGReg 的分布目标

考虑某个时间步、某个空间 Patch 位置。从一个 Batch 中取出该位置对应的特征：

$$
\{z_1,z_2,\ldots,z_B\}, \quad z_b\in\mathbb R^D
$$

接下来随机选择一个单位向量：

$$
u\in\mathbb R^D,\qquad \|u\|_2=1
$$

将这些高维特征投影到一维：

$$
v_b=u^\top z_b
$$

如果高维向量$z_b$的分布是标准各向同性高斯，那么理论上：

$$
v_b\sim\mathcal N(0,1)
$$

因此，可以使用一维正态性检验，判断这组投影值的分布是否接近标准高斯。

论文采用 Epps–Pulley 检验统计量 \(T(\cdot)\)。

重复多个随机方向后，就可以构造完整的 SIGReg 损失：

$$
\mathcal L_{\mathrm{SIGReg}}^{t-K:t+1}
=
\frac{1}{NH'W'M}
\sum_{l=1}^{NH'W'}
\sum_{m=1}^{M}
T\left(
\left\{
\left\langle z_{l,b},u^{(m)}\right\rangle
\right\}_{b=1}^{B}
\right)
$$

这里各个符号的含义是：

- $N=K+2$：单步训练窗口中的帧数
- $H',W'$：Projector 输出的空间尺寸
- $B$：Batch Size
- $M$：随机投影方向数量
- $u^{(m)}$：第$m$个随机单位方向
- $T(\cdot)$：一维 Epps–Pulley 正态性检验统计量

这里的 SIGReg 是针对每个 Patch 位置，使用 Batch 内不同样本的特征进行约束，然后再对所有时间和空间位置求平均。

> 这样处理，不同空间位置的 Patch 特征不需要被混合成同一个样本集合，可以保留空间结构

最终训练损失为

$$
\mathcal L
=
\mathcal L_{\mathrm{pred}}^{\mathrm{proj}}
+
\lambda\mathcal L_{\mathrm{SIGReg}}
$$

作者考虑到如果仅训练单步预测，连续 Rollout 时可能出现误差累积。因此在 Teacher-Forcing 的基础上引入了 Autoregressive Rollout Training。也就是说在预测到$t+1$后继续使用自回归向前预测，直到预测到$t+F$。然后分别与每个时间步的真实潜状态计算 MSE：

$$
\overline{\mathcal L}_k
=
\operatorname{MSE}
\left(
\hat z_{t+k}^{\mathrm{AR}},
\operatorname{sg}(z_{t+k})
\right)
$$

> 附录中说明，作者在自回归时加入了截断反向传播通过时间（Truncated Backpropagation Through Time， TBPTT），也就是说第$k$步的预测损失仅能够更新当前调用的 Predictor，对$k$步之前使用 Stop Gradient

最终多步损失为

$$
\mathcal L^{\mathrm{multi}}
=
\frac{
\overline{\mathcal L}_{\mathrm{TF}}
+
\overline{\mathcal L}_2
+\cdots+
\overline{\mathcal L}_F
}{F}
+
\lambda\mathcal L_{\mathrm{SIGReg}}^{t-K:t+F}
$$

## 3.3 零样本目标条件规划

交叉熵方法（CEM）需要对大量候选动作序列进行迭代评估，对自动驾驶而言代价过高。因此，作者选择了一种更加简单的规划方法：**直接从预先构建的候选轨迹词表（Vocabulary）中选择轨迹**，这里的词表可以理解为一个轨迹库$\mathcal V= \left\{ P_{t:t+F}^{i} \right\}_{i=1}^{8192}$。论文使用已有$Vad V2$提供的聚类轨迹词表，并根据角度坐标排序，再以均匀间隔采样的方式选择 256 条候选轨迹

在实际使用中，像将轨迹转为动作，然后调用世界模型获得未来的潜状态。为选择最优轨迹，论文将目标定义为未来第$F$帧的真实相机图像$I_{t+F}$，并使用同一个 Encoder 和 Projector 将其编码为$z_{t+F}$，然后计算第$i$条轨迹预测得到的未来潜状态与目标潜状态之间的距离

$$
\mathcal C^i
=
\left\|
z_{t+F}
-
\hat z_{t+F}^{\,i}
\right\|_2^2
$$

> 作者不是直接比较候选轨迹的终点位置与真实终点位置，而是通过世界模型预测的视觉特征间接评价轨迹

只需选择代价最小的候选轨迹，便完成了规划

## 3.4 模仿学习的下游迁移

随后作者探索了学习得到的 Projector 能否帮助传统模仿学习式端到端自动驾驶。于是作者移除了 Predictor，仅保留 Enc 和 Proj，并添加了Trajectory Decoder。实验结果表明：世界模型训练得到的 Projector 表征，在后续模仿学习中具有一定的迁移价值。