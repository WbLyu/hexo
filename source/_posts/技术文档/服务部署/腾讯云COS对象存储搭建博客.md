---
title: 腾讯云COS对象存储搭建博客
date: 2026-10-10 11:23:59
# updated:
tags:
    - 网站
    - Hexo
    - Git
    - 对象存储
categories: 
          - 技术文档
          - 服务部署
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
cover: https://img.wblyu.top/images/304eb5ad8692b52e3687daf496f0054b.avif
---

这篇笔记主要记录如何不购买云服务器，直接通过腾讯云对象存储托管 Hexo 静态博客。本方案为**本地 Hexo + 腾讯云 COS + 自定义域名**。相比于轻量云服务器本方案更加简洁与便宜

> **说明**：本笔记以 `blog.wblyu.top`、`img.wblyu.top` 和 COS 中国香港地域 `ap-hongkong` 为例。存储桶的完整名称包含腾讯云 APPID，本文使用 `BLOG_BUCKET-APPID`、`IMG_BUCKET-APPID` 作为占位符，使用时必须换成自己控制台显示的值。地址推荐选择香港，因为内地需要进行备案，但是存储桶不赠送备案资格，比较麻烦

**本笔记只给出整体流程，具体的代码请询问AI**

## 1. 部署思路


### 1.1 整体工作流程

```text
本地 Markdown、站点配置、Butterfly 主题
                    │
                    ▼
             hexo generate
                    │
                    ▼
               public/
                    │
             COSCLI 同步
          或自定义 Hexo deployer
                    │
                    ▼
        腾讯云 COS：博客存储桶
           （启用静态网站）
                    │
       blog.wblyu.top + HTTPS
                    │
                    ▼
                浏览器
                    │
       Markdown 中的图片外链
                    │
                    ▼
       img.wblyu.top + HTTPS
                    │
                    ▼
        腾讯云 COS：图床存储桶
```

文章配图使用独立图片桶；浏览器访问文章时，再根据 Markdown 渲染后的 `<img src="...">` 地址加载图片。外链图片不会因为执行 `hexo generate` 就自动复制到博客桶。


### 1.2 与轻量云服务器方案的区别

|环节|轻量服务器方案| 存储桶方案|
|-|-|-|
|网站生成|本地 Hexo|本地 Hexo，保持不变|
|HTML 托管|Nginx + 服务器目录|COS 博客存储桶|
|上传方式|`hexo-deployer-git` + SSH + Git Hook|COSCLI 或 COS 部署器|
|HTTPS 证书|安装到 Nginx/宝塔目录|绑定到 COS 自定义源站域名|
|文章图片|MinIO / 图床|COS 图片存储桶|
|随机图片 API|PHP + `img.txt` + 302|图片 JSON 索引 + 构建期脚本|
|服务器运维|需要|无须维护 Web 服务器|
|主要计费|服务器、固定带宽、云盘|存储、请求、公网下行等按量费用|

### 1.3 需要准备的资源

* 腾讯云账号，已开通对象存储 COS；
* 自己持有的域名，能够修改 DNS 解析记录；
* 本地 Node.js、npm、Git、Hexo 环境；
* 已经配置完成的 Butterfly 主题和 Markdown 文章；
* 腾讯云 COS 访问凭据（建议专用 CAM 子用户或临时凭据）；
* HTTPS 证书（手工绑定或通过自动化申请）。

## 2. 配置本地Hexo环境

这部分不再赘述请参考{% post_link 技术文档/服务部署/阿里云轻量云服务器搭建博客  阿里云轻量云服务器搭建博客%}

## 3. 创建腾讯云 COS 存储桶

### 3.1 进入 COS 控制台

打开 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos/bucket)，选择「存储桶列表 → 创建存储桶」。创建时需要关注：

|项目|博客桶示例|图片桶示例|
|-|-|-|
|存储桶名称|`blog-BUCKET-APPID`|`img-BUCKET-APPID`|
|地域|中国香港 `ap-hongkong`|中国香港 `ap-hongkong`|
|存储类型|标准存储|标准存储|
|访问权限|公有读、私有写（静态站示例）|公有读、私有写（公共图床示例）|
|静态网站|开启|无须开启|
|对外域名|`blog.wblyu.top`|`img.wblyu.top`|


