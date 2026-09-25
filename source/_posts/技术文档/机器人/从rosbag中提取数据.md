---
title: 从rosbag中提取数据
date: 2025-09-27 15:18:15
# updated:
tags:
    - ROS
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
cover: https://img.wblyu.top/images/45e25bec636dc760ce7540b28528e320.avif
---

## 1. 提取数据为`csv`或`txt`格式

在命令行中输入

```bash
rostopic echo -b xxx.bag -p /topic > xxx.csv(或.txt)
```
