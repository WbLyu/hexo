---
title: "Dreamer V1: Dream to Control: Learning Behaviors by Latent Imagination"
date: 2026-09-21 19:08:47
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
cover: https://img.wblyu.top/images/d87b9b976129d1cfe3f2235816881b5d.avif
---

## 2. 基于世界模型的控制

- `behavior learning`：根据世界模型训练控制策略，对应第三节
- `representation learning`：训练世界模型本身，对应第四节
- `collect real data`：与真实环境交互收集数据

当分布与真实观测有关时使用$p$，当分布在想象中进行时使用$q$

`Dreamer`的训练过程是一个**模型学习与在线数据采集交替进行**的循环，其中模型学习包含动力学习（world model）和行为学习（planning）

首先使用随机动作采集$S$个episodes，构造初始数据集$\mathcal D$，并随机初始化世界模型参数$\theta,\phi,\psi$。

之后不断重复以下两个阶段：

1. **模型训练**
   - 从数据集$\mathcal D$中随机采样$B$个长度为$L$的序列片段；
   - 计算模型损失并更新`Dynamics`的模型参数$\theta$；
   - 在每个潜状态处进行想象，想象长度为$H$；
   - 计算想象中的奖励$\mathbb{E}(q_\theta(t_\tau \mid s_\tau))$和价值模型的输出$v_{\psi}(s_\tau)$；
   - 通过公式6计算价值预估$V_\lambda(s_\tau)$；
   - 根据损失函数更新`Behavior`的模型参数$\phi,\psi$；

2. **数据采集**
   - 重置环境得到初始观测；
   - 根据历史观测与动作，通过编码器推断当前潜状态：$q(s_t\mid o_{\le t},a_{<t})$
   - 使用动作模型输出动作
   - 在动作上加入探索噪声；
   - 执行动作后得到奖励和观测；
   - 完成一个 episode 后，将新的轨迹加入数据集$\mathcal D$。

整个过程不断重复，使行为模型和动力学模型随着新采集的数据持续改进，同时更准确的模型又会产生更好的规划行为，从而采集到更有价值的新数据。

## 3. 基于潜空间想象（imagination）的行为学习

### 3.1 演员评论家方法（actor critic approach）

论文基于`actor critic`提出了`Action model`和`Value model`（论文中的`Value model`公式有点问题）

$$
\begin{gathered}
\text{Action model: } a_{\tau } \sim q_{\phi}(a_\tau \mid s_{\tau}) \\
\text{Value model: } v_{\psi}\approx \mathbb{E}_{q(\cdot \mid s_{\tau})}  (\sum_{n =\tau}^{\infty} \gamma ^{n-\tau}r_n)
\end{gathered}
$$

`Action model`的作用是planning；`Value model`的作用是预估$\tau$之后的累计奖励

这里的动作是从分布中进行采样的，为了保证梯度能够通过采样继续传播，需要用到重参数化技巧，即将随机性分离为常数

$$
a_{\tau} = \tanh (\mu _{\phi}(s_{\tau})+\sigma_{\phi}(s_{\tau}) \epsilon ), \quad \epsilon \sim \operatorname{Normal}(0,\mathbb{I})
$$

### 3.2 价值估计（value estimation）

论文中提及的`value estimation`是指估计想象中的奖励，作者给出了三种方式

$$
V_R(s_\tau) = \mathbb{E}_{q_\theta,q_\phi}(\sum_{n=\tau}^{t+H} r_n)
\tag{4}
$$

期望里面展开就是

$$
r_\tau + \gamma r_{\tau+1} + \gamma^2r_{\tau+2} +\cdots+ \gamma^{t+H-\tau}r_{t+H}
$$

本质上就是从$s_\tau$开始，把想象范围结束之前所有奖励加起来，这种方式的缺点是忽略了范围外的所有奖励，导致短视

$$
V_N^k(s_\tau) = \mathbb{E}_{q_\theta,q_\phi} \left[ \sum_{n=\tau}^{h-1} \gamma^{n-\tau}r_n + \gamma^{h-\tau}v_\psi(s_h) \right],\quad h=\min (\tau + k,t+H)
\tag{5}
$$

它的思想是先计算$k$步内的奖励，之后的不再展开，而是让`Critic`预测后面的总奖励。其中的$h$是为了保证展开范围不会超过序列的末端。这种方法虽然考虑了想象范围外的奖励，但是$k$的取值难以选择。如果$k$太小，会过于依赖`Critic`，虽然方差小但是偏差大；如果$k$太大，对`Critic`依赖低，虽然偏差小但是方差大

