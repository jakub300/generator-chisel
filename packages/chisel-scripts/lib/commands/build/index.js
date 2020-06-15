// TODO: no minify?
// TODO: report

module.exports = (api, options) => {
  api.registerCommand(
    'build',
    (command) =>
      command
        .description('build for production')
        .option(
          '--no-clean',
          'do not remove the dist directory before building the project'
        )
        .option('--watch', 'watch for changes'),
    async (cmd) => {
      const path = require('path');
      const webpack = require('webpack');
      const chalk = require('chalk');
      const fs = require('fs-extra');
      const formatStats = require('./formatStats');

      process.env.NODE_ENV = 'production';

      if (cmd.clean) {
        await fs.remove(api.resolve(options.output.base));
      }

      return new Promise(async (resolve, reject) => {
        //

        const config = await api.service.resolveWebpackConfig();
        const targetDir = api.resolve(options.output.base);
        config.watch = Boolean(cmd.watch);

        webpack(config, (err, stats) => {
          if (err) {
            return reject(err);
          }

          const info = stats.toJson();

          if (stats.hasErrors()) {
            console.log(
              stats.toString({ colors: chalk.supportsColor.hasBasic })
            );
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
    }
  );
};
