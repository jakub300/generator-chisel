module.exports = (api, options) => {
  api.registerCommand('dev', {}, async () => {
    api.chainWebpack((webpackConfig) => {
      webpackConfig
        .plugin('hot-module-replacement')
        .use(require('webpack/lib/HotModuleReplacementPlugin'));

      const hotPath = require.resolve('webpack-hot-middleware/client');
      const hotWithQuery = `${hotPath}?reload=true`;

      Object.values(webpackConfig.entryPoints.entries()).forEach((entry) => {
        entry.prepend(hotWithQuery);
      });
    });

    const browserSync = require('browser-sync');
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    process.env.NODE_ENV = 'development';

    const config = await api.service.resolveWebpackConfig();
    const compiler = webpack(config);
    const bs = browserSync.create();

    const browserSyncConfig = {
      proxy: {
        target: options.wp.url,
        reqHeaders: {
          'x-chisel-proxy': '1',
        },
      },
      ghostMode: false,
      online: true,
      middleware: [
        webpackDevMiddleware(compiler, {
          publicPath: `/wp-content/themes/${options.wp.themeName}/dist`,
          stats: 'errors-warnings',
        }),
        webpackHotMiddleware(compiler, { log: false }),
      ],
    };

    bs.init(browserSyncConfig);
  });
};
