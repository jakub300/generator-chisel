'use strict';

const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = function wordPressConfig({
  resolve,
  config,
  generatorConfig,
}) {
  return {
    output: {
      path: resolve(
        path.join(
          config.dest.wordpress,
          'wp-content/themes',
          config.dest.wordpressTheme,
          config.dest.base,
        ),
      ),
    },
    plugins: [
      new CopyWebpackPlugin(
        [{ from: config.src.assets, to: '[path][name].H[hash:10]H.[ext]' }],
        {},
      ),
      new ManifestPlugin({
        fileName: config.dest.revManifest,
        seed: {},
        map(obj) {
          // console.log(obj.chunk.entryModule.rootModule.resource);
          if (obj.path.startsWith('/dist/')) {
            obj.path = obj.path.substr(6);
          }

          if (obj.name.startsWith('assets/')) {
            obj.name = obj.name.replace(/\.H[\da-f]+H\./, '.');
          }

          if (obj.isInitial) {
            obj.name = path.join(
              path.dirname(obj.path),
              `${path.basename(obj.name)}`,
            );
          }

          return obj;
        },
      }),
      new BrowserSyncPlugin(
        {
          proxy: {
            target:
              generatorConfig.proxyTarget || `${generatorConfig.nameSlug}.test`,
            reqHeaders: {
              'x-chisel-proxy': '1',
            },
          },
          ghostMode: false,
          online: true,
          open: false,
        },
        { reload: false },
      ),
    ],
  };
};
