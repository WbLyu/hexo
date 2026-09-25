---
title: "Learning Agile Gate Traversal via Analytical Optimal Policy Gradient"
date: 2026-06-23 15:34:12
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
cover: https://img.wblyu.top/images/f7178a1a67c152989990a219b5119970.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://arxiv.org/pdf/2508.21592.pdf',Arxiv %}
<!-- markdownlint-enable MD034 -->

## 1. 介绍

四旋翼是欠驱动的，平移和旋转动力学是耦合的，因此，在受限空间内进行运动规划和控制很有挑战性。穿过窄门是一个典型且要求很高的任务，需要非常灵活的飞行、精确的姿态控制，以及严格遵守时空约束。这个任务被广泛用作评估敏捷运动规划和控制方法的标准

## 2. 问题提出

跟踪参考轨迹的MPC被定义为
$$
\begin{align*}
\pi(x)= \argmin _{ \xi} \ &J(\xi)= \sum_{k=0}^{N-1} c(\bm{x}_k,\bm{u}_k)+c_N(\bm{x}_N) \\
\text{s.t.} \ & \bm{x}_{k+1}=f(\bm{x}_k,\bm{u}_k), \\
& f(\bm{x}_k,\bm{u}_k) \leq 0, \\
& g_N(\bm{x}_N) \leq 0, \\
& \bm{x}_0=\bm{x}_{init}
\end{align*}
$$
其中，$f$代表离散时间动力学，$g,g_N$代表状态和输入约束，$\xi : \{ \bm{x}_{0:N},\bm{u}_{0:N-1} \}$代表状态-控制序列。在每个时间步都求解这个优化问题，得到一组最优解序列，但是只使用第一个值

动力学使用四阶龙格–库塔方法进行离散化。四旋翼的状态表示为$\bm{x}=[\bm{p},\bm{v},\bm{q}]^\top$，其中$\bm{p}=[x,y,z]^\top$代表位置，$\bm{v}=[v_x,v_y,v_z]^\top$代表速度，$\bm{q}=[q_0,q_x,q_y,q_z]^\top$代表姿态。控制量为$\bm{u}=[f_r,^\mathcal{B} \bm{\omega}]^\top$，其中$f_r$代表总体推力，$^\mathcal{B} \bm{\omega}=[\omega_x,\omega_y,\omega_z]^\top$代表以机体坐标表示的四旋翼机体角速度