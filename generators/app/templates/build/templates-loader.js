/* eslint-disable no-param-reassign */

'use strict';

const path = require('path');
const fs = require('fs');
const Twig = require('twig');

Twig.cache(false);

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
      // console.log(data);
      this.callback(null, `module.exports = ${JSON.stringify(data)}`);
    })
    .catch(e => {
      this.callback(e);
    });
};
