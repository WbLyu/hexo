---
title: Eigen
date: 2026-04-10 20:39:44
# updated:
# tags:
#     - 
categories: 笔记
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
cover: https://img.wblyu.top/images/bdce900ed63ed5e08226c039f8bab9bb.avif
---

1. `cwiseAbs()`方法

   逐元素取绝对值，返回一个新的同尺寸矩阵

2. `maxCoeff()`方法

    找到矩阵中数值最大的那个元素，并返回该值

3. `topRightCorner(m,n)`方法

    取矩阵的右上角子矩阵，大小为m行×n列

4. `bottomRightCorner(m,n)`方法

    取矩阵的右下角子矩阵，大小为m行×n列

5. `colwise().操作()`方法

    对矩阵的每一列单独执行同一个操作

6. `normalize()/normalized()`方法

    对向量归一化，`normalize()`修改向量本身；`normalized()`返回新向量，不修改原向量本身

7. `head(d)`方法

    取向量的前d个元素，引用取出，可修改原值