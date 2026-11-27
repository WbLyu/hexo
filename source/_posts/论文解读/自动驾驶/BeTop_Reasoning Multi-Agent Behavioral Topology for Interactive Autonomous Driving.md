---
title: 'BeTop: Reasoning Multi-Agent Behavioral Topology for Interactive Autonomous Driving'
date: 2026-11-23 10:59:47
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
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/OpenDriveLab/BeTop',GitHub %}
{% btn 'https://arxiv.org/abs/2409.18031',NeurIPS 2024 %}
<!-- markdownlint-enable MD034 -->

---

> 思考

这里称f为单调递增是否有问题，如果是倒车呢

论文存在的问题：

论文的价值：

## 1. 引言

由于多Agent场景的不确定性和异构交互，自动驾驶的挑战仍然存在。

当前稠密和稀疏行为表征面临效率低下和多Agent建模的一致性问题

真实交通场景的不确定性和复杂多变的交互关系，给多Agent未来行为的建模带来了巨大挑战。为了**建模多Agent的未来行为**，现有方法主要采用两种表示方式：

- 稠密表示（Dense Representation）：在以自车为中心的栅格化下量化Agent行为，预测BEV占用概率（Occ）或时序流（temporal flow）
  - 这类方法能够统一表示多个Agent的空间占据情况，便于分析潜在的空间冲突，并且能够与BEV感知特征直接结合
  - 固定的空间覆盖范围和栅格分辨率限制了表示的灵活性，可能导致部分安全关键的交互信息无法得到充分表达
- 稀疏表示（Sparse Representation）：通过预测每个 Agent 的未来轨迹集合或运动意图分布，描述其可能的运动行为
  - 这类方法能够使用连续空间坐标表示运动轨迹，并通过多模态预测处理不同 Agent 的行为不确定性
  - 分别预测各个 Agent 的未来行为，难以保证组合后的联合行为具有一致性。随着 Agent 数量和运动模态的增加，显式枚举联合行为组合还可能带来指数级的计算复杂度

在复杂交互场景中，仅仅选择合适的行为表示方式仍然不足以**保证IPP（The Integration of Prediction and Planning）时多智能体预测与自车规划之间的一致性**。因此，除了未来行为的表示方式，还需要**进一步考虑如何建模不同 Agent 之间的行为依赖关系**，使预测与规划结果能够相互协调。

为了解决这一问题，已有研究尝试通过条件预测和博弈论推理显式建模多 Agent 之间的交互关系

- 条件预测：通过建立 Agent 未来行为之间的条件依赖，使不同交通参与者的预测相互关联。这种方法需要反复 rollout，计算开销大；并且在结构上往往是单向或局部的条件依赖，很难在一次推理中形成全局多车的“群体行为共识”
- 博弈论方法：通过迭代推理，使不同 Agent 根据其他 Agent 的行为调整自身决策。这种方法需要进行多轮行为调整，可扩展性差（Agent数量增多则难以求解）；还依赖预设的代价函数，在真实复杂路况下，求出的数学均衡解不一定符合人类真实的驾驶习惯和交互默契

目前为止“稠密表示”受限于栅格、“稀疏表示”缺乏一致性，而事后用“条件预测/博弈论”强行协调又太重、太脆。本文受人类驾驶启发：决策不精确预测所有车的状态，而是评估单个 Agent 对自车规划动作的行为影响，并推理出互相协调的交互关系，而这种交互关系在结构上天然呈现为“拓扑形态”。

然而现有深度学习交互方法：GNN/Transformer 只是隐式学习，已有拓扑工作只用于量化不确定性，都缺少显式未来拓扑监督。提出了一种新的交互表征——行为拓扑（Behavioral Topology, BeTop）

| 创新维度 | 现有方法的痛点 | 本文的对应创新 | 核心效果 |
| --- | --- | --- | --- |
| 行为表征层面 | **稠密**受限于固定栅格和分辨率；**稀疏**缺乏全局一致性，穷举联合模态会算力爆炸 | 提出 BeTop（行为拓扑），借用编织理论将多车未来轨迹的交错关系抽象成离散拓扑图，作为显式监督 | 在连续轨迹和全局空间冲突之间找到一个紧凑的“中间层”，先定交互骨架，再填轨迹细节 |
| 行为依赖层面 | **条件预测**往往单向且需多轮推演；**博弈论**迭代开销大、依赖预设代价函数、难保拟人合理性 | 提出 BeTopNet 中的拓扑引导局部注意力 + 模仿式应急规划 | 用一次前向推理的局部注意力替代昂贵的博弈迭代，用带分支的应急规划处理剩余不确定性 |

