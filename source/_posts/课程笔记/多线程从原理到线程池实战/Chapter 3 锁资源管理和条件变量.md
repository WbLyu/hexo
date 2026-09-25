---
title: Chapter 3 锁资源管理和条件变量
date: 2026-01-26 19:31:55
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
cover: https://img.wblyu.top/images/29c90850d81f15630d2001af16eec275.avif
---

## 1. RAII锁管理类

借助对象实现构造时可自动加锁，析构时自动解锁，并通过`{ }`控制锁的临界区

### 1.1 互斥锁管理类`lock_guard`(C++11)

**关键词标记：**

- `adopt_lock`标记/`adopt_lock_t`标记(C++11)，用于手动加锁后，想让RAII工具接管解锁的场景，此时不需要再次手动释放锁

### 1.2 互斥锁管理类`unique_lock`(C++11)

**关键词标记：**

- `adopt_lock`标记/`adopt_lock_t`标记(C++11)

- `defer_lock`延后拥有，只有再次手动上锁后才拥有锁，如果未拥有锁，则出栈区不释放。当`unique_lock`作为成员变量时需要使用此标记

- `try_to_lock`尝试获取锁，不阻塞，获取失败退出栈区不释放

**特点：**

- 可以调用`unlock()`和`lock()`来临时解锁和上锁

- 可以调用`owns_lock()`来判断是否拥有锁，拥有则返回`true`

- 比`lock_guard`更加灵活，但是效率、内存占用差一些，同时支持**移动构造**

### 1.3 共享锁管理类`shared_lock`(C++14)

**特点：**

- 构造时会自动调用共享锁的`lock_shared()`即读锁，析构会调用`unlock_shared()`，因此`shared_lock`只能管理读锁部分

- 想要管理写锁部分需要使用`unique_lock`类，但是`unique_lock`和`shared_lock`需要传入同一个共享锁`shared_mutex`/`shared_timed_mutex`

- 支持**移动构造**

### 1.4 多个互斥锁管理类`scoped_lock`(C++17)

适用场景

```cpp
static std::mutex mux1;
static std::mutex mux2;

void Scope1
{
    mux1.lock();
    mux2.lock();

    mux1.unlock();
    mux2.unlock();
}

void Scope2
{
    mux2.lock();
    mux1.lock();

    mux1.unlock();
    mux2.unlock();
}
```

两个线程可能形成死锁，此时需要借助`lock(mux1,mux2)`函数(C++11)或者`scoped_lock`类(C++17)来避免死锁

**特点：**

- 可同时管理多个锁，它会尝试按顺序获取每个锁。如果在尝试获取下一个锁时失败，它会释放所有已经获取的锁，稍后再重试，以此避免死锁

- 原理类似`lock(mux1,mux2)`函数

## 2. 条件变量

生产者—消费者模型：

- 生产者和消费者共享资源变量
- 生产者生产一个产品，通知消费者消费
- 消费者阻塞等待信号，获取信号后消费产品

定义

```cpp
std::condition_variable cv;
std::mutex mux;
```

写线程

```cpp
{
    // 获取锁资源
    std::unique_lock lock(mux);
    // 写入数据
    msgs_.push_back(data);
    // 释放锁资源
}
// 通知一个等待信号线程
cv.notify_one();
// 通知所有等待信号线程
// cv.notify_all(); 
```

读线程

```cpp
// 获取锁资源，这里加锁是condition_variable的硬性语义要求
std::unique_lock lock(mux);
// 释放锁资源,并阻塞等待notify_one notify_all通知
cv.wait(lock);
// 处理数据
msgs_.front();
msgs_.pop_front();
```

**成员方法：**

- `wait(lck)`会原子地执行以下步骤：释放锁资源、阻塞当前线程、被唤醒后重新加锁、返回

- `wait(lck, pred)`，其中`pred`可以写入`lambda`函数，用于返回判断条件，它的源码如下

```cpp
template <class _Predicate>
void wait(unique_lock<mutex>& _Lck, _Predicate _Pred) 
{
    while (!_Pred()) { 
        wait(_Lck);
    }
}
```

真正执行的步骤如下：

1. 首先判断`pred`是否为真，如果为真，则条件满足，无需调用`wait(lck)`，也就无需等待通知，直接处理
2. 如果`pred`为假，则调用`wait(lck)`，释放锁资源、阻塞当前线程、被唤醒后重新加锁、返回。然后再次判断`pred`是否为真。如果为真则处理任务；如果为假则继续重复本过程

关键总结：

1. 通知并不是让线程继续执行而是提醒线程可以再检查一次条件
2. 如果条件已经满足便绝不等待，无需等待通知

**注意：**

- `pred`写入的`lambda`函数中需要添加退出条件，以防止线程一直阻塞，无法退出

```cpp

cv.wait(lock,[this]{
    if(is_exit())
    {
        return true;
    }
    return !list_.empty();
});
```
