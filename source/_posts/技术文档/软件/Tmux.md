---
title: Tmux
date: 2025-05-20 20:29:28
# updated:
tags:
    - Tmux
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
cover: https://img.wblyu.top/images/3693bdc2357a025e6d9adfc712de6bf0.avif
---

## 1. 安装

```bash
git clone git@github.com:tmux/tmux.git
cd tmux
sh autogen.sh
./configure && make
```

## 2. 配置

再配合zsh使用时会出现提示代码为白色的现象，需要修改~/目录下的.tmux.conf

```bash
set -g default-terminal "tmux-256color"
```

为了让tmux支持鼠标操作，需要继续加入内容

```bash
set-option -g mouse on
```

## 3. 使用

tmux的使用可参考[博客](https://www.cnblogs.com/zhiminyu/p/17457933.html)

## 4. 多窗口同步操作

修改~/目录下的.tmux.conf

```bash
vim ~/.tmux.conf
bind-key s setw synchronize-panes
source ~/.tmux.conf
```

便可以通过按`Ctrl+b s`来切换同步输入
