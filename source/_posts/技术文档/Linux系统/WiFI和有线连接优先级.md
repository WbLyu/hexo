---
title: WiFI和有线连接优先级
date: 2025-08-07 21:04:20
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
cover: https://img.wblyu.top/images/c96afc84a9829abde38a6363596f4f13.avif
---

目的：为了实现同时连接WiFi和有线网络时，优先使用WiFi连接互联网

## 1. 查看当前路由信息

```bash
sudo ip route
```

数字越大的，优先级越低

## 2. 查看当前连接名称​

```bash
nmcli connection show
```

找到有线连接和无线连接对应的连接名称

## 3. 设置无线优先

```bash
sudo nmcli connection modify "无线名称" ipv4.route-metric 10
sudo nmcli connection modify "无线名称" ipv6.route-metric 10
```

## 4. 设置有线备用

```bash
sudo nmcli connection modify "有线名称" ipv4.route-metric 100
sudo nmcli connection modify "有线名称" ipv6.route-metric 100
```

## 5. 应用更改​

```bash
sudo nmcli connection up "无线名称"
sudo nmcli connection up "有线名称"
```

## 6. 验证

```bash
ip route show default
```

---
参考文章

[解决Linux系统WiFI和有线连接优先级问题](https://zhuanlan.zhihu.com/p/1901379010203739176)
