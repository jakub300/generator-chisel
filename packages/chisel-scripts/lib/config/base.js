module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    console.log('updating config')
    // prettier-ignore
    webpackConfig
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))
  })
}
