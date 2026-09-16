'use strict';

// Apply after theme rendering so cached posts and Butterfly's own cover
// generator cannot bypass the distinct URLs required by random-image APIs.
hexo.extend.filter.register('after_render:html', function (html) {
  const settings = hexo.theme.config.cover || {};
  if (![1, 2].includes(Number(settings.suffix))) return html;

  const defaults = (Array.isArray(settings.default_cover)
    ? settings.default_cover
    : [settings.default_cover]).filter(value => typeof value === 'string');
  let index = 0;

  return html.replace(/<img\b[^>]*>/gi, tag => {
    const imageId = index++;
    return tag.replace(/(\s(?:src|data-src|data-lazy-src)=)(["'])(.*?)\2/gi,
      (match, prefix, quote, value) => {
        const decoded = value.replace(/&amp;/g, '&');
        if (!defaults.includes(decoded) || !/^https?:\/\//i.test(decoded)) return match;
        const url = new URL(decoded);
        // Stable keys avoid invalidating every page on every build.
        url.searchParams.set('hexo_cover', String(imageId));
        return prefix + quote + url.href.replace(/&/g, '&amp;') + quote;
      });
  });
});
