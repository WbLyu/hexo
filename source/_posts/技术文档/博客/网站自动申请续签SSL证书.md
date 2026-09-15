---
title: 网站自动申请续签SSL证书
date: 2025-07-20 20:17:33
# updated:
# tags:
#     - 
categories: 
          - 技术文档
          - 博客
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

## 1. 安装 acme.sh

使用`root`账户登录阿里云，然后安装此项目（由于阿里云国内服务器无法访问github，所以要使用gitee拉取项目，可以参考[官方文档](https://github.com/acmesh-official/acme.sh/wiki/Install-in-China)）

```bash
git clone https://gitee.com/neilpang/acme.sh.git
cd acme.sh
./acme.sh --install -m my@example.com
```

`my@example.com`替换成自己邮箱

重新加载环境变量和切换CA证书类型

```bash
# 重新加载环境变量
source ~/.bashrc

#  CA证书类型默认使用ZeroSSL，切换成Let's Encrypt
acme.sh --set-default-ca --server letsencrypt
```

## 2. 配置阿里云DNS API

一次选择`阿里云控制台 - 访问控制 RAM - 身份管理 - 用户 - 创建用户`

填写登录名称，勾选`使用永久AccessKey访问`

分别复制`AccessKey ID`和`AccessKey Secret`的值，并保存好

然后点击添加权限。搜索`DNS`，选择`AliyunDNSFullAccess`

## 3. 申请SSL证书

在终端中配置环境变量

```bash
export Ali_Key="LTAI5txxxxxxxxxxxxx"
export Ali_Secret="TJHStNFrxxxxxxxxxxxxxxxxxxx"
```

依次执行以下命令

```bash
/root/.acme.sh/acme.sh --issue --dns dns_ali -d www.random.wblv66.top -d random.wblv66.top

/root/.acme.sh/acme.sh --issue --dns dns_ali -d www.wblv66.top -d wblv66.top

/root/.acme.sh/acme.sh --issue --dns dns_ali -d www.img.wblv66.top -d img.wblv66.top
```

其中`--dns dns_ali`为指定使用阿里云的`DNS API`来验证域名所有权。`dns_ali`是 `acme.sh` 内置的阿里云DNS插件

## 4. 部署SSL证书

在宝塔面板中查看网站的配置文件，`ssl_certificate`和`ssl_certificate_key`对应的数值为原有ssl证书位置

依次执行以下命令

```bash
/root/.acme.sh/acme.sh --install-cert -d www.random.wblv66.top --key-file "/www/server/panel/vhost/cert/random.wblv66.top/privkey.pem"  --fullchain-file "/www/server/panel/vhost/cert/random.wblv66.top/fullchain.pem" --reloadcmd "service nginx force-reload"

/root/.acme.sh/acme.sh --install-cert -d www.wblv66.top --key-file "/www/server/panel/vhost/cert/wblv66.top/privkey.pem"  --fullchain-file "/www/server/panel/vhost/cert/wblv66.top/fullchain.pem" --reloadcmd "service nginx force-reload"

/root/.acme.sh/acme.sh --install-cert -d www.img.wblv66.top --key-file "/www/server/panel/vhost/cert/img.wblv66.top/privkey.pem"  --fullchain-file "/www/server/panel/vhost/cert/img.wblv66.top/fullchain.pem" --reloadcmd "service nginx force-reload"

```

## 5. 编写脚本实现证书自动更新

`vim ~/auto_ssl.sh`随后写入如下内容

```bash
#!/bin/bash

# 设置环境变量（建议写入 /root/.bashrc 或 .bash_profile 以避免每次都重新 export）
export Ali_Key="LTAI5txxxxxxxxxxxxx"
export Ali_Secret="TJHStNFrxxxxxxxxxxxxxxxxxxx"

# 通用申请函数：重试最多3次
issue_cert() {
  local DOMAIN=$1
  local ALT_DOMAIN=$2
  local RETRY=0
  local SUCCESS=0

  while [ $RETRY -lt 3 ]; do
    echo "尝试申请证书：$DOMAIN ($((RETRY+1))/3)"

    # 捕获输出
    output=$(/root/.acme.sh/acme.sh --issue --dns dns_ali -d "$DOMAIN" -d "$ALT_DOMAIN" 2>&1)

    echo "$output"

    # 检查是否是“未到期跳过续签”
    if grep -q "Skip, Next renewal time" <<< "$output"; then
      echo "证书尚未到期，跳过续签：$DOMAIN"
      return 0
    fi

    # 判断是否成功
    if echo "$output" | grep -q "Your cert is in"; then
      echo "证书申请成功：$DOMAIN"
      SUCCESS=1
      break
    else
      echo "证书申请失败：$DOMAIN，重试中..."
      ((RETRY++))
      sleep 5
    fi
  done

  if [ $SUCCESS -eq 0 ]; then
    echo "证书申请失败（已重试3次）：$DOMAIN"
    return 1
  fi
}

# 安装证书函数
install_cert() {
  local DOMAIN=$1
  local TARGET_DOMAIN=$2

  /root/.acme.sh/acme.sh --install-cert -d "$DOMAIN" \
    --key-file "/www/server/panel/vhost/cert/${TARGET_DOMAIN}/privkey.pem" \
    --fullchain-file "/www/server/panel/vhost/cert/${TARGET_DOMAIN}/fullchain.pem" \
    --reloadcmd "service nginx force-reload"
}

# 所有证书列表
declare -a DOMAINS=(
  "www.random.wblv66.top random.wblv66.top"
  "www.wblv66.top wblv66.top"
  "www.img.wblv66.top img.wblv66.top"
)

# 主程序
for entry in "${DOMAINS[@]}"; do
  DOMAIN1=$(echo "$entry" | awk '{print $1}')
  DOMAIN2=$(echo "$entry" | awk '{print $2}')
  TARGET_DOMAIN=$(echo "$DOMAIN2" | sed 's/^www\.//')

  issue_cert "$DOMAIN1" "$DOMAIN2" && install_cert "$DOMAIN1" "$TARGET_DOMAIN"
done

```

设置可执行权限

```bash
chmod +x ~/auto_ssl.sh
```

添加定时任务（每月1日凌晨 3 点自动执行），编辑 crontab

```bash
crontab -e
```

注释掉acme.h默认续期任务，并添加这一行

```bash
0 3 1 * * /root/auto_ssl.sh >> /var/log/auto_ssl.log 2>&1
```

---
参考文章

[阿里云服务器采用crontab定时任务使acme.sh全自动化申请续签免费SSL证书，并部署在Linux宝塔网站和雷池WAF](https://juejin.cn/post/7510242001599414322#heading-7)