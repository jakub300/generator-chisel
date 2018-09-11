'use strict';

const path = require('path');
const glob = require('glob');
const Twig = require('twig');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const templatesFunctions = require('./templates-functions');

const temporaryData = {
  config: {
    dest: {
      base: path.resolve(__dirname, '../dist'),
      scripts: 'scripts',
      assets: 'assets',
    },
  },
};

function addTwigFunctions() {
  templatesFunctions(temporaryData).forEach(func => {
    // console.log(func.name);
    Twig.extendFunction(func.name, func.func);
  });
}

module.exports = function templates() {
  addTwigFunctions();

  return glob.sync(path.resolve(__dirname, '../src/templates/*.twig')).map(
    file =>
      new HtmlWebpackPlugin({
        filename: `${path.basename(file, path.extname(file))}.html`,
        template: path.relative(path.resolve(__dirname, '../src'), file),
      }),
  );
};

module.exports.loader = require.resolve('./templates-loader');
