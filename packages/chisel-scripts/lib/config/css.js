// TODO: sourcemap

module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const isProd = process.env.NODE_ENV === 'production';

    // prettier-ignore
    webpackConfig.module.rule('scss').test(/\.scss$/)
      .use('extract-css-loader')
        .loader(require('mini-css-extract-plugin').loader)
        .options({
          hmr: !isProd,
          // publicPath: cssPublicPath
        })
        .end()
      .use('css-loader')
        .loader(require.resolve('css-loader'))
        // .options(cssLoaderOptions)
        .end()
      .use('sass-loader')
        .loader(require.resolve('sass-loader'))
        // .options(Object.assign({ sourceMap }, options))
        .end()

    //prettier-ignore
    webpackConfig
      .plugin('extract-css')
        .use(require('mini-css-extract-plugin'), [{
          filename:  `[name]${isProd ? '.[contenthash:8]' : ''}.css`,
        }])
        .end()
      .plugin('style-only-entries')
        .use(require('webpack-fix-style-only-entries'), [])
  });
};
