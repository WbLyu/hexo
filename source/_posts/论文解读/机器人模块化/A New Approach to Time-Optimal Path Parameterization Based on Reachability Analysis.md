---
title: "A New Approach to Time-Optimal Path Parameterization Based on Reachability Analysis"
date: 2026-07-02 21:33:28
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
cover: https://img.wblyu.top/images/7f20c83a753bf9142dd9c2b1ceaf2f48.avif
---

<!-- markdownlint-disable MD034 -->
{% btn 'https://github.com/hungpham2511/toppra',GitHub %}
{% btn 'https://ieeexplore.ieee.org/document/8338417',TRO %}
{% btn 'https://anaconda.org/channels/conda-forge/packages/libtoppra/overview',Conda %}
<!-- markdownlint-enable MD034 -->

`TOPP-RA`算法解决的问题是，再给定一条路径后，怎么在不违反动力学约束的情况下跑完这条路。即路径的时间分配

`TOPP-RA`的代码库在逐渐放弃对`Python`的支持，建议使用`C++`版本

## 1. 简介

之前关于`TOPP`两种主流方法为`TOPP-NI`（数值积分）和`TOPP-CO`（凸优化）

`TOPP-NI`方法速度快，但是实现困难，并且鲁棒性差；`TOPP-CO`方法鲁棒性强，但是速度慢，这篇论文解决了二者的不足

## 2. 