### 3.2 博客存储桶开启静态网站

进入博客桶，找到「基础配置 → 静态网站」并开启。

建议设置：

|配置项|设置|用途|
|-|-|-|
|静态网站|开启|启用站点索引规则|
|索引文档|`index.html`|访问根路径和目录时寻找首页|
|错误文档|`404.html`|错误页面；要求桶中实际存在文件|
|强制 HTTPS|暂不启用|等自定义域名证书生效后再启用|
|忽略 HTML 扩展名|可保持默认|不是 Hexo 目录索引所必需|

Hexo 默认会生成这样的路径：

```text
public/index.html
public/archives/index.html
public/categories/index.html
public/2026/10/10/example/index.html
```

当浏览器访问：

```text
https://blog.wblyu.top/archives/
```

希望得到的实际上是 `archives/index.html`。这就是需要 **静态网站功能 + 静态网站源站域名** 的原因。

如果只把域名指向普通 COS 对象源站，直接请求 `/archives/` 可能找不到名为 `archives/` 的具体对象，从而返回 403/404，而不是自动返回索引文件。

> 2024 年 1 月 1 日后创建的存储桶，腾讯云默认 COS 域名在浏览器中预览文件受到限制。默认静态网站域名也在此范围内。部署博客应使用自己的域名，不能单靠打开默认桶域名验证站点是否正常。

## 4. 自定义域名与 DNS 解析

### 4.1 博客域名绑定到静态网站源站

进入博客桶，并点击**域名与传输管理 → 自定义源站域名 → 添加域名**。

填入：

```text
自定义域名：blog.wblyu.top
源站类型：静态网站源站
```

前提是第 3.2 节已经启用静态网站功能。博客必须选择**静态网站源站**，而不是普通的**默认源站**。

保存后，控制台会显示对应 CNAME 信息，**请复制控制台给出的实际记录值**，不要根据地域自行拼接。

### 4.2 图片域名绑定到默认源站

进入图片桶，并点击**域名与传输管理 → 自定义源站域名 → 添加域名**

```text
自定义域名：img.wblyu.top
源站类型：默认源站
```

图床只需要按照对象 Key 获取图片：

```text
images/xxx.avif
```

因此一般不需要启用静态网站，也不需要目录索引行为。

### 4.3 配置 DNS CNAME 记录

在域名当前使用的权威 DNS 服务商控制台中设置解析。DNS 不一定与域名注册商属于同一家，应先确认实际权威 DNS 在哪里。

|主机记录|类型|记录值|用途|
|-|-|-|-|
|`blog`|CNAME|COS 控制台给出的博客 CNAME|访问 Hexo 静态网站|
|`img`|CNAME|COS 控制台给出的图床 CNAME|访问文章图片|

同名主机不能同时保留冲突的 A/CNAME 记录。原来 `blog` 指向轻量服务器公网 IP 的 A 记录应在切换时删除或替换。

检查解析：

```bash
# Linux / macOS
nslookup -type=CNAME blog.wblyu.top
nslookup -type=CNAME img.wblyu.top
```

不要把 CNAME 的记录值填成 `https://...`，它应该是**主机域名**，不包含协议和 URL 路径。解析修改后需要考虑 DNS TTL、COS 域名绑定传播时间。

## 5. 图床迁移与 PicList 上传

### 5.1 图床与博客桶分离

图片存储结构可以约定为：

```text
COS 图片桶
├── images/
│   ├── xxxxx.avif
│   ├── yyyyy.avif
│   └── zzzzz.avif
└── metadata/
    └── random-images.json
```

图片对外访问地址为：

```text
https://img.wblyu.top/images/xxxxx.avif
```

### 5.2 配置 PicList 的腾讯云 COS 图床

