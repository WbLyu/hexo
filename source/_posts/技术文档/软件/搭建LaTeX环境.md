---
title: 搭建LaTeX环境
date: 2025-09-10 19:39:44
# updated:
tags:
    - LaTeX
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
cover: https://img.wblyu.top/images/47d681ea36bbea43fa11a97c2c4305aa.avif
---

所用的环境：

1. 操作系统版本：Ubuntu
2. 编辑器：VScode

## 1. 编译器的下载与安装

### 1.1 文件下载

在[清华源](https://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/Images/)中下载镜像文件

对镜像文件挂载

```bash
sudo mount texlive.iso /mnt
```

### 1.2 图形界面安装

先安装图形化界面

```bash
sudo apt-get install perl-tk
```

启动图形界面安装(我通过`X11`进行图形转发，故需要加`-E`)

```bash
sudo -E ./install-tl -gui
```

按照安装提示进行安装(建议将安装位置设为个人目录)，安装完成后卸载镜像文件

```bash
sudo umount /mnt
```

### 1.3 非图形界面安装

自定义安装位置

```bash
perl ./install-tl --no-interaction --texdir=/home/extend/texlive/2025
```

安装完成后卸载镜像文件

```bash
sudo umount /mnt
```

### 1.4 设置环境变量

打开`.zshrc`

```bash
# >>> LaTeX >>>
export PATH=export PATH=/home/extend/texlive/2025/bin/x86_64-linux:$PATH
export PATH=/home/extend/texlive/2025/texmf-dist/scripts/latexindent:$PATH
export MANPATH=/home/extend/texlive/2025/texmf-dist/doc/man:$MANPATH
export INFOPATH=/home/extend/texlive/2025/texmf-dist/doc/info:$INFOPATH
# <<< LaTeX <<<
```

完成后重新加载配置

```bash
source ~/.zshrc
```

然后就可以查看安装是否成功了

```bash
tex --version
```

## 2. 安装Windows字体

首先在`Windows`下进入C盘下的`C:/windows/Fonts`下将需要的字体拷贝出来，放到新建的文件夹中

下一步将拷贝出来的字体文件通过U盘拷贝至`Ubuntu`下，在 `Ubuntu`的计算机存储下新建目录用于存储字体

```bash
sudo mkdir /usr/share/fonts/winfonts
```

将`Windows`系统下的字体拷贝到刚刚创建的`winfonts`目录下

```bash
sudo chmod 644 /usr/share/fonts/winfonts/*
```

刷新缓存字体

```bash
sudo mkfontscale
sudo mkfontdir
sudo fc-cache -fsv
```

查看系统中安装的中文字体

```bash
fc-list :lang=zh | sort
```

## 3. 配置VScode

### 3.1 安装插件

在VScode插件市场中搜索安装`LaTeX`插件和`LaTeX Workshop`插件

### 3.2 配置编译环境

`ctrl+shift+p`打开快捷访问，输入打开工作区设置，写入如下内容

```json
{
    "latex-workshop.latex.autoBuild.run": "onSave",
    "latex-workshop.latex.autoBuild.interval": 10000,
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatex",
            "tools": ["xelatex"]
        },
        {
            "name": "pdflatex",
            "tools": ["pdflatex"]
        },
        {
            "name": "xelatex(double)",
            "tools": ["xelatex", "xelatex"]
        },
        {
            "name": "xe->bib->xe(double)",
            "tools": ["xelatex", "bibtex", "xelatex", "xelatex"]
        }
    ],
    "latex-workshop.latex.tools": [
        {
            "name": "xelatex",
            "command": "/home/extend/texlive/2025/bin/x86_64-linux/xelatex",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "%DOC%"
            ]
        },
        {
            "name": "pdflatex",
            "command": "/home/extend/texlive/2025/bin/x86_64-linux/pdflatex",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "%DOC%"
            ]
        },
        {
            "name": "bibtex",
            "command": "bibtex",
            "args": ["%DOC%"]
        }
    ],
    "latex-workshop.latex.autoClean.run": "onBuilt",
    "latex-workshop.latex.clean.fileTypes": [
        "*.aux",
        "*.bbl",
        "*.blg",
        "*.idx",
        "*.ind",
        "*.lof",
        "*.lot",
        "*.out",
        "*.toc",
        "*.acn",
        "*.acr",
        "*.alg",
        "*.glg",
        "*.glo",
        "*.gls",
        "*.ist",
        "*.fls",
        "*.log",
        "*.fdb_latexmk"
    ],
    "latex-workshop.latex.outDir": "%DIR%",
    "latex-workshop.view.pdf.viewer": "external",
    "latex-workshop.view.pdf.external.viewer.command": "okular",
    "latex-workshop.view.pdf.external.viewer.args": ["--unique", "%PDF%"],
    "latex-workshop.view.pdf.external.synctex.command": "okular",
    "latex-workshop.view.pdf.external.synctex.args": ["--unique", "%PDF%#src:%LINE%%TEX%"]
}
```

---
参考文章

[Ubuntu20.04安装Latex并使用vscode作为文本编辑器](https://blog.csdn.net/Hacker_MAI/article/details/130334821)
