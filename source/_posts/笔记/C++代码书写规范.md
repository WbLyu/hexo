---
title: C++代码书写规范
date: 2025-05-21 16:42:32
# updated:
tags:
    - C++
    - 代码规范
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
cover: https://img.wblyu.top/images/2b63b66c47329be958fafe5994f11ff6.avif
---

1. 变量命名使用下划线命名法，函数命名使用大驼峰命名法，类和结构体使用大驼峰命名法，文件名使用下划线命名法
2. 全局变量和常量使用k+大驼峰命名法，类成员变量可以以下划线作为结尾，结构体成员变量不加下划线
3. 命名空间用下划线命名法
4. 尽量不要使用全局变量，可以将其封装进对象里
5. ros中回调函数的形参可以使用const name & 修饰
6. 函数声明中const修饰符无意义，只需在函数定义中使用
7. 模板类的静态成员变量是每个特定实例化类型共享一份，而不是所有实例化类共享同一份。例如MyClass\<int\>和MyClass\<double\>的静态成员变量是独立的。
