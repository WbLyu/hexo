---
title: ROS笔记
date: 2025-08-01 23:55:23
# updated:
tags:
    - ROS
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
cover: https://img.wblyu.top/images/70461c7b5dc98d82174be0720804f284.avif
---

## 1. 将Subscriber类作为类中成员变量

在类中使用`ros::Subscribe`需要参考以下格式：`kNH->subscribe("话题", 1, &类::回调函数, this)`

## 2. 节点句柄

### 2.1 放于main()函数中

如果将节点句柄的构造放于main()函数中，那么需要通过构造函数的参数接口传入类中，**过于冗余**

### 2.2 作为类的成员变量

在构造函数中，如果需要通过调用节点句柄`param`方法获取参数并传入基类的构造函数时，会出现问题。因为基类的构造函数是先于子类成员的初始化的，所以在进行**基类构造**的时候**节点句柄还未初始化**，无法获取正确的参数

### 2.3 作为全局变量

如果将节点句柄的构造作为全局变量，会导致**节点句柄的构造先于节点初始化**，出现报错

### 2.4 作为全局智能指针

将节点句柄的构造作为全局智能指针，并初始化为空指针，在main()函数中节点初始后为智能指针赋值，实现**延迟加载**

## 3. 回调函数

回调函数中不要设置阻塞（如循环判断），因为所有的回调函数共享同一个线程，一个回调函数阻塞，其他回调函数也无法进行

## 4. 使用param获取参数

### 4.1 获取话题名称

使用param获取话题名称时不要初始化构造subscribe/advertise，如

```cpp
cloud_topic_{kNHPrivate->param("cloud_topic",
                                         std::string("/cloud_registered"))},

