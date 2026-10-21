---
title: 'V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning'
date: 2026-10-13 22:19:03
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

> 思考  
> V-JEPA 2预训练时编码器的输入是连续多帧视频，但是训练世界模型时编码器的输入是每一帧单独的图像。因此后者并没有充分利用编码器对连续视频的编码能力（捕获时空特征），这可能是作者在工程上的妥协

## 2. 视觉编码器

我们希望模型通过观看视频，学习视觉表征。但是视频并不包含动作指令等标签，因此采用自监督学习。`V-JEPA 2`采用的方法是：遮挡视频中的部分时空区域，要求模型根据剩余可见区域的特征，预测被遮挡区域的特征。这就是论文中提及的表征空间中的掩码去噪（Mask-Denoising in Representation Space）

### 2.1 整体思路

这里训练视觉编码器的阶段被称为预训练，主要包含三个网络

| 网络 | 符号 | 作用 | 参数如何更新 |
| --- | --- | --- | --- |
| Context Encoder | $E_{\theta}$ | 编码可见视频区域 | 梯度下降 |
| Predictor | $P_{\phi}$ | 预测被遮挡区域的特征 | 梯度下降 |
| Target Encoder | $E_{\bar\theta}$ | 提供预测目标 | EMA 更新 |

`Context Encoder`与`Context Encoder`的架构完全相同，只是参数不同；这里的`Predictor`虽然是预测器，但是并不是预测未来的潜状态，而是预测遮挡区域，可以理解为掩码去噪器

令完整的视频片段为$y=(o_1,o_2,\dots,o_T)$，首先需要将视频分割成一系列的时空patch，假设共得到$N$个token $y=\{p_1,p_2,\dots,p_N\}$，接着随机遮挡一部分 token，保留剩余未被遮挡的 token，构成 Context Encoder 的输入$x$，假设被遮挡位置的索引集合为$\mathcal M$。因此$x$和$y$来自同一段视频，只是可见的信息量不同

Context Encoder 负责将遮挡处理后的剩余token映射为特征向量，内部还会进行自注意力处理

$$
z_x=E_\theta(x), \quad z_x \in \mathbb{R} ^{N_v \times D}
$$

其中$N_v$为可见 token 的数量，$D$为编码器输出的特征维度

Target Encoder 负责将完整的token映射为特征向量

$$
z_y=E_{\bar \theta}(y), \quad z_y \in \mathbb{R} ^{N \times D}
$$

Predictor 预测时只需预测被遮挡的位置，因此只提取被遮挡位置的 Target Encoder 输出

$$
z_y^{\mathcal M} = \left\{ [E_{\bar\theta}(y)]_i \mid i\in\mathcal M \right\}
$$

这些特征向量就是训练时的监督目标。

Predictor负责根据可见区域预测被遮挡区域，但是Predictor 需要知道自己应该预测哪个位置，因此还要引入Learnable Mask Token $\Delta _y$，负责结合位置信息告诉模型需要预测哪些时空区域

$$
\hat z_y^{\mathcal M} = P_\phi(\Delta_y,E_\theta(x))
$$

### 2.2 目标函数

$$
\min_{\theta,\phi,\Delta_y} \left\| P_\phi(\Delta_y,E_\theta(x)) - \operatorname{sg}(E_{\bar\theta}(y)) \right\|_1
$$

此式是让Predictor根据可见的视频特征预测被遮挡位置的特征，并使预测结果尽可能接近Target Encoder的输出。损失函数用于更新Predictor、Encoder的网络参数以及掩码Token $\Delta _y$

**阻断梯度与指数移动平均**

作者提及使用阻断梯度（stop gradient, sg）和指数移动平均（exponential moving average, EMA）操作来降低表征坍塌的风险

表征坍塌是指模型有可能只输出常量，这样损失最小，但实际上什么特征都没学到。这里主要是指数移动平均发挥作用，保证预测和监督中的编码器保持差异，阻断梯度主要是因为它是监督值，不应该视为梯度传播途径。EMA的公式为

