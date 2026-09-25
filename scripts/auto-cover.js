'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = hexo.base_dir;
const SOURCE_DIR = path.join(ROOT, 'source');
const POSTS_DIR = path.join(SOURCE_DIR, '_posts');

const INDEX_URL =
  'https://img.wblyu.top/metadata/random-images.json';

const IMG_DOMAIN =
  'https://img.wblyu.top';

const FETCH_TIMEOUT_MS = 10000;

/*
 * 普通模式：
 *
 *   hexo g
 *   hexo d -g
 *
 * 只给没有 cover 的文章自动分配。
 *
 * 强制重新分配模式：
 *
 *   AUTO_COVER_REASSIGN=1 hexo g
 *   AUTO_COVER_REASSIGN=1 hexo d -g
 *
 * 会重新分配所有由 IMG_DOMAIN 管理的 cover。
 *
 * cover: false
 * 以及其它来源的手动 cover
 * 都不会被修改。
 */
const FORCE_REASSIGN =
  process.env.AUTO_COVER_REASSIGN === '1';


/**
 * 统一路径分隔符。
 */
function normalizePath(value) {
  return String(value || '')
    .replaceAll(path.sep, '/')
    .replace(/^\/+/, '');
}


/**
 * 递归获取所有 Markdown 文章。
 */
function walkMarkdownFiles(dir) {
  const files = [];

  for (
    const entry of fs.readdirSync(
      dir,
      { withFileTypes: true }
    )
  ) {
    const fullPath =
      path.join(
        dir,
        entry.name
      );

    if (entry.isDirectory()) {
      files.push(
        ...walkMarkdownFiles(
          fullPath
        )
      );
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md')
    ) {
      files.push(
        fullPath
      );
    }
  }

  return files;
}


/**
 * 解析 YAML Front Matter。
 */
function parseFrontMatter(content) {
  const match =
    content.match(
      /^---\r?\n([\s\S]*?)\r?\n---(?:(\r?\n)|$)/
    );

  if (!match) {
    return null;
  }

  return {
    front:
      match[1],

    full:
      match[0],

    trailingNewline:
      match[2] || '',

    newline:
      content.includes('\r\n')
        ? '\r\n'
        : '\n'
  };
}


/**
 * 去掉简单 YAML 字符串引号。
 */
function stripQuotes(value) {
  const text =
    String(value || '')
      .trim();

  if (
    text.length >= 2 &&
    (
      (
        text.startsWith('"') &&
        text.endsWith('"')
      ) ||
      (
        text.startsWith("'") &&
        text.endsWith("'")
      )
    )
  ) {
    return text.slice(
      1,
      -1
    );
  }

  return text;
}


/**
 * 获取 Front Matter 中的 cover。
 */
function getCover(front) {
  const match =
    front.match(
      /^cover:[ \t]*(.*)$/m
    );

  if (!match) {
    return {
      exists: false,
      value: ''
    };
  }

  return {
    exists: true,

    value:
      stripQuotes(
        match[1]
      )
  };
}


/**
 * 写入或替换 cover 字段。
 */
function writeCover(
  content,
  coverUrl
) {
  const parsed =
    parseFrontMatter(
      content
    );

  if (!parsed) {
    throw new Error(
      'Missing YAML front matter'
    );
  }

  let front =
    parsed.front;

  const coverLine =
    /^cover:[ \t]*.*$/m;

  /*
   * 如果原来已有 cover：
   *
   * cover:
   *
   * 或：
   *
   * cover: https://...
   *
   * 都直接替换。
   */
  if (
    coverLine.test(front)
  ) {
    front =
      front.replace(
        coverLine,
        `cover: ${coverUrl}`
      );
  } else {
    /*
     * 完全没有 cover 字段，
     * 就追加到 Front Matter 末尾。
     */
    front =
      `${front}` +
      `${parsed.newline}` +
      `cover: ${coverUrl}`;
  }

  const newBlock =
    `---${parsed.newline}` +
    `${front}${parsed.newline}` +
    `---${parsed.trailingNewline}`;

  return (
    newBlock +
    content.slice(
      parsed.full.length
    )
  );
}


/**
 * 如果已有 cover 来自 IMG_DOMAIN，
 * 提取对应 Object Key。
 */
function toImageKey(value) {
  const text =
    stripQuotes(
      value
    );

  const prefix =
    `${IMG_DOMAIN}/`;

  if (
    text.startsWith(prefix)
  ) {
    return text.slice(
      prefix.length
    );
  }

  return null;
}


/**
 * Object Key -> 完整 URL。
 */
