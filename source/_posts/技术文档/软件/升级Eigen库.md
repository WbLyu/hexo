---
title: 升级Eigen库
date: 2025-05-21 17:01:57
# updated:
tags:
    - Eigen
    - Linux
categories: 
          - 技术文档
          - 软件
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
cover: https://img.wblyu.top/images/b78a93a2559e9ac12f1fb3b82dd0ebf1.avif
---

`usr/include/eigen3`存放的是apt安装的Eigen库

`/usr/local/include/eigen3`存放的是源码安装的Eigen库

## 1. 查看Eigen版本

```bash
sudo updatedb

locate Macros.h|grep eigen3

vim (相应位置)/usr/include/eigen3/Eigen/src/Core/util/Macros.h
```

## 2. 安装

下载Eigen源码,最好下载最新release版本

```bash
wget https://gitlab.com/libeigen/eigen/-/archive/3.4.0/eigen-3.4.0.tar.gz
# 解压
mkdir eigen-3.4.0
tar -zxvf eigen-3.4.0.tar.gz -C ./eigen-3.4.0
#编译安装
mkdir build && cd build
cmake ..
sudo make install
```

只需将eigen文件复制到本地调用文件夹`/usr/include`中就能完成对apt安装的覆盖

```bash
sudo cp -r /usr/local/include/eigen3 /usr/include
```