$$
\bar\theta_{k+1} = m\bar\theta_k+(1-m)\theta_{k+1}
$$

### 2.3 网络架构

Encoder和Predictor皆是采用`ViT`架构

**Tubelet Embedding**

DINO-WM中将图片划分为多个patch，并映射为不同的特征向量；这里要处理视频，还需要考虑时间维度，论文中采用了$2 \times 16 \times 16$的Tubelet，也就是每个Tubelet包含连续两帧中相同位置的$16 \times 16$像素区域。因此进入Transformer之前的完整视频 Token 序列可以表示为$Z_0\in\mathbb R^{N\times D}$其中$N$为这段视频划分得到的Tubelet个数，$D$为Token维度

**3D Multi-Block Masking**

论文中采用的掩码策略是首先在空间维度采样若干连续的矩形区域，然后将这些遮挡区域沿整个时间维度重复

因为视频中存在很强的时间冗余性。有时模型可能只需要从邻近帧直接复制类似的特征就能完成预测，而不必真正学习复杂的场景关系。进行时间维度的掩码后，模型就必须更多地利用周围区域的上下文信息进行推断

论文中采用由 8 个较小空间块构成的 short-range mask，以及由 2 个较大空间块构成的 long-range mask。多个区域允许重叠，最终取并集形成掩码

**3D-RoPE**

因为一个视频 Token 不仅有空间位置，还有时间位置，可以用三个坐标表示$p_i=(t_i,h_i,w_i)$。这三个坐标分别表示时间位置、垂直空间位置、水平空间位置

作者将注意力特征维度划分为三个近似相等的部分，分别对时间、高度和宽度坐标应用一维 RoPE 旋转，可以写成：

$$
R(t,h,w) =
\begin{bmatrix}
R_t(t)&0&0\\
0&R_h(h)&0\\
0&0&R_w(w)
\end{bmatrix}
$$

这里的$R_t,R_h,R_w$是对应坐标轴的旋转变换。上式是为了说明分块结构，并省略了实际实现中的特征维度对齐细节

### 2.4 评估训练效果

论文中并不直接使用Loss评价Encoder，而是冻结 Encoder，在其输出特征上训练一个小型任务网络（Attentive Probe），然后通过六个视觉分类任务的准确率衡量表征质量

用Loss评价有几个问题

1. 损失受到Encoder和Predictor的共同影响
2. 目标也是通过学习得到的，Loss降低不意味着表征质量提高
3. 模型可能擅长利用邻近视频帧之间的相似性，不一定就学到了表征能力

可以冻结预训练的 Encoder，仅训练一个下游分类网络，检验 Encoder 提取的特征是否适合完成任务。这种评估方法也叫 Probe-based Evaluation（基于探针的评估），在自监督表征学习中非常常见

完成自监督预训练后得到 Encoder $E_{\theta^*}$。接下来，我们有一个动作分类数据集$\mathcal D=
\{(V_i,c_i)\}_{i=1}^{N}$。其中$V_i$为第$i$段视频；$c_i$为该视频的真实动作类别。

首先使用冻结的Encoder提取视频特征$Z_i$。然后，把这些特征输入 Attentive Probe

$$
\ell_i=C_\psi(Z_i),\quad \ell_i\in\mathbb R^K
$$

$K$是任务的类别数，$\ell_i$是每个类别对应的 Logit。然后通过 Softmax 得到分类概率：

$$
p_\psi(c\mid V_i) = \operatorname{softmax}(C_\psi(Z_i))_c
$$

再使用真实类别标签计算交叉熵损失：

$$
\mathcal L_{\text{probe}}(\psi) = -\frac{1}{N} \sum_{i=1}^{N} \log p_\psi(c_i\mid V_i)
$$

训练完成后在验证集或测试集上计算分类准确率。如果准确率较高，说明这个Encoder学到了具有较强下游迁移能力的视觉表征

## 3. 动作条件动力学

