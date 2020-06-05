// TODO: allow easy inclusion of selected node modules
// cache loader?

module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    // prettier-ignore
    webpackConfig.module.rule('js').test(/\.m?jsx?$/).exclude.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
  });
};