使用 [PicList](https://github.com/Kuingsmile/PicList) 管理图片上传。进入图床配置，选择腾讯云 COS 类型，根据当前版本界面填写对应信息：

|配置项|填写内容|
|-|-|
|SecretId|腾讯云 CAM 子用户 SecretId|
|SecretKey|腾讯云 CAM 子用户 SecretKey|
|Bucket|完整图片桶名，例如 `img-BUCKET-APPID`|
|APPID|腾讯云账号实际 APPID（如插件要求单独填写）|
|地域|`ap-hongkong`|
|上传目录|`images/`|
|自定义域名|`https://img.wblyu.top`|

不同 PicList 版本的字段名称可能略有差异，**不要同时把 APPID 既拼进桶名又再错误拼接一次**，最终应以实际生成 URL 的对象键为准。

在 PicList 上传一张图片后，打开复制得到的 HTTPS 链接，确认浏览器可以显示图片。

### 5.3 图像转换与压缩

推荐使用[IMCompressor](https://www.imbox8.com/products/imcompressor)，将图片在上传前转换为 AVIF，以减少图片体积。


## 6. 图片索引与固定文章封面

#目前的方案是：**图片继续存放在 COS，但在 Hexo 生成阶段把封面确定下来**。生成的网页直接使用实际图片 URL，访问网页时无需再向随机 API 查询封面。

### 6.1 生成图库索引

借助腾讯云中的云函数生成图库索引，代码请询问AI，目的是实现存储桶中增加图片或者删除图片后刷新索引`random-images.json`，最好增加根据图片大小分配为cover和background的功能

我采用的是

```python
# < 100 KB       -> cover
# 100~300 KB     -> cover + background
# 300~500 KB    -> background
# > 500 KB      -> 不参与随机
```

新建COS触发，分别为全部删除和全部创建

### 6.2 使用 `random-images.json` 作为图片索引

约定图床中的文件：

```text
metadata/random-images.json
```

对外 URL：

```text
https://img.wblyu.top/metadata/random-images.json
```

对应 JSON 可以包含 `cover` 字段，例如：

```json
{
  "cover": \[
    "images/example-001.avif",
    "images/example-002.avif",
    "images/example-003.avif"
  ]
}
```

这里的 `cover` 列表填写**图片桶中的对象 Key**，而不是完整的外链。脚本会自动在前面拼接：

```text
https://img.wblyu.top/
```

如果实际的 JSON 还包含 `background` 或其他业务字段，可以保留；封面脚本只读取 `cover` 数组。


### 6.3 在 Hexo中写入固定封面

在博客根目录放置：

```text
scripts/auto-cover.js
```

Hexo 会加载 `scripts/` 目录中的脚本。脚本注册 `before\_generate`，因此执行：

```bash
hexo generate
hexo g
hexo deploy --generate
hexo d -g
```

都可以在生成网页之前触发封面处理。

核心逻辑分为两遍：首先递归扫描 `source/\_posts/\*\*/\*.md` 的 Front Matter，找出缺少 `cover` 的文章，同时统计已经被使用的图片；接着获取 JSON 索引，从候选图片中选择尚未占用的图片，并**真正写回对应 Markdown 文件**。

例如原始文章：

```yaml
---
title: PlaNet：Learning Latent Dynamics for Planning from Pixels
date: 2026-09-23
categories:
  - 论文解读
  - World Models
---
```

运行：

```bash
hexo d -g
```

生成阶段会自动补充：

```yaml
---
title: PlaNet：Learning Latent Dynamics for Planning from Pixels
date: 2026-09-23
categories:
  - 论文解读
  - World Models
cover: https://img.wblyu.top/images/xxxxx.avif
---
```

具体代码请询问AI

## 7. 使用 GitHub Actions 自动更新 COS 证书

通过 GitHub Actions 定期检查域名证书，在临近到期时使用 acme.sh 和 Let's Encrypt 签发证书，并上传腾讯云 SSL、部署到 COS 自定义源站域名或 SCF 自定义域名。

当前管理以下三个目标，每个域名单独签发证书并部署到对应服务：

| 域名 | 部署目标 | YAML 地域配置 |
| --- | --- | --- |
| `blog.wblyu.top` | `blog-1317189963` | `ap-hongkong` |
| `img.wblyu.top` | `img-1317189963` | `ap-hongkong` |
| `random.wblyu.top` | SCF 自定义域名 | `ap-hongkong` |

GitHub Actions 为每个目标创建独立任务；一个失败不会取消另一个。根域名 

### 7.1 准备域名和存储桶

- 域名的权威 DNS 必须由腾讯云 DNSPod 托管；仅将域名注册商转到腾讯云不代表 DNS 已迁移。请确认域名 NS 已切换到 DNSPod 分配的服务器，并迁移原有解析记录。
- 在 COS 控制台给目标存储桶绑定**自定义源站域名**，按控制台提示在 DNSPod 添加 CNAME，确保解析生效，并确认所在地域支持自定义域名 HTTPS。
- 若域名使用 CDN / EdgeOne 加速，需要部署到对应加速服务；本项目支持 COS 源站及 SCF 原生自定义域名证书。
- 腾讯云 DNSPod 在这里负责自动添加、删除 `_acme-challenge` TXT 记录完成 DNS-01 验证。证书最终部署到 COS / SCF，不需要开放 HTTP 80 端口。

参见 [COS 自定义域名 HTTPS 配置](https://cloud.tencent.cn/document/product/436/11142) 和 [acme.sh 腾讯云 DNSPod 驱动](https://github.com/acmesh-official/acme.sh/blob/master/dnsapi/dns_tencent.sh)。

### 7.2 SCF 自定义域名准备

在云函数 SCF 对应地域的自定义域名页面，先创建 `random.wblyu.top`，配置函数路由，并按控制台要求设置 CNAME。项目更新已有域名证书，不创建函数、路由或域名。

脚本使用 [GetCustomDomain](https://cloud.tencent.com.cn/document/product/583/111924) 读取现有配置，通过 [UpdateCustomDomain](https://cloud.tencent.com/document/api/583/111922) 更新 SSL 证书 ID，再查询确认绑定。现有 HTTPS / HTTP&HTTPS 协议保留；仅 HTTP 会升级为 HTTP&HTTPS。更新请求不传路由和 WAF 字段。

这里支持 SCF 原生自定义域名；如果实际使用 API 网关自定义域名，需要对应的 API 网关部署接口。

## 7.3 配置 GitHub Actions

在当前仓库 **Settings → Secrets and variables → Actions** 配置：

| 名称 | 内容 |
| --- | --- |
| `TENCENTCLOUD_SECRET_ID` | 腾讯云 CAM 子用户 SecretId |
| `TENCENTCLOUD_SECRET_KEY` | 腾讯云 CAM 子用户 SecretKey |

**非敏感配置直接写入 YAML**

不再使用 GitHub Actions Variables。编辑 `.github/workflows/renew-cos-cert.yml`：

- `env.ACME_EMAIL`：填写真实的 ACME 账户邮箱。
- `jobs.renew.strategy.matrix.include`：配置各目标的 `domain`、`target`、`region`，COS 目标另需 `bucket`。
- `env.RENEW_BEFORE_DAYS`：提前续期天数，默认 30。

当前 YAML 已填写邮箱及三个目标的北京地域（`ap-beijing`），请按实际资源核对。请从云控制台确认真实地域，不能由域名或桶名推断。地域格式例如 `ap-guangzhou`。

### 7.4 腾讯云 CAM 权限

专用子用户需给予自定义策略

```json
{
    "statement": [
        {
            "action": [
                "dnspod:DescribeRecordList",
                "dnspod:DescribeRecordFilterList",
                "dnspod:CreateRecord",
                "dnspod:DeleteRecord",
                "ssl:UploadCertificate",
                "ssl:DeployCertificateInstance",
                "ssl:DescribeHostDeployRecordDetail",
                "scf:GetCustomDomain",
                "scf:UpdateCustomDomain"
            ],
            "effect": "allow",
            "resource": "*"
        }
    ],
    "version": "2.0"
}
```

已有子用户请在原策略中补充上述四个 `dnspod:*` 操作（分别列明的操作，不是通配授权），并保留 SSL / SCF 权限。以上示例的资源范围为 `*`。SCF 更新仍需 `ssl:UploadCertificate`，原有 COS 权限继续保留。

将此策略命名为`GitHubActionsCosCertDeploy`

使用主账号或管理员进入 `SSL 证书控制台 → 证书托管`，根据提示完成角色授权：`SSL_QCSLinkedRoleInReplaceLoadCertificate`它用于让 SSL 服务访问 COS 等云资源并部署证书。角色由腾讯云控制台创建和配置，通常只需完成一次。官方角色授权说明

**具体代码请询问AI**

## 8. 使用 COSCLI 上传 Hexo 静态网站

### 8.1 修改站点地址

编辑博客根目录 `_config.yml`：

```yaml
# Site
url: https://blog.wblyu.top
root: /

# Theme
theme: butterfly
```

其中 `url` 应当填写最终正式使用的博客域名。如果只修改了 DNS，而 Hexo 仍然使用旧的 `url`，主题某些资源地址、站点地图或链接可能仍然指向旧域名。

原文章的 `permalink` 建议保持不变，例如：

```yaml
permalink: :year/:month/:day/:title/
```

这样可以尽量保持此前已经分享出去的文章 URL 不变。**不要因为迁移到 COS 就随意调整永久链接结构**。

### 8.2 安装 COSCLI

COSCLI 是腾讯云官方提供的对象存储命令行工具，用于上传、下载、同步、列举与删除对象。

Ubuntu / WSL2 的 Linux x86-64 环境可从官方地址下载：

```bash
wget https://cosbrowser.cloud.tencent.com/software/coscli/coscli-linux-amd64

mv coscli-linux-amd64 coscli
chmod 755 coscli
sudo mv coscli /usr/local/bin/coscli

coscli --version
```

ARM64 机器应换成对应的 `coscli-linux-arm64` 包。Windows 用户可以下载 Windows 版本并加入 PATH；如果博客项目本身在 WSL2 中，则可直接在 WSL2 安装 Linux 版本。

官方文档：https://cloud.tencent.com/document/product/436/63144

### 8.3 配置 CAM 子用户密钥

建议在腾讯云「访问管理 CAM」中新建用于博客部署的专用身份，仅授权对**博客存储桶**的必要操作。COSCLI 同步往往不只使用 PutObject，还会调用 HeadBucket、GetBucket、HeadObject、分片上传等 API，因此权限不足时可能出现能登录却无法 `sync` 的问题。

首次运行：

```bash
coscli config init
```

按提示填写 SecretId、SecretKey、APPID、桶名称、地域和 Endpoint 等信息。配置文件一般位于：

```text
~/.cos.yaml
```

**不要把这个文件加入 Hexo 的 GitHub 源码仓库**，也不要把 SecretKey 直接写进 `\_config.yml`。虽然 COSCLI 对敏感字段有加密存储支持，本地配置文件仍应当作为敏感文件管理。

### 8.4 为博客桶和图片桶配置别名

如果第一次配置只创建了一个桶别名，可以后续使用 `config add`。例如：

```bash
coscli config add \\
  -b BLOG\_BUCKET-APPID \\
  -r ap-hongkong \\
  -e cos.ap-hongkong.myqcloud.com \\
  -a blog
```

图片桶也可以添加：

```bash
coscli config add \\
  -b IMG\_BUCKET-APPID \\
  -r ap-hongkong \\
  -e cos.ap-hongkong.myqcloud.com \\
  -a img
```

查看配置：

```bash
coscli config show
```

`blog` 和 `img` 只是本地别名，后续可以分别使用：

```text
cos://blog/
cos://img/
```

COSCLI 的上传目标路径不是浏览器 URL，不需要写 `https://img.wblyu.top`。这里 `cos://...` 表示 COSCLI 内部识别的存储桶及对象路径。


## 9. 配置 `hexo d -g` 一键部署到 COS

### 9.1 Hexo 的 generate 和 deploy 是两个阶段

Hexo 命令：

```bash
hexo generate
```

负责在本地生成 `public/`；而：

```bash
hexo deploy
```

负责调用 `_config.yml` 中配置的部署器。组合：

```bash
hexo d -g
```

即先生成、再部署。这种使用习惯可以继续保留，不需要切换到 `npm run deploy`。

### 9.2 添加 Hexo 自定义部署器

在博客根目录创建：

```text
scripts/cos-deployer.js
```

内容：

```js
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

hexo.extend.deployer.register('cos', async function (args) {
  const bucket = String(args.bucket || '');
  const region = String(args.region || '');

  if (!/^[a-z0-9][a-z0-9-]*-\d+$/.test(bucket)) {
    throw new Error('请在 deploy.bucket 中填写完整 COS 桶名');
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(region)) {
    throw new Error('请在 deploy.region 中填写地域，例如 ap-guangzhou');
  }

  const publicDir = path.resolve(hexo.public_dir);

  // 避免生成目录不存在或未生成首页时执行上传。
  await fs.access(path.join(publicDir, 'index.html'));

  const destination = `cos://${bucket}/`;
  const endpoint = `cos.${region}.myqcloud.com`;

  const cliArgs = [
  'sync',
  publicDir + path.sep,
  destination,
  '-r',
  '-e',
  endpoint,
  '--routines', '8',
  '--snapshot-path',
  path.join(hexo.base_dir, '.coscli-snapshots', bucket)
];

  hexo.log.info(`上传博客到 ${destination}`);

  await new Promise((resolve, reject) => {
    const child = spawn('coscli', cliArgs, {
      cwd: hexo.base_dir,
      stdio: 'inherit',
      shell: false
    });

    child.once('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('未找到 coscli，请确认已安装并加入 PATH'));
      } else {
        reject(error);
      }
    });

    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(
          `COS 上传失败：${signal ? `信号 ${signal}` : `退出码 ${code}`}`
        ));
      }
    });
  });

  hexo.log.info('COS 博客部署完成');
});
```

### 9.3 配置 `_config.yml`

编辑博客根目录 `_config.yml` 中的部署配置，替换旧 `git` 部署方式：

```yaml
deploy:
  type: cos
  bucket: blog-xxxxx
  region: ap-hongkong