前面已经训练得到了视觉编码器$z = E_\theta (x)$。这部分要训练动作条件预测器

$$
\hat{z}_{k+1} =P_\phi((a_t,s_t,z_t)_{t \leq k})
$$

其中$z_t$为视觉特征，$s_t$为末端执行器的状态，$a_t$为动作

### 3.1 世界模型的输入

数据集来自`DROID`，数据中包括操作中的RGB图像和每一帧对应的末端执行器状态，不包含奖励等额外信息

**图像输入**

每次训练，从数据集中随机采样一个视频片段，采样设置为：

|参数|数值|
|-|-|
|视频片段时长|4 秒|
|采样帧率|4 FPS|
|每段帧数|16|
|图像分辨率|$256\times256$|
|相邻采样间隔|0.25 秒|

对每帧图像进行随机缩放裁剪，作者使用的裁剪宽高比范围为$(0.75,1.35)$

**状态**

作者将机械臂末端执行器的状态定义为一个 7 维向量：

$$
s_k=
\begin{bmatrix}
p_x&p_y&p_z&
r_x&r_y&r_z&
g
\end{bmatrix}^{\top}
$$

其中：

- 前3维为末端执行器在机器人基座坐标系下的笛卡尔位置。
- 中间3维为使用外旋欧拉角表示的末端姿态。
- 最后1维为夹爪状态。

所以这些信息均为本体感知状态

**动作**

论文中的动作直接通过相邻两帧末端执行器状态的变化得到

$$
a_k = s_{k+1}-s_k
$$

### 3.2 将图像编码为特征

论文中将预训练的视频编码器当作图像编码器，**逐帧**提取特征。编码器训练时的输入是一段视频，为了保持输入维度一致，将一帧图片复制多次

编码时Encoder被冻结，只有 Predictor 需要通过梯度下降训练

### 3.3 损失函数

论文中的损失函数为

$$
\mathcal L(\phi) = \mathcal L_{\mathrm{teacher-forcing}}(\phi) + \mathcal L_{\mathrm{rollout}}(\phi)
$$

**教师强制损失**

它的核心思想是：训练过程中，每个时刻都将真实历史数据提供给模型，而不是将模型上一步的预测结果作为下一步输入。简单理解便是模型仅进行单步预测

$$
\begin{aligned}
\mathcal L_{\mathrm{TF}}(\phi)
&=\frac1T\sum_{k=1}^{T}
\|\hat z_{k+1}-z_{k+1}\|_1\\
&=\frac1T\sum_{k=1}^{T}
\left\|
P_\phi\left(
(a_t,s_t,E(x_t))_{t\leq k}
\right)
-E(x_{k+1})
\right\|_1
\end{aligned}
$$

每段视频有16帧，所以一共可以构造15个单步预测。Teacher Forcing的优点是训练稳定，缺点是训练时的单步预测与实际使用的多步预测不符，存在输入分布差异，这也被称为暴露偏差（Exposure Bias）

**试错展开损失**

模型还要计算两步预测的损失，以增强模型连续推理的能力

第一步：

$$
\hat z_2=P_\phi(z_1,s_1,a_1)
$$

第二步不再使用真实的$z_2$，而是使用模型预测的$\hat z_2$：

$$
\hat z_3= P_\phi((z_1,s_1,a_1),(\hat z_2,s_2,a_2))
$$

其中$s_2$是根据$s_1$和$a_1$计算得到的。论文中定义损失函数为

$$
\mathcal L_{\mathrm{rollout}}(\phi) = \left\| P_\phi(a_{1:T};s_1,z_1)-z_{T+1} \right\|_1
$$

实际中$T$取为2

### 3.4 网络结构

论文使用的 Predictor 是一个约 300M 参数的Transformer模型。位置编码采用`3D-RoPE`，注意力机制 采用`Block-Causal Attention`

这里的Block指的是一个时间步对应的全部 Token

$$
\begin{gathered}
U_1 = (a_1,s_1,z_1) \\
U_2 = (a_2,s_2,z_2)
\end{gathered}
$$

