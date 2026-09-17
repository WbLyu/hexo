'use strict';

/**
 * Mark Butterfly default-cover images for client-side random replacement.
 *
 * The default cover itself should be a local placeholder image.
 * This prevents the browser from requesting the old random-image API.
 */

hexo.extend.filter.register('after_render:html', function (html) {
  const settings = hexo.theme.config.cover || {};

  const defaults = (
    Array.isArray(settings.default_cover)
      ? settings.default_cover
      : [settings.default_cover]
  ).filter(value => typeof value === 'string');

  if (defaults.length === 0) {
    return html;
  }

  let index = 0;

  return html.replace(/<img\b[^>]*>/gi, tag => {
    let matched = false;

    const replaced = tag.replace(
      /(\s(?:src|data-src|data-lazy-src)=)(["'])(.*?)\2/gi,
      (match, prefix, quote, value) => {
        const decoded = value.replace(/&amp;/g, '&');

        if (!defaults.includes(decoded)) {
          return match;
        }

        matched = true;

        return match;
      }
    );

    if (!matched) {
      return tag;
    }

    const imageId = index++;

    return replaced.replace(
      /<img\b/i,
      `<img data-random-cover="${imageId}"`
    );
  });
});