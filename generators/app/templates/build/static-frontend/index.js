'use strict';

const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const templates = require('./templates');

module.exports = function staticFrontendConfig({ config, assetsPath }) {
  return {
    output: {
      path: path.resolve(config.dest.base),
    },
    module: {
      rules: [
        { test: /\.twig$/, exclude: assetsPath, loader: templates.loader },
      ],
    },
    plugins: [
      ...templates({ config }),
      new BrowserSyncPlugin(
        {
          server: './',
          ghostMode: false,
          online: true,
          open: false,
        },
        { reload: false },
      ),
    ],
  };
};
