---
title: FAR_PLANNER调试笔记
date: 2025-11-01 20:29:06
# updated:
# tags:
#     - 
categories: 
          - 代码解读
          - 机器人模块化
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
cover: https://img.wblyu.top/images/ce85ee63b501a2995a676d1093075a5f.avif
---

## 1. 2025-10某项目

`far_planner/config/default.yaml`参数设置

1. `main_run_freq`设为`5`
2. `robot_dim`设为`0.4`
3. `vehicle_height`设为`0.2`
4. `is_viewpoint_extend`设为`false`
5. `is_static_env`设为`false`
6. `MapHandler/map_grid_max_length`设为`2000`
7. `Util/terrain_free_Z`设为`0.1`
8. `Util/dynamic_obs_dacay_time`设为`5.0`
9. `GPlanner/goal_adjust_radius`设为`1.0`
