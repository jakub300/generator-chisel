const webpackMerge = require('webpack-merge');

const environment = process.env.NODE_ENV;

if (environment !== 'production' && environment !== 'development') {
  console.error('Environment must me set to either development or production');
  process.exit(1);
}

const isDevelopment = environment === 'development';
const resolve = p => path.resolve(__dirname, p);
const config = require('./package.json').chisel;
const generatorConfig = require('./.yo-rc.json')['generator-chisel'].config;
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

// TODO: WordPress things should be confitional during build time
// eslint-disable-next-line import/order
const isWordPress = require('fs').existsSync(resolve('wp'));
const params = {config, generatorConfig, isDevelopment, resolve};

module.exports = webpackMerge(
  require('./build/base.js')(params),
  require(isWordPress ? './build/wordpress' : './build/static-frontend')(params),
);
