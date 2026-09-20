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
s_t \sim p(s_t \mid s_{t-1},\hat{a}_{t-1}) = \mathcal N \left( \mu(z), \sigma_x^2I \right) \\
\hat{o}_t \sim p(\hat{o}_t \mid s_t) \\
\hat{r}_t \sim p(\hat{r}_t \mid s_t)
\end{gathered}
$$

公式中隐含两个条件独立假设

$$
\begin{gathered}
p(s_t \mid s_{1:t-1},o_{1:t-1},a_{1:t-1}) = p(s_t \mid s_{t-1},a_{t-1})\\
p(o_t \mid s_{1:t},o_{1:t-1},a_{1:t}) = p(o_t \mid s_t)
\end{gathered}
$$

意味着

1. 只需要上一时刻的状态和动作，就可以得到这一时刻的状态
2. 只需要当前时刻的状态，就可以生成当前时刻的观测

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

| VAE | RSSM | 注释 |
| --- | --- | --- |
| 观测数据 $x$ | 观测序列 $o_{1:T}$ 和动作序列 $a_{1:T}$ | RSSM输入为$a$，输出为$o$ |
| 潜变量 $z$ | 潜状态序列 $s_{1:T}$ | |
| 真实后验 $p(z \mid x)$ | 真实状态后验 $p(s_{1:T} \mid o_{1:T}, a_{1:T})$ | 给定观测与动作后，对潜状态的条件分布 |
| 近似后验 $q(z \mid x)$ | 近似状态后验 $q(s_{1:T} \mid o_{1:T}, a_{1:T})$ | 用神经网络近似难以计算的真实后验 |
| 先验 $p(z)$ | 转移模型 $p(s_t \mid s_{t-1}, a_{t-1})$ | VAE 常用标准正态先验；时序模型使用依赖历史状态和动作的条件先验 |
| 解码器／生成模型 $p(x \mid z)$ | 观测模型 $p(o_t \mid s_t)$ 和奖励模型 $p(r_t \mid s_t)$ | 从潜状态预测观测和奖励 |

> `PlaNet`将`VAE`中单个潜变量$z$扩展为了随时间变化的潜状态序列$s_{1:T}$，并且加入了动作序列$a_{1:T}$，因此其最大化的目标函数形式也发生一些变化，但最根本的核心仍是最大化观测（也可以加上最大化奖励）

因此真正希望最大化的是

$$
\max \log p(o_{1:T}\mid a_{1:T})
$$

直接建模这个概率分布很困难，可以引入潜状态

$$
\boxed{
\begin{aligned}
p(o_{1:T} \mid a_{1:T}) =& \int p (o_{1:T} , s_{1:T}\mid a_{1:T}) d s_{1:T} \\
=& \int \underbrace{p (s_{1:T}\mid a_{1:T})}_{\text{后验}} \underbrace{p (o_{1:T}\mid s_{1:T})}_{\text{观测}}  d s_{1:T}
\end{aligned}
}
$$

将上式进一步变形可以得到公式8的第一行

$$
\begin{aligned}
p(o_{1:T} \mid a_{1:T})=& \int p (s_{1:T}\mid a_{1:T})p (o_{1:T}\mid s_{1:T})  d s_{1:T} \\
=& \mathbb{E}_{p (s_{1:T}\mid a_{1:T})} \left[  p (o_{1:T}\mid s_{1:T})\right]  \\
=& \mathbb{E}_{p (s_{1:T}\mid a_{1:T})} \left[ \prod_{t=1}^{T}  p (o_t\mid s_t)\right]
\end{aligned}
$$

与`VAE`一样，引入近似后验$q(s_{1:T}\mid o_{1:T},a_{1:T})$，并构建ELBO来近似目标函数。先在积分中乘除同一个近似后验

$$
\begin{aligned}
p(o_{1:T}\mid a_{1:T}) ={}& \int q(s_{1:T}\mid o_{1:T},a_{1:T}) \\
&\cdot \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ q(s_{1:T}\mid o_{1:T},a_{1:T}) } ds_{1:T}
\end{aligned}
$$

根据期望定义：

$$
\log p(o_{1:T}\mid a_{1:T}) = \log \mathbb E_q \left[ \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ q(s_{1:T}\mid o_{1:T},a_{1:T}) } \right]
$$

由于 $\log$ 为凹函数，根据 Jensen 不等式$\log\mathbb E[Y] \geq \mathbb E[\log Y]$有

$$
\begin{aligned}
\log p(o_{1:T}\mid a_{1:T}) \geq \mathbb E_q \left[ \log \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ q(s_{1:T}\mid o_{1:T},a_{1:T}) } \right]
\end{aligned}
$$

