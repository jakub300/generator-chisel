'use strict';

class DynamicPublicPath {
  apply(compiler) {
    compiler.hooks.compilation.tap('DynamicPublicPath', compilation => {
      compilation.mainTemplate.hooks.requireExtensions.tap(
        'DynamicPublicPath',
        (source, chunk) => {
          // Based on https://github.com/webpack/webpack/blob/9fe42e7c4027d0a74addaa3352973f6bb6d20689/lib/MainTemplate.js#L237
          const chunkMaps = chunk.getChunkMaps();
          if (Object.keys(chunkMaps.hash).length) {
            source +=
              '\n\n// Chisel: Allow public path to be modified during runtime\n' +
              '__webpack_require__.p = document.documentElement.dataset.webpackPublicPath || __webpack_require__.p;';
          }

          return source;
        },
      );
    });
  }
}

module.exports = DynamicPublicPath;