## 3. 行为拓扑

### 3.1 表述

在当前时刻 $t = 0$，假设场景中共有 $N_a$ 个交通参与者，记为 $A_{1:N_a}$，同时给定场景的高精地图 $M$。给定过去时间窗口 $T_h$ 内的历史状态序列——包括自车的历史状态 $X_1$ 与周围环境 Agent 的历史状态 $X_{2:N_a}$，其中历史状态表示为 $X_n = \{x_{-T_h:0}\}_n$。IPP 任务的目标是在未来时间窗口 $T_f$ 内，联合输出自车的规划轨迹 $\hat{Y}_1$ 与其他 Agent 的预测轨迹 $\hat{Y}_{2:N_a}$，使其逼近未来的真实轨迹真值 $Y_{1:N_a}$

为了让神经网络能够显式学习多车未来的共识交互，作者通过连续四步抽象，将复杂的连续轨迹博弈转化为了标准的图推理问题：

未来真值轨迹$Y_{1:N_a}$ ➡️ 编织群$\mathbf{B}_{N_a} = \{\sigma_n\}$ ➡️ 行为拓扑图 $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ ➡️ 联合优化目标 $\mathcal{G}^* = (\max \hat{\mathcal{V}}, \max \hat{\mathcal{E}})$

**编织理论（Braid Theory）**

它包含两步操作：先把所有 Agent 的未来轨迹 $Y_{1:N_a}$ **分别变换到每个 Agent 各自的局部坐标系下**，再沿着时间轴向前观察这些轨迹是否发生**向前交织**（forward intertwine / occupancy），把这种时空交织作为联合交互的本质表达。

首先，包含 $N_a$ 个Agent的场景构成一个由 $N_a$ 个基本编织（primitive braids） $\sigma_n$ 组成的编织群 $B_{N_a} = \{\sigma_n\}$。其次，每一个基本编织 $\sigma_n$ 是由 $N_a$ 个编织函数组成的有序元组：

$$
\sigma_n = \left(f_1^n, \cdots, f_{N_a}^n\right)
$$

其中，每一个函数 $f: \mathbb{R}^3 \times Y \rightarrow \mathbb{R}^2 \times I$ 都是一个单调递增函数，它先将第 $i$ 辆车的未来轨迹 $Y_i$ 变换到 $n$ 辆车 $A_n$ 的局部坐标系下，然后将变换后的轨迹从三维时空笛卡尔坐标系 $(\vec{x}, \vec{y}, \vec{t})$ 映射到二维的横向-时间坐标系 $(\vec{y}, \vec{t})$ 上

> 这里称其为单调递增，是因为时间 $\vec{t}$ 严格向前推进，每条轨迹在 $(\vec{y}, \vec{t})$ 平面上形成一根不折返的“绳子”

多智能体的联合交互行为被识别为编织群中发生交织的编织集合 $\{\sigma_n^{\pm}\} \subset B_{N_a}$（如论文 Fig. 2 所示）。与以往隐式交互方法（如 MTR、JFP、EvolveGraph 等）暗中依赖“未来空间距离启发式（future distance heuristic）”不同，编织中的每一次交织都对应着明确的行为响应语义：正编织 $\sigma_n^+$ 代表主动/抢行行为（assertive，促使他车让行），负编织 $\sigma_n^-$ 则代表被动/让行行为（passive，礼让他车先行）。

> 这里只是在阐述编织理论，实际论文并未完全采用编织理论，因此许多细节并未在此处展开，如：如何判断两Agent是否有交互；

**行为拓扑图**

尽管编织集合 $\{\sigma_n^{\pm}\}$ 语义清晰，但场景中交互车辆的数量、交叉次数和排列组合都在动态变化，直接进行编织序列推理的最坏计算复杂度高达 $\mathcal{O}((N_a - 1)^{N_a})$

为规避动态编织推理的难题，作者从图拓扑推理的视角对多智能体编织进行了重构，正式提出了**行为拓扑（BeTop）**，即将多 Agent 的未来联合行为建模为一张拓扑图

