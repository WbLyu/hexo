---
title: Ubuntu输入法
date: 2026-07-08 19:23:32
# updated:
tags:
    - Linux
    - 输入法
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
cover: https://img.wblyu.top/images/11755bec33f8c2674411a4b45d9753c1.avif
---

## 1. 卸载系统默认的`IBus`

系统自带的`IBus`不具备记忆功能，建议卸载防止与新安装的`Fcitx5`冲突

```bash
sudo apt purge ibus ibus-gtk ibus-gtk3
```

## 2. 安装`Fcitx5`和`RIME`

```bash
sudo apt install -y fcitx5 fcitx5-chinese-addons fcitx5-rime fcitx5-config-qt
```

设置环境变量

```bash
vim ~/.bashrc
```

```bash
# >>>Fcitx5>>>
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
export INPUT_METHOD=fcitx
export SDL_IM_MODULE=fcitx
export GLFW_IM_MODULE=ibus
# <<<Fcitx5<<<
```

刷新

```bash
source ~/.bashrc
```

启动服务并查看状态

```bash
# 启动服务
fcitx5 -d

# 检查状态
fcitx5-diagnose
```

## 3. 安装白霜拼音

进入`Fcitx5`的配置父目录：

```bash
cd ~/.local/share/fcitx5/
```

备份旧rime文件夹

```bash
mv rime rime-backup
```

通过`Git`下载白霜拼音

```bash
git clone --depth 1 https://github.com/gaboolic/rime-frost rime
```

重新部署让配置生效

```bash
fcitx5-remote -r
```

打开配置工具

```bash
fcitx5-configtool
```

将rime（中州韵）加入当前输入法

## 4. 激活右Shift切换中英文

进入配置目录

```bash
cd ~/.local/share/fcitx5/rime
```

创建用户配置

```bash
vim default.custom.yaml
```

加入以下补丁

```yaml
patch:
  ascii_composer/switch_key:
    # 保留左Shift原有行为（通常为 commit_code）
    Shift_L: commit_code
    # 让右Shift也能切换中英文，行为与左Shift一致
    Shift_R: commit_code
```

保存后，右键点击输入法图标选择“重新部署"