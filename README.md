# 雯欂の修仙笔记

记录机器人、自动驾驶、世界模型相关的论文阅读、书籍笔记与技术实践。

🌐 **博客地址：https://blog.wblyu.top**

## 内容

- **论文解读**：世界模型、端到端自动驾驶、机器人等方向
- **书籍笔记**：优化模型与数学基础
- **技术文档**：Linux、开发工具、服务部署与机器人实践
- **课程笔记与代码解读**：课程学习记录及项目实现分析

笔记随学习过程持续更新，欢迎通过 Issue 指出错误或交流讨论。

## 技术栈

- Hexo + Butterfly
- Markdown-it + KaTeX 数学公式渲染
- 腾讯云 COS 静态网站托管
- COSCLI + 自定义 Hexo 部署器
- 前端随机封面与独立图床

## 本地运行

准备 Node.js（建议使用兼容项目的 22.x 版本）、npm 和 Git。

克隆源码及主题子模块：

```bash
git clone --recurse-submodules <本仓库地址> hexo
cd hexo
npm ci
npm run server
```

浏览器访问 `http://localhost:4000`。

主题子模块使用 GitHub SSH 地址，需要本机具备 GitHub SSH 访问权限。已克隆但未初始化主题时，执行：

```bash
git submodule update --init --recursive
```

## 常用操作

```bash
# 新建文章
hexo new "文章标题"

# 强制全部重新分配自动封面
AUTO_COVER_REASSIGN=1 hexo d -g

# 生成与部署，只给没有cover的文章自动分配
hexo d -g

# 清理生成结果与缓存
hexo clean
```

修改主题配置、删除或重命名文章后，可以先清理再生成。

## 部署到 COS

1. 安装 COSCLI，确保终端可以执行 `coscli`。
2. 在本机配置 COS 凭据，密钥不写入仓库。
3. 确认 `_config.yml` 中的域名、目标桶和地域。
4. 执行：

```bash
npx hexo deploy --generate
```

已安装全局 Hexo CLI 时，也可以使用：

```bash
hexo d -g
```

部署脚本位于 `scripts/deploy-cos.js`，将生成目录同步到 COS。
当前启用了并发上传及同步快照，未开启远端文件删除。
删除文章后，COS 中遗留的旧页面需要另行清理。

`npm run deploy` 只执行部署，不会自动生成最新页面。

## 项目结构

```text
.
├── _config.yml              # Hexo 站点与部署配置
├── _config.butterfly.yml    # Butterfly 主题配置
├── scripts/                # 部署器及生成阶段的自定义脚本
├── source/
│   ├── _posts/             # 博客文章
│   ├── css/                # 自定义样式与字体
│   ├── img/                # 本地图片
│   └── js/                 # 浏览器端脚本
├── themes/butterfly/        # 主题子模块
├── package.json
└── package-lock.json
```

`public/` 为生成结果，不应直接修改；`node_modules/` 为本地依赖。

## 更新与备份

拉取代码及依赖更新后：

```bash
git pull
git submodule update --init --recursive
npm ci
```

文章和配置通过本仓库备份，部署到 COS 不等于备份源码。
外部图床文件、云服务凭据和服务器配置需要单独管理。

## 致谢

- [Hexo](https://hexo.io/)
- [Butterfly](https://github.com/jerryc127/hexo-theme-butterfly)
- [KaTeX](https://katex.org/)