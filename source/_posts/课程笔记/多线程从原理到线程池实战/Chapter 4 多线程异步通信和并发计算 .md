---
title: Chapter 4 多线程异步通信和并发计算 
date: 2026-01-31 13:44:48
# updated:
tags:
    - 多线程
    - C++
categories:
          - 课程笔记
          - 多线程从原理到线程池实战
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
cover: https://img.wblyu.top/images/4dfb0c1c9a0b296dd03675346da1148f.avif
---

## 1. 异步通信

### 1.1 异步变量

**promise：**

- `promise`提供存储异步通信的值 , 再通过其对象创建的`future`异步获得结果

- `promise`创建的一个对象只能用一次`set_value`设置传递值；也只能用一次`get_future()`获取`future`对象

- 创建子线程时需要使用`move`将`promise`对象传给子线程

**future：**

- `future`对象的`get()`方法会阻塞等待`promise::set_value()`的值

**代码示例：**

```cpp
#include <iostream>
#include <future>
#include <thread>

using namespace std;

void TestFuture(promise<string> p)
{
    p.set_value("TestFuture value\n");
}

int main(int argc, char* argv[])
{
    promise<string> p;/*异步传输变量存储*/
    auto future{ p.get_future() };/*用来获取线程异步值获取*/
    thread th(TestFuture, move(p));

    cout << "future.get() = " << future.get();
    th.join();

    return 0;
}
```

### 1.2 异步调用函数

**packaged_task：**

- 包装函数为一个对象，可通过`get_future()`获取`future`对象

**代码示例：**

```cpp
#include <iostream>
#include <future>
#include <thread>

using namespace std;
string TestPack(const int index)
{
    string r {__FUNCTION__};
    r += " return";
    return r;
}

int main(int argc, char* argv[])
{
    packaged_task<string(const int)> task(TestPack);
    auto result { task.get_future() };
    thread th(move(task), 100);

    cout << "result get = " << result.get();
    th.join();

    return 0;
}
```

### 1.3 阻塞超时

- `future`对象的`wait_for()`方法会阻塞等待一段时间；如果返回结果为`future_status::ready`则说明收到信号；超时则返回`future_status::timeout`

### 1.4 创建异步线程

**async关键词标记：**

- `launch::deferred`任务在其结果首次被请求时`wait_for()`和`get()`在调用线程上执行（不创建子线程）

- `launch::async`任务在一个不同的线程上执行（创建子线程），立刻执行

## 2. 并发计算

**C++17：**

通过`std::for_each(std::execution::par,begin,end,lambda)`实现

需要包含`<algorithm>`和`<execution>`两个头文件

CMAKE需要添加`find_package(TBB REQUIRED)`和`target_link_libraries(YOUR_TARGET  PRIVATE TBB::tbb)`

**C++17之前：**

需要手动切片、手动管理线程池、手动确定边界

设置`Release`模式后二者耗时相似
