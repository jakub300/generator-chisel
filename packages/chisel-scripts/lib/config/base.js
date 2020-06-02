const globby = require('globby');
const path = require('path');

module.exports = (api, options) => {
  api.chainWebpack(async (webpackConfig) => {
    const isProd = process.env.NODE_ENV === 'production';
    const { projectOptions } = api.service;

    console.log('updating config');

    if (isProd) {
      // prettier-ignore
      webpackConfig
        .mode('production')
        .devtool(projectOptions.productionSourceMap !== false ? 'source-map' : false)
    } else {
      webpackConfig.mode('development');
    }

    const baseDir = api.resolve(projectOptions.source.base);

    webpackConfig.context(api.service.context);

    (
      await globby([
        path
          .join(baseDir, projectOptions.source.scripts, '*.js')
          .replace(/\\/g, '/'),
        path.join(baseDir, projectOptions.source.styles, '*.scss').replace(/\\/g, '/'),
      ])
    )
      .map((p) => path.relative(api.service.context, p))
      .sort()
      .forEach((p) => {
        const ext = path.extname(p);
        const base = path.basename(p, ext);
        const outDir =
          projectOptions.output[ext === '.scss' ? 'styles' : 'scripts'];
        webpackConfig.entry(`${outDir}/${base}`).add(`./${p}`).end();
      });

    const fileName = `[name]${isProd ? '.[contenthash:8]' : ''}.js`;

    webpackConfig.output
      .path(api.resolve(projectOptions.output.base))
      .filename(fileName)
      .chunkFilename(`${projectOptions.output.scripts}/${fileName}`);

    // prettier-ignore
    webpackConfig.resolve
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .end()
    // .alias
    //   .set('@', api.resolve('src'))
    //   .set('~', api.resolve('src'))

    // prettier-ignore
    webpackConfig.resolveLoader
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))

    // prettier-ignore
    webpackConfig
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))
  });
};
