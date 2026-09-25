---
title: Optimization-Based Collision Avoidance
date: 2026-04-20 16:20:30
# updated:
# tags:
#     - 
categories: 
          - 论文解读
          - 机器人模块化
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
cover: https://img.wblyu.top/images/427f61ac9ff4f5fcfeb96c17d3bd3f50.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/XiaojingGeorgeZhang/OBCA',GitHub %}
{% btn 'https://ieeexplore.ieee.org/document/9062306',TCST %}
{% btn 'https://arxiv.org/abs/1711.03449',Arxiv %}
<!-- markdownlint-enable MD034 -->

## 2. 问题描述

### 2.1 障碍物建模

障碍物用如下公式表示

$$
\mathbb{O}^{(m)} = \left\{ \bm{y} \in \mathbb{R} ^n \mid \bm{A}^{(m)} \bm{y} \preceq _{\mathcal{K}} \bm{b}^{(m)}\right\}  
$$

上标$^{(m)}$表示在时间步为$m$时的障碍物位置；$\bm{A}^{(m)} \bm{y} \preceq _{\mathcal{K}} \bm{b}^{(m)}$可以展开为$\bm{b}^{(m)} - \bm{A}^{(m)} \bm{y} \in \mathcal{K}$。若令$\mathcal{K} = \mathbb{R} ^l_+$即非负象限锥，则此广义不等式变为逐元素不等式$\leq$，此时障碍物由不同的半空间组成，是一个多面体；若令锥为二阶锥，此时障碍物是一个椭球，满足$\mathcal{K} = \left\{ (\bm{x},\bm{t}) \in \mathbb{R} ^{l+1} \mid \lVert \bm{x} \rVert_2 \leq \bm{t} \right\}$，即前几项的二范数小于等于最后一项

### 2.2 被控物体建模

被控物体用符号$\mathbb{E}(\bm{x}_k)$表示，其中$\bm{x}_k$表示被控物体在时间步为$k$时的状态

当被控物体被视为质点时，它可以表示为

$$
\mathbb{E}(\bm{x}_k) = \bm{p}_k
$$

$\bm{p}_k$表示质点在时间步为$k$时的位置

当被控物体被视为全维度物体时，即形状不可忽略，它可以表示为

$$
\mathbb{E}(\bm{x}_k) = \bm{R}(\bm{x}_k) \mathbb{B} + \bm{t}(\bm{x}_k) , \mathbb{B} \coloneqq \left\{ \bm{y} \mid \bm{Gy} \preceq _{\bar{\mathcal{K}}} \bm{g}\right\}
$$

可以视为对一个已知的锥$\mathbb{B}$进行旋转$\bm{G}$和平移$\bm{g}$

### 2.3 带避碰的最优控制问题

可以构造一个具备避障功能的模型预测控制

$$
\begin{align*}
  \min_{\bm{x},\bm{u},\bm{\lambda}} \ &\sum_{k=0}^{N}  \ell(\bm{x}_k, \bm{u}_k)  \\
  \text{s.t.} \ & \bm{x}_0 = \bm{x}_S, \quad \bm{x}_{N+1} = \bm{x}_F \\
  & \bm{x}_{k+1} = f(\bm{x}_k,\bm{u}_k), \quad h(\bm{x}_k, \bm{u}_k) \leq 0 \\
  & \mathbb{E}(\bm{x}_k) \cap \mathbb{O}^{(m)} = \emptyset
 \end{align*}
$$

其中$\ell(\cdot)$为代价函数；$\bm{x}_{k+1} = f(\bm{x}_k,\bm{u}_k)$为运动方程；$h(\bm{x}_k, \bm{u}_k) \leq 0$为输入$\bm{u}$和状态$\bm{x}$约束；$\mathbb{E}(\bm{x}_k) \cap \mathbb{O}^{(m)} = \emptyset$为避障约束，通常是非凸的且不可微的，因此需要使用等价方式来表示避障

### 2.4 避碰约束

$$
\begin{align*}
  \operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) = \min _{\bm{t}} \ &  \lVert \bm{t} \rVert \\
  \text{s.t.} \ & (\mathbb{E}(\bm{x}) + \bm{t}) \cap \mathbb{O} \neq \emptyset
