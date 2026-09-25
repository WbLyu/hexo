---
title: "PlaNet: Learning Latent Dynamics for Planning from Pixels"
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
cover: https://img.wblyu.top/images/41cd78650c2c21d865bd2f6aea2ad295.avif
---

## 2. 潜空间规划

### 2.1 PlaNet（Deep Planning Network）算法整体训练流程

PlaNet 的训练过程是一个 **模型学习（model fitting）与在线数据采集（data collection）交替进行** 的循环。

首先使用随机动作采集$S$个episodes，构造初始数据集$\mathcal D$，并随机初始化世界模型参数$\theta$。

之后不断重复以下两个阶段：

1. **Model Fitting**
   - 从数据集$\mathcal D$中随机采样$B$个长度为$L$的序列片段；
   - 根据公式3计算模型损失；
   - 使用梯度下降更新模型参数；
   - 连续训练$C$个 update steps。

2. **Data Collection**
   - 重置环境得到初始观测；
   - 根据历史观测与动作，通过编码器推断当前潜状态：$q(s_t\mid o_{\le t},a_{<t})$
   - 使用当前学习到的**动力学模型**和**规划器**规划动作：$a_t = \operatorname{planner} \left( q(s_t\mid o_{\le t},a_{<t}), p \right)$
   - 在动作上加入探索噪声；
   - 将同一个动作重复执行$R$次；
   - 累加这$R$次得到的奖励，并保留最后一次观测；
   - 完成一个 episode 后，将新的轨迹加入数据集$\mathcal D$。

整个过程不断重复，使世界模型随着新采集的数据持续改进，同时更准确的模型又会产生更好的规划行为，从而采集到更有价值的新数据。

规划器的算法请参考下一节

### 2.2 基于CEM的潜空间规划

`PlaNet`使用交叉熵方法（Cross-Entropy Method, CEM） 在学习到的潜空间中搜索未来一段时间内的最优动作序列。规划器的输入包括当前潜状态分布、状态转移模型和奖励模型。
具体过程如下：

1. 初始化未来$H$步动作序列的概率分布$q(a_{t:t+H})=\mathcal N(0,I)$
2. 重复进行$I$次 CEM 优化：
   - 从当前动作分布中采样$J$条候选动作序列；
   - 从当前潜状态$q(s_t\mid o_{\le t},a_{<t})$出发，根据每条候选动作序列，利用状态转移模型$p(s_{\tau}\mid s_{\tau-1},a_{\tau-1})$在潜空间中向未来滚动预测；
   - 利用奖励模型$p(r_\tau\mid s_\tau)$计算每条动作序列对应的累计预测奖励；
   - 选择奖励最高的$K$条动作序列；
   - 根据这$K$条优选动作序列重新计算均值和方差，更新动作序列分布。
3. 完成$I$次优化后，只执行最终动作分布中当前时刻动作的均值$a_t=\mu_t$ 而不会一次执行整条规划出的动作序列。执行当前动作并获得新的观测后，重新推断当前潜状态并再次进行规划，因此 PlaNet 实际采用的是MPC。


整个 CEM 规划过程可以概括为：
$$
\boxed{
\text{采样候选动作序列}
\rightarrow
\text{潜空间 rollout}
\rightarrow
\text{预测累计奖励}
\rightarrow
\text{选择 Top-}K
\rightarrow
\text{更新动作分布}
}
$$

其中一个很重要的特点是：规划过程中不需要生成未来图像，而是直接通过潜状态预测未来奖励，因此能够高效评估大量候选动作序列。

### 2.3 动力学模型

算法中提到的动力学模型包括：观测函数、转移函数和奖励函数（实际不需要观测函数）

**观测函数**

$$
o_t \sim p(o_t \mid s_t)
$$

通过潜空间中的未来世界状态，对相应的观测进行重建。式中$o$为观测，$s$为潜状态

**转移函数**

$$
s_t \sim p(s_t \mid s_{t-1},a_{t-1})
$$

根据上一时刻的潜状态和动作，预测下一时刻潜状态，即所谓的`world dynamics`，世界动力学。式中$a$为动作

**奖励函数**

$$
r_t \sim p(r_t \mid s_t)
$$

预测未来状态会获取的奖励，用于评价一个动作序列好不好。式中$r$为奖励

**编码器**

$$
q(s_t \mid o_{\leq t},a_{<t})
$$

通过过去的观测和过去的动作，估计当前的潜状态（后验）

这些公式中隐含两个条件独立假设

