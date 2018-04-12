const regLink = /^(https?:\/\/)?[^/]+/;

const validPageLink = link => {
  return (
    link &&
    typeof link === 'string' &&
    !link.startsWith('javascript:') &&
    (/qingcloud\.com/.test(link) || link.startsWith('/'))
  );
};

/**
 * auto append slash to url
 *
 * @param url
 * @param prefix
 * @returns {string}
 */
const normalizeUrl = (url, prefix = '') => {
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1);
  }

  if (url.startsWith('http')) {
    return url;
  }

  if (url.startsWith('/')) {
    let match = prefix.match(regLink);
    prefix = match ? match[0] : '';
    return prefix + url;
  }
  return url;
};

module.exports = {
  validPageLink,
  normalizeUrl
};
