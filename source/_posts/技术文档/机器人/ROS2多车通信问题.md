---
title: ROS2多车通信问题
date: 2026-09-09 15:58:34
# updated:
tags:
    - ROS2
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
cover: https://img.wblyu.top/images/0e100fcd5979b4f7b26d6600bd9f494e.avif
---

## 1. 组播默认路由选取错误

实车同时存在有线网卡（用于传感器通信）和无线网卡（用于跨车通信）时，Linux 可能把组播默认路由选到有线网卡，导致 DDS 发现或跨车数据传输失败。示例使用 Fast DDS，两辆车通过 Wi-Fi 交换数据，各自通过有线网卡连接 MID360。

| 网络用途 | a 车 | b 车 |
| --- | --- | --- |
| Wi-Fi 跨车通信 | `192.168.31.11` | `192.168.31.12` |
| 有线雷达通信 | 本机有线网卡 IP | 本机有线网卡 IP |
| DDS 域 | `ROS_DOMAIN_ID=30` | `ROS_DOMAIN_ID=30` |

两车的无线 IP 必须不同，建议配置静态地址或 DHCP 地址保留。两车有线地址即使都为 `192.168.2.166`，也仅适用于彼此隔离的雷达网段；如果接入同一二层网络，就会产生 IP 冲突。

### 1.1 确认网络出口

组播路由检查可作为排查线索，最终还需确认 DDS 实际使用的网卡。先分别在两车上确认普通单播连通，并检查组播出口：

```bash
# a车
ping -c 3 192.168.31.12
ip route get 192.168.31.12

# b车
ping -c 3 192.168.31.11
ip route get 192.168.31.11

# 两车都执行；225.0.0.1 是 ros2 multicast 测试地址，
# 239.255.0.1 是 Fast DDS 默认发现使用的组播地址。
ip route get 225.0.0.1
ip route get 239.255.0.1
```

普通单播的路由结果应显示无线网卡，以及本车的 `192.168.31.11` 或 `192.168.31.12` 源地址。`ping` 成功只能证明 ICMP 可达，不能证明 DDS 所需的 UDP 通信已放行。

### 1.2 配置 Fast DDS 网卡与初始单播节点

将网络配置保存为 `fastdds_wifi.xml`，两辆车使用同一份配置。

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<profiles xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">

  <!--
    DCL-SLAM 实车 DDS 传输配置，两辆车共用。

    白名单与本机实际接口匹配：a 车使用 192.168.31.11，
    b 车使用 192.168.31.12。

    保留回环接口供本机通信使用；
    无线地址变化时同步修改白名单和初始节点。
  -->

  <transport_descriptors>
    <transport_descriptor>

      <transport_id>dcl_wifi_udp</transport_id>
      <type>UDPv4</type>

      <!-- 扩大初始发现的 participant ID 探测范围，兼顾 bridge 与 ROS 2 CLI。 -->
      <maxInitialPeersRange>32</maxInitialPeersRange>

      <interfaceWhiteList>
        <address>127.0.0.1</address>
        <address>192.168.31.11</address>
        <address>192.168.31.12</address>
      </interfaceWhiteList>

    </transport_descriptor>
  </transport_descriptors>

  <participant
    profile_name="dcl_wifi_participant"
    is_default_profile="true">

    <rtps>

      <useBuiltinTransports>false</useBuiltinTransports>

      <userTransports>
        <transport_id>dcl_wifi_udp</transport_id>
      </userTransports>

      <!-- 通过明确的单播目标发起发现，减少对 Wi-Fi 组播转发的依赖。 -->
      <builtin>
        <initialPeersList>

          <locator>
            <udpv4>
              <address>192.168.31.11</address>
            </udpv4>
          </locator>

          <locator>
            <udpv4>
              <address>192.168.31.12</address>
            </udpv4>
          </locator>

        </initialPeersList>
      </builtin>

    </rtps>
  </participant>

