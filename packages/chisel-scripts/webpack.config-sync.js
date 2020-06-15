// eslint-plugin-import requires config to be returned synchronously
// This is absolutely awful way to do that

const execa = require('execa');

const { stdout, stderr } = execa.sync(process.execPath, [
  ...process.execArgv,
  require.resolve('./lib//generate-and-serialize-config.js'),
]);

process.stderr.write(stderr);

const cfg = eval(`(${stdout})`);

module.exports = cfg;