定义右侧为序列模型的 `ELBO`：

$$
\boxed{ \mathcal L_{\mathrm{ELBO}} = \mathbb E_q \left[ \log \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ q(s_{1:T}\mid o_{1:T},a_{1:T}) } \right] }
$$

因此：

$$
\boxed{ \log p(o_{1:T}\mid a_{1:T}) \geq \mathcal L_{\mathrm{ELBO}} }
$$

和普通`VAE`完全一样，`PlaNet`的`ELBO`与真实后验之间也存在关系。
考虑

$$
D_{\mathrm{KL}} \left( q(s_{1:T}\mid o_{1:T},a_{1:T}) \Vert p(s_{1:T}\mid o_{1:T},a_{1:T}) \right).
$$

根据 KL 定义：

$$
\begin{aligned}
D_{\mathrm{KL}} ={}& \mathbb E_q \left[ \log \frac{ q(s_{1:T}\mid o_{1:T},a_{1:T}) }{ p(s_{1:T}\mid o_{1:T},a_{1:T}) } \right].
\end{aligned}
$$

根据贝叶斯公式：

$$
p(s_{1:T}\mid o_{1:T},a_{1:T}) = \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ p(o_{1:T}\mid a_{1:T}) }.
$$

想要理解这个公式，可以暂时忽略$a_{1:T}$。代入：

$$
\begin{aligned}
D_{\mathrm{KL}} = \mathbb E_q \Big[ & \log q(s_{1:T}\mid o,a) \\
&- \log p(o_{1:T},s_{1:T}\mid a) \\
&+ \log p(o_{1:T}\mid a) \Big].
\end{aligned}
$$

由于$\log p(o_{1:T}\mid a_{1:T})$与$q$无关，可以提出期望，因此

$$
\boxed{ \log p(o_{1:T}\mid a_{1:T}) = \mathcal L_{\mathrm{ELBO}} + D_{\mathrm{KL}} \left( q(s_{1:T}\mid o,a) \Vert p(s_{1:T}\mid o,a) \right) }
$$

这与普通 VAE 的关系完全相同。
所以 PlaNet 中 ELBO 也同时承担两个作用：

1. 作为难以计算的 $\log p(o_{1:T}\mid a_{1:T})$ 的可优化下界；
2. 推动近似后验接近真实后验。

下面回到`ELBO`

$$
\mathcal L_{\mathrm{ELBO}} = \mathbb E_q \left[ \log \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ q(s_{1:T}\mid o_{1:T},a_{1:T}) } \right]
$$

先处理分子

**首先处理分子$p (o_{1:T} , s_{1:T}\mid a_{1:T})$**

先从从最一般的链式法则出发（也可以不使用链式法则而是将$p (o_{1:T} , s_{1:T}\mid a_{1:T})$拆为$p (s_{1:T}\mid a_{1:T})p (o_{1:T}\mid s_{1:T})$）

$$
\begin{aligned}
p(o_{1:T},s_{1:T} \mid a_{1:T}) &= p( s_1,o_1 \mid  a_{1:T}) p( s_2,o_2 \mid s_1,o_1, a_{1:T}) \cdots  p( s_T,o_T \mid s_{1:T-1},o_{1:T-1}, a_{1:T}) \\
&= \prod_{t=1}^{T} p( s_t,o_t \mid s_{<t},o_{<t}, a_{1:T}) \\
&= \prod_{t=1}^{T} p( s_t\mid s_{<t},o_{<t}, a_{1:T})p( o_t\mid s_{\leq t},o_{<t}, a_{1:T})
\end{aligned}
$$

这个可以类比$p(X,Y,Z) = p(X)p(Y \mid X) p(Z \mid X,Y)$得到，此式只是概率论的链式法则，具有普适性

根据论文中的条件独立假设可以得到

$$
\boxed{
p(o_{1:T},s_{1:T} \mid a_{1:T}) = \prod_{t=1}^{T} p( s_t\mid s_{t-1}, a_{t-1})p( o_t\mid s_t)
}
$$

**然后处理分母$q(s_{1:T}\mid o_{1:T},a_{1:T})$**

仿照上面的方式：

$$
\begin{aligned}
q(s_{1:T} \mid o_{1:T},a_{1:T}) &= q( s_1\mid  o_{1:T},a_{1:T}) q( s_2\mid  s_1,o_{1:T},a_{1:T}) \cdots  q( s_T\mid  s_{1:T-1},o_{1:T},a_{1:T}) \\
&= \prod_{t=1}^{T} q( s_t\mid s_{<t},o_{1:T}, a_{1:T})
\end{aligned}
$$

