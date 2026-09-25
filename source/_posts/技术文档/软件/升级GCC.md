---
title: 升级GCC
date: 2025-05-21 17:01:08
# updated:
tags:
    - GCC
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
cover: https://img.wblyu.top/images/04dfdd7a154efabf1af17511da94de07.avif
---

## 1. 查看版本

```bash
gcc -v 
```

```bash
g++ -v
```

## 2. 下载指定版本

进入[清华源](https://mirror.tuna.tsinghua.edu.cn/gnu/gcc)下载相应版本

```bash
wget https://mirror.tuna.tsinghua.edu.cn/gnu/gcc/gcc-14.1.0/gcc-14.1.0.tar.gz
```

解压文件进入目录,我下载的是gcc-14.1.0,版本因人而异

```bash
tar -xf gcc-14.1.0.tar.gz
cd gcc-14.1.0
# 下载依赖包
./contrib/download_prerequisites
# 创建一个用于编译GCC的目录：
mkdir build && cd build
# 配置编译选项：
../configure --prefix=/opt/gcc-14.1.0 --enable-languages=c,c++ --disable-multilib
# 开始编译
make -j8
# 最后，安装GCC：
sudo make install
```

## 3. 设置软链接

查看系统gcc/g++版本

```bash
sudo updatedb --prunepaths="/mnt"
locate g++|grep /usr/bin/
locate gcc|grep /usr/bin/ 
```

设置软链接的优先级

```bash
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 10
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 10

sudo update-alternatives --install /usr/bin/gcc gcc /opt/gcc-14.1.0/bin/gcc 20
sudo update-alternatives --install /usr/bin/g++ g++ /opt/gcc-14.1.0/bin/g++ 20
```

手动切换gcc与g++版本

```bash
sudo update-alternatives --config gcc
sudo update-alternatives --config g++
```

## 4. 更新系统libstdc++版本

libstdc++是适应于g++的标准库,位于`/usr/lib/x86_64-linux-gnu/`下面
使用指令先看下系统目前都有哪些版本的

```bash
strings /usr/lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
```

寻找安装高版本gcc目录下的libstdc++.so.6

```bash
sudo find /opt -name "libstdc++.so.6*"
```

使用之前的指令看看其是否包含需要的版本

```bash
strings /opt/gcc-14.1.0/lib64/libstdc++.so.6.0.33 | grep GLIBCXX
```

将文件复制到指定目录并建立新的链接

```bash
# 复制
sudo cp /opt/gcc-14.1.0/lib64/libstdc++.so.6.0.33 /usr/lib/x86_64-linux-gnu/
# 删除之前链接
sudo unlink /usr/lib/x86_64-linux-gnu/libstdc++.so.6
# 创建新的链接
sudo ln -s /usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.33 /usr/lib/x86_64-linux-gnu/libstdc++.so.6
```
