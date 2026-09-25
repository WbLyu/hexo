---
title: Chapter 2 多线程通信和同步
date: 2026-01-24 22:18:05
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
cover: https://img.wblyu.top/images/66863db4ee5e697ec7c10cbd7cf7fc52.avif
---

## 2. 锁

### 2.1 互斥锁`mutex`

**成员方法：**

- `lock()`获取锁资源，如果获取不到则阻塞等待

- `unlock()`释放锁资源

- `try_lock()`尝试获取锁资源，如果获取成功返回`true`；否则返回`false`，并不会阻塞线程

**互斥锁的坑**：

- 释放锁资源只是告诉操作系统要释放锁资源，故而并不是立即释放，此时如果再次立即获取锁资源，此线程会再次上锁，其他线程无法获取

### 2.2 超时锁`timed_mutex`

**成员方法：**

- `try_lock_for(std::chrono::duration)`在指定的时间期限内尝试获取互斥锁。如果在这个时间期限内获得了锁，函数返回 `true`；否则函数返回`false`。如果接受的参数接近`0`，那么函数的功能基本就等于`try_lock()`

### 2.3 递归锁`recursive_mutex`和`recursive_timed_mutex`

**特点：**

- 可以多次`lock()`和`unlock()`当计数为`0`时才真正释放，而普通锁多次上锁属于**未定义行为**

### 2.4 共享锁`shared_timed_mutex`(C++14)和`shared_mutex`(C++17)

**成员方法：**

- `lock_shared()`又称读锁。读锁上锁后其他线程仍然能够获取读锁，但是获取写锁时会阻塞

- `lock()`又称写锁。写锁上锁后，其他线程调用`lock()`和`lock_shared()`都会被阻塞
