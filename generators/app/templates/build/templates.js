'use strict';

const path = require('path');
const glob = require('glob');
const Twig = require('twig');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const templatesFunctions = require('./templates-functions');
const InjectRevisioned = require('./InjectRevisioned');

function addTwigFunctions(config) {
  templatesFunctions({ config }).forEach(func => {
    // console.log(func.name);
    Twig.extendFunction(func.name, func.func);
  });
}

module.exports = function templates({ config }) {
  addTwigFunctions(config);

  const htmlPlugins = glob
    .sync(path.resolve(__dirname, '../src/templates/*.twig'))
    .map(
      file =>
        new HtmlWebpackPlugin({
          filename: `${path.basename(file, path.extname(file))}.html`,
          template: path.relative(path.resolve(__dirname, '../src'), file),
          inject: false,
        }),
    );

    return [
      ...htmlPlugins,
      ...(htmlPlugins.length ? [new InjectRevisioned()] : []),
    ];
};

module.exports.loader = require.resolve('./templates-loader');
