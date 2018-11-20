'use strict';

// Based on: https://github.com/fqborges/webpack-fix-style-only-entries/blob/0.0.4/index.js

class CssWithoutJs {
  apply(compiler) {
    compiler.hooks.compilation.tap('CssWithoutJs', compilation => {
      compilation.hooks.chunkAsset.tap('CssWithoutJs', (chunk, file) => {
        if (!chunk.hasEntryModule()) {
          return;
        }

        const resources =
          typeof chunk.entryModule.resource === 'string'
            ? [chunk.entryModule.resource]
            : chunk.entryModule.dependencies
                .map(dep => dep.module && dep.module.resource)
                .filter(r => r);

        const allResourcesAreStyles = resources.every(res =>
          res.endsWith('.scss'),
        );

        if (resources.length > 0 && allResourcesAreStyles) {
          if (file.endsWith('.js')) {
            chunk.files = chunk.files.filter(f => f !== file);
            delete compilation.assets[file];
          }
        }
      });
    });
  }
}

module.exports = CssWithoutJs;
