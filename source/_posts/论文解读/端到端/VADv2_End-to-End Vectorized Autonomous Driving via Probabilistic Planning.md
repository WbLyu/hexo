---
title: "VADv2: End-to-End Vectorized Autonomous Driving via Probabilistic Planning"
date: 2026-07-27 20:00:41
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
{% btn 'https://github.com/hustvl/VAD',GitHub %}
{% btn 'https://arxiv.org/abs/2402.13243',ICLR 2026 %}
<!-- markdownlint-enable MD034 -->

## 1. 简介

本文贡献

1. 提出概率规划以应对规划中的不确定性（Uncertainty，指信息不完整）和非确定性（Non-deterministic，指未来的随机性）特征，并能对非凸可行解空间（存在多条最优轨迹）进行建模，从而实现更准确、更安全的规划
2. V1使用Query，是因为它把规划当成一个类似于目标检测的特征提取与坐标回归任务；V2使用Token，是因为它借助了LLM的思想，把自动驾驶当成了一个语言翻译的任务（根据上下文对候选词进行概率预测）

![vadv2-1.png](https://img.wblyu.top/end-to-end/vadv2-1.png)

![vadv2-2.png](https://img.wblyu.top/end-to-end/vadv2-2.png)

## 2. 相关工作

## 3. 方法


VAD中的 Query：主要是一种隐式的特征聚合工具。虽然 Map Query 和 Agent Query 也对应了具体的地图线和车辆，但它们最终只是为了填充 Ego Query 的信息量。
VADv2中的 Token：是一种显式的实体/动作表示。
Scene Tokens（Map Token, Agent Token等）：显式表示场景中的具体实体。
Planning Tokens：显式表示动作空间中的离散动作。 这种 Token 化使得整个自动驾驶任务变成了类似语言模型中的“给定上下文，预测下一个词”的任务，极大地提升了模型的可扩展性和与规则结合的灵活性。