---
title: Linux创建新用户
date: 2025-05-26 16:15:16
# updated:
tags:
    - Linux
categories: 
          - 技术文档
          - Linux系统
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
cover: https://img.wblyu.top/images/0b2476e298309e84b775d6da56984e1b.avif
---

## 1. 创建用户

### 1.1 法一：使用 `adduser` 命令创建新用户

在某些基于Debian的Linux发行版中，可以使用`adduser`命令，会提供交互式操作。

```bash
sudo adduser 新用户名
```

### 1.2 法二：使用 `useradd` 命令创建新用户

在 Linux 系统中，可以使用`useradd`这个通用命令来创建新用户

```bash
sudo useradd -m -s /bin/bash 新用户名
```

- -d 指定用户的家目录
- -s 指定用户的默认shell，可写为/bin/zsh
- -m 为新用户在 /home 目录下创建一个新的家目录

给新用户设置一个密码

```bash
sudo passwd 新用户名
```

## 2. 赋予root权限

## 2.1 法一：使用 `adduser` 命令

在某些基于Debian的Linux发行版中，可以使用`adduser`命令

```bash
sudo adduser newuser sudo
```

## 2.2 法二：修改`/etc/sudoers`文件

```bash
sudo vim /etc/sudoers
```

在文件中找到如下命令

```bash
## Allow root to run any commands anywhere
root    ALL=(ALL)     ALL
```

添加以下内容

```bash
## Allow root to run any commands anywhere
新用户名     ALL=(ALL)     ALL
```

然后按`Esc`键，然后按`w!`回车和`q!`回车，强制写入
