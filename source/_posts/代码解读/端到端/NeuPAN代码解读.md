---
title: NeuPAN代码解读
date: 2026-05-26 17:04:55
# updated:
# tags:
#     - 
categories: 
          - 代码解读
          - 端到端
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
cover: https://img.wblyu.top/images/b816081db00f722447cc9ff258a32c33.avif
---

## 1

`Dune`部分的网络结构是在`obs_point_net.py`中定义的，`Linear+LayerNorm+Tanh`代表$\lambda$的更新过程；`Linear+ReLU`代表$\mu$的更新过程，交替重复三次得到$\mu$，而$\lambda$则通过等式约束条件计算得到

在计算损失函数时会用到机器人本体的姿态即$R$，姿态是随机生成的

## 2. 优化问题构建

**加粗代表变量**

### 2.1 `nrmp`

定义变量`variable_definition`

1. $\bm{d}$ 安全距离 尺寸为$1 \times T$
2. $\bm{s}$ 状态 尺寸为$3 \times (T+1)$，代表$t_0 - T$
3. $\bm{u}$ 控制输入 尺寸为$3 \times T$，代表$t_1 - T$

定义参数`parameter_definition`

1. $s$ 预测状态 尺寸为$3 \times (T+1)$
2. $q \circ s^\diamondsuit$ 权重乘以参考状态 尺寸为$3 \times (T+1)$
3. $p \circ u^\diamondsuit$ 权重乘以参考控制输入 尺寸为$3 \times (T+1)$
4. $A$ 运动学方程中的状态转移矩阵 尺寸为$T \times (3 \times 3)$
5. $B$ 运动学方程中的输入移矩阵 尺寸为$T \times (3 \times 2)$
6. $C$ 运动学方程中的扰动向量 尺寸为$T \times (3 \times 1)$
7. $\lambda ^\top$ 尺寸为$T \times (M \times 2)$，$M$代表最大点云数量
8. $\lambda ^\top p + \mu ^\top h$  尺寸为$T \times (M \times 1)$
9. $q$ 状态的权重系数 尺寸为$1$或$3 \times 1$，取决于给参数输入的格式
10. $p$ 控制输入的权重系数 尺寸为$1$
11. $\eta$ 安全距离正则化的权重系数 尺寸为$1$
12. $d_{\max}$ 安全距离的上限 尺寸为$1$
13. $d_{\min}$ 安全距离的下限 尺寸为$1$

构建约束

1. $\bm{s}_{t+1} = A_t \bm{s}_t + B_t \bm{u}_t + C_t, \forall t$
2. $\bm{s}_{0} = s_0$
3. $a_{\min} \leq \bm{u}_{t+1} - \bm{u}_t \leq a_{\max}$
4. $u_{\min} \leq \bm{u}_t \leq u_{\max}$
5. $d_{\min} \leq \bm{d}_t \leq d_{\max}$

代价函数为

$$
\begin{align*}
& \operatorname{cost} : \\
& \sum_{h=t}^{t+H} \lVert q \circ \bm{s}_h - (q \circ s^\diamondsuit)_h \rVert_2^2 + \sum_{h=t}^{t+H} \lVert p \circ \bm{u}_h - (p \circ u^\diamondsuit)_h \rVert_2^2 \\
& + \frac{b_k}{2} \lVert \bm{s}_h - s^{\text{ref}}_h \rVert_2^2 - \eta \sum_{h=t}^{t+H} \bm{d}_h + \frac{\rho}{2} \sum_{t=0}^{N} \lVert \min(I_{t,m} , 0)  \rVert_2^2 \\
& \text{where }I_{t,m} = \lambda^{i \top}_t \bm{s}_t -( \lambda ^\top p + \mu ^\top h)^i_t - \bm{d}_t
\end{align*}
$$

可以不考虑$E$函数，因为在`DUNE`部分求解出的结果应该是满足约束的，同时每次迭代时轨迹变化不大，那么$E$函数便可以视为零

为参数赋值`generate_parameter_value`（赋值的是`tensor`）

1. $s$ 将上次求出的最优控制值输入到运动学模型中得到预测状态
2. $q \circ s^\diamondsuit$ 权重系数乘以参考路径上的状态
3. $p \circ u^\diamondsuit$ 权重乘以参考控制输入
4. $A$ 将运动学方程线性化处理，用预测状态作为矩阵参数
5. $B$ 将运动学方程线性化处理，用预测状态作为矩阵参数
6. $C$ 将运动学方程线性化处理，用预测状态作为矩阵参数
7. $\lambda ^\top$ `DUNE`求解出的参数值
8. $\lambda ^\top p + \mu ^\top h$  `DUNE`求解出的参数值与点云和物体自身参数相乘
9. $q$ 构造函数输入或者通过update函数更新
10. $p$ 构造函数输入或者通过update函数更新
11. $\eta$ 构造函数输入或者通过update函数更新
12. $d_{\max}$ 构造函数输入或者通过update函数更新
13. $d_{\min}$ 构造函数输入或者通过update函数更新
