/* eslint-disable class-methods-use-this, no-param-reassign */

'use strict';

const path = require('path');

function getFileType(str) {
  // Based on https://github.com/danethurber/webpack-manifest-plugin/blob/v2.0.4/lib/plugin.js
  const transformExtensions = /^(gz|map)$/i;
  str = str.replace(/\?.*/, '');
  const split = str.split('.');
  let ext = split.pop();
  if (transformExtensions.test(ext)) {
    ext = `${split.pop()}.${ext}`;
  }
  return ext;
}

const revisionedPathRegex = /---CHISEL-REVISIONED-PATH---([\d\w+/]*=*)---/g;

class InjectRevisioned {
  apply(compiler) {
    compiler.hooks.compilation.tap('InjectRevisioned', compilation => {
      console.log('The compiler is starting a new compilation...');

      let chunksMap = {};

      compilation.hooks.htmlWebpackPluginAlterChunks.tap(
        'InjectRevisioned',
        chunks => {
          const map = {};
          chunks.forEach(chunk => {
            chunk.files.forEach(file => {
              const ext = getFileType(file);
              const name = path.join(path.dirname(file), `${chunk.id}.${ext}`);
              map[name] = file;
            });
          });
          chunksMap = map;
        },
      );

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(
        'InjectRevisioned',
        data => {
          data.html = data.html.replace(revisionedPathRegex, (_, pathHash) => {
            const assetPath = Buffer.from(pathHash, 'base64').toString('utf8');
            if (chunksMap[assetPath]) {
              return chunksMap[assetPath];
            }
            throw new Error(`File ${assetPath} seems to not be revisioned`);
          });
        },
      );
    });
  }
}

module.exports = InjectRevisioned;
