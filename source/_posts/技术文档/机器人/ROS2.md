---
title: ROS2使用教程
date: 2026-01-19 15:24:47
# updated:
tags:
    - ROS2
categories: 
          - 技术文档
          - 机器人
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
cover: https://img.wblyu.top/images/00a4f76516b112eba4a8de192af4a271.avif
---

## 1. 安装

### 1.1 安装ros2

切换成bash后使用小鱼一键安装

```bash
bash

wget http://fishros.com/install -O fishros && . fishros
```

1. Ubuntu 22.04建议安装humble
2. Ubuntu 24.04建议安装jazzy

### 1.2 安装colcon

```bash
sudo apt install python3-colcon-common-extensions
```

## 2. ZSH补全

### 2.1 humble版本

为了解决`zsh`下`ros2`命令无法自动补全的问题，我们需要在`/opt/ros/humble/setup.zsh`的末尾添加如下命令

```bash
eval "$(register-python-argcomplete3 ros2)"
eval "$(register-python-argcomplete3 colcon)"
```

### 2.2 jazzy版本

为了解决`zsh`下`ros2`命令无法自动补全的问题，我们需要在`/opt/ros/jazzy/setup.zsh`的末尾添加如下命令

```bash
eval "$(register-python-argcomplete ros2)"
eval "$(register-python-argcomplete colcon)"
```

### 3. 在wsl中使用

wsl的网络隔离、多播限制，导致节点间无法通信、ros2 daemon无法在节点启动时自动激活，需要手动拉起

```bash
ros2 daemon start
```

### 4. 安装Gazebo

```bash
sudo apt install ros-humble-ros-gz
# 或者
sudo apt install ros-jazzy-ros-gz
```