\end{align*}
$$

即计算两个集合的距离，因此$\mathbb{E}(\bm{x}_k) \cap \mathbb{O}^{(m)} = \emptyset$与$\operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) > 0$是等价的

## 3. 质点模型下的无碰撞轨迹生成

结合质点模型和避碰约束，可以得到

$$
\begin{align*}
  \operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) = \min _{\bm{t}} \ &  \lVert \bm{t} \rVert \\
  \text{s.t.} \ & \bm{A} (\bm{p}_k + \bm{t}) \preceq _{\mathcal{K}} \bm{b}
\end{align*}
$$

它的拉格朗日对偶问题可以写为

$$
\begin{align*}
& \max _{\bm{\lambda }} \min _{\bm{t}} \ \lVert \bm{t} \rVert + \bm{\lambda }^\top (\bm{A} (\bm{p}_k + \bm{t}) - \bm{b}) \\
= & \max _{\bm{\lambda }} \min _{\bm{t}} \ \lVert \bm{t} \rVert + \bm{\lambda }^\top \bm{At} + \bm{\lambda }^\top \bm{A \bm{p}}_k - \bm{\lambda }^\top \bm{b} \\
= & \max _{\bm{\lambda }} \min _{\bm{t}} \ \lVert \bm{t} \rVert + (\bm{A}^\top \bm{\lambda})\bm{t} +  (\bm{A \bm{p}}_k - \bm{b})^\top \bm{\lambda }
\end{align*}
$$

为了保证内层的极小化结果是有限的，需要令$\lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1$，其中$\lVert \cdot \rVert_*$为对偶范数，证明如下

> 便于讨论，令$\bm{\mu} = \bm{A}^\top \bm{\lambda}$，令$\bm{t} = -\alpha \bm{t}_0$，其中$\alpha >0$，则
> $$
> \lVert \bm{t} \rVert + (\bm{A}^\top \bm{\lambda})\bm{t} = \alpha \lVert \bm{t}_0 \rVert - \alpha \bm{\mu }^\top \bm{t}_0 = \alpha (1-\bm{\mu }^\top \bm{t}_0)
> $$
>
> 若$\lVert \bm{\mu } \rVert_* > 1$，则存在$\bm{\mu }^\top \bm{t}_0 >1$，括号里为负，当$\alpha \to + \infty$，整个表达式无界。因此需要$\lVert \bm{\mu } \rVert_* \leq 1$，即$\lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1$，此时$\min _{\bm{t}} \ \lVert \bm{t} \rVert + (\bm{A}^\top \bm{\lambda})\bm{t} = 0$

因此拉格朗日对偶问题为

$$
\begin{align*}
  \max _{\bm{\lambda }} \ &(\bm{A \bm{p}}_k - \bm{b})^\top \bm{\lambda } \\
  \text{s.t.} \ & \lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1 \\
  & \bm{\lambda} \succeq _{\mathcal{K}^*} 0 \\
\end{align*}
$$

其中$\bm{\lambda} \succeq _{\mathcal{K}^*} 0$意味着$\bm{\lambda}$属于对偶锥，等价于拉格朗日乘子时参数大于零。因为$\mathbb{O}$具有非空相对内部，具有强对偶性。因此原问题与对偶问题等价
$$
\begin{align*}
  \operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) = \max _{\bm{\lambda }} \ &(\bm{A \bm{p}}_k - \bm{b})^\top \bm{\lambda } \\
  \text{s.t.} \ & \lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1 \\
  & \bm{\lambda} \succeq _{\mathcal{K}^*} 0 \\
\end{align*}
$$

因此
$$
\operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) > d_{\min} \Leftrightarrow \exists  \bm{\lambda} \succeq _{\mathcal{K}^*} 0 :(\bm{A \bm{p}}_k - \bm{b})^\top \bm{\lambda } > d_{\min} ,\lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1
$$

可以把此**存在**问题直接放进约束条件中，但若是**任意**问题，需要转成 “极值约束”放进约束中。因为**存在**是 “只要有一个就行”，优化器帮我们找到它即可；但是**任意**是 “所有都要满足”，优化器没法同时验证无穷多个

