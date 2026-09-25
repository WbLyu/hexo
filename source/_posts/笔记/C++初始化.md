---
title: C++初始化
date: 2025-05-21 16:43:45
# updated:
tags:
    - 初始化
    - C++
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
cover: https://img.wblyu.top/images/be369476e20df3fb1c980fad589508dd.avif
---

## 1. 列表初始化

初始化列表用{}表示，正常是没有类型的，但是在函数的参数列表中可以用std::initializer_list表示能够接收初始化列表。

std::initializer_list在一下情况会自动构造对象:

1. 用于列表初始化对象，并且构造函数需要能够接受std::initializer_list参数
2. 用于赋值或者函数调用，并且赋值运算符/函数需要能够接受std::initializer_list参数
3. 绑定到auto或者包括在范围 for 循环中

> auto p = { 1,2,3 };//能够推导出类型为std::initializer_lis
>
> auto p2  { 1,2,3 };//无法推导
