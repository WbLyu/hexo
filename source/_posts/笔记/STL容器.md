---
title: STL容器
date: 2025-05-20 20:30:41
# updated:
tags:
    - C++
    - STL
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
cover: https://img.wblyu.top/images/9f8d6c97abda2b283ed8c054b3f48420.avif
---

## 1. Array

### 1.1 初始化

std::array无构造函数，只含有非静态公共成员变量，所以属于**聚合类型**，其他聚合类型还有**数组类型**。

对聚合体使用列表初始化被称为**聚合初始化**，它也是列表初始化的一种形式，聚合体初始化需要**层层嵌套**。

std::array的定义大概如下：

```cpp
template<typename T, std::size_t N>
class array {
public:
  T _data[N];
};
```

它的聚合初始化如下：

```cpp
/**
* 第一层是为了初始化std::array本身
* 第二层是为了初始化里面的数组
*/
std::array<int, 3> arr{{1,2,3}};
```

由于 C++ 聚合初始化时允许省略所有的内部花括号，所以可以简写做：

```cpp
std::array<int, 3> arr{1,2,3};
```

对于二维数组。标准形式的初始化如下：

```cpp
/**
* 最外两层是为了初始化外层array
* 内部两层是为了初始化内层array
*/
std::array<std::array<int, 4>, 3> a{{
  {{1, 2, 3, 4}},
  {{5, 6, 7, 8}},
  {{9, 10, 11, 12}}
}};
```

因为子数组内不再出现内部花括号，所以可以让子数组采用省略语法：

```cpp
/**
* 最外两层是为了初始化外层array
* 内部一层是省略后的写法
*/
std::array<std::array<int, 4>, 3> a{{
  {1, 2, 3, 4},
  {5, 6, 7, 8},
  {9, 10, 11, 12}
}};
```

## 2. Vector

### 2.1 赋值

在将其他容器的数值赋值给std::vector时，有两种方式，分别是通过构造函数或assign方法和使用std::copy算法。使用构造函数和assign会自动管理内存和大小，无需使用resize手动预留空间；使用std::copy算法需要先分配空间

```cpp
#include <array>
#include <vector>

int main() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};

    // 方法1: 通过构造函数初始化
    std::vector<int> vec1(arr.begin(), arr.end());

    // 方法2: 通过assign方法赋值
    std::vector<int> vec2;
    vec2.assign(arr.begin(), arr.end());

    return 0;
}
```

```cpp
#include <array>
#include <vector>
#include <algorithm> // 需要包含 algorithm 头文件

int main() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};
    std::vector<int> vec;

    // 确保 vector 有足够空间（可选，但建议提前预留）
    vec.resize(arr.size());

    // 使用 std::copy
    std::copy(arr.begin(), arr.end(), vec.begin());

    return 0;
}
```

## 2.2 增添元素

std::vector可以使用`push_back()`方法在末尾添加元素，也可以使用`emplace_pack()`方法在末尾添加元素。二者的差别如下:

1. emplace_back()方法是成员函数模板，它根据传入的变量来推导类型；push_back()方法只是使用了类模板std::vector的类型模板形参，使用时已经实例化了对象，参数类型是确定的。
2. emplace_back()方法可以接受构造函数的参数，而push_back()方法只能接受一个参数，因为参数类型是确定的。
3. 当emplace_back()接收参数时可以直接在目标内存中直接构造对象，即**原位构造**。比生成副本后移动性能更好。

> **初始化器列表不参与模板参数推导**，对emplace_back()传入{}时会报错。但是push_back()不是函数模板，不需要推导类型，不会报错
>
> 当参数类型和容器数据类型一致时，二者都会调用拷贝构造函数或者移动构造函数，二者没有区别
