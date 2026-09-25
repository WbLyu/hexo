---
title: AEDE调试笔记
date: 2025-08-08 16:08:09
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
cover: https://img.wblyu.top/images/cb2196c6bc05fa84f166651ce00386b3.avif
---

## 1. 2025-10某项目

### 1.1 室内测试指标参数设置

`local_planner/launch/local_planner.launch`参数设置

1. `sensorOffsetX`设为`0.2`
2. `maxSpeed`设为`2.0`
3. `autonomySpeed`设为`2.0`
4. `joyToSpeedDelay`设为`2.0`
5. `vehicleLength`设为`0.4`
6. `vehicleWidth`设为`0.25`
7. `dirWeight`设为`0.05`，使规划的路径尽量不转向

`terrain_analysis/launch/terrain_analysis.launch`参数设置

1. `useSorting`参数设为`true`，减少路面点云分割错误率
2. `considerDrop`参数设为`false`，不考虑路面出现深坑情况
3. `vehicleHeight`参数设为`0.2`
4. `voxelPointUpdateThre`参数设为`50`，加快体素更新
5. `voxelTimeUpdateThre`参数设为`1.0`，加快体素更新
6. `minRelZ`参数设为`-0.1`，舍弃激光雷达`z`轴`-0.1`米以下所有点云，放弃地面点云
7. `maxRelZ`参数设为`0.15`，舍弃激光雷达`z`轴`0.15`米以上所有点云，放弃过高点云

`vehicle_simulator/launch/system_real_robot.launch`参数设置

1. `vehicleX`参数设为`-0.2`，因为车辆起点相对于原点后退了`sensorOffsetX`，故而初始目标点也要后退相应的距离