$$
\mathcal{G} = (\mathcal{V}, \mathcal{E})
$$

图中包含两部分：其一是**节点拓扑** $\mathcal{V} = \{Y_n\}$，直接表示**各个 Agent 的未来轨迹**；其二是将动态编织集合 $\{\sigma_n^{\pm}\}$ 重构为固定维度的**边拓扑矩阵** $e_{ij} \rightarrow \mathcal{E} \in \mathbb{R}^{N_a \times N_a}$（$1 \le i, j \le N_a$），用以**显式表征未来交互关系**。

边拓扑矩阵中的每一个元素 $e_{ij}$，用来衡量轨迹 $Y_i$ 与 $Y_j$ 在 Agent $i$ 视角下沿未来时间步是否发生交织：

$$e_{ij} = \max_t \, I\left(f_i^i(y_i^t), \, f_j^i(y_j^t)\right)$$

这里的 $I$ 是一个交织指示器，用来判断两个轨迹是否相交。在工程实现上采用横向坐标系下的线段相交检测。也就是说，只要在 Agent $i$ 局部视角的横向-时间投影平面中，Agent $j$ 的未来轨迹线段与 Agent $i$ 自己的未来轨迹线段在某个未来时刻 $t$ 发生相交，$\max_t$ 就会将交互边 $e_{ij}$ 激活。

**联合图推理目标**

在将多车编织转化为图 $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ 之后，整个预测与规划一体化的推理任务就被统一为节点拓扑与边拓扑的联合优化问题，即最大化似然估计

$$
\mathcal{G}^* = \left(\max \hat{\mathcal{V}}, \max \hat{\mathcal{E}}\right)
$$

在这一联合目标中，节点项 $\hat{\mathcal{V}}$ 对应的多 Agent 未来轨迹采用高斯混合模型（GMM）来刻画多模态分布，其具体损失与优化将在 3.3 节展开；而边拓扑推理 $\hat{\mathcal{E}}$ 则被形式化为一个标准的概率推理问题，即在全部 $N_a \times N_a$ 对智能体上最大化伯努利对数似然（实际训练中对应二元交叉熵 BCE 监督）

$$
\max \hat{\mathcal{E}} = \max \sum_i \sum_j \left[ e_{ij} \log \hat{e}_{ij} + (1 - e_{ij}) \log(1 - \hat{e}_{ij}) \right], \quad 1 \le i, j \le N_a
$$

后续设计的协同推理网络（BeTopNet），正是围绕同步优化这一目标 $\mathcal{G}^*$ 而构建的。

### 3.2 BeTopNet

BeTopNet 是围绕联合优化目标 $\mathcal{G}^* = (\max \hat{\mathcal{V}}, \max \hat{\mathcal{E}})$ 构建的 Transformer 编解码协同学习框架。它由场景编码器（Scene Encoder）、协同解码器（Synergistic Decoder，内嵌拓扑引导局部注意力 TopoAttn）以及推理头（Reason Heads）三大部分组成

