module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const path = require('path');
    const isProd = process.env.NODE_ENV === 'production';
    const outDir = api.service.projectOptions.output.assets;

    webpackConfig.plugin('wordpress-copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.join(api.service.projectOptions.source.base, api.service.projectOptions.source.assets),
            to: `${outDir}/[path][name].[contenthash:8].[ext]`,
          },
        ],
      },
    ]);

    webpackConfig
      .plugin('wordpress-manifest')
      .use(require('webpack-manifest-plugin'), [
        {
          // fileName: config.dest.revManifest,
          // seed: {},
          map(obj) {
            if (obj.isAsset && obj.name.startsWith(`${outDir}/`)) {
              obj.name = obj.name.replace(/\.[\da-f]{8}\.(?=[^\.]*$)/, '.');
            }

            return obj;
          },
        },
      ]);
  });
};
