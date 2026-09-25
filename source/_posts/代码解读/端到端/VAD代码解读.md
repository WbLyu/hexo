---
title: VAD代码解读
date: 2026-07-17 21:06:27
# updated:
# tags:
#     - 
categories: 
          - 代码解读
          - 端到端
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
cover: https://img.wblyu.top/images/cfb202c9333e7e25e3eba06b6675e86b.avif
---

**BEV特征提取**

首先使用ResNet50（backbone）从输入的多帧多视角图片提取图片特征，然后使用FPN（neck）融合多尺度特征，最后借助BEVFormer的编码器得到BEV特征