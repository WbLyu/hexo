---
title: docker
date: 2026-08-16 21:11:59
# updated:
tags:
    - Linux
categories: 
          - 技术文档
          - 服务部署
# keywords:
# description:
top_img: transparent
# comments:
# cover:
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

## 1. 安装

### 1.1 手动安装（生产环境推荐）

安装依赖

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

下载 GPG 密钥

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc 
```

安装 Docker

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] http://mirrors.aliyun.com/docker-ce/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 1.2 脚本安装（开发环境推荐）

```bash
curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh
```

## 2. 更改权限

省去普通用户执行Docker命令需要添加sudo的步骤，将用户添加到Docker用户组

查看用户组

```bash
grep docker /etc/group
```

添加当前用户

```bash
sudo usermod -aG docker $USER
```

让新的组权限生效

1. 注销后重新登录
2. 打开一个新的终端窗口
3. 执行`newgrp docker`

## 3. 获取镜像、容器用于开发

### 3.1 从docker hub拉取镜像

执行

```bash
docker pull osrf/ros:noetic-desktop-full-focal
```

`:`前为镜像名称，`:`后为相应的标签

查看镜像

```bash
docker images
```

### 3.2 根据镜像创建容器

创建并启动一个新的容器

```bash
docker run [OPTIONS] IMAGE
```

参数说明

- `-d`: 后台运行容器并返回容器 ID。
- `-it`: 交互式运行容器，分配一个伪终端
- `--name`: 给容器指定一个名称
- `-p`: 端口映射，格式为 `host_port:container_port`
- `-v`: 挂载卷，格式为 `host_dir:container_dir`
- `--rm`: 容器停止后自动删除容器
- `--env` 或 `-e`: 设置环境变量
- `--network`: 指定容器的网络模式
- `--restart`: 容器的重启策略（如 no、on-failure、always、unless-stopped）
- `-u`: 指定用户
- `--gpus` 指定使用的GPU

参考指令

```bash
docker run -it \
--name ros1_noetic \
--gpus all \
--net=host \
-e DISPLAY=$DISPLAY \ 
-v /tmp/.X11-unix:/tmp/.X11-unix \ 
ros1_noetic_img
```

查看容器

```bash
docker ps -a
```

### 3.3 进入容器

```bash
docker exec -it ros1_noetic /bin/bash
```

### 3.4 删除

```bash
# 删除镜像
docker rmi ID

# 删除容器
docker rm ID
```

## 4. 获取镜像、容器用于部署

此操作需要借助`Dockerfile`和`docker-compose.yml`，即将配置写入文件中，文件目录推荐为

```bash
├── docker-compose.yml
├── Dockerfile
└── code
```

在`Dockerfile`中定义镜像构建的操作

参考内容

```dockerfile
FROM osrf/ros:noetic-desktop-full-focal

SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get install -y \
    libglfw3-dev \
    libglew-dev

WORKDIR /root/code

COPY doce /root/code

RUN echo "source /opt/ros/noetic/setup.bash" >> /root/.bashrc

RUN cd /root/code/Livox-SDK2 && \
    mkdir build && cd build &&\
    cmake .. && \
    make -j && \
    make install

RUN source /opt/ros/noetic/setup.bash && \
    cd /root/exploration/C2-Explorer && \
    catkin_make -DCATKIN_WHITELIST_PACKAGES="livox_ros_driver2"  -DROS_EDITION=ROS1 && \
    catkin_make -DCATKIN_WHITELIST_PACKAGES="fast_lio"  && \
    catkin_make -DCATKIN_WHITELIST_PACKAGES=""
```

在`docker-compose.yml`中定义镜像的命名和容器的属性

参考内容

```yaml

services:
  ros1_noetic:
    build: .
    image: c2_explorer:latest
    container_name: c2_explorer
    network_mode: host

    environment:
      - DISPLAY=${DISPLAY}

    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix

    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

    stdin_open: true
    tty: true
```

构建镜像

```bash
docker compose build
```

创建容器

```bash
docker compose up -d
```

## 5. 启动显卡支持

需要在宿主机安装NVIDIA显卡驱动，然后安装NVIDIA Container Toolkit

添加 NVIDIA Container Toolkit 的仓库密钥和源列表

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

更新系统包列表，然后安装 NVIDIA Container Toolkit

```bash
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
```

重启 Docker 服务

```bash
sudo systemctl restart docker
```

创建容器时使用`--gpus all`参数

## 6. X11转发

创建容器时使用`-e DISPLAY=$DISPLAY
-v /tmp/.X11-unix:/tmp/.X11-unix`

宿主机可能还需要执行`xhost +local:docker`

## 7. cpu架构

docker镜像会区分cpu架构的，可以执行

```bash
docker image inspect IMAGE --format '{{.Os}}/{{.Architecture}}'
```

`IMAGE`用相关的镜像名替换，输出的结果即为支持的cpu架构

想要拉取对应架构的镜像可以在`docker pull`后增加`--platform linux/arm64`参数

## 8. 容器分发

将构建好的容器保存为镜像

```bash
docker commit 容器名 镜像名:tag
```

> 注意挂载的内容不会保存在镜像中；容器分发需要保持cpu架构一致

将镜像保存为压缩文件

```bash
docker save 镜像名:tag | gzip > 镜像名-tag.tar.gz
```

然后传到对应主机上，在目标主机上构筑镜像

```bash
docker load -i 镜像名-tag.tar.gz
```

## 9. 换源

在`Dockerfile` 中`SHELL`后面添加相关内容

### 9.1 `apt`换源

对于`arm`架构

```dockerfile
# Ubuntu ARM64 清华源
RUN cat > /etc/apt/sources.list <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-security main restricted universe multiverse
EOF
```

对于`amd`架构

```dockerfile
# Ubuntu AMD64 清华源
RUN cat > /etc/apt/sources.list <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse
EOF
```

### 9.2 `ros`换源

```dockerfile
# ROS 清华源
RUN if [ -f /etc/apt/sources.list.d/ros1-latest.list ]; then \
        sed -i \
        's|http://packages.ros.org/ros/ubuntu|https://mirrors.tuna.tsinghua.edu.cn/ros/ubuntu|g' \
        /etc/apt/sources.list.d/ros1-latest.list; \
    fi
```