function toImageUrl(key) {
  if (
    /^https?:\/\//i.test(key)
  ) {
    return key;
  }

  return (
    `${IMG_DOMAIN}/` +
    String(key)
      .replace(/^\/+/, '')
  );
}


/**
 * 根据文章路径稳定选择一张候选图。
 *
 * 在候选集合不变的情况下，
 * 同一篇文章会稳定得到同一结果。
 */
function chooseCover(
  postKey,
  candidates
) {
  if (
    candidates.length === 0
  ) {
    return null;
  }

  const digest =
    crypto
      .createHash('sha256')
      .update(postKey)
      .digest('hex');

  const index =
    Number.parseInt(
      digest.slice(0, 12),
      16
    ) %
    candidates.length;

  return candidates[index];
}


/**
 * 下载当前最新封面图库索引。
 */
async function fetchCoverList() {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        INDEX_URL,
        {
          cache: 'no-store',

          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const json =
      await response.json();

    if (
      !Array.isArray(
        json.cover
      )
    ) {
      throw new Error(
        '"cover" is not an array'
      );
    }

    const covers = [
      ...new Set(
        json.cover
          .map(item =>
            String(item)
              .trim()
          )
          .filter(Boolean)
      )
    ];

    if (
      covers.length === 0
    ) {
      throw new Error(
        'Cover image list is empty'
      );
    }

    return covers;
  } finally {
    clearTimeout(
      timer
    );
  }
}


/**
 * 同步更新当前 Hexo 内存中的 post.cover。
 *
 * before_generate 执行时，
 * Markdown 已经被 Hexo 读取过。
 *
 * 所以仅修改 .md 文件还不够，
 * 本次 generate 还需要同步更新内存对象。
 */
function setInMemoryCover(
  post,
  url
) {
  if (
    typeof post.set === 'function'
  ) {
    post.set(
      'cover',
      url
    );
  }

  post.cover =
    url;
}


/**
 * 每次 generate 前执行。
 *
 * 所以这些都会触发：
 *
 * hexo generate
 * hexo g
 * hexo deploy --generate
 * hexo d -g
 */
