module.exports = (api) => {
  api.registerCommand('inspect', {}, async () => {
    const { toString } = require('webpack-chain');
    const { highlight } = require('cli-highlight');

    const config = await api.service.resolveWebpackConfig();

    console.log(highlight(toString(config), { language: 'js' }));
  });
};
