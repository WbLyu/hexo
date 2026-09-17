(() => {
  'use strict';

  const INDEX_URL =
    'https://img.wblyu.top/metadata/random-images.json';

  const IMG_DOMAIN =
    'https://img.wblyu.top';

  function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [result[i], result[j]] = [
        result[j],
        result[i]
      ];
    }

    return result;
  }

  function toImageUrl(key) {
    return `${IMG_DOMAIN}/${key}`;
  }

  async function loadRandomCovers() {
    const elements = [
      ...document.querySelectorAll(
        'img[data-random-cover]'
      )
    ];

    if (elements.length === 0) {
      return;
    }

    try {
      const response = await fetch(
        INDEX_URL,
        {
          cache: 'no-cache'
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const index = await response.json();

      if (
        !Array.isArray(index.cover) ||
        index.cover.length === 0
      ) {
        throw new Error(
          'Cover image list is empty'
        );
      }

      const images = shuffle(index.cover);

      elements.forEach((element, i) => {
        /*
         * 当封面数量超过图库数量时，
         * 从头循环使用。
         */
        const key =
          images[i % images.length];

        const url =
          toImageUrl(key);

        /*
         * 先预加载，加载完成后再替换占位图，
         * 避免图片区域突然变空。
         */
        const preload =
          new Image();

        preload.onload = () => {
          element.src = url;

          if (element.dataset.src) {
            element.dataset.src = url;
          }

          if (element.dataset.lazySrc) {
            element.dataset.lazySrc = url;
          }
        };

        preload.src = url;
      });
    } catch (error) {
      /*
       * 加载失败时保留本地 placeholder，
       * 不影响页面正常显示。
       */
      console.error(
        '[random-cover]',
        error
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      loadRandomCovers,
      { once: true }
    );
  } else {
    loadRandomCovers();
  }
})();