---
title: C++踩坑记录
date: 2025-07-30 23:28:35
# updated:
tags:
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
cover: https://img.wblyu.top/images/9813ccec639d5abd26d137bf13ef7e58.avif
---

## 1. 数组智能指针

在创建指向数组的智能指针时需要注意传入模板的类型需要加中括号，例如创建八个元素的整数数组指针`std::unique_ptr<int[]> ptr = std::make_unique<int[]>(8)`

## 2. 移位操作

移位运算符即按二进制形式把所有数字向左移动相应的位数，高位舍弃，空位补0。因此移位后**返回的字符宽度**与**需要移位**的数字**字符宽度保持一致**

注意**移动的位数不得超过变量的字符宽度**，不然会导致未定义行为

此时便出现了易错点：**移位操作时存在整数提升现象**，即小于或等于`int`的整数类型在运算时会被自动提升为`int`或`unsigned int`（当`int`不够存储原类型数据），这样是不安全的，因此**需要在移位前先显示进行类型转换**

---
参考文章[C++ 整数提升与移位陷阱](https://www.cnblogs.com/sprinining/p/18994484)

参考文章[C++移位运算符详解](https://www.cnblogs.com/shrimp-can/p/5145351.html)

## 3. 判断两个`double`类型是否相等

由于浮点数储存的精度问题，直接使用相等运算符（==）判断两个`double`类型的数是否相等可能会导致意外的结果，因此可以设置一个极小的阈值作为两数相差的上限

```cpp
bool isEqual(double a, double b) {
       const double epsilon = 1e-9; // 自定义的阈值
       return std::abs(a - b) < epsilon;
   }
```
