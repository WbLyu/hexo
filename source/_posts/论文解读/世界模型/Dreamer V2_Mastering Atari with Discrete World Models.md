---
title: "Dreamer V2: Mastering Atari with Discrete World Models"
date: 
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
cover: https://img.wblyu.top/images/0152a354c151766b91fbc6ff99a61a31.avif
---

## 1. 引言

- 世界模型的作用：世界模型将智能体的经验提炼为一个预测模型，该模型**可替代环境**以用于行为学习
- 使用隐空间的作用：在隐空间中进行前向预测不仅有助于实现长期预测，还能够在单个批次中高效并行预测数千条紧凑状态序列，而无需生成图像
- 此算法相比于V1的改进：使用离散的隐空间，即用分类变量取代之前的高斯分布；平衡了KL损失中的各项；将折扣因子加入预测项用以预测回合结束

## 2. 世界模型学习

### 2.1 经验数据集

令智能体与真实环境交互，并收集相应的数据$x_{1:T},a_{1:T},r_{1:T},\gamma_{1:T}$用以训练世界模型。这里的折扣因子在回合结束的时刻设为$0$，在其他时刻设为$0.999$，借此可以获知回合结束的时刻。

在训练时要从数据集中选取路径，选出$B=50$条长度为$L=50$的路径，为了保证选取的路径满足长度要求，需要控制选取的起点，起点的最大值不能超过$T-L$。同时论文中为了保证终止点能够被频繁选取，并未采用$s \sim U(0,T-L)$即在最大值范围内均匀取样。而是采用

$$
\begin{gathered}
s_{sample} \sim U(0,T-1) \\
s = \min (s_{sample},T-L)
\end{gathered}
$$

这里的$\min$操作便对应论文中提及的`clip`，通过这种方式，选到终止点的概率便大幅提高，更有利于$\gamma$的训练

### 2.2 模型的组成

此论文将世界模型建模为RSSM，并将潜状态显示表示为随机部分$z_t$和确定部分$h_t$，并加入了折扣因子用以判断是否到达了终止时刻$\gamma_t$，完整公式为

$$
\text{Recurrent model: }h_t = f_\phi (h_{t-1},z_{t-1},a_{t-1}) \\
\text{Representation model: }z_t \sim q_\phi (z_t \mid h_t,x_t) \\
\text{Transition predictor: }\hat{z}_t \sim p_\phi (\hat{z}_t \mid  h_t) \\
\text{Reward predictor: }\hat{r}_t \sim p_\phi (\hat{r}_t \mid  h_t,z_t) \\
\text{Discount predictor: }\hat{\gamma}_t \sim p_\phi (\hat{\gamma}_t \mid  h_t,z_t) \\
\text{Image predictor: }\hat{x}_t \sim p_\phi (\hat{x}_t \mid  h_t,z_t) \\
$$

其中观测为$x_t$。通过`discount predictor`我们可以获知回合终止的可能性，从而防止在想象时过多估计奖励

### 2.3 离散化

`DreamerV2` 不再像 `DreamerV1` 那样将$z_t$定义为一个高斯连续向量，而是把它设计成多个离散分类变量组成的向量。论文具体使用 $32$ 个分类变量，每个分类变量有 $32$ 个类别。在神经网络中分类变量一般表示为`one-hot`

$$
[0,0,\cdots , 1, \cdots ,0]
$$

这就意味着离散潜变量是一个$32 \times 32$的矩阵。神经网络真正输出的并不是这样的`0-1`形式，而是类似$p=[0.1,0.6,0.2,0.1]$这种形式，期间还需要经过采样的操作

$$
p \rightarrow \operatorname{sample} (p) \rightarrow [0,1,0,0] 
$$

这个采样是离散跳变的，无法正常求导。论文中使用了`Straight-Through Gradient`操作

> `Dreamer V1`在解决高斯连续分布采样不可求导时使用的是重参数化技巧，把随机性集中到一个与模型参数无关的噪声变量中。但是这里是离散化的采样，它的结果对分布参数不是连续可微的

```txt
sample = one_hot(draw(logits))
probs = softmax(logits)
sample = sample + probs - stop_grad(probs)
```

最关键的地方在第三行

$$
\boxed{
z_{\text{ST}} = z_{\text{sample}} + p - \operatorname{sg}(p) }
$$

其中的$\operatorname{sg}$代表停止梯度传播


在前向传播时

$$
z_{\text{ST}}=z_{\text{sample}}
$$

也就是说，前向传播时仍然使用真正的离散`one-hot sample`

例如

$$
l=[\ln 0.1,\ln 0.6,\ln 0.2,\ln 0.1]
$$

那么