在处理单步编码器的时候有两个选择：**在训练时要不要传入未来观测**，作者将其区分为`filtering posterior`（不传入） 和 `full smoothing posterior`（传入）。作者考虑到PlaNet最终为了在线planning，于是选择了`filtering posterior`即$q(s_t\mid s_{t-1},a_{t-1},o_t)$

> 这里的思想和Transformer、BERT的很像，Transformer选择了在训练时只传入历史信息即**Causal Attention**，BERT选择了在训练时传入历史和未来信息即**Bidirectional Attention**

可以得到

$$
\boxed{
q(s_{1:T} \mid o_{1:T},a_{1:T}) = \prod_{t=1}^{T} q(s_t\mid s_{t-1},a_{t-1},o_t)
}
$$

但是$s_{t-1}$本身并不是独立得到的，而是由更早时刻递推而来：$q(s_{t-1}\mid s_{t-2},a_{t-2},o_{t-1})$。依次递推，当前时刻潜状态的后验可以从整体上概括表示为$q(s_{t} \mid o_{\leq t},a_{<t})$，因此

$$
\boxed{
q(s_{1:T} \mid o_{1:T},a_{1:T}) = \prod_{t=1}^{T} q(s_{t} \mid o_{\leq t},a_{<t})
}
$$

> 这是论文采用的记号写法；严格区分时，$q(s_t\mid s_{t-1},a_{t-1},o_t)$与$q(s_{t} \mid o_{\leq t},a_{<t})$并不完全相同。

将将分子和分母分解形式代回观测似然可以得到

$$
\boxed{
p(o_{1:T} \mid a_{1:T}) = \mathbb E_{q(s_{1:T}\mid o_{1:T},a_{1:T})} \left[\prod_{t=1}^{T} \frac{p( s_t\mid s_{t-1}, a_{t-1})p( o_t\mid s_t)}{q(s_{t} \mid o_{\leq t},a_{<t})}\right]
}
$$

两边取对数，并根据Jensen 不等式$\log \mathbb E[X]\geq\mathbb E[\log X]$可以得到

$$
\log p(o_{1:T} \mid a_{1:T}) \geq \mathbb E_{ q(s_{1:T}\mid o_{1:T},a_{1:T})} \left[ \log \prod_{t=1}^{T} \frac{p( s_t\mid s_{t-1}, a_{t-1})p( o_t\mid s_t)}{q(s_{t} \mid o_{\leq t},a_{<t})}\right]
$$

进一步变形得到

$$
\log p(o_{1:T} \mid a_{1:T}) \geq \mathbb E_q \left[  \sum_{t=1}^{T} \log p( s_t\mid s_{t-1}, a_{t-1}) + \log p( o_t\mid s_t)- \log q(s_{t} \mid o_{\leq t},a_{<t})\right]
$$

利用期望的线性性质可以得到

$$
\boxed{
\begin{aligned}
\log p(o_{1:T}\mid a_{1:T}) \geq \sum_{t=1}^{T} \Bigg(&\mathbb E_q[\log p(o_t\mid s_t)]\\
&+\mathbb E_q \left[\log p(s_t\mid s_{t-1},a_{t-1})-\log q(s_t\mid o_{\le t},a_{<t})\right]\Bigg)
\end{aligned}
}
$$

**首先考虑第一项**

把期望按定义写成积分：

$$
\mathbb E_q[\log p(o_t\mid s_t)] = \int q(s_{1:T} \mid o,a) \log p(o_t\mid s_t) d s_{1:T}
$$

> 这里的$\int \Box  d s_{1:T}$表示对序列的积分，可以展开为$\int \int \int \cdots \Box  d s_1 d s_2 \cdots d s_T$

因为$\log p(o_t\mid s_t)$只与$s_t$有关，因此将其拆分为

$$
\mathbb E_q[\log p(o_t\mid s_t)] = \int \left[  \int q(s_{1:T} \mid o,a) d s_{-t} \right] \log p(o_t\mid s_t) ds_t
$$

其中$d s_{-t} = d s_1 \cdots d s_{t-1} d s_{t+1} \cdots ds_T$，那么$\left[  \int q(s_{1:T} \mid o,a) d s_{-t} \right]$应该可以把除$s_t$的项全部积分消去，从而得到$q(s_{t} \mid o,a)$。由于作者选择了`filtering posterior`，因此$q(s_{t} \mid o,a) = q(s_{t} \mid o_{\leq t},a_{<t})$。最终形式为

