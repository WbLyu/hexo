---
title: Docker终端中文显示与输入
date: 2025-12-10 10:43:47
# updated:
tags:
    - Docker
    - 编码
categories: 
          - 技术文档
          - 服务部署
# keywords:
# description:
top_img: transparent
# comments:
# cover:
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
---

## 1. 安装依赖

```bash
apt update
apt install locales
```

## 2. 修改语言为`C.UTF-8`

```bash
update-locale LANG=C.UTF-8 LC_ALL=C.UTF-8
```

修改`.bashrc`配置文件

```bash
vim ~/.bashrc
```

滚动到文件末尾，添加

```bash
export LANG="C.UTF-8"
export LC_ALL="C.UTF-8"
```

刷新

```bash
source ~/.bashrc
```