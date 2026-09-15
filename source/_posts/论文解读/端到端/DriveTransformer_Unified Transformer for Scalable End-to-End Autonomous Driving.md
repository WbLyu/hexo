---
title: "DriveTransformer: Unified Transformer for Scalable End-to-End Autonomous Driving"
date: 2026-07-30 16:33:12
# updated:
# tags:
#     - 
categories: 
          - 论文解读
          - 端到端
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

---
<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/Thinklab-SJTU/DriveTransformer/',GitHub %}
{% btn 'https://arxiv.org/abs/2503.07656',ICLR 2025 %}
<!-- markdownlint-enable MD034 -->

## 1. 简介

本文贡献

1. 任务并行性，所有任务query都是直接输入和直接输出的，摆脱了序列化结构
2. 稀疏表达，摆脱了BEV特征网格，query直接与原始传感器特征交互，提高效率
3. 流式处理，维护一个先进先出的队列用以存储历史任务query，通过队列可以实现时间融合

![drivetransformer-1.png](https://img.wblv66.top/end-to-end/drivetransformer-1.png)

现有的端到端自动驾驶多是采用**感知-预测-规划**这种序列化结构，这种结构有两个问题：1.可能导致累积误差，进而导致训练不稳定。如`UniAD`方法必须采用多阶段训练策略，这是因为在训练早期存在不一致性，上游模块的不准确会影响下游模块，最终导致整个训练崩溃。2.人工设置的任务排序可能会限制系统利用协同效应的能力，例如规划感知和博弈论交互式预测与规划（几个任务间可能是彼此耦合的）

现有方法采用的是BEV特征网格（稠密表达），在时空扩展时有明显短板，即在远距离检测和存储历史BEV特征进行融合中会面临计算挑战

## 2. 相关工作

## 3. 方法

![drivetransformer-2.png](https://img.wblv66.top/end-to-end/drivetransformer-2.png)

1. 初始化Agent、Map、Ego三类稀疏Task Token
2. 多视角相机图像经过Backbone变为图像特征，结合3D位置编码构成Sensor Token
3. 将历史队列的Task Token变换到当前自车坐标系下并根据潜在运动对Agent进行补偿，得到Temporal Token
4. 3类Token输入到重复堆叠N次的Transformer blocks中，分别进行自注意力交互和交叉注意力交互
5. 输出的Token经过不同的任务头输出“检测 + 运动预测 + 在线地图 + 自车规划”的结果
6. 输出的TopK个Token会进入队列中，成为历史信息

### 3.1 初始化与Token化

受`DAB-DETR`的启发，所有Token由`语义嵌入`（semantic embedding）和`位置编码`（position encodings）两个部分组成

![drivetransformer-3.png](https://img.wblv66.top/end-to-end/drivetransformer-3.png)

图中将语义嵌入简称为了Tokens

**Sensor Tokens**

环视相机的多视角图像由`ResNet`等backbones编码为语义嵌入$\bm{H}_{sensor} \in \mathbb{R} ^{N_c \times H \times W \times D}$，分别对应相机数量、特征图的高和长、隐藏维度。给每个像素块分配一系列等距深度值，那么其在三位空间中对应的射线可以表示为$\bm{Ray}_{i,j}=\left\{ TK^{-1} [i,j,d_k] \mid k = 1,2,\cdots ,K \right\}$，其中$T,K$为相机的外内参矩阵，$i,j$为像素坐标，$d_k$为分配的深度值。随后通过MLP便得到位置编码$\bm{PE}_{sensor} \in \mathbb{R} ^{N_c \times H \times W \times D}$

**Task Tokens**

设置了三类任务queries：Agent Queries表示动态物体，进行目标检测和运动预测；Map Queries表示静态元素，进行在线建图；Ego Queries表示自车的行为，进行规划

遵循`DAB-DETR`，Agent Queries和Map Queries的语义嵌入被随机初始化为可学习参数，分别用$\bm{H}_{agent} \in \mathbb{R} ^{N_a \times D},\bm{H}_{map} \in \mathbb{R} ^{N_m \times D}$来表示，其中$N_a,N_m$为超参数。它们的位置编码在预定义的感知范围内均匀初始化，表示为$\bm{PE}_{agent} \in \mathbb{R} ^{N_a \times D},\bm{PE}_{map} \in \mathbb{R} ^{N_m \times D}$。将CAN信号中的信息经由MLP处理后作为Ego Queries的语义嵌入的初始化，即$\bm{H}_{ego} = MLP(\bm{H}_{canbus}) \in \mathbb{R} ^D$，而它的位置编码被初始化为零$\bm{PE}_{ego} = 0 \in \mathbb{R} ^D$

### 3.2 Token交互

三种注意力仅更新得到语义嵌入，位置编码的更新是根据task head 的结果更新的

![drivetransformer-4.png](https://img.wblv66.top/end-to-end/drivetransformer-4.png)

**传感器交叉注意力（Sensor Cross Attention，SCA）**，令任务和原始传感器信息间能直接交互

$$
\begin{align*}
\bm{H}_{ego}^{'},\bm{H}_{agnet}^{'},\bm{H}_{map}^{'} = SCA-Attention(Q = [\bm{H}_{ego}+\bm{PE}_{ego},\bm{H}_{agnet}+\bm{PE}_{agnet}, \\
\bm{H}_{map}+\bm{PE}_{map}],K=\bm{H}_{sensor}+\bm{PE}_{sensor},V=\bm{H}_{sensor})
\end{align*} 
$$

其中$\bm{H}^{'}$是更新后的query。通过使用3D位置编码，省去了构建BEV特征的步骤

**任务自注意力（Task Self-Attention，TSA)**，任务之间能直接交互，促进协同效应，如规划感知和博弈论交互式预测与规划

$$
\begin{align*}
\bm{H}_{ego}^{'},\bm{H}_{agnet}^{'},\bm{H}_{map}^{'} = TSA-Attention(Q =K= [\bm{H}_{ego}+\bm{PE}_{ego}, \\
\bm{H}_{agnet}+\bm{PE}_{agnet},\bm{H}_{map}+\bm{PE}_{map}],V=[\bm{H}_{ego},\bm{H}_{agnet},\bm{H}_{map}])
\end{align*} 
$$

放弃手动设计任务依赖，任务之间的交互关系可以自己学习

**时间交叉注意力（Temporal Cross Attention，TCA)**，整合历史的信息。现有范式使用历史BEV特征传递时间信息，这引入了两个缺点：1.维护长期BEV特征成本高昂；2.只传递BEV特征，带有强先验语义和空间信息的先前Task Query被丢弃了。受`StreamPETR`启发，为每个Task分别维护先进先出（FIFO）query队列

维护的队列是时间纬度的，假设当前的时间步为$t_0$，那么FIFO队列为
$$
Queue_{task} = \left\{ (\bm{H}_{task}^t , \bm{PE}_{task}^t) \mid t = t_0-1,t_0-2,\cdots,t_0-T_{queue} \right\}
$$

其中$T_{queue}$为超参数，表示队列长度。当$t_0$时间步的Task Query加入时，$t_0-T_{queue}$的Task Query会被弹出。由于`DETR`的方法中query有冗余，因此对于Agent Query和Map Query，只有top-K置信度的query会被保留，$K$是超参数

由于自车一直在移动，历史query的位置编码需要变换到当前位置的自车坐标系下

$$
\hat{\bm{PE}}^t = MLP(T_t^{t_0} \bm{Pos}^t)
$$

式中$Pos$为原始位姿信息。对于Agent Query来说，由于Agent本身也存在运动，因此需要进一步补偿。参考`DiT`中的`ada-LN`

$$
\hat{\bm{PE}}^t_{agent} = LayerNorm(\bm{PE}^{\hat{t}}_{agent},[\gamma , \beta ]=MLP(v^t_{agent}*(t-t_0)))
$$

其中$\bm{PE}^{\hat{t}}_{agent}$为经过ego补偿后的位置编码。定义时间嵌入$t_{emb}=MLP(t-t_0)$来表示不同时间步

$$
\begin{align*}
\bm{H}_{task}^{'} = TCA-Attention(Q = \bm{H}_{task}+\bm{PE}_{task}^t,K = \bm{H}_{task}+\hat{\bm{PE}}_{task}^t+t_{emb}, V=\bm{H}_{task}^t)
\end{align*} 
$$

每一个注意力模块是由TSA、TCA、SCA三个部分组成的，通过堆叠多层注意力模块便实现了`DriveTransformer`。多层模块中共用相同的传感器token和历史信息队列

![drivetransformer-5.png](https://img.wblv66.top/end-to-end/drivetransformer-5.png)

### 3.3 DETR风格任务头

受`DETR`启发，在每层模块之后设置任务头以逐步细化预测，并相应地更新位置编码

![drivetransformer-6.png](https://img.wblv66.top/end-to-end/drivetransformer-6.png)

**目标检测与运动预测**，现有的端到端方法仍然采用经典的检测-关联-预测流程，由于关联本身固有的难度，这给训练带来了不稳定性。为了解决这个问题，将相同的Agent Query送到不同的任务头进行检测和预测，并且预测的标签被转换到agent的局部坐标系下，于是检测和预测彼此独立，二者的结果不会互相影响。当推理时，预测结果需要与检测结果结合，得到全局坐标系下的结果

**在线建图**，最新研究进展表明，考虑到地图元素折线的不规则且多样分布，采用点级特征比实例级的特征更有意义。因此在进行Sensor Cross Attention时，将每个Map Query复制$N_{point}$次，并与每个单点的位置编码配对，实现了将实例级离散为点级。其他模块需要实例级query，因此点级还要经过`PointNet`再次恢复为实例级

**规划**，为避免模式平均，利用高斯混合模型来建模自车的未来运动。根据运动的方向和距离，将轨迹分为六大类：直行、停车、左转、急左转、右转、急右转。将六个模式的正弦和余弦编码位置输入到MLP中得到六个模式嵌入，添加到ego特征中，最后再用轨迹预测头输出未来轨迹，可以得到六个轨迹。在训练时仅使用真值模式下的轨迹计算损失。同时还训练一个分类头来预测当前模式，在推理期间，将使用置信度得分最高的模式对应的轨迹

**从粗到细优化**，所有任务query的位置编码会在每个模块之后进行更新。即各个任务head的输出结果经MLP编码后会更新对应的位置编码。训练时对每层模块的任务头都计算损失，推理时仅使用最后一层模块的输出