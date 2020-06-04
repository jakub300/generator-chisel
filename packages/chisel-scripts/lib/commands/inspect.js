module.exports = (api) => {
  api.registerCommand('inspect', {}, async () => {
    const { toString } = require('webpack-chain')

    console.log(toString(await api.service.resolveWebpackConfig()));
  });
};