Block-Causal Attention 要求：第 1 个时间步的 Token 只能访问第 1 个时间步；第 2 个时间步的 Token 可以访问第 1、2 个时间步如此递推

## 4. 规划

核心公式为

$$
\mathcal E(\hat a_{1:T};z_k,s_k,z_g) = \left\| P_\phi(\hat a_{1:T};s_k,z_k)-z_g \right\|_1
$$

即根据输入的动作进行预测，计算预测特征与目标特征的距离

论文希望求解：

$$
a_{1:T}^* = \arg\min_{\hat a_{1:T}} \mathcal E(\hat a_{1:T};z_k,s_k,z_g)
$$

来获取最优的动作，但是直接求解比较困难，论文采用交叉熵方法（Cross-Entropy Method，CEM）

在执行整个规划是采用MPC。但是实际实验中采用$T=1$，也就是只进行单步预测，对于复杂的任务需要人工进行子目标分解

## 5. 实验

V-JEPA 2-AC 能实现零样本迁移，但这不是跨机器人形态的泛化，而是强调新机器人实例和实验环境的迁移

### 5.1 实验设计

真实平台采用机械臂，并且采用了阻塞式控制（Blocking Control），即等待上一条指令完成才会再次规划与执行

设置动作约束$\|a_k\|_1\leq0.075$，防止动作幅度过大，导致世界模型可能无法准确预测这个动作的后果

### 5.2 基线选择

**Octo策略**

核心思路是行为克隆，直接学习策略，即从观测到动作的映射

**Cosmos**

本质上是视频生成世界模型路线，利用潜在扩散生成机制预测未来观测

### 5.3 目标位置到达实验

![vjepa2-1.png](https://img.wblyu.top/world-models/vjepa2-1.png)

可以看出

- 三个任务中，机器人最终均能将末端移动到距离目标 4 cm 以内。
- 随着控制步骤增加，实际位置误差单调减小。

论文还想进一步探索世界模型定义的特征距离，是否真的可以作为一个合理的动作优化目标

第一步：固定当前状态和目标$z_k,z_g$

第二步：只改变两个动作维度

作者令：

$$
a=(\Delta x,\Delta y,\Delta z,\ldots)
$$

只改变$\Delta x,\Delta y$，其他动作维度保持固定

因此，Energy 可以看成一个二维函数：

$$
\mathcal E(\Delta x,\Delta y) = \|P_\phi(a;s_k,z_k)-z_g\|_1
$$

第三步：观察 Energy 曲面

![vjepa2-2.png](https://img.wblyu.top/world-models/vjepa2-2.png)

论文中给出的示例为真实地使机械臂从起始位置到达目标的动作大约是$a_{\text{gt}}=(0,-0.1)$，而世界模型 Energy 的最小值大约出现在$a_{\text{pred}}\approx(0,-0.05)$，单位为米。可以看出将特征距离作为优化目标可以正确提供有用的局部动作方向

因此，V-JEPA 2-AC 在这类任务中不一定需要每一步精确预测完整目标位移，只需要提供足够可靠的局部控制方向。通过MPC逐渐迭代就能达到目标

### 5.4 抓取、持物移动和抓放任务

相较于**Octo策略**，此方法成功率大幅提高

相较于**Cosmos**，此方法计算开销大幅降级，任务成功率更高

### 5.5 局限

**对相机位置敏感**

机器人的动作是基于基座坐标系的，而相机图像受到相机外参影响，这个模型没有显示输入相机标定信息。所以从训练中推断出的外参信息只适合相同外参下的测试

在附录中的实验作者发现世界模型推断出的动作坐标方向可能会随着相机视角变化发生系统性偏转

**长时域规划的局限**

具体体现为

- 多步预测误差累积
- 规划时域越长动作优化越困难

**任务只能通过目标图像指定**

论文方法的目标是通过目标图像给出的，但是存在限制

- 不是所有任务都容易提供目标图像
- 目标图像不一定明确包含所有任务约束
