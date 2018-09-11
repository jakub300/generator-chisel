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

function findEntries() {
  const files = glob.sync('./src/scripts/*.js');
  const entries = {};
  files.forEach(file => {
    const noSrc = path.relative('./src', file);
    const name = path.basename(file, path.extname(file));
    entries[name] = `./${noSrc}`;
  });

  return entries;
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: findEntries(),
  output: {
    filename: 'scripts/[name].[contenthash:10].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '../',
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
    ...templates(),
    new webpack.HashedModuleIdsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash:10].min.css',
    }),
    new CopyWebpackPlugin(
      [{ from: 'assets/**/*', to: '[path][name].[hash:10].[ext]' }],
      {},
    ),
    new ManifestPlugin({
      fileName: 'rev-manifest.json',
      map(obj) {
        // console.log(obj.chunk.entryModule.rootModule.resource);
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
