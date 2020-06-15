console.log = console.error.bind(console);

const config = require('../webpack.config');
const { toString } = require('webpack-chain');

config.then((cfg) => {
  cfg.plugins = []; // problems with serialization
  process.stdout.write(toString(cfg, { verbose: true }));
});
