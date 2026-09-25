---
title: 设置IP变化同步脚本
date: 2025-05-21 17:03:45
# updated:
tags:
    - Git
    - Bash
    - Systemd
    - Linux
categories: 
          - 技术文档
          - 服务部署
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
cover: https://img.wblyu.top/images/6db9855abe658024c2c84332f74d6097.avif
---

## 1. 创建无密码密钥

生成无passphrase密钥的命令

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/rsa_no_pass -N ""
```

在`~/.ssh`添加文件config

```bash
vim ~/.ssh/config
```

在里面添加

```ini
    Host gitee.com
    HostName gitee.com
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/rsa_no_pass
```

## 2. 将本地Git与Gitee建立联系

将本地无密码公钥添加到Gitee上

创建并切换到main分支

```bash
git switch -c main 
```

然后按照gitee提示的操作

## 3. 创建脚本

创建Bash脚本，该脚本每次检测IP是否变化，如果变化则更新仓库中的一个文件（例如`current_ip.txt`），提交并推送到Gitee的main分支

```bash
vim update_ip.sh
```

添加内容

```bash
#!/bin/bash
export GIT_SSH_COMMAND="ssh -i /home/lwb/.ssh/rsa_no_pass"
# 定义仓库路径
REPO_DIR="/home/lwb/lwb_ws/A100IP"
# 定义 IP 信息文件
IP_FILE="$REPO_DIR/current_ip.txt"
# 定义日志文件
LOG_FILE="$REPO_DIR/update_ip.log"

# 每 6 小时清空一次日志（当小时数可以被 6 整除时）
if [ $(( $(date '+%H') % 6 )) -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 清空日志文件" > "$LOG_FILE"
fi

# 记录当前时间到日志
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 脚本开始执行" >> "$LOG_FILE"

# 获取 ifconfig 命令的 IPv4 和 IPv6 地址
NEW_OUTPUT=$(ifconfig | grep -E "inet |inet6 ")

# 如果文件不存在，则认为第一次运行，直接写入并提交
if [ ! -f "$IP_FILE" ]; then
    echo "$NEW_OUTPUT" > "$IP_FILE"
    cd "$REPO_DIR" || exit 1
    git add .
    git commit -m "Initial commit: ifconfig output" >> "$LOG_FILE" 2>&1
    git push origin main >> "$LOG_FILE" 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 初次保存 ifconfig 输出并推送到 Gitee" >> "$LOG_FILE"
    exit 0
fi

# 读取之前保存的 IP 信息
OLD_OUTPUT=$(cat "$IP_FILE")

# 检查 ifconfig 输出是否发生变化
if [ "$NEW_OUTPUT" != "$OLD_OUTPUT" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ifconfig 输出发生变化，开始更新..." >> "$LOG_FILE"
    echo "$NEW_OUTPUT" > "$IP_FILE"
    cd "$REPO_DIR" || exit 1
    git add .
    git commit -m "Updated ifconfig output" >> "$LOG_FILE" 2>&1
    git push origin main >> "$LOG_FILE" 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ifconfig 变化已提交到 Gitee" >> "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ifconfig 输出没有变化" >> "$LOG_FILE"
fi
```

并确保文件具有可执行权限

```bash
sudo chmod +x update_ip.sh
```

测试脚本

```bash
./update_ip.sh
```

## 4. 使用 Systemd 服务

创建 Systemd 服务单元,新建一个服务单元文件

```bash
sudo vim /etc/systemd/system/update-ip.service
````

```ini
[Unit]
Description=Run update_ip.sh script

[Service]
Type=oneshot
User=lwb
Group=lwb
WorkingDirectory=/home/lwb/repository/A100IP
ExecStart=/home/lwb/repository/A100IP/update_ip.sh
```

新建一个timer单元文件，这里设置开机后延迟1分钟启动，然后每隔5分钟执行一次

```bash
sudo vim /etc/systemd/system/update-ip.timer
```

```ini
[Unit]
Description=Run update_ip.sh every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
```

运行以下命令

```bash
sudo systemctl daemon-reload
sudo systemctl enable update-ip.timer
sudo systemctl start update-ip.timer
```
