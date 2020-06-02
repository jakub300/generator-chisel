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
        path
          .join(baseDir, projectOptions.source.styles, '*.scss')
          .replace(/\\/g, '/'),
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

    const outScriptsDir = projectOptions.output.scripts;
    webpackConfig.output
      .path(api.resolve(projectOptions.output.base))
      .filename(`[name]${isProd ? '.[contenthash:8]' : ''}.js`)
      .chunkFilename(`${outScriptsDir}/[id].js`);

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

    webpackConfig
      .plugin('case-sensitive-paths')
      .use(require('case-sensitive-paths-webpack-plugin'));

    webpackConfig
      .plugin('chisel-dynamic-public-path')
      .use(require('../webpack-plugins/DynamicPublicPath'));

    if (isProd) {
      // keep chunk ids stable so async chunks have consistent hash (#1916)
      webpackConfig
        .plugin('named-chunks')
        .use(require('webpack/lib/NamedChunksPlugin'), [
          (chunk) => {
            if (chunk.name) {
              return chunk.name;
            }

            const hash = require('hash-sum');
            const joinedHash = hash(
              Array.from(chunk.modulesIterable, (m) => m.id).join('_')
            );
            return `chunk-` + joinedHash;
          },
        ]);

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
        .use(require('webpack/lib/HashedModuleIdsPlugin'), [
          { hashDigest: 'hex' },
        ]);
    }
  });
};
