---
title: 'NWM: Breaking survivorship bias in driving world models'
date: 2026-11-14 22:05:30
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
cover: https://img.wblyu.top/images/57589bcb7930b90252622539045e4a12.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/zihaosheng/NWM',GitHub %}
{% btn 'https://arxiv.org/abs/2611.11516',arXiv %}
{% btn 'https://zihaosheng.github.io/NWM/',Wetsite %}
<!-- markdownlint-enable MD034 -->

---

> 思考

论文存在的问题：

1. 论文认为世界模型在没有视觉监督时难以学习危险事件如何演变，这过于绝对了

论文的价值：

1. 提出了目前数据集缺少安全关键时间，导致驾驶世界模型中存在幸存者偏差

## 1. 引言

世界模型赋予了自动驾驶 agent 在执行动作前的想象能力，因此它被视为下一代自动驾驶的关键基础设施。然而这都建立在一个关键假设上：从真实驾驶数据中学习到的未来分布，足以覆盖规划时需要评估的未来分布。

安全关键事件在公共道路上很少见，许多事件如果想刻意采集需要承担很大风险，因此记录数据的驾驶员和安全员会在大多数冲突升级之前将其化解。这就导致主流驾驶数据集如`nuScenes`、`OpenDV`、`NAVSIM`数据集的**日志中出现风险交互时，其记录的后续过程几乎总是以安全告终**。这并不只是意味着数据中很少包含碰撞场景，而是构成了驾驶世界模型中的幸存者偏差（survivorship bias）：数据几乎只包含以安全方式结束的交互，遗漏了对安全最为重要的危险结果

这种偏差**导致世界模型在面对安全关键情境时出现系统性失败**。作者用真实交通事故发生前不久录制的行车记录仪视频作为条件测试最先进的驾驶世界模型，这些模型常常想象出一个碰撞从未发生的未来。然而在现实中，这些片段每一个都以碰撞告终。这些结果表明，现有世界模型已经习得了一种偏好良性结果的乐观先验，难以预测碰撞如何演变

这一问题的根源在于**安全关键数据的稀缺**。许多方法试图合成对抗性场景，然而大多数输出的是抽象表示，例如轨迹或者 agent 状态，而不是相机图像。世界模型在没有视觉监督时难以学习危险事件如何演变。近期视频扩散模型能够合成逼真的碰撞视频，然而它们不以自车轨迹为条件，无法设想采取候选动作的后果

作者在`Ctrl-Crash`的基础上引入了自车轨迹条件，令提出的`NVM`（neutral world model，中立世界模型）既能想象安全的未来图像也能想象危险的未来图像，并根据未来图像评价轨迹

模型框架等并非此论文的核心创新点，不在赘述