</profiles>
```

| 字段 | 作用 |
| --- | --- |
| `transport_id` | 自定义传输的名称，定义与 `userTransports` 中的引用必须一致。 |
| `type=UDPv4` | 使用 IPv4 UDP 传输。 |
| `interfaceWhiteList` | 将该传输限制在列出的本机接口上，从而排除雷达网卡。另一辆车的地址不会成为本机接口。 |
| `useBuiltinTransports=false` | 禁用内置传输，仅使用这里挂载的自定义 UDPv4 传输，也不使用内置共享内存传输。 |
| `is_default_profile=true` | 将该 participant 配置设为默认配置，供未显式指定其他配置的 participant 使用。 |
| `initialPeersList` | 向指定地址发起初始发现；它不是允许通信的远端白名单，也不会替代系统单播路由。 |
| `maxInitialPeersRange=32` | 在未指定初始节点端口时扩大 participant ID 探测范围；不是最多支持 32 辆车，也不是固定 UDP 端口。 |

白名单限制的是**本机使用哪些接口**，初始节点列表指定的是**向哪些地址发起发现**。两车使用相同 XML 的前提是各自无线接口实际拥有表中的地址；配置文件不会给网卡分配 IP。参见 [Fast DDS 接口白名单说明](https://fast-dds.docs.eprosima.com/en/stable/fastdds/transport/whitelist.html)。

初始节点没有填写 `<port>`，Fast DDS 会根据 DDS 域和 participant ID 规则探测发现端口。若同机进程很多或 participant ID 分配较高，可结合日志调整 `maxInitialPeersRange`；扩大范围也会增加初始发现报文。参见 [Fast DDS 初始节点配置](https://fast-dds.docs.eprosima.com/en/3.x/fastdds/use_cases/wifi/initial_peers.html)。

> 这份 XML 没有显式关闭组播。显式单播节点让两车可以通过单播发起发现，不应将它描述为“彻底禁用组播”。保留 `127.0.0.1` 也不代表任意环境下的 CLI 都能访问节点，CLI 仍需使用一致的 DDS 域与中间件配置。

### 1.3 加载配置并重启进程

如果实际无线 IP 与示例不同，必须同步修改 XML 中的 `interfaceWhiteList` 和 `initialPeersList`。在每辆车启动 `parameter_bridge` 前设置：

```bash
export ROS_DOMAIN_ID=30
export ROS_LOCALHOST_ONLY=0
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
export FASTRTPS_DEFAULT_PROFILES_FILE="$HOME/mtare/dcl_slam/config/fastdds_wifi.xml"
```

示例路径按实际工程位置修改，可先检查文件是否存在：

```bash
test -r "$FASTRTPS_DEFAULT_PROFILES_FILE" && echo "XML 文件可读"
```

这里沿用 Fast DDS 2.x 的 `FASTRTPS_DEFAULT_PROFILES_FILE`，参见 [2.6 环境变量文档](https://fast-dds.docs.eprosima.com/en/2.6.x/fastdds/env_vars/env_vars.html)。Fast DDS 3.x 将其改名为 `FASTDDS_DEFAULT_PROFILES_FILE`，升级时应按实际安装版本检查 XML 与变量兼容性，参见 [官方迁移说明](https://github.com/eProsima/Fast-DDS/blob/master/UPGRADING.md)。

配置在进程创建 DDS participant 时读取，修改文件不会自动更新已运行的节点。

### 1.4 分层验证跨车通信

先验证纯 ROS 2，再验证 bridge，便于区分 DDS 网络与桥接问题。以下每个新终端都需要先加载第 3 节的环境。

```bash
# a 车：在安装了 demo_nodes_cpp 的情况下启动测试发布者。
ros2 run demo_nodes_cpp talker

# b 车：应持续看到来自 a 车的消息。
ros2 run demo_nodes_cpp listener
```

然后交换两车角色再测一次。

看到话题名仅说明发现了话题；还要结合已知的远端节点名称、命名空间及端点信息确认来源，并验证消息能持续到达。`hz` 反映当前订阅端观察到的频率，不一定等于发布端原始频率。

| 现象 | 优先检查 |
| --- | --- |
| 无线 IP 无法互 ping | IP、掩码、单播路由、无线连接，以及 AP 客户端隔离策略。 |
| 能 ping，但纯 ROS 2 测试无法发现 | 两车域是否一致、XML 是否加载、RMW 是否正确、实际 IP 是否匹配白名单，以及防火墙是否放行 DDS UDP 流量。 |
| 能看到远端端点，但收不到消息 | 发布端是否真的发数据、两端 QoS 是否兼容、数据通道是否被拦截。 |
| 纯 ROS 2 正常，但桥接话题缺失 | ROS 1 话题与消息类型、bridge 支持的类型映射、`parameter_bridge` 的话题和方向配置。 |
| 小消息正常，大消息卡顿或丢失 | 无线链路质量、带宽、消息大小、分片及 QoS；先降低发布频率或数据量定位问题。 |
| 本机 CLI 与 bridge 观察不一致 | CLI 终端环境、旧 daemon、旧 bridge 或节点进程是否仍使用旧配置。 |

> `ros2 multicast send/receive` 是独立的原始 UDP 组播测试，不读取 Fast DDS XML。因此，使用固定单播节点后，即使该测试仍因系统组播路由错误而失败，DDS 话题也可以正常跨车发现；应以 `ros2 topic info ... -v` 中是否出现远端端点为准。

### 1.5 可选：修正组播测试的路由

若还需要让 `ros2 multicast` 测试本身长期通过，可使用 NetworkManager 将两个精确组播地址永久绑定到无线连接，而不要添加会影响 MID360 的整段 `224.0.0.0/4` 路由：

```bash
# 先查找无线网卡对应的 NetworkManager 连接名。
nmcli -t -f NAME,DEVICE connection show --active

# 将 <无线连接名> 替换为上一步显示的名称；两辆车都执行一次。
sudo nmcli connection modify "<无线连接名>" +ipv4.routes "225.0.0.1/32"
sudo nmcli connection modify "<无线连接名>" +ipv4.routes "239.255.0.1/32"
```

路由会在该无线连接下次重连或系统重启后自动生效。立即重连可能中断 SSH，建议现场操作或等待下次重启。重启后再次用 `ip route get` 确认出口为无线网卡和对应的 `192.168.31.11/12` 源地址。
