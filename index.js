#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const request = require('superagent');
const cheerio = require('cheerio');

const logger = require('./lib/logger');
const utils = require('./lib/utils');

const pkg = require('./package.json');

let entryLink;

program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .option('-d, --debug', 'verbose mode')
  .option('-l, --levels [levels]', 'crawl levels recursively')
  .option('-w, --write', 'write broken links to file');

program.arguments('<entry>').action(entry => {
  entryLink = entry;
});

program.parse(process.argv);

// action
if (!entryLink) {
  program.outputHelp();
  console.log('\n');
  logger.warn('entry should given');
  process.exit(1);
}

const header = {
  Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
  'Content-Type': 'text/html; charset=utf-8',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 \
  (KHTML, like Gecko)Chrome/65.0.3325.181 Safari/537.36'
};

const debug = !!program.debug;
const write = !!program.write;

const brokenLinks = new Set();
const handledLinks = new Set();

let maxLevel = program.levels === undefined ? 2 : Number(program.levels);

const brokenLinksFile = 'broken-links.txt';
const saveFile = (data, append = false) => {
  fs.writeFileSync(brokenLinksFile, data, {encoding: 'utf8', flag: append ? 'a' : 'w'});
};

entryLink = utils.normalizeUrl(entryLink);
logger.info('checking entry: ', entryLink);

if (write) {
  logger.info(`writing file: ${brokenLinksFile}`);
  saveFile(`Entry=${entryLink}, depth=${maxLevel}\n`);
}

const getEntrySubLinks = (entry, parent) => {
  if (handledLinks.has(entry)) {
    return new Promise(resolve => resolve('handled'));
  }

  return new Promise(resolve => {
    let req = request
      .get(entry)
      .retry(2)
      .timeout({
        response: 3000
      })
      .set(header);

    req
      .then(res => {
        const html = res.text;
        const $ = cheerio.load(html);
        const childLinks = [];

        $('body a').each(function() {
          let link = $(this).attr('href');

          if (utils.validPageLink(link)) {
            let normalizedLink = utils.normalizeUrl(link, entry);

            if (childLinks.indexOf(normalizedLink) < 0) {
              childLinks.push(normalizedLink);
            }
          }
        });

        handledLinks.add(entry);

        resolve({
          parentLink: entry,
          childLinks: childLinks
        });
      })
      .catch(err => {
        if (err.timeout) {
          debug && logger.error('[skip] timeout, invalid url: ', entry);
        } else {
          // filter `404: Not found`
          let statusCode = (err.status / 100) | 0;
          if (statusCode === 4 || statusCode === 5) {
            if (!brokenLinks.has(entry)) {
              brokenLinks.add(entry);
              logger.error(err.status, ':', entry, ', parent:', parent);
              write && saveFile(`${entry} ,parent: ${parent}\n`, true);
            }
          }
        }

        req.abort();
      });
  });
};

// depth-first search
const crawl = (entry, parent, depth = maxLevel) => {
  if (depth === 0) {
    debug && logger.info('[done]', entry);
    return;
  }

  getEntrySubLinks(entry, parent).then(state => {
    if (state === 'handled') {
      debug && logger.warn('[skip handled]', entry);
      return;
    }

    state.childLinks.forEach(link => {
      let parentLink = state.parentLink;
      link = utils.normalizeUrl(link, parentLink);

      crawl(link, parentLink, depth - 1);
    });
  });
};

crawl(entryLink);
