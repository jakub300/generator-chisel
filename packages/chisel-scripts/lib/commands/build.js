module.exports = (api, options) => {
  api.registerCommand('build', {}, async () => {
    const webpack = require('webpack');

    return new Promise(async (resolve, reject) => {
      //

      const config = await api.service.resolveWebpackConfig();

      webpack(config, (err, stats) => {
        if (err) {
          return reject(err);
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.log(stats.toString({ colors: true })); // TODO: detect
          return reject(`Build failed with errors.`);
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }

        console.log('DONE');
        console.log(stats.toString({ colors: true })); // TODO: detect

        resolve();
      });
    });
  });
};
