'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function templateFunctions(data = {}) {
  const webpackManifestPath = path.join(
    data.config.dest.base,
    data.config.dest.scripts,
    `manifest${!data.manifest ? '-dev' : ''}.json`,
  );

  return [
    {
      name: 'revisionedPath',
      func(fullPath) {
        const pathBase64 = Buffer.from(fullPath, 'utf8').toString('base64');
        return `---CHISEL-REVISIONED-PATH---${pathBase64}---`;
      },
    },
    {
      name: 'assetPath',
      func(assetPath) {
        const pathBase64 = Buffer.from(
          path.join('~', data.config.dest.assets, assetPath),
          'utf8',
        ).toString('base64');
        return `---CHISEL-ASSET-PATH---${pathBase64}---`;
      },
    },
    {
      name: 'className',
      func(...args) {
        const name = args.shift();
        if (typeof name !== 'string' || name === '') {
          return '';
        }
        const classes = [name];
        let el;
        for (let i = 0; i < args.length; i += 1) {
          el = args[i];
          if (el && typeof el === 'string') {
            classes.push(`${name}--${el}`);
          }
        }
        return classes.join(' ');
      },
    },
    {
      name: 'hasVendor',
      func() {
        if (!data.manifest) {
          return fs.existsSync(
            path.join(
              data.config.dest.base,
              data.config.dest.scripts,
              'vendor.js',
            ),
          );
        }

        return !!data.manifest['vendor.js'];
      },
    },
    {
      name: 'getScriptsPath',
      func() {
        return 'scripts/';
      },
    },
    {
      name: 'hasWebpackManifest',
      func() {
        return fs.existsSync(webpackManifestPath);
      },
    },
    {
      name: 'getWebpackManifest',
      func() {
        return fs.readFileSync(webpackManifestPath, 'utf8');
      },
    },
  ];
};
