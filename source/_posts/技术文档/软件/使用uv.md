---
title: 使用uv
date: 2025-06-24 19:01:21
# updated:
tags:
    - python
    - uv
    - 包管理
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
cover: https://img.wblyu.top/images/58eaf9e9ccf484a8dc05602909211a43.avif
---

## 1. uv安装

使用`curl`下载脚本并通过`sh`执行：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

如果系统没有`curl`，可以使用`wget`

```bash
wget -qO- https://astral.sh/uv/install.sh | sh
```

要为`uv`命令和`uvx`命令启用`shell`自动补全，运行以下对应命令

```bash
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc

echo 'eval "$(uvx --generate-shell-completion bash)"' >> ~/.bashrc
```

使用`source ~/.zshrc`刷新

## 2. 基础用法

### 2.1 创建项目

首先设定python版本

```bash
uv python pin 3.13
uv init
```

### 2.2 添加依赖

添加`numpy`库

```bash
uv add numpy
```

添加指定版本的`numpy`库

```bash
uv add numpy>=2.0.2
```

### 2.3 移除依赖

移除`numpy`库

```bash
uv remove numpy
```

### 2.4 查看项目的依赖树

```bash
uv tree
```

### 2.5 创建虚拟环境

创建一个虚拟环境，并指定`Python`版本

```bash
uv venv my-name --python 3.11
```

### 2.6 激活虚拟环境

```bash
source .venv/bin/activate
```

### 2.7 退出虚拟环境

```bash
deactivate
```

### 2.8 在uv中使用pip

```bash
uv pip install
```

## 3. 换源

通过配置`uv`的原生配置文件，无论是`uv pip`还是`uv add`都能直接生效

```bash
mkdir -p ~/.config/uv

vim ~/.config/uv/uv.toml
```

写入

```toml
[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
```

## 4. 使用Jupyter

使用如下指令即可运行Jupyter

```bash
uv run --with jupyter jupyter lab
```

---

[官方文档](https://docs.astral.sh/uv/)

[中文文档](https://uv.doczh.com/)
