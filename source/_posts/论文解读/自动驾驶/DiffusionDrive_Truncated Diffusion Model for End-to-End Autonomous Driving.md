---
title: 'DiffusionDrive: Truncated Diffusion Model for End-to-End Autonomous Driving'
date: 2026-11-6 19:53:59
# updated:
# tags:
#     - 
categories: 
            - 论文解读
            - 自动驾驶
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
cover: https://img.wblyu.top/images/10f757b819b97a135417f06013c9e26f.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hustvl/DiffusionDrive',GitHub %}
{% btn 'https://arxiv.org/abs/2411.15139',CVPR 2025 %}
<!-- markdownlint-enable MD034 -->

---

> 思考

论文存在的问题：

1. 论文提出的方法虽然具有多模态，但是真值轨迹仅有一条，无法约束其他模式轨迹的质量

论文的价值：

## 1. 引言

扩散模型能够建模多模态的动作分布。但是扩散模型中需要大量去噪步骤，难以用实时速度生成多样化驾驶动作

- 主流的端到端规划器通常回归出一条单模态轨迹，这种范式没有考虑到驾驶行为固有的不确定性和多模态性
- VADv2引入了一个大规模固定的锚点轨迹（anchor trajectories）词表（vocabulary），但是这种范式受制于锚点轨迹的数量和质量，在词表外场景会失效；管理大量锚点还会带来显著计算负担，难以实时应用

> 这里的anchor trajectories是指一条具有代表性的轨迹；而vocabulary是指由许多anchor trajectories组成的轨迹集合

作者将机器的扩散策略引入单模态回归方法`Transfuser`，得到了`TransfuserDP`。在结构上是将确定性的MLP回归头替换为条件扩散模型。但是这有两个关键难题

1. 大量的去噪步骤给推理过程引入了繁重的计算负担
2. 从不同高斯噪声中采样得到的轨迹几乎彼此重叠，丧失了多模态特性，作者称之为模式坍塌（Mode Collapse）

