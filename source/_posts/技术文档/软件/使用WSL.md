---
title: 使用WSL
date: 2025-05-21 16:53:51
# updated:
tags:
    - WSL
    - Linux
    - Windows
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
cover: https://img.wblyu.top/images/a95ffda820f48d1d94cfefb93c755e50.avif
---

## 1. 与Windows网络共享

在Windows用户文件夹下新建`.wslconfig`文件并写入

```ini
[experimental]
autoMemoryReclaim=gradual # 可以在 gradual 、dropcache 、disabled 之间选择
networkingMode=mirrored
dnsTunneling=true
firewall=true
autoProxy=true
sparseVhd=true
```

## 2. 排除对Windows中的文件检索

在WSL的/etc/wsl.conf文件中加入如下内容

```ini
[interop]
appendWindowsPath = false
[automount]
enabled = false
```

理论上可以关闭与Windows的交互，但是由于WSL共享了Windows的网络，所以无法真正禁止磁盘挂载。

可以修改updatedb的搜索范围来减小磁盘挂载的影响，编辑 /etc/updatedb.conf的方法并不是对所有发行版全部适用，可以在.zshrc或者.bashrc中加入如下内容

```bash
alias updatedb="sudo updatedb --prunepaths=\"/mnt/c /mnt/d\""
```

以后只需要执行updatedb就行了
