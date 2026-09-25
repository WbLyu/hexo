---
title: AEDE代码解读
date: 2025-06-26 20:30:00
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
cover: https://img.wblyu.top/images/a8027fba0165735ab2c142c5cf8aa72f.avif
---

本代码主只是用来做局部路径规划和小范围避障

<!-- 主要的软件包有 -->

## 1. joystick_drivers

包含不同手柄遥操作的各种代码，实车部署不需要，可以删去

## 2. loam_interface

用来桥接不同slam算法，通过修改loam_interface.launch可以使此项目适配各种slam算法。修改规则可参考[State Estimation Setup Notes](https://drive.google.com/file/d/1zn8gU5FL8Vnccs-80708XfnRDovmf7hm/view)


输入为不同slam算法输出的stateEstimationTopic和registeredScanTopic

输出为/state_estimastion和/registered_scan话题名

## 3. sensor_scan_generation

将世界坐标系下的点云转换至传感器Lidar坐标系下，并以与扫描消息相同的频率和时间戳发布状态估计消息。这些信息会提供给上层规划模块使用

输入为/state_estimation和/registered_scan

输出为/state_estimation_at_scan（等同于/state_estimation）和/sensor_scan（世界坐标系下的点云转换至传感器Lidar坐标系下）

## 4. local_planner

## 4.1 localPlanner

局部路径规划

输入为`/state_estimation`

`/registered_scan`

`/terrain_map`

`/joy`手柄

`/way_point`导航目标点

`/speed`

`/navigation_boundary`导航的边界

`/added_obstacles`通过单独节点添加障碍物点云

`/check_obstacle`是否检测障碍物

输出为`/path` `/free_paths`

## 4.2 pathFollower

路径跟踪，这些信息会提供给下层控制模块使用

输入为`/state_estimation` `/path` `/joy` `/speed` `/stop`

输出为`/cmd_vel`

## 5. terrain_analysis

地面点云信息分割

输入为`/state_estimation` `/registered_scan` `/joy` `/map_clearing`

输出为`/terrain_map`

## 6. terrain_analysis_ext

扩展地面点云信息分割，这些信息会提供给上层规划模块使用

输入为`/state_estimation` `/registered_scan` `/joy` `/cloud_clearing` `/terrain_map`

输出为`/terrain_map_ext`

## 7. vehicle_simulator

车辆的仿真模型，项目中的launch文件为总launch文件，需保留，其余可删去

## 8. velodyne_simulator

传感器仿真模型，可删去

## 9. visualization_tools

车辆运行参数可视化

输入为`/state_estimation` `/registered_scan` `/runtime`

输出为`/overall_map` `/explored_areas` `/trajectory` `/explored_volume` `/traveling_distance` `/time_duration`

## 10. waypoint_example

车辆仿真路点管理，可删去

实车上需要用上层规划模块来代替这个模块

## 11. waypoint_rviz_plugin

rviz插件，可删去

rviz中话题说明

`/camera/image` 为仿真中为机器人添加的相机输出的图像

`/registered_scan` 为全局坐标下的点云

`/sensor_scan` 为雷达坐标下的点云

`/terrain_map` 为近距离内地形点云，并将地面和墙壁区分开 坐标为map

`/terrain_map_ext` 为较远范围内的地形点云

`/path` 为从待选路径中选出的路径，坐标为vehicle

`/free_paths` 为待选路径，坐标为vehicle

`/way_point` 为导航的目标点

`/navigation_boundary` 为导航的边界点

`/added_obstacles` 为手动添加的障碍物

`/overall_map` 为仿真全局地图

`/explored_areas` 为激光雷达点云扫过的墙壁

`/trajectory` 为机器人行驶过的轨迹

---

[官方文档](https://www.cmu-exploration.com/)
