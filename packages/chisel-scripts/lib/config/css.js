const path = require('path');
const isGlob = require('is-glob');

module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const globby = require('globby');
    const path = require('path');

    const isProd = process.env.NODE_ENV === 'production';
    const { projectOptions } = api.service;
    const { productionSourceMap } = api.service;

    const sourceMap = Boolean(
      !isProd ||
        (isProd &&
          projectOptions.productionSourceMap !== false &&
          productionSourceMap)
    );

    const sassLoaderOptions = {
      sourceMap,
      sassOptions: {
        indentedSyntax: false,
        includePaths: [api.resolve('node_modules')], // TODO: don't use?
        importer(url, prev, done) {
          (async () => {
            if (isGlob(url)) {
              const files = (
                await globby(url, { cwd: path.dirname(prev) })
              ).sort();
              done({
                contents: files.map((file) => `@import '${file}';`).join('\n'),
              });
            } else {
              done(null);
            }
          })();
        },
      },
    };

    const postCssLoaderOptions = {
      sourceMap,
    };

    const cssLoaderOptions = {
      sourceMap,
      import: false,
    };

    const extractCssLoaderOptions = {
      hmr: !isProd,
      publicPath: path.relative(
        api.resolve(
          path.join(projectOptions.source.base, projectOptions.source.styles)
        ),
        api.resolve(projectOptions.source.base)
      ),
    };

    const assetsDir = api.resolve(
      path.join(projectOptions.source.base, projectOptions.source.assets)
    );

    const createCssLoader = (rule, test) => {
      // prettier-ignore
      return webpackConfig.module.rule(rule).test(test)
        .exclude
          .add(assetsDir)
          .end()
        .use('extract-css-loader')
          .loader(require('mini-css-extract-plugin').loader)
          .options(extractCssLoaderOptions)
          .end()
        .use('css-loader')
          .loader(require.resolve('css-loader'))
          .options(cssLoaderOptions)
          .end()
    };

    createCssLoader('css', /\.css$/);

    // prettier-ignore
    createCssLoader('scss', /\.scss$/)
      .use('sass-loader')
        .loader(require.resolve('sass-loader'))
        .options(sassLoaderOptions)
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