![diffusiondrive-1.png](https://img.wblyu.top/world-models/diffusiondrive-1.png)

人类驾驶员实际上是遵循既有的驾驶模式的，根据这一观点，可以将高斯分布划分为以先验锚点为中心的多个高斯子分布（即锚定高斯分布，Anchored Gaussian Distribution），将这些先验驾驶模式嵌入扩散策略中。因此加噪过程无需得到近似标准高斯分布，去噪也无需从标准高斯噪声开始，论文称其为截断扩散（Truncated Diffusion）

也就是说这篇论文认为，**驾驶轨迹并不是完全随机的而是有明显先验模式的**。因此这篇论文给不同的Anchor Trajectory加噪，形成多峰混合高斯分布，   也就是Anchored Gaussian Distribution。而传统的扩散模型需要从标准高斯噪声中恢复出驾驶轨迹，需要进行大量去噪步骤（20步），本论文只需给不同的Anchor Trajectory增加少量噪声，并进行少量去噪就能恢复出驾驶轨迹（2步）

> 此论文应用的是条件扩散模型，因此扩散过程会受到感知条件的影响，并不会简单还原成原来的Anchor Trajectory

得益于扩散模型的多模态分布能力，所提出的阶段扩散模型无需像VADv2一样依赖大量anchor，便可以覆盖潜在的动作空间

本文贡献

- 提出一种新颖的截断扩散策略，以解决模式崩溃和计算开销大的问题

## 3. 方法

### 3.1 基础知识

轨迹被表示为一系列路径点$\tau = \left\{ (x_t,y_t) \right\}_{t=1}^{T_f}$，这里的$(x_t,y_t)$是当前自车坐标系下的坐标

> 这里用的是轨迹（trajectory）而不是路径(path)，是因为输出的是车辆在未来不同时间点的位置，隐含时间信息

扩散模型的前向加噪过程可以定义为

$$
q(\tau^i \mid \tau^0) = \mathcal{N}(\tau^i ; \sqrt{\bar{\alpha}^i}\tau ^0,(1-\bar{\alpha}^i)\bm{I})
$$

扩散模型需要训练一个反向过程$f_{\theta}(\tau ^i,z,i)$，其中$z$为条件信息，代表空间特征、交通参与者特征以及道路地图特征等环境信息，用以引导轨迹生成；$\theta$为模型参数。在推理过程中，$f_{\theta}$会在$z$的引导下从高斯分布中采样的随机噪声$\tau ^T$逐步细化至干净数据$\tau^0$

$$
p_{\theta}(\tau_0 \mid z) = \int p(\tau^T) \prod_{i=1}^{T} p_{\theta}(\tau^{i-1} \mid \tau ^i ,z) d \tau^{1:T}
$$

### 3.2 研究

**模式崩溃**

在`TransfuserDP`中，从高斯分布中随机采用出$20$个噪声，并经过$20$步去噪后恢复出轨迹，但是不同的随机噪声收敛到相似的轨迹。为了定量分析模式坍塌现象，论文定义了一个模式多样性得分$\mathcal{D}$，其基于每条去噪轨迹与所有去噪轨迹的并集之间的平均交并比（mIoU）

$$
\mathcal D=1-
\frac{\sum_{i=1}^N\operatorname{Area}(\tau_i)}
{N\cdot\operatorname{Area}\left(\bigcup_{j=1}^N\tau_j\right)}
$$

如果轨迹彼此重合，并集面积变小，$\mathcal D$也会变小，完全重合时$\mathcal D$变为$0$。$\operatorname{Area}$的具体实现论文并未提及

### 3.3 截断扩散

截断扩散模型的去噪过程是从锚点高斯分布开始的而不是从标准高斯分布开始的，因此加噪过程也不需要变成标准高斯分布

$$
\tau _k^i=\sqrt{\bar{\alpha}^i}\bm{a}_k+ \sqrt{1- \bar{\alpha}^i} \bm{\epsilon}, \quad \bm{\epsilon} \sim  \mathcal{N}(0,\bm{I})
$$

其中$i \in [1, T_{trunc}], \quad T_{trunc} \ll T$

扩散解码器接收噪声轨迹$\{\tau_k^i\}_{k=1}^{N_{anchor}}$并输出预测分类分数$\{\hat{s}_k\}_{k=1}^{N_{anchor}}$和去噪后的轨迹$\{\hat{\tau}_k\}_{k=1}^{N_{anchor}}$

$$
\left\{ \hat{s}_k,\hat{\tau}_k \right\}_{k=1}^{N_{anchor}} = f_{\theta}(\{\tau_k^i\}_{k=1}^{N_{anchor}},z)
$$

训练损失函数定义为

$$
\mathcal{L} = \sum_{k=1}^{N_{anchor}} \left[ y_k \mathcal{L}_{rec}(\hat{\tau}_k,\tau _{gt})+ \lambda \operatorname{BCE}(\hat{s}_k,y_k) \right] 
$$

- 公式是将轨迹回归和轨迹分类这两个任务结合起来
- $\tau _{gt}$为真值轨迹
- $\hat{\tau}_k$为第$k$条 Anchor 对应的预测轨迹
- $y_k$为正负样本标签，最接近真值的轨迹取$0$其余为$1$
- $\hat{s}_k$为预测轨迹的置信度得分
- $\mathcal{L}_{rec}$为轨迹重建损失$L_1$
- 回归损失前乘上$y_k$，因此只对最接近真值的带噪 Anchor 进行回归监督，防止不同带噪 Anchor 收敛到同一种驾驶行为，保持生成多模态轨迹的能力
- $\operatorname{BCE}$为二元交叉熵（Binary Cross-Entropy），期望输出的分类分数与正负样本标签接近，也就是提高正样本对应轨迹的得分，降低负样本对应轨迹的得分

> 真值只有一个，所以学到的置信度分数只是反映出候选驾驶行为与专家示范的匹配程度，并非轨迹的安全性分数

**推理**

论文在推理中使用了两步去噪法：

1. 对初始带噪轨迹$\tau^{i_{\mathrm{start}}}$进行第一次Decoder前向传播，得到$\hat{\tau}_0^{(1)}$和$\hat{s}^{(1)}$
2. 进行第二次Decoder前向传播，得到$\hat{\tau}_0^{(2)}$和$\hat{s}^{(2)}$

> Decoder 并不像传统DDPM一样预测噪声，而是直接预测出干净的轨迹，但其实这里输出的并不是真正的轨迹，而是相对于带噪 Anchor 的偏移

**推理的灵活性**

在推理时，并非每条带噪 Anchor 只能恢复一条轨迹，而是可以灵活调整的

### 3.4 结构

![difusiondrive-2.png](https://img.wblyu.top/world-models/difusiondrive-2.png)

主要包含三个部分

1. 轨迹先验：给 Anchor Trajectories 加噪，然后进行采样，得到$N_{\text{infer}}$条带噪轨迹
2. 环境感知：通过感知模块将传感器数据转化为BEV/PV以及Agent Map Feature
3. 级联扩散解码：通过扩散解码输出轨迹修正量和置信度

**带噪轨迹**

对带噪轨迹进行位置编码并通过编码器转为Query，每条轨迹对应一个Query

**空间交叉注意力**

为了让去噪过程能够考虑到BEV/PV的信息，论文中对轨迹与空间特征执行可变形空间交叉注意力机制，即在轨迹点附近进行特征交互

**Agent/Map 交叉注意力**

BEV/PV 中的信息是隐式的，而 Agent/Map Query中的信息是显示的，因此还需要与 Agent/Map Query 进行交互

随后进行连接前馈网络（FFN）以及Timestep Modulation。Timestep Modulation用以将去噪时间步信息编码进去

**级联扩散模型**

这个设计是为了堆叠多个 `Decoder Layer`，逐层修正轨迹。论文中设计了两个`Cascade Decoder Layer`，每层包含两步去噪。而两个`Cascade Decoder Layer`之间用`DDIM`相连。这里的DDIM（Denoising Diffusion Implicit Models）是 DDPM 的一种快速采样方法，通过改变反向采样方式，减少去噪步骤