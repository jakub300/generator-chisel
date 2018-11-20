'use strict';

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const sassGlobImporter = require('node-sass-glob-importer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const Reloader = require('./Reloader');
const CssWithoutJs = require('./CssWithoutJs');
const DynamicPublicPath = require('./DynamicPublicPath');

function findEntries(config) {
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

module.exports = function baseConfig({
  isDevelopment,
  resolve,
  config,
  assetsPath,
}) {
  return {
    mode: isDevelopment ? 'development' : 'production',
    watch: isDevelopment,
    context: resolve(config.src.base),
    entry: findEntries(config),
    output: {
      filename: path.join(
        config.dest.scripts,
        isDevelopment ? '[name].js' : '[name].[contenthash:10].js',
      ),
      chunkFilename: path.join(
        config.dest.scripts,
        '[name].[chunkhash].chunk.js',
      ),
      // path set in specific configs
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
        {
          test: /\.js$/,
          exclude: [/node_modules/, assetsPath],
          loader: 'babel-loader',
        },
        {
          test: /\.scss$/,
          exclude: assetsPath,
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
          include: assetsPath,
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
      new UnminifiedWebpackPlugin({ postfix: 'full' }),
      new OptimizeCssAssetsPlugin({ assetNameRegExp: /\.min\.css$/ }),
      new Reloader(),
      new CssWithoutJs(),
      new DynamicPublicPath(),
    ],
  };
};
