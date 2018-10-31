/* eslint-disable class-methods-use-this, no-param-reassign */

'use strict';

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

class Reloader {
  apply(compiler) {
    const browserSyncPlugin = compiler.options.plugins.find(
      plugin => plugin instanceof BrowserSyncPlugin,
    );
    const cache = {};

    compiler.hooks.emit.tap('Reloader', compilation => {
      const { assets } = compilation;
      const assetsNames = Object.keys(assets);
      const emittedAssetsNames = assetsNames.filter(
        assetName => assets[assetName].emitted !== false,
      );
      const changedAssetsNames = emittedAssetsNames.filter(assetName => {
        const source = assets[assetName].source();
        if (source !== cache[assetName]) {
          cache[assetName] = source;
          return true;
        }
      });
      const changedWithoutMaps = changedAssetsNames.filter(
        assetName => !assetName.endsWith('.map'),
      );
      if (changedWithoutMaps.length > 0) {
        browserSyncPlugin.browserSync.reload(changedWithoutMaps);
      }
    });
  }
}

module.exports = Reloader;
