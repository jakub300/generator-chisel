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

const templates = require('./build/templates');

const environment = process.env.NODE_ENV;

if (environment !== 'production' && environment !== 'development') {
  console.error('Environment must me set to either development or production');
  process.exit(1);
}

const isDevelopment = environment === 'development';
const resolve = p => path.resolve(__dirname, p);
const config = require('./package.json').chisel;
// const generatorConfig = require('./.yo-rc.json')['generator-chisel'].config;
// const helpers = require('./gulp/helpers')(gulp, plugins, config);

// try {
//   // eslint-disable-next-line global-require, import/no-unresolved
//   const generatorConfigLocal = require('./.yo-rc-local.json')[
//     'generator-chisel'
//   ].config;
//   _.merge(generatorConfig, generatorConfigLocal);
// } catch (e) {
//   // Do nothing
// }

function findEntries() {
  const files = glob.sync(path.join(config.src.base, config.src.scriptsMain));
  const entries = {};
  files.forEach(file => {
    const noSrc = path.relative(config.src.base, file);
    const name = path.basename(file, path.extname(file));
    entries[name] = `./${noSrc}`;
  });

  return entries;
}

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  watch: isDevelopment,
  context: resolve(config.src.base),
  entry: findEntries(),
  output: {
    filename: path.join(config.dest.scripts, '[name].[contenthash:10].js'),
    chunkFilename: path.join(
      config.dest.scripts,
      '[name].[chunkhash].chunk.js',
    ),
    path: resolve(config.dest.base),
    publicPath: '../',
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
        test: /\.(png|jpe?g|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[path][name].[hash:10].[ext]' },
          },
        ],
      },
    ],
  },
  plugins: [
    ...templates({ config }),
    new webpack.HashedModuleIdsPlugin(),
    new MiniCssExtractPlugin({
      filename: path.join(
        config.dest.styles,
        '[name].[contenthash:10].min.css',
      ),
    }),
    new CopyWebpackPlugin(
      [{ from: config.src.assets, to: '[path][name].[hash:10].[ext]' }],
      {},
    ),
    new ManifestPlugin({
      fileName: config.dest.revManifest,
      map(obj) {
        // console.log(obj.chunk.entryModule.rootModule.resource);
        if (obj.path.indexOf('../') === 0) {
          // eslint-disable-next-line no-param-reassign
          obj.path = obj.path.substr(3);
        }

        if (obj.isInitial) {
          // eslint-disable-next-line no-param-reassign
          obj.name = path.join(path.dirname(obj.path), obj.name);
        }

        return obj;
      },
    }),
    new UnminifiedWebpackPlugin({ postfix: 'full' }),
    new OptimizeCssAssetsPlugin({ assetNameRegExp: /\.min\.css$/ }),
  ],
};
