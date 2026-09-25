---
title: FAR_PLANNER参数解读
date: 2025-11-01 10:59:47
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
cover: https://img.wblyu.top/images/44405b091686caafdc41eb458e8cff29.avif
---

## 1. GraphMsger

`main_run_freq` 主循环运行频率

`voxel_dim` 体素/网格分辨率（米），分辨率越小地图越精细、计算量越大

`robot_dim` 机器人的直径（米），用于碰撞检测/路径约束

`vehicle_height` 机器人高度（米）

`sensor_range` 传感器有效探测距离（米）

`terrain_range` 地形评估的半径（米）

`local_planner_range` 局部规划的距离（米）室内1–3，室外5-10

`visualize_ratio` RViz中缩放常量

`is_viewpoint_extend` 当 设为为`true`时，规划器会把原始`waypoint`向离障碍物更“开阔”的方向推进（延伸一个观察点），以获得更好的视点（visibility）。如果**环境很开阔或精确到指定点的任务**建议设为`false`

`is_multi_layer` 是否启用多楼层地图处理

`is_opencv_visual` 是否启用`OpenCV`可视化，仅影响开发调试显示

`is_static_env` 是否为静态环境，设为`false`会清除动态障碍物

`is_pub_boundary` 发布边界消息给其他模块使用

`is_debug_output` 开启详细调试输出

`is_attempt_autoswitch` 是否允许规划器自动从已知环境的导航切换到未知环境导航

`world_frame` 全局坐标系名

## 2. GraphMsger

`GraphMsger/robot_id` 机器人ID，与多机器人协同有关

## 3. MapHandler

`MapHandler/floor_height` 多层建筑物单层高度（米）

`MapHandler/cell_length` 宏观格网地图单元边长（米）与`voxel_dim`互补的：`voxel_dim`决定局部点云精细度，`cell_length`决定全局地图粗粒度

`MapHandler/map_grid_max_length` 整体地图允许的最大边长（米）

`MapHandler/map_grad_max_height` 整体地图允许的最大高度（米）

## 4. Util

`Util/angle_noise` 角度噪声/容许的角度扰动（度）

`Util/accept_max_align_angle`

`Util/obs_inflate_size` 障碍膨胀尺寸（格数）为了降低感知误差导致的碰撞风险

`Util/new_intensity_thred` 使用`intensity`区分新观测点的阈值

`Util/terrain_free_Z` 地形被视为可通行的高度阈值（米），低于此高度视为非障碍

`Util/dyosb_update_thred` 需要多次检测才把目标设为动态障碍物

`Util/new_point_counter` 需要多次检测才把目标设为新观测点

`Util/dynamic_obs_dacay_time` 某动态障碍在超过该时间（秒）内未被更新/观测，则认为其已消失并从动态障碍集合中移除。快速动态场景可调小

`Util/new_points_decay_time` 新观测点的衰减时间（秒）



## 5. Graph

`Graph/connect_votes_size` 需要多次检测才把一条候选边正式建立到图中。高置信场景5–12；
噪声大场景15–30；传感器稳定3–7。

`Graph/clear_dumper_thred` 需要多次检测才把候选节点清除。一般3–6；噪声频繁可减小

`Graph/node_finalize_thred`需要多次检测才把瞬时角点当成稳定节点长期加入图。一般3–8，若点云噪声高可增大

`Graph/filter_pool_size` 同时保留多少候选项以供后续筛选

## 6. CDetector

`CDetector/resize_ratio` 在进行角点/轮廓检测前对点云或栅格图像的缩放/下采样比例（缩小倍数）。室外调大3–8，室内调小1–3

`CDetector/filter_count_value` 角点/候选点需通过的计数阈值。噪声较大或点云稀疏3–8，噪声较小的环境1–3

`CDetector/is_save_img` 是否将角点检测相关的中间/输出图像保存到磁盘，用于离线调试与可视化

`CDetector/img_folder_path` 当`is_save_img`为`true`时，用于保存图像的目录路径

## 7. GPlanner

`GPlanner/converge_distance` 判定“到达目标”的距离阈值（米），注意到达目标后并不是停止，只是不再继续发布新的`waypoint`。停止减速的阈值要取决于AEDE中的`stopDisThre`和`slowDwnDisThre`

`GPlanner/goal_adjust_radius` 当目标在图上不可直接到达时，允许在目标周围一定半径内寻找替代可达点的半径（米）

`GPlanner/free_counter_thred` 计数阈值，用于在评估某节点是否可通行时，需要多次检测才能判定为通行

`GPlanner/reach_goal_vote_size` 在判定已到达目标时需要多次检测才真正认为已到达

`GPlanner/path_momentum_thred` 路径“惯性”阈值，用于避免规划器频繁切换路径或目标点
