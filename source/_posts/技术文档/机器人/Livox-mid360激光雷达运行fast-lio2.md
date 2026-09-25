---
title: Livox-mid360激光雷达运行fast-lio2
date: 2025-07-19 17:07:33
# updated:
# tags:
#     - 
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
cover: https://img.wblyu.top/images/86ff4de08c61d285a1821321986c0611.avif
---

所用的环境：

1. Linux版本：Ubuntu 20.04
2. ROS版：Noetic

## 1. mid-360配置

将mid-360通过网口与电脑相连，然后给mid360上电

设置有线连接的IPv4地址：

1. 地址设为`192.168.1.50`
2. 子网掩码设为`255.255.255.0`
3. 网关设为`192.168.1.1`

## 2. 安装Livox SDK2

### 2.1 源码安装

```bash
git clone https://github.com/Livox-SDK/Livox-SDK2.git
cd Livox-SDK2/
mkdir build && cd build
cmake .. 
make -j
sudo make install
```

### 2.2 运行Livox-SDK2示例

进入`Livox-SDK2/samples/livox_lidar_quick_start`这个文件夹，找到`mid360_config.json`，把 `host_ip` 改成 `192.168.1.50`

进入`Livox-SDK2/build/samples/livox_lidar_quick_start`这个文件夹运行如下代码

```bash
./livox_lidar_quick_start ../../../samples/livox_lidar_quick_start/mid360_config.json
```

### 2.3 删除的指令

```bash
sudo rm -rf /usr/local/lib/liblivox_lidar_sdk_*
sudo rm -rf /usr/local/include/livox_lidar_*
```

## 3. 安装livox_ros_driver2

### 3.1 下载并编译

```bash
cd src
git clone https://github.com/Livox-SDK/livox_ros_driver2.git
cd livox_ros_driver2
cp package_ROS1.xml package.xml
cd ../..
catkin_make -DCATKIN_WHITELIST_PACKAGES="livox_ros_driver2"  -DROS_EDITION=ROS1
```

### 3.2 更改json文件

打开`config`文件夹中的`MID360_config.json`文件，找到`host_net_info`，将四个IP地址改为`192.168.1.50`，找到`lidar_configs`，将IP地址改成`192.168.1.1xx`，xx为mid360序列号的最后两位

### 3.3 运行驱动

```bash
source devel/setup.sh
roslaunch livox_ros_driver2 msg_MID360.launch
roslaunch livox_ros_driver2 rviz_MID360.launch
```

## 4. 安装fast-lio2

### 4.0 下载修改后的fast-lio2

```bash
git clone https://github.com/BIT-Jiang-Group/FAST_LIO.git
cd FAST_LIO
git submodule update --init
```

### 4.1 下载原版fast-lio2

```bash
git clone https://github.com/hku-mars/FAST_LIO.git
cd FAST_LIO
git submodule update --init
```

修改项目源代码

1. 将`FAST_LIO/CMakeLists.txt`的`livox_ros_driver`改成`livox_ros_driver2`；在`find_package`尾部加上`genmsg`
2. 将`FAST_LIO/package.xml`的`livox_ros_driver`改成`livox_ros_driver2`
3. 将`FAST_LIO/src/preprocess.h`和`FAST_LIO/src/laserMapping.cpp`中`livox_ros_driver`头文件改为`livox_ros_driver2`
4. 将`FAST_LIO/src/preprocess.h` `FAST_LIO/src/preprocess.cpp` `FAST_LIO/src/laserMapping.cpp`中的`livox_ros_driver::`命名空间改为`livox_ros_driver2::`

### 4.2 编译代码

```bash
catkin_make -DCATKIN_WHITELIST_PACKAGES="fast_lio"  
```

---
参考文章

[Livox mid360 激光雷达运行 fast-lio2 详细教程](https://www.bilibili.com/opus/986664810984767490)

[ROS1运行FAST_LIO2](https://zhuanlan.zhihu.com/p/719043772)