$$
p=\operatorname{softmax}(l) = [0.1,0.6,0.2,0.1]
$$

根据其分布随机采样

$$
k \sim \operatorname{Categorical}([\ln 0.1,\ln 0.6,\ln 0.2,\ln 0.1]) = \operatorname{Categorical}([0.1,0.6,0.2,0.1])
$$

这里等号成立是因为`Categorical`的输入必须是概率分布，如果输入不满足概率分布，会使用`softmax`化为概率分布。假设本次采到第 2 类$z_{\text{sample}}=[0,1,0,0]$

那么

$$
z_{\text{ST}} = [0,1,0,0] + [0.1,0.6,0.2,0.1] - [0.1,0.6,0.2,0.1] = [0,1,0,0]
$$

但是反向传播时完全不同。采样操作不可导，并且第三项是停止梯度传播的。因此

$$
\frac{\partial z_{\text{ST}}} {\partial\text{logits}} = 0+ \frac{\partial p} {\partial\text{logits}} -0
$$

于是：

$$
\boxed{
\frac{\partial z_{\text{ST}}} {\partial\text{logits}} =  \frac{\partial p} {\partial\text{logits}}
}
$$

这就是`straight-through`的本质：**前向传播时走离散 sample，反向传播时假装走的是 softmax probability**

> 这个梯度不是严格真实的梯度，而是一个近似估计。因此它属于有偏梯度估计器，但是实践中通常比较简单、稳定，而且方差较低

论文给出选择离散分布效果更好的**猜想**：

1. `categorical`的先验更容易匹配群体后验
2. 离散的潜变量非常稀疏，有利于泛化
3. 可能更容易优化
4. 雅达利游戏中有许多离散事件如进入新的房间、敌人被击败后突然消失，离散化更容易拟合这种环境

关于第一点的补充：

训练时会选取多条轨迹，因此会出现同一个潜状态对应多个观测的情况，例如某一时刻敌人可能从左侧出现也可能从右侧出现，但是先验不知道最终结果，它只能将二者混合。

此时`categorical`可以很好融合，但是`Gaussian`融合后可能就变为均值为零方差很大，融合效果很差，产生许多无意义的中间态。这是因为`categorical`混合后仍然是`categorical`分布族；而`Gaussian`混合后可能有多个峰，就不是`Gaussian`了。

### 2.4 损失函数

世界模型中的所有模块要放在一起联合优化，因此损失函数中需要包括所有变量，损失函数可以写为

$$
\mathcal{L}(\phi) = \mathbb{E}_{q_\phi (z_{1:T} \mid a_{1:T},x_{1:T})} \left[ \sum_{t=1}^{T} \mathcal{L}_{\text{image}} + \mathcal{L}_{\text{reward}} + \mathcal{L}_{\text{discount}} + \beta \mathcal{L}_{\text{KL}} \right] 
$$

参考VAE的形式，前三项分别为对应的`log`损失

$$
\begin{gathered}
\mathcal{L}_{\text{image}} = - \ln p_\phi (x_t \mid h_t,z_t) \\
\mathcal{L}_{\text{reward}} = - \ln p_\phi (r_t \mid h_t,z_t) \\
\mathcal{L}_{\text{discount}} = - \ln p_\phi (\gamma_t \mid h_t,z_t) 
\end{gathered}
$$

在`ELBO`目标中，`KL`损失令后验$q_\phi(z_t \mid h_t,x_t)$与先验$p_\phi(z_t \mid h_t)$彼此趋近。然而，先验的学习难度较大，我们希望避免将后验向训练不充分的先验趋近。为解决该问题，我们通过设置不同的学习率，使`KL`损失针对先验的最小化速度快于针对后验的速度。论文中将其称为 KL 平衡（KL balancing）

$$
\begin{aligned}
\mathcal{L}_{\text{KL}} =& \alpha \operatorname{KL} \left[ \operatorname{sg}(q_\phi(z_t \mid h_t,x_t))  \Vert p_\phi(z_t \mid h_t) \right]\\
&+ (1 - \alpha) \operatorname{KL} \left[ q_\phi(z_t \mid h_t,x_t)  \Vert \operatorname{sg} (p_\phi(z_t \mid h_t)) \right]
\end{aligned}
$$

论文中将$\alpha$设为$0.8$

## 3. 行为学习

在训练行为模型时，世界模型是固定的，并且在想象中不需要重建图像，因此可以并行模拟大量轨迹，整个想象过程如下图所示。可以看出想象过程的起点是从后验输出的状态开始的。论文中将想象的范围设置为$H = 15$

