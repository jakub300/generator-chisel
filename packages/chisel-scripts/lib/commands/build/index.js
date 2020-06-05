// TODO: docs, clear, watch

module.exports = (api, options) => {
  api.registerCommand('build', {}, async () => {
    const path = require('path');
    const webpack = require('webpack');
    const chalk = require('chalk');
    const fs = require('fs-extra');
    const formatStats = require('./formatStats');

    process.env.NODE_ENV = 'production';

    return new Promise(async (resolve, reject) => {
      //

      const config = await api.service.resolveWebpackConfig();
      const targetDir = api.resolve(options.output.base);
      // config.watch = true;

      webpack(config, (err, stats) => {
        if (err) {
          return reject(err);
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.log(stats.toString({ colors: chalk.supportsColor.hasBasic }));
          return reject(`Build failed with errors.`);
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }

        const targetDirShort = path.relative(api.service.context, targetDir);
        const assetsDir = `${options.output.assets}/`;
        console.log();
        console.log(formatStats(stats, targetDirShort, assetsDir, api));

        resolve();
      });
    });
  });
};