$$
\boxed{
\begin{aligned}
\mathbb E_q[\log p(o_t\mid s_t)] &= \int q(s_{t} \mid o_{\leq t},a_{<t})\log p(o_t\mid s_t) ds_t  \\
&= \mathbb{E}_{q(s_{t} \mid o_{\leq t},a_{<t})} \left[ \log p(o_t\mid s_t) \right]
\end{aligned}
}
$$

**然后考虑第二三项**

现在考虑

$$
\mathbb E_{q(s_{1:T}\mid o,a)}\left[\log p(s_t\mid s_{t-1},a_{t-1})-\log q(s_t\mid o_{\le t},a_{<t})\right]
$$

这里被积函数同时涉及$s_{t-1},s_t$，所以只能把除此之外的状态积分掉。写成积分：

$$
\int q(s_{1:T}\mid o,a) \Big[ \log p(s_t\mid s_{t-1},a_{t-1}) - \log q(s_t\mid o_{\le t},a_{<t}) \Big] ds_{1:T}
$$

先积分掉$s_1,\ldots,s_{t-2},s_{t+1},\cdots,s_T$得到

$$
\begin{aligned}
\int\int & q(s_{t-1},s_t\mid o_{1:T},a_{1:T}) \Big[ \log p(s_t\mid s_{t-1},a_{t-1}) - \log q(s_t\mid o_{\le t},a_{<t}) \Big] ds_{t-1} ds_t  \\
=\int\int & q(s_{t-1}\mid o_{1:T},a_{1:T})q(s_t\mid s_{t-1},o_{1:T},a_{1:T}) \\
&\Big[ \log p(s_t\mid s_{t-1},a_{t-1}) - \log q(s_t\mid o_{\le t},a_{<t}) \Big] ds_{t-1} ds_t  
\end{aligned}
$$

由于作者选择了`filtering posterior`，因此$q(s_{t-1}\mid o_{1:T},a_{1:T}) = q(s_{t-1}\mid o_{\leq t-1},a_{<t-1})$以及$q(s_t\mid s_{t-1},o_{1:T},a_{1:T})=q(s_t\mid o_{\leq t},a_{<t})$。再变为期望

$$
\mathbb E_{q(s_{t-1}\mid o_{\leq t-1},a_{<t-1})}\left[E_{q(s_t\mid o_{\leq t},a_{<t})}\left[\log p(s_t\mid s_{t-1},a_{t-1})-\log q(s_t\mid o_{\le t},a_{<t})\right]\right]
$$

内层期望可以写成KL散度

$$
\begin{aligned}
&E_{q(s_t\mid o_{\leq t},a_{<t})}\left[\log p(s_t\mid s_{t-1},a_{t-1})-\log q(s_t\mid o_{\le t},a_{<t})\right] \\
=& -D_{\mathrm{KL}} \Big(q(s_t\mid o_{\leq t},a_{<t}) \Vert p(s_t\mid s_{t-1},a_{t-1})\Big)
    \\
\end{aligned}
$$

最终得到

$$
\boxed{
\begin{align*}
&\quad \log p(o_{1:T} \mid a_{1:T})\\
&\begin{aligned}
\geq \sum_{t=1}^{T} & \Bigg(\underbrace{\mathbb{E}_{q(s_{t} \mid o_{\leq t},a_{<t})} \left[ \log p(o_t\mid s_t) \right]}_{\text{reconstruction}}\\
&- \underbrace{\mathbb E_{q(s_{t-1}\mid o_{\leq t-1},a_{<t-1})}\left[ D_{\mathrm{KL}} \Big(q(s_t\mid o_{\leq t},a_{<t}) \Vert p(s_t\mid s_{t-1},a_{t-1})\Big) \right]}_{\text{complexity}}
\Bigg)
\end{aligned}
\end{align*}
}
$$

1. 第一项与`VAE`中的$\mathbb E_{q(z\mid x)} [\log p(x\mid z)]$对应。它要求从后验编码器中得到的潜状态能够让观测模型对真实观测赋予较高概率。论文把这一项称为`reconstruction`
2. 第二项与`VAE`中的$D_{\mathrm{KL}} \left( q_\phi(z\mid x) \Vert p(z) \right)$对应。它要求编码器产生的近似后验不要过度偏离事先规定的潜变量先验（转移模型）。



与`VAE`类似，本文中观测模型$p(o_t\mid s_t)$是固定协方差高斯分布，因此同样可以简写成`MSE`。

> 论文中也明确指出 unit-variance Gaussian 的 log-likelihood 与 MSE 只差常数项