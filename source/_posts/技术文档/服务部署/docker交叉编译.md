---
title: docker交叉编译
date: 2026-08-23 14:41:17
# updated:
tags:
    - docker
categories: 
          - 技术文档
          - 服务部署
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
cover: https://img.wblyu.top/images/22932cde2faa8653713a87e280f8ba1e.avif
---

1. 安装 binfmt/QEMU
执行：
docker run --privileged --rm tonistiigi/binfmt --install all
正常输出类似：
installing: arm64 OK
installing: arm OK
installing: riscv64 OK
...

创建支持多架构的 builder
不要使用 default。
创建新的：
docker buildx create \
    --name multiarch \
    --driver docker-container \
    --use
注意这里：
--driver docker-container
很重要。
因为：
driver=docker
能力有限。
3. 初始化
docker buildx inspect --bootstrap
现在应该看到：
Platforms:
 linux/amd64
 linux/amd64/v2
 linux/amd64/v3
 linux/arm64
 linux/arm/v7
 ...
 4. 测试 ARM64
先不要编译你的 ROS。
测试：
docker buildx build \
    --platform linux/arm64 \
    -t test-arm64 \
    --load \
    .
或者简单：
docker run \
    --rm \
    --platform linux/arm64 \
    ubuntu:20.04 \
    uname -m
应该输出：
aarch64
5. 对你的 mtare 项目
之后：
docker buildx build \
    --platform linux/arm64 \
    -t mtare:arm64 \
    -f Dockerfile.dev \
    --load \
    .
其中：
--load
表示：
构建完成后导入本地 docker image。
适合测试。
如果以后推送到 Docker Hub：
用：
docker buildx build \
    --platform linux/arm64 \
    -t username/mtare:arm64 \
    --push .