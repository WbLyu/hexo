---
title: 'DiffusionDrive: Truncated Diffusion Model for End-to-End Autonomous Driving'
date: 2026-11-6 19:53:59
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
cover: https://img.wblyu.top/images/10f757b819b97a135417f06013c9e26f.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hustvl/DiffusionDrive',GitHub %}
{% btn 'https://arxiv.org/abs/2411.15139',CVPR 2025 %}
<!-- markdownlint-enable MD034 -->

## 1. 引言

扩散模型能够建模多模态的动作分布。但是扩散模型中需要大量去噪步骤，难以用实时速度生成多样化驾驶动作

- 主流的端到端规划器通常回归出一条单模态轨迹，这种范式没有考虑到驾驶行为固有的不确定性和多模态性
- VADv2引入了一个大规模固定的锚点轨迹（anchor trajectories）词表（vocabulary），但是这种范式受制于锚点轨迹的数量和质量，在词表外场景会失效；管理大量锚点还会带来显著计算负担，难以实时应用

> 这里的anchor trajectories是指一条具有代表性的轨迹；而vocabulary是指由许多anchor trajectories组成的轨迹集合

作者将机器的扩散策略引入单模态回归方法`Transfuser`，得到了`TransfuserDP`。在结构上是将确定性的MLP回归头替换为条件扩散模型。但是这有两个关键难题

1. 大量的去噪步骤给推理过程引入了繁重的计算负担
2. 从不同高斯噪声中采样得到的轨迹几乎彼此重叠，丧失了多模态特性，作者称之为模式坍塌（Mode Collapse）

人类驾驶员实际上是遵循既有的驾驶模式的，根据这一观点，可以将高斯分布划分为以先验锚点为中心的多个高斯子分布（即锚定高斯分布，Anchored Gaussian Distribution），将这些先验驾驶模式嵌入扩散策略中。因此加噪过程无需得到近似标准高斯分布，去噪也无需从标准高斯噪声开始，论文称其为截断扩散（Truncated Diffusion）

也就是说这篇论文认为，**驾驶轨迹并不是完全随机的而是有明显先验模式的**。因此这篇论文给不同的Anchor Trajectory加噪，形成多峰混合高斯分布，   也就是Anchored Gaussian Distribution。而传统的扩散模型需要从标准高斯噪声中恢复出驾驶轨迹，需要进行大量去噪步骤（20步），本论文只需给不同的Anchor Trajectory增加少量噪声，并进行少量去噪就能恢复出驾驶轨迹（2步）

> 此论文应用的是条件扩散模型，因此扩散过程会受到感知条件的影响，并不会简单还原成原来的Anchor Trajectory

得益于扩散模型的多模态分布能力，所提出的阶段扩散模型无需像VADv2一样依赖大量anchor，便可以覆盖潜在的动作空间
