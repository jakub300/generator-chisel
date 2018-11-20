'use strict';

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const sassGlobImporter = require('node-sass-glob-importer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const templates = require('./build/templates');
const Reloader = require('./build/Reloader');
const CssWithoutJs = require('./build/CssWithoutJs');
const DynamicPublicPath = require('./build/DynamicPublicPath');

function findEntries() {
  const filesStyles = glob.sync(
    path.join(config.src.base, config.src.stylesMain),
  );
  const filesScripts = glob.sync(
    path.join(config.src.base, config.src.scriptsMain),
  );
  const entries = {};

  filesStyles.forEach(file => {
    const noSrc = path.relative(config.src.base, file);
    const name = path.basename(file, path.extname(file));
    entries[`${config.dest.styles}/${name}`] = [`./${noSrc}`];
  });

  filesScripts.forEach(file => {
    const noSrc = path.relative(config.src.base, file);
    const name = path.basename(file, path.extname(file));
    entries[name] = `./${noSrc}`;
  });

  return entries;
}

module.exports =function baseConfig({}) {
  return {
    mode: isDevelopment ? 'development' : 'production',
    watch: isDevelopment,
    context: resolve(config.src.base),
    entry: findEntries(),
    output: {
      filename: path.join(
        config.dest.scripts,
        isDevelopment ? '[name].js' : '[name].[contenthash:10].js',
      ),
      chunkFilename: path.join(
        config.dest.scripts,
        '[name].[chunkhash].chunk.js',
      ),
      path: resolve(
        isWordPress
          ? path.join(
              config.dest.wordpress,
              'wp-content/themes',
              config.dest.wordpressTheme,
              config.dest.base,
            )
          : config.dest.base,
      ),
      publicPath: '/dist/',
    },
    resolve: {
      alias: {
        '~': resolve(config.src.base),
      },
    },
    externals: {},
    devtool: 'source-map',
    // stats: { colors: true, modules: false },
    node: false,
    module: {
      rules: [
        { test: /\.twig$/, loader: templates.loader },
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { minimize: true } },
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                importer: sassGlobImporter(),
                outputStyle: 'expanded',
                includePaths: ['node_modules'],
              },
            },
          ],
        },
        {
          // test: /\.(png|jpe?g|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
          include: resolve('src/assets'),
          use: [
            {
              loader: 'file-loader',
              options: { name: '[path][name].H[hash:10]H.[ext]' },
            },
          ],
        },
      ],
    },
    plugins: [
      ...(isDevelopment ? [] : [new webpack.HashedModuleIdsPlugin()]),
      new MiniCssExtractPlugin({
        filename: isDevelopment
          ? '[name].css'
          : '[name].[contenthash:10].min.css',
      }),
      new CopyWebpackPlugin(
        [{ from: config.src.assets, to: '[path][name].H[hash:10]H.[ext]' }],
        {},
      ),
      new ManifestPlugin({
        fileName: config.dest.revManifest,
        seed: {},
        map(obj) {
          // console.log(obj.chunk.entryModule.rootModule.resource);
          if (obj.path.startsWith('/dist/')) {
            // eslint-disable-next-line no-param-reassign
            obj.path = obj.path.substr(6);
          }

          if (obj.name.startsWith('assets/')) {
            // eslint-disable-next-line no-param-reassign
            obj.name = obj.name.replace(/\.H[\da-f]+H\./, '.');
          }

          if (obj.isInitial) {
            // eslint-disable-next-line no-param-reassign
            obj.name = path.join(
              path.dirname(obj.path),
              `${path.basename(obj.name)}`,
            );
          }

          return obj;
        },
      }),
      new UnminifiedWebpackPlugin({ postfix: 'full' }),
      new OptimizeCssAssetsPlugin({ assetNameRegExp: /\.min\.css$/ }),
      ...templates({ config }),
      new BrowserSyncPlugin(
        {
          ...(isWordPress
            ? {
                proxy: {
                  target:
                    generatorConfig.proxyTarget ||
                    `${generatorConfig.nameSlug}.test`,
                  reqHeaders: {
                    'x-chisel-proxy': '1',
                  },
                },
              }
            : { server: './' }),

          ghostMode: false,
          online: true,
          open: false,
        },
        { reload: false },
      ),
      new Reloader(),
      new CssWithoutJs(),
      new DynamicPublicPath(),
    ],
  };
}
