---
title: Docker命令
date: 2025-05-20 20:45:31
# updated:
tags:
    - Docker
    - Linux
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
cover: https://img.wblyu.top/images/4263a51e4f3da2b8e3c124403d63f3e2.avif
---


查看本地镜像

```bash
docker images
```

查看运行容器

```bash
docker ps
```

根据镜像创建容器

```bash
docker run  --name my_container -dit --network=host my_image:tag /bin/bash

--name：加上此参数可指定生成容器的名称，此参数位置在镜像id前
my_container 指定的容器名字
-d：打开后台运行
-i：打开控制台交互（不设置此选项退出容器后docker会自动清理未活动的容器）
-t：支持终端登录
--network=host: 指定网络模式为主机网络
my_image:tag 是要使用的镜像名称和标签。不喜欢打这么多字的可以用id代替
/bin/bash 表示要在容器内启动 Bash Shell进行交互
```

进入容器正在执行的终端

```bash
docker attach 容器id
# 如果使用exit退出，容器会停止运行
# 想退出容器但不想容器停止，则按住Ctrl+P+Q退出
```

进入容器并开启一个新的终端

```bash
docker exec -it 容器id /bin/bash
# 如果使用exit退出，容器也不会停止
```

Docker容器向宿主机传送文件

```bash
docker cp container_id:<docker容器内的路径> <本地保存文件的路径>
```

宿主机向Docker容器传送文件

```bash
docker cp 本地文件的路径 container_id:<docker容器内的路径>
```