$$
\begin{gathered}
p(s_t \mid s_{1:t-1},o_{1:t-1},a_{1:t-1}) = p(s_t \mid s_{t-1},a_{t-1})\\
p(o_t \mid s_{1:t},o_{1:t-1},a_{1:t}) = p(o_t \mid s_t)
\end{gathered}
$$

意味着

1. 只需要上一时刻的状态和动作，就可以得到这一时刻的状态
2. 只需要当前时刻的状态，就可以生成当前时刻的观测

此文章与VAE的对应关系如下表

| VAE | SSM | 注释 |
| --- | --- | --- |
| 观测数据 $x$ | 观测序列 $o_{1:T}$ 和动作序列 $a_{1:T}$ | RSSM输入为$a$，输出为$o$ |
| 潜变量 $z$ | 潜状态序列 $s_{1:T}$ | |
| 真实后验 $p(z \mid x)$ | 真实状态后验 $p(s_{1:T} \mid o_{1:T}, a_{1:T})$ | 给定观测与动作后，对潜状态的条件分布 |
| 近似后验 $q(z \mid x)$ | 近似状态后验 $q(s_{1:T} \mid o_{1:T}, a_{1:T})$ | 用神经网络近似难以计算的真实后验 |
| 先验 $p(z)$ | 转移模型 $p(s_t \mid s_{t-1}, a_{t-1})$ | VAE 常用标准正态先验；时序模型使用依赖历史状态和动作的条件先验 |
| 解码器／生成模型 $p(x \mid z)$ | 观测模型 $p(o_t \mid s_t)$ 和奖励模型 $p(r_t \mid s_t)$ | 从潜状态预测观测和奖励 |

## 3. 循环状态空间模型（Recurrent State Space Model，RSSM）

### 3.1 RSSM结构解析

作者发现**确定性路径**和**不确定性路径**在转移模型中都很关键，因此他将二者融合，形成了这个模型