hexo.extend.filter.register(
  'before_generate',

  async function () {
    if (
      !fs.existsSync(
        POSTS_DIR
      )
    ) {
      hexo.log.warn(
        '[auto-cover] source/_posts does not exist'
      );

      return;
    }

    if (
      FORCE_REASSIGN
    ) {
      hexo.log.warn(
        '[auto-cover] Reassign mode enabled.'
      );
    }

    const files =
      walkMarkdownFiles(
        POSTS_DIR
      ).sort();

    const usedCovers =
      new Set();

    const missing = [];

    /*
     * 本轮新写入的：
     *
     * source path -> URL
     */
    const assignments =
      new Map();


    /*
     * ========================================================
     * 第一遍扫描文章
     * ========================================================
     *
     * 普通模式：
     * - 没 cover -> 待分配
     * - 有自动 cover -> 保留，并登记 used
     * - 手动 cover -> 保留
     *
     * 强制模式：
     * - IMG_DOMAIN 下的自动 cover -> 全部待重新分配
     * - 其它来源 cover -> 保留
     * - cover: false -> 永远保留
     */

    for (
      const file of files
    ) {
      const content =
        fs.readFileSync(
          file,
          'utf8'
        );

      const parsed =
        parseFrontMatter(
          content
        );

      if (!parsed) {
        hexo.log.warn(
          '[auto-cover] Skip file without front matter: ' +
          normalizePath(
            path.relative(
              ROOT,
              file
            )
          )
        );

        continue;
      }

      const cover =
        getCover(
          parsed.front
        );

      const relativeToSource =
        normalizePath(
          path.relative(
            SOURCE_DIR,
            file
          )
        );

      const relativeToPosts =
        normalizePath(
          path.relative(
            POSTS_DIR,
            file
          )
        );


      /*
       * cover: false
       *
       * 明确禁用封面。
       * 即使 FORCE_REASSIGN 也不处理。
       */
      if (
        cover.exists &&
        cover.value
          .toLowerCase() ===
          'false'
      ) {
        continue;
      }


      /*
       * 判断是不是自动图库封面。
       */
      const autoCoverKey =
        toImageKey(
          cover.value
        );


      /*
       * 强制模式下：
       *
       * 所有来自 IMG_DOMAIN 的 cover
       * 都重新进入分配队列。
       */
      const shouldReassign =
        FORCE_REASSIGN &&
        autoCoverKey !== null;


      /*
       * 三种情况进入待分配：
       *
       * 1. 没有 cover 字段
       * 2. cover: 空值
       * 3. 强制重分配自动 cover
       */
      if (
        !cover.exists ||
        cover.value === '' ||
        shouldReassign
      ) {
        missing.push({
          file,
          content,
          relativeToSource,
          relativeToPosts
        });

        continue;
      }


      /*
       * 普通模式下：
       *
       * 已经存在的自动图库封面要登记为 used，
       * 避免给新文章重复分配。
       *
       * 强制模式下旧自动 cover 已经 continue 了，
       * 所以不会污染新的重新分配结果。
       */
      if (
        autoCoverKey
      ) {
        usedCovers.add(
          autoCoverKey
        );
      }
    }


    /*
     * 全部文章都已经有 cover，
     * 并且不需要重新分配。
     *
     * 连 random-images.json 都不用请求。
     */
    if (
      missing.length === 0
    ) {
      hexo.log.info(
        '[auto-cover] All posts already have covers; skip.'
      );

      return;
    }


    hexo.log.info(
      `[auto-cover] ${missing.length} post(s) need cover; ` +
      'loading image index...'
    );


    /*
     * ========================================================
     * 下载当前最新图库
     * ========================================================
     */

    let covers;

    try {
      covers =
        await fetchCoverList();
    } catch (error) {
      hexo.log.error(
        '[auto-cover] Failed to load image index:',
        error.message
      );

      /*
       * 图库请求失败时不阻止 Hexo 构建。
       */
      return;
    }


    /*
     * 已有 cover 如果已经从图库删除，
     * 不应继续占用 usedCovers。
     */
    const coverSet =
      new Set(
        covers
      );

    for (
      const key of [
        ...usedCovers
      ]
    ) {
      if (
        !coverSet.has(
          key
        )
      ) {
        usedCovers.delete(
          key
        );
      }
    }


    let assignedCount = 0;
    let reusedCount = 0;


    /*
     * ========================================================
     * 给待处理文章分配当前图库中的图片
     * ========================================================
     */

    for (
      const item of missing
    ) {
      /*
       * 优先从还未被使用的图片中选择。
       */
      let candidates =
        covers.filter(
          cover =>
            !usedCovers.has(
              cover
            )
        );

      let reused =
        false;


      /*
       * 如果图片数量少于文章数量，
       * 所有图片都用过以后才允许重复。
       */
      if (
        candidates.length === 0
      ) {
        candidates =
          covers;

        reused =
          true;
      }


      const selected =
        chooseCover(
          item.relativeToPosts,
          candidates
        );


      if (!selected) {
        hexo.log.warn(
          '[auto-cover] No cover available for ' +
          item.relativeToPosts
        );

        continue;
      }


      const url =
        toImageUrl(
          selected
        );


      /*
       * 真正写入 / 替换 Markdown Front Matter。
       */
      const updated =
        writeCover(
          item.content,
          url
        );

      fs.writeFileSync(
        item.file,
        updated,
        'utf8'
      );


      /*
       * 保存本次 assignment。
       *
       * 两种路径都登记，
       * 方便后面匹配 Hexo post.source。
       */
      assignments.set(
        item.relativeToSource,
        url
      );

      assignments.set(
        item.relativeToPosts,
        url
      );


      if (
        reused
      ) {
        reusedCount++;
      } else {
        usedCovers.add(
          selected
        );

        assignedCount++;
      }


      hexo.log.info(
        '[auto-cover] ' +
        `${item.relativeToPosts} -> ${selected}`
      );
    }


    /*
     * ========================================================
     * 同步当前 generate 的内存文章对象
     * ========================================================
     *
     * 因为 Markdown 是刚刚修改的，
     * 但 Hexo 在 before_generate 前已经读取过文章。
     *
     * 所以这里直接同步 post.cover，
     * 保证第一次执行 hexo d -g 就能使用新封面。
     */

    const posts =
      hexo.locals
        .get('posts')
        .toArray();


    for (
      const post of posts
    ) {
      const source =
        normalizePath(
          post.source
        );

      const withoutPostsPrefix =
        source.replace(
          /^_posts\//,
          ''
        );

      const url =
        assignments.get(
          source
        ) ||
        assignments.get(
          withoutPostsPrefix
        );


      if (
        url
      ) {
        setInMemoryCover(
          post,
          url
        );
      }
    }


    hexo.log.info(
      '[auto-cover] Done: ' +
      `${assignedCount} assigned, ` +
      `${reusedCount} reused.`
    );
  }
);