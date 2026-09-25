---
title: Ubuntu创建快捷方式
date: 2026-08-27 19:27:58
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
cover: https://img.wblyu.top/images/bf1d4c8122da1ead5236a376b1cd5b5d.avif
---

## 1. 获取图标

`AppImage`一般已经带有图标，可以从中提取出图标文件

```bash
./xxxx.AppImage --appimage-extract
```

在出现的`squashfs-root/`目录中能找到对应的`.png`文件或者`.svg`文件

然后把图标放入`Freedesktop`的图标目录

```bash
mkdir -p ~/.local/share/icons/hicolor/256x256/apps
cp xxx.png ~/.local/share/icons/hicolor/256x256/apps/xxx.png
```

`svg`对应的是`hicolor/scalable/apps`

刷新图标缓存

```bash
gtk-update-icon-cache -f -t ~/.local/share/icons/hicolor
```

## 2. 创建配置文件

创建桌面快捷方式，本质上就是创建一个`.desktop`文件，一般放在`~/.local/share/applications/`下，首先创建文件

```bash
vim ~/.local/share/applications/xxx.desktop
```

写入：

```ini
[Desktop Entry]
Name=xxx
Comment=xxx
Exec=/home/xxx/xxxx.AppImage
Icon=xxxxx
Terminal=false
Type=Application
Categories=Development;
StartupNotify=true
```

`Icon`部分直接写为找的图标，然后赋予权限并更新应用数据库

```bash
chmod +x ~/.local/share/applications/xxx.desktop

update-desktop-database ~/.local/share/applications/
```

如果希望桌面上也直接出现图标，可以复制一份

```bash
cp ~/.local/share/applications/xxx.desktop ~/桌面/
chmod +x ~/桌面/xxx.desktop
```

如果更改图标后没有刷新，可以重启。对于`x11`，可以只重启`GNOME Shell`，按下`Alt + F2`，输入`r`