![betop-1.png](https://img.wblyu.top/world-models/betop-1.png)

**场景编码器**

采用规划导向的以场景为中心（scene-centric）坐标系，负责将动态历史轨迹与静态高精地图压缩为统一的场景语义特征

> 以场景为中心的坐标系原点一般选择为自车在当前时刻的位姿，但也有特殊情况选为路口几何中心。所有Agent共享同一个坐标系

系统接收两路原始输入，此时还未编码为特征

1. 场景中全部 $N_a$ 个Agent的历史状态张量 $X \in \mathbb{R}^{N_a \times T_h \times D_a}$，包含基础运动学状态 $(x, y, v_x, v_y, \theta)$ 以及Agent尺寸和类别
2. 将完整场景高精地图切分为 $N_m$ 条长度为 $L_m$ 的折线段集合 $M \in \mathbb{R}^{N_m \times L_m \times D_m}$，记录车道位置、红绿灯状态与限速信息

> 红绿灯状态属于离散分类信息，一般会转为 One-Hot 向量，然后拼接到折线的每个点上；限速信息属于连续数值信息，会换算成标准单位，通常还会再附带一个 0/1 标记位表示“该车道是否有限速标注”，同样拼接到折线的每个点上。Agent尺寸和类别也是类似的处理方式

在 `nuPlan` 规划配置下，周围车辆输入过去$T_h$的完整历史，但自车只保留当前时刻状态，以防止开环模仿学习中仅根据自车历史速度推断未来速度（copy-cat）导致的闭环退化

在特征编码阶段，原始输入 $X$ 和 $M$ 先分别经过分层的点云式编码器（PointNet 架构），被映射到全局共享的隐藏维度 $D$，得到Agent特征 $S_A \in \mathbb{R}^{N_a \times D}$ 与Map特征 $S_M \in \mathbb{R}^{N_m \times D}$。随后两者拼接为统一场景特征 $S = [S_A; S_M] \in \mathbb{R}^{(N_a + N_m) \times D}$，送入多层带局部注意力的  Transformer Encoder，从而在Encoder端先进行区域级的**车-车**与**车-图**交互

此外，借鉴`MTR` 与`PlanTF` 的做法，Encoder 输出后还会外接一个稠密辅助预测头（dense prediction head）对全场景Agent做初步轨迹监督，以提前往 $S_A$ 中注入未来运动语义

> 这里的预测头会输出每个Agent的未来轨迹，它的作用包括
>
> 1. 加速收敛：把原本必须绕过多层协同Decoder才能传回Encoder的未来轨迹梯度，提前接在了Encoder的输出端
> 2. 消灭背景车监督盲区：下游Decoder中只会筛选部分Agent进行轨迹预测，导致大部分背景车无法收到梯度
> 3. 给下游轻量拓扑Decoder减负：经过预测头的监督，$S_A$ 已注入未来运动语义，可以减轻下游Decoder既需要预测未来运动又需要判断未来交互的繁重任务

**协同解码器**

拿到编码后的场景特征 $S_A$、$S_M$ 后，Decoder 需要同时完成两件互相耦合的事：一是同步推理出多车交互的行为拓扑 $\hat{\mathcal{E}}$，二是立刻拿推理出来的拓扑先验反过来指导未来轨迹 $\hat{\mathcal{V}}$ 的选择性解码。为此，作者设计了一个由 $L$ 层迭代 Transformer Decoder构成的双信息流架构

为了同时在 `nuPlan` 和 `WOMD` 上与各自领域的 SOTA 公平对打，作者实际上将 BeTopNet 实例化成了两套独立的模型变体：在 `nuPlan` 上跑的是完整的 IPP 版本；而在 `WOMD` 上跑的是纯预测版本

Decoder为场景中每个待预测/规划的Agent $A_n$ 同时维护两条并行的query流

1. 多模态轨迹查询流 $Q_A^{0,n} \in \mathbb{R}^{M \times D}$，用来表征智能体 $A_n$ 的 $M$ 种未来可能模态以应对场景不确定性——在规划任务中使用 $M=6$ 个可学习嵌入向量，而在预测任务中则采用类似 MTR 的 $M=64$ 个意图锚点查询（anchored queries）
2. 边拓扑特征流 $Q_R^0 \in \mathbb{R}^{N_a \times N_a \times D}$，它并不是凭空随机初始化的，而是先按照 `GoRela` 的方式显式计算场景中两两智能体之间的相对几何属性 $S_R \in \mathbb{R}^{N_a \times N_a \times D_r}$（包含相对距离与相对航向角，对单个智能体 $A_n$ 而言对应切片 $S_R^n$），再经由 MLP 映射为初始拓扑特征。

在任意第 $l$ 层解码器中，对于目标智能体 $A_n$，**拓扑支路**与**轨迹支路**严格按先后协同的顺序执行更新

$$Q_R^{l,n} = \text{TopoDecoder}\!\left(Q_R^{l-1,n},\; Q_A^{l-1,n},\; S_A\right), \quad \hat{e}_n^l = \text{TopoHead}\!\left(Q_R^{l,n}\right)
$$

$$Q_A^{l,n} = \text{TransDecoder}\!\left(Q_A^{l-1,n},\; S_A,\; S_M,\; \hat{Y}_n^{l-1},\; \hat{e}_n^l\right), \quad \hat{Y}_n^l = \text{IPPHead}\!\left(Q_A^{l,n}\right)$$

先看拓扑支路 TopoDecoder：它把上一层的轨迹Query $Q_A^{l-1,n} \in \mathbb{R}^{M \times D}$ 和Encoder输出的全部Agent特征 $S_A \in \mathbb{R}^{N_a \times D}$ 分别送入各自的 MLP，然后将两者广播对齐并拼接（Concat），拼出一个形状为 $[M, N_a, D_a]$ 的三维张量。这一步是为了把Agent $A_n$ 的每一种未来模态（共 $M$ 种）与场景中全部 $N_a$ 个Agent做两两特征配对。紧接着，这个拼接张量与上一层传下来的拓扑特征 $Q_R^{l-1,n}$ 做残差相加（$\oplus$）（第 1 层由 $S_R^n$ 初始化），再经过一层 MLP 输出本层更新后的拓扑特征 $Q_R^{l,n} \in \mathbb{R}^{M \times N_a \times D}$。随后 TopoHead 直接从中解码出本层的边拓扑预测概率 $\hat{e}_n^l \in \mathbb{R}^{M \times N_a}$。

> 边拓扑预测概率的维度为$\mathbb{R}^{M \times N_a}$，说明每个Agent的每一种多模态意图（$M$），都有自己专属的一组交互对象概率分布（$N_a$）

再看轨迹支路 TransDecoder：上一层的轨迹Query $Q_A^{l-1,n} \in \mathbb{R}^{M \times D}$ 先经过一层多头自注意力以及 Add & Norm，让同一Agnet的 $M$ 个不同模态之间互相沟通去重。接着，它并不同步关注全场景所有车，而是调用核心模块 `TopoAttn（拓扑引导局部注意力）`，借助刚刚算出的 $\hat{e}_n^l$ 选择性聚合关键交互车辆的特征，经 FFN 与 Add & Norm 后输出交互智能体聚合特征 $C_A^{l,n}$。与此同时，轨迹支路还会并行从 $S_M$ 中聚合地图语义特征 $C_M^{l,n}$（规划任务直接用标准 Transformer 交叉注意力，预测任务因地图段多达 768 条，沿用 MTR 利用上一层轨迹 $\hat{Y}_n^{l-1}$ 做动态局部地图采样收集）。最后，Decoder把Agent交互特征 $C_A^{l,n}$、地图特征 $C_M^{l,n}$ 以及Encoder直连的自身语义 $S_A^n$ 三者拼接，更新得到本层的轨迹查询 $Q_A^{l,n}$，再交给 IPPHead 解码出本层的轨迹预测 $\hat{Y}_n^l$

这种设计的“协同”闭环在于：上一层学得更准的轨迹Query $Q_A^{l-1,n}$ 会让本层的拓扑预测 $\hat{e}_n^l$ 更准；而更准的 $\hat{e}_n^l$ 马上在本层引导 TopoAttn 过滤掉无关车辆，从而产出更协调的 $Q_A^{l,n}$ 和轨迹 $\hat{Y}_n^l$，逐层螺旋精修。

**拓扑引导局部注意力**

如果直接让 $Q_A^{l-1,n}$ 去对全场景所有Agent特征 $S_A$ 做全局交叉注意力，不仅计算冗余，而且大量无关背景车会稀释注意力权重，造成**交互对象错位（misaligned interactive agents）**。   TopoAttn 直接把本层刚推理出的行为拓扑概率 $\hat{e}_n^l \in \mathbb{R}^{M \times N_a}$ 当作显式筛选先验。具体而言，针对智能体 $A_n$ 的每一个模态，按照拓扑概率从高到低取出 Top-$K$ 个最可能发生未来交互的智能体索引 $\epsilon_n^l = \text{argmax}_K(\hat{e}_n^l) \in \mathbb{R}^{M \times K}$。利用这组索引，从 $S_A \in \mathbb{R}^{N_a \times D}$ 中定向捞出对应的特征张量 $S_A^{\epsilon_n^l} \in \mathbb{R}^{M \times K \times D}$ 作为局部交叉注意力的 Key 和 Value，计算公式如下

$$
C_A^{l,n} = \text{TopoAttn}\!\left(Q_A^{l-1,n},\; S_A,\; \epsilon_n^l\right) = \text{MultiHeadAttn}\!\left(q = Q_A^{l-1,n};\; k, v = S_A^{\epsilon_n^l}\right)
$$

这里有两点来自实验与附录的重要补充

1. 超参数 $K$ 的选取并非越大越好：在论文的消融实验中，随着 $K$ 增大模型性能呈现先升后降的收敛效应；一旦 $K$ 过大，就会把原本不交互的背景车误纳入注意力，导致性能下降
2. 在计算效率上，虽然额外引入了拓扑推理分支，但由于 TopoAttn 在解码阶段把 KV 特征从全场景裁剪到了 Top-$K$，BeTopNet 的整体推理延迟与传统 MTR 基本持平，仅因缓存三维拓扑张量 $Q_R^{l,n}$ 增加了少量显存占用

**推理头**

在解码器的每一层 $l \in \{1, \dots, L\}$ 之后，网络都会挂载由 `MLP` 组成的推理头，分别解码边拓扑与未来轨迹，从而支持逐层深度监督

- 拓扑头（Topology Head）：输入为 $Q_R^{l,n} \in \mathbb{R}^{M \times N_a \times D}$，输出每个模态对全场景智能体的交互边概率 $\hat{e}_n^l \in \mathbb{R}^{M \times N_a}$
- 预测头（Prediction Head）：输入为 $Q_A^{l,n} \in \mathbb{R}^{M \times D}$，遵循 3.1 节的高斯混合模型（GMM）形式化定义，为Agent $A_n$ 输出 $M$ 条模态的未来二维高斯分布参数 $\hat{y}_n^l \in \mathbb{R}^{M \times T_f \times 5}$（每个未来时间步包含均值 $\mu_x, \mu_y$、对数标准差 $\log\sigma_x, \log\sigma_y$ 与相关系数 $\rho$），以及各模态的混合置信度得分 $\hat{p}_n^l \in \mathbb{R}^M$，二者共同构成 $\hat{Y}_n^l = \{\hat{y}_n^l, \hat{p}_n^l\}$
- 级联分支规划头（Planning Head）：这是专门为 3.3 节“模仿式应急规划（Contingency Planning）”设计的两阶段级联结构，只作用于自车查询 $Q_A^{l,1}$。在第一阶段，MLP 先从 $Q_A^{l,1}$ 解码出 $M$ 条安全稳妥的短期规划轨迹 $\tau_M \in \mathbb{R}^{M \times t_b \times 2}$，覆盖从 $t=1$ 到分支时刻 $t_b = 3\text{s}$ 的近期动作。随后系统对 $\tau_M$ 执行 detach 梯度截断，将其作为既定的短期先验输入下一级 MLP，投影并重塑（reshape）为形状 $[M, M_J, D]$ 的分支特征（每条短期规划向后衍生出 $M_J = 6$ 条应急分支）。在第二阶段，该分支特征与广播后的自车解码查询 $Q_A^{l,1}$ 拼接，再经最后一层 MLP 输出覆盖剩余时间 $[t_b, T_f]$ 的长期分支轨迹 $\tau_J \in \mathbb{R}^{M M_J \times (T_f - t_b) \times 2}$。将短期段 $\tau_M$ 与长期分支 $\tau_J$ 拼接起来，规划头最终为自车生成 $M \cdot M_J$ 条完整的树状候选规划轨迹 $\hat{Y}_1$，无缝对接 3.3 节的应急代价优化。

### 3.3 模仿式应急学习

**模仿学习**

由于历史真值中只有一条轨迹，而Decoder的每一层都会输出 $M$ 个候选模态的轨迹与拓扑，因此训练时需要挑选出一个模态进行监督——最匹配真实未来的正样本模态 $m^*$

- 在 `nuPlan` 规划任务中直接计算 $M$ 条预测轨迹与真值轨迹 $Y_n$ 的平均位移误差（ADE），选误差最小的那条作为 $m^*$
- 而在 `WOMD` 预测任务中，直接选取距离真值终点最近的那个静态意图锚点作为 $m^*$

接下来可以定义模仿学习的两个核心损失

1. 节点轨迹损失 $\mathcal{L}_{\mathcal{V}}$（二维高斯混合模型的负对数似然 NLL）：最小化正样本模态 $m^*$下真实轨迹点在预测二维高斯分布 $(\mu_x, \mu_y, \log\sigma_x, \log\sigma_y, \rho)$ 下的负对数似然，同时最大化该模态的分类置信度得分 $\hat{p}_n^{m^*}$
2. 边拓扑损失 $\mathcal{L}_{\mathcal{E}}$（二元交叉熵 BCE）：只抽出正样本模态 $m^*$ 对应的边预测向量 $\hat{e}_n^{m^*} \in \mathbb{R}^{N_a}$，最小化$N_a$ 个Agent的二元交叉熵 $\mathcal{H}$

$$
\begin{aligned}
\mathcal{L}_{\text{NLL}} =& \log\sigma_x + \log\sigma_y + \frac{\log(1-\rho^2)}{2} \\
+ &\frac{1}{2(1-\rho^2)}\left[\left(\frac{d_x}{\sigma_x}\right)^2 + \left(\frac{d_y}{\sigma_y}\right)^2 - 2\rho\frac{d_x d_y}{\sigma_x \sigma_y}\right] - \log p(m^*)
\end{aligned}
$$

其中 $d_x, d_y$ 表示预测均值与真实未来坐标之间的差值，前几项构成标准的二维相关高斯回归负对数似然，最后一项 $-\log p(m^*)$ 则是针对正样本模态概率的交叉熵分类损失

$$
\mathcal{L}_{\mathcal{E}} = \sum_{j=1}^{N_a} \mathcal{H}\!\left(\hat{e}_{n,j}^{m^*},\; e_{n,j}\right)
$$

**集成应急规划**

如果仅仅用模仿学习来训练规划器，模型在闭环强交互场景中通常非常脆弱。因为纯模仿学习很难显式衡量碰撞风险，而且面对周围车辆未来的多模态不确定性，规划器如果过早押注单一确定的 8 秒轨迹，要么过于激进发生碰撞，要么为了躲避所有低概率威胁而彻底刹死不动

论文引入了应急规划（Contingency Planning）范式，并巧妙地用 BeTop 边拓扑打通了它最大的计算瓶颈。它借鉴了人类开车时的方案：**推迟决策（adjourn uncertain decisions）**。把一条长时间轨迹拆成两部分：前一段为安全主干，后一段为根据不同情况演变出的分支。推理头中专门为此设计了一个两阶段级联结构，只接收Ego 轨迹 Query $Q_A^{l,1} \in \mathbb{R}^{M \times D}$

在第一阶段，第一组 MLP 先从$Q_A^{l,1}$ 中，只解码出前 $t_b = 3\text{s}$ 的短期规划主干 $\tau_M$，张量形状为 $[M, t_b, 2] = [6, 3\text{s}, 2]$。紧接着，网络对$\tau_M$ 执行detach（梯度截断），把它当作既定的短期先验送入第二阶段

> 这里使用Detach是为了防止后面的远期分支影响短期主干，另短期主干只考虑防碰撞并参考人类轨迹

在第二阶段，短期先验经过 MLP 投影并重塑（reshape）成形状 $[M, M_J, D]$ 的分支特征，随后，网络将Ego 轨迹Query $Q_A^{l,1}$ 与该分支特征拼接，经最后一层 MLP 输出覆盖剩余 $3 \sim 8$ 秒的长期分支轨迹 $\tau_J$，形状为 $[M \cdot M_J, T_f - t_b, 2] = [36, 5\text{s}, 2]$。把前 3 秒的 $\tau_M$ 和后 5 秒的 $\tau_J$ 拼在一起，自车就得到了 $6 \times 6 = 36$ 条完整的树状候选轨迹 $\hat{Y}_1$

由于短期主干主要考虑安全问题，因此它考虑的是所有 $N_a = 32$ 辆车的**边缘预测**（Marginal Predictions） $\hat{Y}_M = \hat{Y}_{2:N_a}$，也就是考虑每辆车各自的全部未来轨迹；而远期分支需要的是**多车联合预测**（Joint Predictions） $\hat{Y}_J^m$，也就是把关键交互车辆的动作绑定成一个整体场景

> 边缘预测中未考虑其他Agent彼此交互的影响，因此其他Agent会发生碰撞的轨迹也会考虑在内

在进行联合预测时由于全场景有 32 辆车，每辆车预测了 $M = 6$ 种走法，直接做联合组合总共有 $6^{32}$ 种场景，因此本文通过前面得到的边拓扑预测概率 $\hat{e}_n^l \in \mathbb{R}^{M \times N_a}$来挑选出前 $K_M = 4$ 辆最关键的交互车

$$
\epsilon_{\text{AV}} = \arg\max_{K_M}\!\left(\max_M \hat{e}_1\right)
$$

只要某个Agent在**自车的任意一种轨迹**下有高交互概率，就会得到高分

获得4 辆核心交互Agent后，每个Agent都有 $M = 6$ 条预测轨迹和对应的模态概率向量 $\hat{p}_n \in \mathbb{R}^6$（$n \in \{1, 2, 3, 4\}$），做全组合有 $6^4 = 1,296$ 种联合场景。论文通过张量广播乘法来获取最可能发生的6个场景

$$
P_J = \max_M \prod_{n=1}^{N_I} P_J^{(n)} \otimes \hat{p}_n
$$

本质上就是先建一个形状为 $[6, 6, 6, 6]$、元素全为 1 的四维张量 $P_J$；第 1 步把第 1 辆车的概率向量 $\hat{p}_1 [6, 1, 1, 1]$ 广播乘进去，第 2 步把第 2 辆车的 $\hat{p}_2 [1, 6, 1, 1]$ 广播乘进去，第 3、4 步同理。乘完之后，这个四维张量里的第 $(a, b, c, d)$ 个格子装的正好就是联合概率 $\hat{p}_{1,a} \cdot \hat{p}_{2,b} \cdot \hat{p}_{3,c} \cdot \hat{p}_{4,d}$。最后把这 1,296 个数拉平，直接取最大的前 $M = 6$ 个（即公式里的 $\max_M$），瞬间就能捞出最可能发生的 6 个多车联合场景 $\hat{Y}_J^1, \dots, \hat{Y}_J^6$ 及其对应的联合场景概率 $P(\hat{Y}_J^1), \dots, P(\hat{Y}_J^6)$，全程仅耗时 1.6 ms。

优化的目标为

$$
\tau_M^* = \arg\min_{\tau \subset \hat{Y}_1} \left[ \max_{\hat{Y}} C_M(\tau_M, \hat{Y}_M) + \sum_{m} P(\hat{Y}_J^m)\, C_J(\mathcal{T}_J^m, \hat{Y}_J^m) \right]
$$

- 左边是“短期最坏情况安全代价”
- 右边是“长期分支的期望代价”

$C_M$ 和 $C_J$ 具体的代价公式，作者并借鉴 GameFormer 采用光滑可微的排斥势场

$$
\phi = \frac{1}{1 + d(\tau, \hat{y})}
$$

因此，短期最坏代价 $C_M$ 是在完整时域上针对全场景 $N_a = 32$ 辆车的边缘预测 $\hat{Y}_M$ 取最坏势场值；而每个分支的长期代价 $C_J^m$ 则是针对重组出的 $N_I = 4$ 辆核心交互车的第 $m$ 组联合预测 $\hat{Y}_J^m$ 计算势场。两者合在一起，构成端到端可微的应急规划代价损失 $\mathcal{L}_{\text{CL}}$

$$
\mathcal{L}_{\text{CL}} = C_M + \sum_{m=1}^{M} P(\hat{Y}_J^m)\, C_J^m
$$

**端到端总训练损失与测试推理机制**

在训练阶段，BeTopNet 将模仿学习目标与应急规划代价整合为一个统一的端到端损失函数，并施加在协同Decoder的每一层上

$$
\mathcal{L} = \mathcal{L}_{\mathcal{V}} + \lambda_1 \mathcal{L}_{\mathcal{E}} + \lambda_2 \mathcal{L}_{\text{CL}}
$$

其中边拓扑监督权重 $\lambda_1 = 50$，应急规划代价权重 $\lambda_2 = 5$

训练时规划头生成了树状分支轨迹，但在推理时，控制器最终必须执行唯一一条长达 $T_f = 8\text{s}$ 的完整轨迹。因此，在推理阶段，BeTopNet 会对自车候选规划集合 $\hat{Y}_1$ 进行综合打分，选出得分最高的完整 8 秒轨迹 $\tau^* = \arg\max_C \hat{Y}_1$。综合评分函数 $C = \hat{p}_1 + \lambda_m C_M$ 结合了模型学到的模仿置信度概率 $\hat{p}_1$ 与短期安全代价项 $C_M$