因此具备避障功能的模型预测控制可以改写为

$$
\begin{align*}
  \min_{\bm{x},\bm{u},\bm{\lambda}} \ &\sum_{k=0}^{N}  \ell(\bm{x}_k, \bm{u}_k)  \\
  \text{s.t.} \ & \bm{x}_0 = \bm{x}_S, \quad \bm{x}_{N+1} = \bm{x}_F \\
  & \bm{x}_{k+1} = f(\bm{x}_k,\bm{u}_k), \quad h(\bm{x}_k, \bm{u}_k) \leq 0 \\
  & (\bm{A \bm{p}}_k - \bm{b})^\top \bm{\lambda } > d_{\min} \\
  & \bm{\lambda} \succeq _{\mathcal{K}^*} 0, \quad \lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1
 \end{align*}
$$

## 4. 全维度模型下的无碰撞轨迹生成

结合全维度模型和避碰约束，可以得到

$$
\begin{align*}
  \operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) = \min _{\bm{e},\bm{o}} \ &  \lVert \bm{e} - \bm{o} \rVert \\
  \text{s.t.} \ & \bm{Ao} \preceq _{\mathcal{K}} \bm{b} \\
  & \bm{e} \in \mathbb{E}(\bm{x}) \\
  = \min _{\bm{e}',\bm{o}} \ &  \lVert \bm{R}(\bm{x})\bm{e}'+\bm{t}(\bm{x}) - \bm{o} \rVert \\
  \text{s.t.} \ & \bm{Ao} \preceq _{\mathcal{K}} \bm{b} \\
  & \bm{Ge}' \preceq _{\bar{\mathcal{K}}} \bm{g} \\
  = \min _{\bm{e}',\bm{o},\bm{y}} \ &  \lVert \bm{y} \rVert \\
  \text{s.t.} \ & \bm{Ao} \preceq _{\mathcal{K}} \bm{b} \\
  & \bm{Ge}' \preceq _{\bar{\mathcal{K}}} \bm{g} \\
  & \bm{R}(\bm{x})\bm{e}'+\bm{t}(\bm{x}) - \bm{o} - \bm{y} = 0
\end{align*}
$$

令$\bm{y}=\bm{R}(\bm{x})\bm{e}'+\bm{t}(\bm{x}) - \bm{o}$，它的拉格朗日对偶问题可以写为

$$
\begin{align*}
& \max _{\bm{\lambda }, \bm{\mu },\bm{\eta}} \min _{\bm{y},\bm{o},\bm{e}'} \ \lVert \bm{y} \rVert + \bm{\lambda }^\top (\bm{Ao}-\bm{b})+ \bm{\mu }^\top (\bm{Ge}'-\bm{g}) + \bm{\eta }^\top (\bm{R}(\bm{x})\bm{e}'+\bm{t}(\bm{x}) - \bm{o} - \bm{y})\\
= & \max _{\bm{\lambda }, \bm{\mu },\bm{\eta}} \  \min _{\bm{y}} \ (\lVert \bm{y} \rVert - \bm{\eta }^\top \bm{y}) + \min _{\bm{o}} \ (\bm{\lambda }^\top \bm{Ao} - \bm{\eta}^\top \bm{o}) + \min _{\bm{e}'} \ (\bm{\mu }^\top \bm{Ge}' - \bm{\eta}^\top \bm{R}(\bm{x})\bm{e}') -\bm{\lambda }^\top \bm{b}(\bm{x}) - \bm{\mu}^\top \bm{g} +  \bm{\eta}^\top \bm{t} \\
= & \max _{\bm{\lambda }, \bm{\mu },\bm{\eta}} \  \min _{\bm{y}} \ (\lVert \bm{y} \rVert - \bm{\eta }^\top \bm{y}) + \min _{\bm{o}} \ ( \bm{\eta}-\bm{A}^\top \bm{\lambda })^\top\bm{o} + \min _{\bm{e}'} \ (\bm{G}^\top \bm{\mu} - \bm{R}(\bm{x})^\top \bm{\eta})^\top\bm{e}' -\bm{\lambda }^\top \bm{b}(\bm{x}) - \bm{\mu}^\top \bm{g} +  \bm{\eta}^\top \bm{t}
\end{align*}
$$

为了保证内层的极小化结果是有限的，需要令$\lVert \bm{\eta}\rVert_* \leq 1$，$\bm{\eta}-\bm{A}^\top \bm{\lambda } = 0$，$\bm{G}^\top \bm{\mu} - \bm{R}(\bm{x})^\top \bm{\eta} = 0$，因此可以将$\bm{\eta}=\bm{A}^\top \bm{\lambda }$代入

因此拉格朗日对偶问题为

$$
\begin{align*}
  \max _{\bm{\lambda },\bm{\mu}} \ &-\bm{g}^\top \bm{\mu } + (\bm{At}(\bm{x}) - \bm{b})^\top \bm{\lambda} \\
  \text{s.t.} \ & \lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1 \\
  & \bm{G}^\top \bm{\mu} + \bm{R}(\bm{x})^\top \bm{A}^\top \bm{\lambda}= 0 \\
  & \bm{\lambda} \succeq _{\mathcal{K}^*} 0 \\
  & \bm{\mu} \succeq _{\bar{\mathcal{K}}^*} 0
\end{align*}
$$

因为$\mathbb{O}$和$\mathbb{B}$具有非空相对内部，具有强对偶性。因此原问题与对偶问题等价
$$
\begin{align*}
  \operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) = \max _{\bm{\lambda },\bm{\mu}} \ &-\bm{g}^\top \bm{\mu } + (\bm{At}(\bm{x}) - \bm{b})^\top \bm{\lambda} \\
  \text{s.t.} \ & \lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1 \\
  & \bm{G}^\top \bm{\mu} + \bm{R}(\bm{x})^\top \bm{A}^\top \bm{\lambda}= 0 \\
  & \bm{\lambda} \succeq _{\mathcal{K}^*} 0 \\
  & \bm{\mu} \succeq _{\bar{\mathcal{K}}^*} 0
\end{align*}
$$

因此
$$
\begin{align*}
  &\operatorname{dist} (\mathbb{E}(\bm{x}),\mathbb{O}) > d_{\min} \\
   \Leftrightarrow &\exists  \bm{\lambda} \succeq _{\mathcal{K}^*} 0 , \bm{\mu} \succeq _{\bar{\mathcal{K}}^*} 0 :-\bm{g}^\top \bm{\mu } + (\bm{At}(\bm{x}) - \bm{b})^\top \bm{\lambda} > d_{\min} , \\
   &\lVert \bm{A}^\top \bm{\lambda} \rVert_* \leq 1 , \quad \bm{G}^\top \bm{\mu} + \bm{R}(\bm{x})^\top \bm{A}^\top \bm{\lambda}= 0
\end{align*}
$$

因此具备避障功能的模型预测控制可以改写为

$$
\begin{align*}
  \min_{\bm{x},\bm{u},\bm{\lambda}} \ &\sum_{k=0}^{N}  \ell(\bm{x}_k, \bm{u}_k)  \\
  \text{s.t.} \ & \bm{x}_0 = \bm{x}_S, \quad \bm{x}_{N+1} = \bm{x}_F \\
  & \bm{x}_{k+1} = f(\bm{x}_k,\bm{u}_k), \quad h(\bm{x}_k, \bm{u}_k) \leq 0 \\
  & -\bm{g}^\top \bm{\mu } + (\bm{At}(\bm{x}) - \bm{b})^\top \bm{\lambda} > d_{\min} \\
  & \bm{G}^\top \bm{\mu} + \bm{R}(\bm{x})^\top \bm{A}^\top \bm{\lambda}= 0 \\
  & \bm{A}^\top \bm{\lambda} \rVert_* \leq 1, \quad \bm{\lambda} \succeq _{\mathcal{K}^*} 0, \quad \bm{\mu} \succeq _{\bar{\mathcal{K}}^*} 0
 \end{align*}
$$

---
参考资源

[凸优化基础](https://www.bilibili.com/video/BV1CxHUzLEip/?share_source=copy_web&vd_source=5690184b80b2e24595a4c16d516181af)

[机器人中的数值优化](https://www.shenlanxueyuan.com/course/745)
