---
title: 'DDPM: Denoising Diffusion Probabilistic Model'
date: 2026-11-13 20:02:29
# updated:
# tags:
#     - 
categories: 
            - 论文解读
            - 世界模型
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
---

只介绍论文中的公式推导，主要参考苏剑林的博客

- [生成扩散模型漫谈（一）：DDPM = 拆楼 + 建楼](https://spaces.ac.cn/archives/9119)
- [生成扩散模型漫谈（二）：DDPM = 自回归式VAE](https://spaces.ac.cn/archives/9152)
- [生成扩散模型漫谈（三）：DDPM = 贝叶斯 + 去噪](https://spaces.ac.cn/archives/9164)

## 1. 通俗类比推导

### 1.1 拆楼建楼
`DDPM`是想训练出一个生成模型，实现将随机噪声$z$变换成数据样本$x$。我们可以将随机噪声$z$类比为砖瓦水泥，将数据样本$x$类比为高楼大厦，所以生成模型就是一支施工队。未经训练的施工队难以直接建造出大楼，但是可以让他们拆楼：将建好的高楼大厦$x_0$一步步拆成只剩砖瓦水泥$x_T$

$$
x = x_0 \to x_1 \to x_2 \to \cdots  \to x_{T-1} \to x_T = z
$$

当我们有了拆楼的整个过程后，我们将拆楼的每一步$x_{t-1} \to x_t$反过来是不是就可以得到建楼的每一步了$x_t \to x_{t-1}$。如果能够学会两者的变化关系$x_{t-1} = \mu (x_t)$，那从$x_T$出发，逐步执行$x_{T-1} = \mu (x_T)$、$x_{T-2} = \mu (x_{T-1})$，最后应该就能构造出高楼大厦$x_0$

### 1.2 该怎么拆

`DDPM`做生成模型的过程，跟上述“拆楼-建楼”的类比是完全一致的，它是先构建一个从数据样本渐变到随机噪声的过程，然后再考虑其逆变换，通过反复执行逆变换来完成数据样本的生成