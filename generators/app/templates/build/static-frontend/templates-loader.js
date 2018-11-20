'use strict';

const path = require('path');
const fs = require('fs');
const Twig = require('twig');

Twig.cache(false);

const assetRegex = /(---CHISEL-ASSET-PATH---[\d\w+/]*=*---)/;
const assetPathRegex = /---CHISEL-ASSET-PATH---([\d\w+/]*=*)---/;

module.exports = function templatesLoader(content) {
  this.cacheable();
  this.async();

  // console.log('loader', this.resourcePath);

  Twig.extend(TwigCore => {
    TwigCore.Templates.registerLoader('fs', (location, params, callback) => {
      params.path = params.path || location;

      if (params.path === this.resourcePath) {
        params.data = content;
      } else {
        const fullPath = path.join(this.rootContext, params.path);
        this.addDependency(fullPath);
        // console.log(fullPath);
        params.data = fs.readFileSync(path.join(fullPath), 'utf8');
        // params.data = '';
      }

      const template = new TwigCore.Template(params);
      if (typeof callback === 'function') {
        callback(template);
      }
      return template;
    });
  });

  Twig.twig({
    path: this.resourcePath,
    base: 'templates/',
    async: false,
    rethrow: true,
  })
    .renderAsync()
    .then(data => {
      const response = [];
      data.split(assetRegex).forEach(part => {
        const pathMatched = assetPathRegex.exec(part);
        if (!pathMatched) {
          response.push(JSON.stringify(part));
          return;
        }
        const pathHash = pathMatched[1];
        const assetPath = Buffer.from(pathHash, 'base64').toString('utf8');
        response.push(`require(${JSON.stringify(assetPath)})`);
      });
      this.callback(null, `module.exports = ${response.join(' + ')}`);
    })
    .catch(e => {
      this.callback(e);
    });
};