![dreamer-v2-1.png](https://img.wblyu.top/world-models/dreamer-v2-1.png)

### 3.1 模型组成

行为模型是由随机性演员（actor）和确定性评论家（critic）组成的

$$
\begin{gathered}
\text{Actor: } \hat{a}_t \sim p_\psi (\hat{a}_t \mid \hat{z}_t) \\
\text{Critic: } \hat{v}_\xi(\hat{z}_t) \approx \mathbb{E}_{p_\phi , p_\psi} \left[ \sum_{\tau \geq t}^{} \hat{\gamma}^{\tau -t} \hat{r}_\tau \right]
\end{gathered}
$$

这两个模型在同一段轨迹中共同优化，但是使用的损失函数是不同的

### 3.2 评论家损失函数

论文中将`Critic`的目标函数设置为

$$
V_t^\lambda = \hat r_t + \hat\gamma_t
\left\{
\begin{aligned}
&\left[ (1-\lambda)v_\xi(\hat z_{t+1}) + \lambda V_{t+1}^\lambda \right], &\qquad t<H \\
&v_\xi (\hat{z}_H), &\qquad t=H \\
\end{aligned}
\right.
$$

此函数的含义和V1版本的类似，即对$n$步内的奖励进行折扣累加，最大的区别便是这里的折扣因子$\gamma$是时变的，这样可以在预测出回合结束时终止奖励积累。根据目标函数可以得到损失函数

$$
\mathcal{L}(\xi) = \mathbb E_{p_\phi,p_\psi } \left[ \sum_{t=1}^{H-1} \frac12 \left( v_\xi(\hat z_t) - \operatorname{sg}(V_t^\lambda) \right)^2 \right]
$$

注意到做后一步$t=H$的时候，损失函数就是`Critic`减去自身，因此这里的时间步只到$t=H-1$便终止

公式中的$V_t^\lambda$是目标函数，我们真正希望的是**固定$V_t^\lambda$，只让$v_\xi(z_t)$去拟合它**。因此使用$\operatorname{sg}()$来终止梯度传播。但是还有一个问题：$V_t^\lambda$内部含有`Critic`，`target`本身一直在变化，因此论文中使用了时间差分学习（Temporal-Difference Learning， TD Learning）并不直接用当前正在高速更新的`Critic`$v_\xi$来构造 `target`。而是复制一份$v_{\bar\xi}$

- $v_\xi$：`online critic`，正常每一步更新
- $v_{\bar\xi}$：`target critic`，暂时固定，只每一百步才更新一次

### 3.3 演员损失函数

`Actor`的损失函数定义为

$$
L(\psi) = \mathbb E_{p_\phi,p_\psi} \left[ \sum_{t=1}^{H-1} \left( \underbrace{-\rho \log p_\psi(\hat a_t\mid \hat z_t) \operatorname{sg} \left( V_t^\lambda-v_\xi(\hat z_t) \right)}_{\text{reinforce}}
\underbrace{- (1-\rho)V_t^\lambda}_{\substack{\text{dynamics}\\\text{backprop}}}
\underbrace{- \eta \mathcal H[\hat a_t\mid\hat z_t]}_{\text{entropy regularizer}} \right) \right]
$$

**第一项：REINFORCE**

可以令$A_t = V_t^\lambda-v_\xi(\hat z_t)$，那么第一项变为

$$
-\rho \log p_\psi(\hat a_t\mid \hat z_t) \operatorname{sg} \left( A_t \right)
$$

$A_t$可以看成**这次轨迹的实际表现 - `Critic`原本的平均预期**

如果$A_t>0$说明采到好动作了，那么就提高该动作的概率；反之亦然。这里不直接使用$V_t^\lambda$而是要减去$v_\xi(\hat z_t)$是为了减去`Baseline`，从而减少方差。这里的思想与`REINFORCE`算法的思想一致

**第二项：Dynamics Backpropagation**

这项不像第一项，能通过损失项直接计算出更新梯度。这项要将$V_t^\lambda$的梯度向前传播，经由$\hat{r},\hat{z},\hat{a}$等变量来更新网络的参数$\psi$。

其中会经过世界模型，但是此时世界模型是冻结的，只传递梯度不更新参数。其中会有采样操作，利用`straight-through gradients`来近似梯度

第一项无偏但是方差大；第二项有偏但是方差小。使用$\rho$参数用来平衡这两项

**第三项：Entropy Regularization**

熵正则化本质上是为了让输出较为均匀，用在这里是为了鼓励模型去进行探索（exploration）。将参数$\eta$设置很小是为了让模型稍微探索但不要永远随机

> `Actor`和`Critic`的每个时间步`loss`，还要乘累计预测的折扣因子，从而平滑地考虑回合结束的可能性（并不是低于某个阈值就硬性截断）