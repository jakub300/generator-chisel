module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const path = require('path');
    const isProd = process.env.NODE_ENV === 'production';
    const outDir = api.service.projectOptions.output.assets;

    webpackConfig.plugin('wordpress-copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.join(
              api.service.projectOptions.source.base,
              api.service.projectOptions.source.assets
            ),
            to: `${outDir}/[path][name].[contenthash:8].[ext]`,
          },
        ],
      },
    ]);

    webpackConfig
      .plugin('wordpress-manifest')
      .use(require('webpack-manifest-plugin'), [
        {
          fileName: `manifest${!isProd ? '-dev' : ''}.json`,
          writeToFileEmit: !isProd,
          map(obj) {
            if (obj.isAsset && obj.name.startsWith(`${outDir}/`)) {
              obj.name = obj.name.replace(/\.[\da-f]{8}\.(?=[^\.]*$)/, '.');
            }

            return obj;
          },
        },
      ]);
  });

  api.registerCommand('dev', {}, async () => {
    // api.chainWebpack((webpackConfig) => {
    //   //
    // });

    const browserSync = require('browser-sync');
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');

    process.env.NODE_ENV = 'development';

    const config = await api.service.resolveWebpackConfig();
    const compiler = webpack(config);
    const bs = browserSync.create();

    const browserSyncConfig = {
      proxy: {
        target: `xfive-co.test`,
        reqHeaders: {
          'x-chisel-proxy': '1',
        },
      },
      ghostMode: false,
      online: true,
      middleware: [
        webpackDevMiddleware(compiler, {
          publicPath: '/wp-content/themes/xfive-co-chisel/dist/',
          stats: 'errors-warnings',
        }),
      ],
    };

    bs.init(browserSyncConfig);
  });

  api.registerCommand('wp', {}, async () => {
    const execa = require('execa');
    const path = require('path');

    const args = process.argv.slice(3);
    const wpCliPath = path.resolve(__dirname, 'wp-cli.phar');

    try {
      const wp = await execa('php', [wpCliPath, ...args], { stdio: 'inherit' });
      process.exit(wp.exitCode);
    } catch (e) {
      process.exit(e.exitCode);
    }
  });
};
