---
title: 'OccDriver: Future Occupancy Guided Dual-branch Trajectory Planner in Autonomous Driving'
date: 2026-11-16 14:59:47
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
cover: https://img.wblyu.top/images/eb9afc6d3e702ff6fd804efcb995504e.avif
---

---

> 思考

论文存在的问题：

1. 未反复进行预测与轨迹优化：当精细轨迹相较粗轨迹发生较大变化时，先前预测的 Occupancy 可能不再适用
2. 损失函数设计不太理想：占据引导损失中用预测结果来监督规划的轨迹，未使用真值监督会影响准确性；并且占据引导损失只约束自车轨迹，未约束其他Agent轨迹

论文的价值：

1. 考虑了多Agent中场景级预测会存在彼此影响的局限性，提出了 Marginal Occupancy 预测来进行缓解
2. 将向量化表征与栅格化表征有效结合
3. 论文考虑的场景信息较为全面，工作较为完整
4. 预测用Occ来做，规划用向量来做

## 1. 引言

由于**多智能体交互的复杂性**以及从传感器噪声到高层行为**不可预测性导致的不确定性**，自动驾驶的轨迹规划面临着内在挑战。虽然深度学习展现出巨大的潜力，但是有效建模未来场景中智能体之间动态且不确定的交互仍是一项艰巨任务

| 表征方法 | 优势 | 劣势 |
| --- | --- | --- |
| 栅格化表征（rasterized representations） | 可以预测未来不同位置的占据概率，便于描述场景整体变化及潜在碰撞风险 | 栅格分辨率限制了几何表示精度，而且不区分个体的占据图难以完整保留交通参与者的身份和运动信息 |
| 向量化表征（vectorized representations） | 能够显式表示各交通参与者的状态和历史轨迹，适合生成精细的规划轨迹 | 依赖目标检测与跟踪，难以直接表示未识别障碍物和连续空间占据；多交通参与者的联合交互及未来不确定性需要额外建模 |

| 交互建模方法 | 解释 | 不足 |
| --- | --- | --- |
| 多智能体强化学习（MARL） | 在仿真环境中通过多个 Agent 的交互学习驾驶策略 | 可扩展性较差，环境非平稳 |
| 图神经网络（GNN） | 将交通参与者表示成节点，利用消息传递建模相互影响 | 消息传递存在局限，Agent 增多时计算开销增加 |
| 博弈论方法（Game Theory） | 考虑不同 Agent 的策略及相互响应 | 鲁棒性不足 |
| 树搜索规划（Tree Policy Planning） | 展开不同决策对应的未来场景，通过搜索选择动作 | 鲁棒性不足 |

> MARL的环境非平稳是说多智能体强化学习中，其他车辆的策略也在不断变化，因此自车采取相同的动作，其他车辆的行为也会不同，因此环境不再稳定，令强化学习更加困难  
> GNN的消息传递存在局限是说，如果GNN只进行一轮邻居间的消息传递，而且图中只有 A-B、B-C 两条边，那么 A 通常无法直接获得 C 的信息

现有规划方法倾向于生成候选轨迹后直接评价和选择

当前交通场景 ➡️ 生成候选轨迹 ➡️ 对候选轨迹评分 ➡️ 选择最终轨迹

这种范式缺乏在单次规划过程中**利用显式未来场景预测来修正初始候选轨迹**的机制

