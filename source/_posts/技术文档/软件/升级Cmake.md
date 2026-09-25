---
title: 升级Cmake
date: 2025-05-21 17:02:54
# updated:
tags:
    - Cmake
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
cover: https://img.wblyu.top/images/e6e4578172855394a7a5fb6100811905.avif
---

## 1. 安装

安装依赖

```bash
sudo apt install libssl-dev
```

### 1.1 发行版安装

在[官网](https://cmake.org/download/)下载压缩包

```bash
wget https://github.com/Kitware/CMake/releases/download/v3.31.12/cmake-3.31.12-linux-x86_64.tar.gz

tar -xvzf cmake-3.31.12-linux-x86_64.tar.gz
```

### 1.2 源码编译安装

去[官网](https://cmake.org/files/)下载所需版本的源码。也可以使用wget下载，例如：

```bash
wget https://cmake.org/files/v3.28/cmake-3.28.5.tar.gz

tar -xvzf cmake-3.28.5.tar.gz
```

进入目录配置

```bash
cd cmake-3.28.5
chmod 777 ./configure
./configure
make -j8
sudo make install
```

## 2. 替换

最后使用新安装的Cmake替换旧版本，其中`/usr/local/bin/cmake`为新安装的Cmake目录

```bash
sudo update-alternatives --install /usr/bin/cmake cmake /usr/local/bin/cmake 1 --force
```
