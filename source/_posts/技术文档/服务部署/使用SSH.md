---
title: 使用SSH
date: 2025-05-21 16:58:48
# updated:
tags:
    - SSH
    - Linux
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

## 1. SSH基础操作

创建.ssh文件夹

```bash
mkdir ~/.ssh
```

创建本地密钥对

```bash
ssh-keygen -t rsa -b 4096 -C "你的邮箱@xxx.com" -f ~/.ssh/xxx
```

这样就生成了公钥`xxx.pub`和私钥`xxx`，公钥可以分发，私钥需要保存好

在`~/.ssh`添加文件config

```bash
touch ~/.ssh/config
vim ~/.ssh/config
```

在里面添加

```ini
Host 别名
  HostName 目标IP地址
  User 目标用户名
  IdentityFile 私钥的位置（绝对位置）
```

修改文件权限，SSH严格要求私钥文件必须仅所有者可读，其他用户无权访问

```bash
chmod 600 ~/.ssh/xxx 
# xxx为对应的私钥
chmod 700 ~/.ssh
```

## 2. 使用SSH连接远程服务器

远程服务器访问人数较多，所以在本地生成密钥对，将公钥传到服务器上，将私钥保存在本地

### 2.1 本地生成SSH密钥对

请参考SSH基础操作

### 2.2 上传公钥到服务器

```bash
ssh-copy-id -i ~/.ssh/xxx.pub username@server_ip
```

如果`ssh-copy-id`不可用，可以手动将公钥内容添加到服务器的`~/.ssh/authorized_keys`文件中

### 2.3 配置SSH远程服务器

先通过SSH密码认证连接远程服务器

```bash
ssh username@server_ip
```

然后输入密码，并在远程服务器的终端中修改SSH配置

> 此操作将修改全局SSH配置，会影响到其他用户

```bash
sudo vim /etc/ssh/sshd_config
```

```ini
PubkeyAuthentication yes           # 启用公钥认证
PasswordAuthentication no          # 禁用密码认证
AuthorizedKeysFile .ssh/authorized_keys # 指定公钥文件路径
```

重启SSH服务

```bash
sudo service ssh restart
```

### 2.4 配置SSH本地客户端

请参考SSH基础操作

使用密钥连接

```bash
ssh xxx
#xxx为Host的值
```

为了不再需要重复输入密码解锁密钥需使用SSH Agent

```bash
# 启动 SSH Agent（如果未运行）
eval "$(ssh-agent -s)"

# 添加私钥到 Agent（会提示输入一次密码）
ssh-add ~/.ssh/id_rsa
```

为了实现持久化 SSH Agent（跨会话有效​，将以下内容添加到 `~/.bashrc` 或 `~/.zshrc`

```bash
# 自动启动 SSH Agent 并添加密钥
if [ -z "$SSH_AUTH_SOCK" ]; then
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_rsa 2>/dev/null
fi
```

然后重新加载配置

```bash
source ~/.bashrc
```

## 3. 使用图形转发

### 3.1 开启X11

修改远程主机的`ssh`配置

```bash

sudo vim /etc/ssh/sshd_config

# 取消这一行的注释——如果没有这一行则手动添加

X11Forwrding yes

# 重启sshd服务

sudo service ssh restart

```

### 3.2 使用带X11的ssh服务

```bash

ssh -X user@192.168.x.xx　

```

### 3.3 常见问题

1. root用户无法获取X11信息

解决方法：加上`-E`参数如

```bash

sudo -E ./install-tl -gui

```
