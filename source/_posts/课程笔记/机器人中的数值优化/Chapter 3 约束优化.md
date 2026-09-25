---
title: Chapter 3 约束优化
date: 2026-04-08 16:24:23
# updated:
tags:
    - 数值优化
categories:
          - 课程笔记
          - 机器人中的数值优化
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
cover: https://img.wblyu.top/images/6386459b40a9ee1f92f87702b82627bc.avif
---

## 1. 低维线性规划

### 1.1  问题描述

最大化（最小化）**目标函数**

$$
f(x_1,x_2 \cdots x_d) = c_1 x_1 + c_2 x_2 + \cdots + c_d x_d
$$

需满足的**约束**为

$$
a_{1,1}x_1 + \cdots + a_{1,d}x_d \le b_1 \\
a_{2,1}x_1 + \cdots + a_{2,d}x_d \le b_2 \\
\vdots \quad\quad\quad\quad \vdots \quad\quad\quad \vdots \\
a_{n,1}x_1 + \cdots + a_{n,d}x_d \le b_n
$$

此线性规划的维度为$d$

这些约束形成的可行区域是一个$\mathbb{R}^d$中的凸多面体，可以看成是$n$个半空间的交集

### 1.2 Seidel's算法

适用于维度比较低（个位数）的线性规划

此算法的提出基于如下结论

1. 最终的最优解一定落在约束形成的半空间上

算法结构

```
随机遍历约束
    如果当前解违反约束：
        → 把问题限制到这个约束上
        → 降一维
        → 递归求解
```