$$
V_\lambda(s_\tau) = (1-\lambda) \sum_{n=1}^{H-1} \lambda^{n-1}V_N^n(s_\tau) + \lambda^{H-1}V_N^H(s_\tau)
\tag{6}
$$

将这个公式展开得到

$$
\begin{aligned}
V_\lambda= & (1-\lambda)V_N^1 +(1-\lambda)\lambda V_N^2 + (1-\lambda)\lambda^2 V_N^3\\
&+\cdots +(1-\lambda)\lambda^{H-2}V_N^{H-1} +\lambda^{H-1}V_N^H
\end{aligned}
$$

可以看出公式6的核心思想就是对多个不同长度$k$的$V_N^k(s_\tau)$进行平均加权从而平衡偏差和方差。最后一项的权重为$\lambda^{H-1}$是为了保证权重之和为$1$。$\lambda$参数决定是更相信`Critic`（$\lambda$小）还是更相信展开（$\lambda$大）

### 3.3 学习目标（learing objective）

动作模型$q_{\phi}(a_\tau \mid s_{\tau})$的目标是预测得到的潜状态轨迹获得的奖励最大（状态轨迹取决于动作的输入）；价值模型$v_{\psi}$的目标是回归价值估计（让价值模型的输出和价值估计尽可能一致）

$$
\begin{gathered}
\max _{\phi} \mathbb{E}_{q_\theta ,q_\phi}\Big(\sum_{\tau =t}^{t+H}V_\lambda(s_\tau)\Big) \\
\max _{\psi} \mathbb{E}_{q_\theta ,q_\phi}\Big(\sum_{\tau =t}^{t+H} \frac{1}{2} \lVert v_{\psi}(s_\tau) - V_\lambda (s_\tau) \rVert^2 \Big)
\end{gathered}
$$

## 4. 可学习的潜空间动力学

世界模型的固定组成部分

$$
\begin{gather*}
\text{Representation model } p(s_t \mid s_{t-1},a_{t-1},o_t) \\
\text{Transition model } q(s_t \mid s_{t-1},a_{t-1}) \\
\text{Reward model } q(r_t \mid s_t) \\
\end{gather*}
$$

为了让隐状态能学到有用的信息，我们需要设计监督信号与损失函数，论文中给出了三种设计方式

### 4.1 Reward Prediction

最简单的想法是让隐状态只去预测奖励$p(r_t \mid s_t)$，并设置只考虑奖励的损失函数。理论上，如果数据集足够大且足够多样，这样做是可以的；但是现实中大多数情况下数据集是有限的，并且奖励提供的信息太少了，这种方法就不奏效了

### 4.2 Image Reconstruction

参考`PlaNet`，加入观测作为监督信号

$$
\begin{gather*}
\text{Representation model } p_{\theta}(s_t \mid s_{t-1},a_{t-1},o_t) \\
\text{Transition model } q_{\theta}(s_t \mid s_{t-1},a_{t-1}) \\
\text{Reward model } q_{\theta}(r_t \mid s_t) \\
\text{Observation model } q_{\theta}(o_t \mid s_t)
\end{gather*}
$$

训练目标可以写为

$$
J_{\mathrm{REC}} = \mathbb E_p \left[ \sum_t \left( J_O^t+J_R^t+J_D^t
\right) \right]
$$

其中：

$$
\begin{gather*}
J_O^t = \ln q(o_t|s_t) \\
J_R^t = \ln q(r_t|s_t) \\
J_D^t = -\beta D_{\mathrm{KL}} \left[ p(s_t|s_{t-1},a_{t-1},o_t) \| q(s_t|s_{t-1},a_{t-1}) \right]
\end{gather*}
$$

分别对应观测监督、奖励监督和先验后验分布监督

论文中将转移模型建模为为`RSSM`；表征模型建模为`RSSM`与卷积神经网络的结合；观测模型建模为转置`CNN`；奖励模型建模为全连接网络。

### 4.3 Contrastive Estimation

将观测作为监督信号的话就需要重建图像，但是重建的成本比较高。所以论文选择另外一条路，不重构图像，而是反过来让观测能识别正确的潜状态，即

$$
q_{\theta}(s_t \mid o_t)
$$

然后定义：

$$
\mathcal{J}_S^t = \log q(s_t|o_t) - \log \left( \sum_{o'}q(s_t|o') \right).
$$

第一项的意思是**正确的观测应该能够很好地对应正确的潜状态**；第二项的意思是**防止所有观测都对应到同一个状态**

公式的推导暂时不进行展开，核心思想是：潜状态中到底应该保存观测中的多少信息，太少会导致信息缺少无法正确预测；太多就难以学好动力学。因此需要一个平衡：**既保留有用信息又限制随意读取观测**，就是信息瓶颈（Information Bottleneck）

