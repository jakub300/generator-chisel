module.exports = (api, options) => {
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
};