![occdriver-1.png](https://img.wblyu.top/world-models/occdriver-1.png)

## 3. 方法

### 3.1 问题表述

传统轨迹规划的输入为

$$
X=\{E,A,S,M_{\mathrm{map}}\}
$$

- $E$表示自车过去$T_h$时间内的历史状态
- $A$表示周围动态Agent的历史状态
- $S$表示静态物体的状态
- $M_{\mathrm{map}}$表示高精地图

> 这里采用的坐标系为自车坐标系，因此历史所有时刻的状态都需要变换到自车坐标系下；OccDriver 使用的是结构化场景状态，而不是直接以原始摄像头图像作为输入

传统轨迹规划的输出为

$$
Y=\{(y_i,\pi_i)\mid i=1,\ldots,M\}
$$

- $M$为预测的轨迹模态数量
- $y_i$为第$i$个模态下，自车未来$T_f$时间内的轨迹
- $\pi_i$为对应轨迹的置信度分数

引入 Occupancy 分支之后，额外给栅格化分支的输入为

$$
X_{\mathrm{occ}}= \{O_e^0,O_a^0,O_m,FL^0\}
$$

- $O_e^0$表示当前自车 Occupancy
- $O_a^0$表示当前其他 Agent 的 Occupancy
- $O_m$表示地图 Occupancy
- $FL^0$表示当前 Backward Flow

这里的Backward Flow是用来描述物体的运动信息的，定义为

$$
FL^t(x_t,y_t) = (x_{t-1}-x_t,\ y_{t-1}-y_t)
$$

因此，**Occupancy + Flow 可以同时描述物体的空间占据和运动变化**

Occupancy 分支的预测为

$$
Y_{\mathrm{occ}}
=
\{(O_{e,i},O_{a,i},FL_i)
\mid i=1,\ldots,M\}
$$

- $O_{e,i}$表示第$i$个模态下，自车未来的Occupancy
- $O_{a,i}$表示第$i$个模态下，其他 Agent 未来的 Occupancy
- $FL_i$表示第$i$个模态下，未来场景的 Backward Flow

> 这三个输出均覆盖未来预测时域$T_f$；预测未来Occ是为了表示未来哪里有车，预测未来Backward Flow是为了表示未来那里的车从哪里来

最后将两个分支合并

$$
Y,Y_{\mathrm{occ}}
=f(X,X_{\mathrm{occ}}\mid\theta)
$$

> 这里只是沿用了已有的 Backward Flow 设计，并不是说它比Forward Flow更优。在之前的方法中 Forward Flow 是一个当前位置指向多个可能未来位置，而 Backward Flow 是多个可能未来位置分别指向同一个过去位置，后者一个网格只需存储一个向量。但是这里每个模态是分开的，Forward Flow 和 Backward Flow没什么区别

### 3.2 双分支架构

#### 3.2.1 场景信息编码

**向量化场景编码**

前面已经知道，模型的向量化输入为$X=\{E,A,S,M\}$。首先使用不同的 Encoder 分别编码这些输入

$$
\{E,A,S,M\}
\longrightarrow
\{F_E,F_A,F_S,F_M\}
$$

- $F_E$为自车的历史状态特征
- $F_A$为其他动态 Agent 的历史状态特征
- $F_S$为静态物体特征
- $F_M$为地图元素特征

这里使用不同的编码器是因为输入的类型各不相同，编码后给特征加入位置编码并拼接起来，得到$F_{\mathrm{vec}}\in\mathbb R^{(1+N_A+N_S+N_M)\times D}$，这里自车的数量为$1$，$N$代表对应类型的数量

**栅格化场景编码**

栅格化分支使用两个独立的 Swin-Transformer进行编码

$$
\begin{gathered}
O^0 = \{O_e^0,O_a^0,O_m,\}
\longrightarrow
F_o \\
FL^0 \longrightarrow F_f
\end{gathered}
$$

$F_o$ 和 $F_f$ 分别包含 Occupancy 和 Flow 的空间特征。两者拼接之后，再通过 MLP 融合，得到栅格场景特征$F_s \in \mathbb{R} ^{(H/4) \times (W/4) \times D}$，这里的$H,W$代表输入的Occ网格的尺寸

现在我们有两组特征$F_{\mathrm{vec}}, F_s$，论文中通过交叉注意力机制将向量信息融入栅格化空间中

$$
F_s=\operatorname{CrossAttn}(F_s,F_{\mathrm{vec}},F_{\mathrm{vec}})
$$

然后通过自注意力机制让不同空间位置之间进行交互

$$
F_{\mathrm{occ}}=\operatorname{SelfAttn}(F_s)
$$

#### 3.2.2 迭代解码结构

作者设计了三个依次执行的 Decoder：

$$
D_c\rightarrow D_s\rightarrow D_f
$$

- $D_c$为Coarse Trajectory Decoder，初步预测自车及其他Agent的未来轨迹特征
- $D_s$为Future Scene Decoder，预测候选轨迹条件下的未来场景
- $D_f$为Fine Trajectory Decoder，根据预测出的未来场景细化轨迹

**Coarse Trajectory Decoder**

引入一组$M$个可学习的Query $Q_m \in \mathbb{R} ^{M \times D}$并与自车和其他Agent的向量特征$\{ F_E,F_A \} \subset F_{\mathrm{vec}}$结合，形成$Q_{\mathrm{vec}} \in \mathbb{R} ^{M \times (N_A+1) \times D}$

> 这里的$M$代表模态的数量，用以区分不同的纵向运动模式，即未来行驶的不同距离代表不同的模态

Coarse Trajectory Decoder主要包含三个Attention操作

1. 在每个模态内部，对自车及其他 Agent 的 Query 进行 Self-Attention
2. Query 读取静态物体和地图特征$K,V=\{F_S,F_M\}$
3. Query 进一步读取栅格场景特征$K,V=F_{\mathrm{occ}}$

最终得到粗轨迹的潜在特征$Q_c$，这里不只是解码自车轨迹，而是联合解码自车与其他 Agent 的未来运动

总结为

$$
Q_c=D_c(Q=Q_{\mathrm{vec}},K,V=F_{\mathrm{occ}},\{F_S,F_M\})
$$

**Future Scene Decoder**

论文希望构建一个以候选轨迹为条件的世界模型

$$
Q_s=D_s(Q=F_{\mathrm{occ}},K,V=Q_c,\{F_S,F_M\})
$$

得到未来Occ场景特征

**Fine Trajectory Decoder**

得到未来场景特征$Q_s$后，作者将其重新引入向量化轨迹规划分支：

$$
Q_f=D_f(Q=Q_c,K,V=Q_s,\{F_S,F_M\})
$$

粗轨迹特征$Q_c$现在能够利用预测的未来场景信息，重新调整轨迹特征

经过三个 Decoder，我们得到$Q_c, Q_s, Q_f$，但这些都只是特征，还需要 Prediction Heads 生成实际结果

| 输入特征 | 预测头 | 输出 |
| --- | --- | --- |
| $Q_c$ | MLP | 粗轨迹$Y_c$ |
| $Q_f$ | 两个 MLP | 精细轨迹$Y$以及置信度$\pi$ |
| $Q_s$ | Upsample + 2D CNN | 未来 Occupancy 和 Backward Flow |

精细轨迹每个轨迹点包含六个变量：

$$
(x,y,\cos\theta,\sin\theta,v_x,v_y)
$$

> 这里本质上并非迭代，而是三个串行Decoder，更像是Coarse-to-Fine Refinement而不是反复进行预测-优化的迭代规划；为了避免捷径偏差（Shortcut Bias），防止模型过渡依赖历史信息不学习经过验证的规划方案，实际上自车$E$只使用当前状态，没使用历史状态

### 3.3 边缘占用分布预测

在3.2中预测的是 Joint Occupancy，这强调场景中各个Agent的运动相互协调，这是场景级的预测。作者**认为场景级的预测中自车和其他Agent的预测结果会彼此影响，因此不能完全依赖场景模态中的预期交互结果。特别是在短期内，还应该考虑单个 Agent 可能采取的其他行为**。基于此，作者提出了Marginal Occupancy（边缘占用），只关注单个 Agent $i$ 的未来占据可能性，不显式区分完整场景模态，用以补充潜在风险

首先进行**交通参与者筛选（Agent Pruning）**

并不是考虑场景中的所有Agent，只筛选关键Agent

$$
\{F_i\}=\operatorname{Prune}(F_A)
$$

为了获得训练标签，论文使用训练数据中的真实未来轨迹来标注 Agent 的交互角色

然后进行**Marginal Occupancy Encoder**

$$
F_{m,i}=f_m(F_s,F_i)
$$

- $F_s$为融合向量信息后的栅格特征向量
- $F_i$为第 $i$个 Agent 的向量化特征
- $F_{m,i}$针对 Agent $i$ 的空间特征

这里采用 Cross-Attention 和 Self-Attention

$$
\operatorname{CrossAttn}(F_s,F_i,F_i)
$$

最后**生成 Marginal Occupancy**

$$
O_{m,i}
=
\operatorname{Conv}(\operatorname{Upsample}(F_{m,i}))
$$

注意这里只预测短期 $T_s$，而不是完整未来时域 $T_f$。因为作者主要希望处理临近的突发风险。随着预测时域增加，单个 Agent 的行为不确定性往往也会增加，如果长期都采用保守的边缘占据约束，可能让自车过度减速甚至无法正常通行

> 短期考虑更保守的边缘占据风险，长期主要依赖与规划模态一致的联合占据；Marginal 分支只在训练时使用，在训练时会影响损失函数，起到额外监督的功能

### 3.4 训练损失

总损失为

$$
\mathcal L=
\mathcal L_{\mathrm{traj}}
+\mathcal L_{\mathrm{occ}}
+\mathcal L_{\mathrm{oi}}
+\mathcal L_{\mathrm{og}}
$$

| 损失函数 | 作用 | 主要约束对象 |
| --- | --- | --- |
| $\mathcal L_{\mathrm{traj}}$ | 监督预测轨迹接近真实轨迹 | 轨迹分支 |
| $\mathcal L_{\mathrm{occ}}$ | 监督未来 Occupancy 和 Flow 预测 | Occupancy 分支 |
| $\mathcal L_{\mathrm{oi}}$ | 减少自车与其他 Agent 的预测占据冲突 | Occupancy 预测 |
| $\mathcal L_{\mathrm{og}}$ | 利用未来占据预测指导轨迹生成 | 精细轨迹 |

**占据干涉损失（Occupancy Interference Loss）**

$\mathcal L_{\mathrm{oi}}$的出发点是同一时刻自车与其他Agent不能占据同一物理空间

$$
\begin{aligned}
\mathcal L_{\mathrm{oi}} &= \mathcal L_{\mathrm{oe}} + \mathcal L_{\mathrm{oa}} \\
&= \frac{\operatorname{sum}(O_e^*\cdot O_a^{gt})}{\operatorname{sum}(O_a^{gt})} + \frac{ \operatorname{sum}(O_a^*\cdot O_e^{gt})
} {\operatorname{sum}(O_e^{gt})}
\end{aligned}
$$

- $O_e^*,O_a^*$为预测的自车和其他 Agent Occupancy
- $O_e^{gt},O_a^{gt}$为对应的真实 Occupancy
- $\cdot$为逐网格相乘
- $\operatorname{sum}$为对相关的时间和空间网格求和

$\mathcal L_{\mathrm{oe}}$是检查自车预测是否侵入其他车辆真实区域；$\mathcal L_{\mathrm{oa}}$正好反过来，是检查其他车辆预测是否侵入自车真实区域。这里令预测值与真实值相乘，本质是采用`Teacher-forcing`思路，防止两个预测值相乘导致训练不稳定

**占据引导损失（Occupancy Guidance Loss）**

$L_{\mathrm{og}}$的出发点是生成的精细轨迹需要与自车的预测 Occupancy 保持一致（场景一致性），并且还不能与其他Agent发生碰撞（安全性）

$$
\mathcal L_{\mathrm{og}}
=
w_1\mathcal L_{\mathrm{align}}
+
w_2\mathcal L_{\mathrm{collision}}
$$

规划网络输出的精细$Y$轨迹由离散状态组成，但是Occupancy 是考虑车辆尺寸的 BEV 网格。所以作者将车辆近似为$N_v$个圆。使用多个圆覆盖自车的几何形状。根据轨迹确定每个圆心的位置，然后就可以利用这些圆心在 Occupancy 上计算损失

$$
\mathcal L_{\mathrm{align}}
=
\frac{1}{T_f}
\sum_{t=1}^{T_f}
\sum_{i=1}^{N_v}
\max(0,\varepsilon-O_i^t)
$$

$O_i^t$是对应圆心所在自车Occ的占据概率，因为圆心未必落入网格正中心，这里的计算采用双线性插值。$\varepsilon$为阈值，超过这个阈值才进行惩罚

> 这是约束规划出的精细轨迹需要与自车Occ预测保持一致

接下来论文根据阈值 $\zeta$ 定义其他Agent的高占据概率区域：

$$
\mathcal R_a^t=
\{(x,y)\mid O_a^{t,*}(x,y)>\zeta\}
$$

也就是占据概率超过这个阈值便定义为高占据概率，然后定义碰撞损失

$$
\mathcal L_{\mathrm{collision}}
=
\frac{1}{T_f}
\sum_{t=1}^{T_f}
\sum_{i=1}^{N_v}
\max(0,\eta-d_i^t)
$$

- $d_i^t$是自车第$i$个圆心，到其他 Agent 高概率占据区域的最小欧氏距离
- $\eta$是安全距离阈值

因此，只要规划轨迹距离其他 Agent 的高概率占据区域过近，就会受到惩罚

> 这是约束规划出的精细轨迹不要与其他Agent Occ预测过近

> 论文附录中提到，使用Detach操作将预测的路径梯度截断了，因此这个损失只会引导精细轨迹规划模块学习；并不是训练一开始就加入，防止预测不可靠造成错误监督

**意外规划（Contingency Planning）**

这对应3.3部分的Marginal Occupancy

$$
\tilde O_a^{t,*}=
\begin{cases}
\displaystyle
\max\left(
O_a^{t,*},
\max_{i=1}^{N_m}O_{m,i}^t
\right),
&t\le T_s\\
O_a^{t,*},
&t>T_s
\end{cases}
$$

- $O_a^{t,*}$为目标场景模态下，其他 Agent 的 Joint Occupancy
- $O_{m,i}^t$为第$i$个关键 Agent 的 Marginal Occupancy
- $N_m$为保留的关键交互 Agent 数量
- $T_s$为短期预测时间范围
- $\tilde O_a^{t,*}$融合后的占据图
- $\max$为逐网格取最大值

在训练时作者利用上式替代原来的$O_a^{t,*}$

**轨迹规划损失（Trajectory Planning Loss）**

这部分利用轨迹真值进行监督

$$
\mathcal L_{\mathrm{traj}}
=w_3\mathcal L_{\mathrm{reg}}
+w_4\mathcal L_{\mathrm{cls}}
+w_5\mathcal L_{\mathrm{coarse}}
$$

首先要明确模型根据轨迹的纵向行驶距离区分不同的模态，$\mathcal L_{\mathrm{reg}}$使用Smooth L1 Loss来计算真值模态对应的精细轨迹回归损失，$\mathcal L_{\mathrm{cls}}$使用交叉熵损失来计算精细轨迹模态置信度损失，$\mathcal L_{\mathrm{coarse}}$使用Smooth L1 Loss来计算真值模态对应的粗轨迹回归损失

**占据预测损失（Occupancy Prediction Loss）**


$$
\mathcal L_{\mathrm{occ}}
=
w_6\mathcal L_e
+w_7\mathcal L_a
+w_8\mathcal L_m
+w_9\mathcal L_{\mathrm{flow}}
$$

$\mathcal L_e$使用Focal Loss来监督自车的未来占据概率，$\mathcal L_a$使用Focal Loss来监督其他Agent的未来占据概率；Focal Loss可以让网络更加关注难预测的网格。$\mathcal L_m$使用Focal Loss来监督边缘占据，$\mathcal L_{\mathrm{flow}}$使用L1 Loss来监督目标模态下预测的未来 Backward Flow