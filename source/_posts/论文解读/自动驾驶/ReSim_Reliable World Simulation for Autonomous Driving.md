---
title: 'ReSim: Reliable World Simulation for Autonomous Driving'
date: 2026-11-18 19:47:24
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
cover: https://img.wblyu.top/images/a076067a588441e00096b423d3a5e282.avif
---

---

> 思考

论文存在的问题：



论文的价值：



## 1. 引言

## 2. 可靠的驾驶世界仿真

### 2.1 异构数据合集

- `NAVSIM` 包含用于动作控制学习的严格标注动作
- 大规模 `OpenDV` 数据集支持世界模型的泛化

然而这些都受人类行为主导，仅包含专家动作会导致世界模型难以想象非专家行为及其对应的结果。为了解决这个局限，论文利用驾驶仿真器`CARLA`在合成环境中收集数据

现有的世界模型多是在合成环境中使用仿真数据，如`Dreamer`系列等，这类研究的应用场景多为游戏环境或仿真模拟环境，特点为：**世界模型学习的环境动力学本就是由仿真器构建**；而自动驾驶中很少使用仿真数据，因为这里**世界模型学习的是真实道路环境的动态变化规律**，仿真数据会存在`Sim-to-Real Gap`问题，若是只使用仿真数据训练世界模型会面临泛化问题。作者将三者数据进行融合： OpenDV-4M、NAVSIM-85K、CARLA-88K。每个视频样本长$4.9$秒，频率为$10Hz$，其中前$9$帧为视觉上下文，后$40$帧为训练期间的预测目标

在CARLA中收集数据时，驾驶路线从`Bench2Drive`设置中随机采样。环境中部署了两类智能体

1. 使用成熟的驾驶策略`PDM-Lite`来收集专家行为数据
2. 采用探索策略，即转向角和速度均从预定义集合中随机采样，以生成非专家行为数据

### 2.2 可控世界模型

`ReSim` 基于 `CogVideoX` 构建世界模型。`CogVideoX` 本质上是一个基于 Diffusion Transformer（DiT）的视频生成模型，即根据输入的文字生成相应的视频。但是这并不符合自动驾驶世界模型的需要，因此`ReSim`还需要对 `CogVideoX`进行改造：引入**历史视觉条件**和**自车未来轨迹条件**

论文参考`Vista`，将历史视频经过 `VAE` 编码得到的 latent，直接作为干净的历史条件输入，而不是对历史 latent 进行扩散加噪

假设完整视频被 VAE 编码为潜变量，前面一部分是历史视频 latent，后面一部分是未来视频 latent。在训练时

- 历史 latent 保持干净，作为条件$h$
- 未来 latent 加入噪声，形成$x_t$
- DiT 根据历史信息，对未来 latent 进行去噪预测

仅有历史观测还不够。因为世界模型还需要能够按照指定的自车动作预测未来。因此，作者引入了第二种条件，未来自车轨迹

$$
a=\{w_1,w_2,\ldots,w_T\}
$$

因此`DiT`的输入有：历史视觉观测、自车未来轨迹以及高层驾驶指令，输出为未来视频预测

> 高层驾驶指令是左转、直行等粗糙运动信息，而自车轨迹是精细运动信息

论文中模型使用$9$帧历史视频，预测未来$4$秒、$10Hz$的视频，同时可以接受未来$4$秒、$2Hz$的自车轨迹作为条件

基础训练损失

$$
\mathcal L_{\mathrm{diffusion}}
=
\mathbb E_{x,\epsilon,t}
\left[
\left\|
x_{k:}
-
D_\theta(x_t;t,h,c[,a])_{k:}
\right\|_2^2
\right]
$$

符号	含义
\(x\)	原始干净视频 latent
\(\epsilon\)	加入的高斯噪声
\(t\)	扩散时间步
\(x_t\)	加噪后的视频 latent
\(h\)	历史视频 latent
\(c\)	高层驾驶指令
\(a\)	自车未来轨迹
\(D_\theta\)	扩散 Transformer
\(x_{k:}\)	从第 \(k\) 个 latent 帧开始的未来目标