```

### 9.5 部署并检查

执行：

```bash
hexo d -g
```

期望流程：

```text
hexo d -g
    │
    ├── generate
    │     ├── 读取 Markdown
    │     ├── 运行自定义 scripts
    │     └── 生成 public/
    │
    └── deploy
          └── coscli sync public/ → COS 博客桶
```

查看 COSCLI 上传日志及浏览器访问结果。此示例部署器使用的是**增量同步、不自动删除旧对象**的保守行为；需要删除文章时可以先在控制台按对象键删除，或经过确认后单独执行带 `--delete` 的同步命令。

> 如果你当前已经通过其他 COS 插件完成了一键部署，不要额外添加第二个部署器，以免一次 `hexo d -g` 发生重复上传或覆盖。



---
参考资料

* [Hexo 官方文档：部署](https://hexo.io/docs/one-command-deployment)
* [Hexo 官方文档：配置](https://hexo.io/docs/configuration)
* [Butterfly 主题官方仓库](https://github.com/jerryc127/hexo-theme-butterfly)
* [腾讯云：设置静态网站](https://cloud.tencent.com/document/product/436/32670)
* [腾讯云：开启自定义源站域名](https://cloud.tencent.com/document/product/436/36638)
* [腾讯云：配置自定义域名支持 HTTPS](https://cloud.tencent.com/document/product/436/11142)
* [腾讯云：COS 存储桶域名使用安全管理通知](https://cloud.tencent.com/document/product/436/96243)
* [腾讯云：COSCLI 下载与安装配置](https://cloud.tencent.com/document/product/436/63144)
* [腾讯云：COSCLI config 命令](https://cloud.tencent.com/document/product/436/63679)
* [腾讯云：COSCLI sync 命令](https://cloud.tencent.com/document/product/436/63670)
* [腾讯云：COSCLI cp 命令](https://cloud.tencent.com/document/product/436/63669)
* [PicList 项目](https://github.com/Kuingsmile/PicList)
* [acme.sh 项目](https://github.com/acmesh-official/acme.sh)