![planet-1.png](https://img.wblyu.top/world-models/planet-1.png)

- 方块代表确定变量（是一个确定的值而非一个分布）；圆形代表随机变量
- 实线代表生成过程（从潜变量中生成观测和奖励）；虚线表示推理过程（从观测和动作反推潜变量，后验）
- 当前状态是$t_2$，$h$变量存储着历史的动作$a_{<t}$和潜状态$s_{<t}$
- 确定性模型无法很好地表示多个可能性的未来，但是可以很好的机理历史信息；随机性模型正好与它相反
- 这本质上是将潜状态拆成了两个部分，一部分负责表示随机性，一部分负责确定性的长期记忆（这和重参数化的思想有些相似）

完整的公式表达为

1. 确定性状态模型$h_t = f(h_{t-1},s_{t-1},a_{t-1})$
2. 随机性状态模型$s_t \sim p(s_t \mid h_t)$
3. 观测模型$o_t \sim p(o_t \mid h_t,s_t)$
4. 奖励模型$r_t \sim p(r_t \mid h_t,s_t)$
5. 编码器$q(s_{1:T} \mid o_{1:T},a_{1:T}) = \prod_{t=1}^{T} q(s_t \mid h_t,o_t)$

> 在后文中出于简洁性考虑，并不会特意强调$h$的存在，而是把它合并进$s$中

### 3.2 损失函数公式推导

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
=& \int \underbrace{p (s_{1:T}\mid a_{1:T})}_{\text{序列先验}} \underbrace{p (o_{1:T}\mid s_{1:T})}_{\text{观测}}  d s_{1:T}
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
D_{\mathrm{KL}} ={}& \mathbb E_q \left[ \log \frac{ q(s_{1:T}\mid o_{1:T},a_{1:T}) }{ p(s_{1:T}\mid o_{1:T},a_{1:T}) } \right]
\end{aligned}
$$

根据贝叶斯公式：

$$
p(s_{1:T}\mid o_{1:T},a_{1:T}) = \frac{ p(o_{1:T},s_{1:T}\mid a_{1:T}) }{ p(o_{1:T}\mid a_{1:T}) }
$$

想要理解这个公式，可以暂时忽略$a_{1:T}$。代入：

$$
\begin{aligned}
D_{\mathrm{KL}} = \mathbb E_q \Big[ & \log q(s_{1:T}\mid o,a) \\
&- \log p(o_{1:T},s_{1:T}\mid a) \\
&+ \log p(o_{1:T}\mid a) \Big]
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
\tag{3}
$$

1. 第一项与`VAE`中的$\mathbb E_{q(z\mid x)} [\log p(x\mid z)]$对应。它要求从后验编码器中得到的潜状态能够让观测模型对真实观测赋予较高概率。论文把这一项称为`reconstruction`
2. 第二项与`VAE`中的$D_{\mathrm{KL}} \left( q_\phi(z\mid x) \Vert p(z) \right)$对应。它要求编码器产生的近似后验不要过度偏离事先规定的潜变量先验（转移模型）。

与`VAE`类似，本文中观测模型$p(o_t\mid s_t)$是固定协方差高斯分布，因此同样可以简写成`MSE`。

> 论文中也明确指出 unit-variance Gaussian 的 log-likelihood 与 MSE 只差常数项

## 4. 潜变量多步预测(Latent Overshooting)

由于**模型容量有限**（神经网络能表达的函数复杂度是有限的）且**分布族受限**（模型里很多分布被假定为特定分布），模型在一步预测时表现良好，并不意味着在多步预测同样表现良好。因此文章将单步预测推广至多步预测，但是这并不意味着使用多步预测训练就会提高性能，比如`RSSM`使用多步预测后性能反而下降因为模型本身能力够强。

![planet-2.png](https://img.wblyu.top/world-models/planet-2.png)

- 指向阴影圆的箭头表示重建损失，波浪线指先验和后验的KL散度
- $s_{i \mid j}$ 表示在$j$步得到的第$i$步的状态，如$s_{3 \mid 1}$表示在第一步预测得到的第三步状态
- (a)表示标准的单步预测，因此不会出现$s_{3 \mid 1}$
- (b)表示多步预测，并将多步预测的结果转成观测$o$并与真实观测比较，实现预测结果监督
- (c)为本文方法。将预测结果转成观测的计算量巨大，因此不对观测结果进行对比，而是比较先验和后验的KL散度。本质上是将(a)扩展到多步从而解决(b)的缺陷

**多步预测先验（状态转移）**

首先考虑从$s_{t-d}$出发预测$s_t$，一共需要经过$d$次转移

$$
s_{t-d} \xrightarrow{a_{t-d}} s_{t-d+1} \xrightarrow{a_{t-d+1}} \cdots \xrightarrow{a_{t-2}} s_{t-1} \xrightarrow{a_{t-1}} s_t
$$

因此参与这段多步预测的动作序列为

$$
a_{t-d:t-1} = (a_{t-d},a_{t-d+1},\ldots,a_{t-1})
$$

而中间潜状态为

$$
s_{t-d+1},\ldots,s_{t-1}
$$

首先根据链式法则可知

$$
\prod_{\tau=t-d+1}^{t} p(s_\tau\mid s_{\tau-1},a_{t-d:t-1}) = p(s_{t-d:t-1} \mid a_{t-d:t-1})
$$

为了得到只关于起点$s_{t-d}$和终点$s_t$的条件分布，需要将这些中间状态全部积分掉

$$
p(s_t\mid s_{t-d},a_{t-d:t-1}) = \int \prod_{\tau=t-d+1}^{t} p(s_\tau\mid s_{\tau-1},a_{t-d:t-1}) \,ds_{t-d+1:t-1}
$$

进一步根据条件独立假设有$p(s_\tau\mid s_{\tau-1},a_{t-d:t-1}) = p(s_\tau\mid s_{\tau-1},a_{\tau-1})$，因此

$$
\boxed{
p(s_t\mid s_{t-d},a_{t-d:t-1}) = \int \prod_{\tau=t-d+1}^{t} p(s_\tau\mid s_{\tau-1},a_{\tau-1}) \,ds_{t-d+1:t-1}
}
$$

把最后一个转移$p(s_t\mid s_{t-1},a_{t-1})$单独提出来有

$$
\begin{aligned}
&p(s_t\mid s_{t-d},a_{t-d:t-1}) \\
=& \int  p(s_{t-d+1:t-1} \mid s_{t-d},a_{t-d:t-2}) p(s_t\mid s_{t-1},a_{t-1}) \,ds_{t-d+1:t-1} \\
= & \int p(s_{t-1}\mid s_{t-d},a_{t-d:t-2}) p(s_t\mid s_{t-1},a_{t-1}) \,ds_{t-1} \\
= & \mathbb E_{p(s_{t-1}\mid s_{t-d},a_{t-d:t-2})}\left[ p(s_t\mid s_{t-1},a_{t-1}) \right]
\end{aligned}
\tag{5}
$$
