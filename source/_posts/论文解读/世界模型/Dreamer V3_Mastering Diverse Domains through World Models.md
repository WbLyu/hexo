---
title: "Dreamer V3: Mastering Diverse Domains through World Models"
date: 
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
cover: https://img.wblyu.top/images/f7db7b4e1b6877c23a7515c77ded63f1.avif
---

## 2. 世界模型

此论文将世界模型建模为RSSM，并将潜状态显示表示为随机部分$z_t$和确定部分$h_t$，并加入了episode是否继续的标志$c_t \in \left\{ 0,1 \right\}$，完整公式为

$$
\text{Sequence model: }h_t = f_\phi (h_{t-1},z_{t-1},a_{t-1}) \\
\text{Encoder: }z_t \sim q_\phi (z_t \mid h_t,x_t) \\
\text{Dynamics predictor: }\hat{z}_t \sim p_\phi (\hat{z}_t \mid  h_t) \\
\text{Reward predictor: }\hat{r}_t \sim p_\phi (\hat{r}_t \mid  h_t,z_t) \\
\text{Continue predictor: }\hat{c}_t \sim p_\phi (\hat{c}_t \mid  h_t,z_t) \\
\text{Decoder: }\hat{x}_t \sim p_\phi (\hat{x}_t \mid  h_t,z_t) \\
$$

其中的$\hat{\square}$用以区分真实变量和想象变量，观测为$x_t$。$q_\phi (z_t \mid h_t,x_t)$对应后验；$p_\phi (\hat{z}_t \mid  h_t)$对应先验