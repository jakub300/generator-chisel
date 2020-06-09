const { runLocalCommand } = require('../../../../utils/package-manager');

const wp = (args, opts) =>
  runLocalCommand(['chisel-scripts', 'wp', ...args], opts);

module.exports = (api) => {
  api.schedule(api.PRIORITIES.ASK, async () => {
    // await api.creator.loadCreator('wp-plugins');
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy(); // template directory
    const wpDist = require(api.resolve('chisel.config.js')).output.base;
    await api.copy({ from: 'chisel-starter-theme', to: `${wpDist}/..` });
  });

  api.schedule(api.PRIORITIES.WP_DOWNLOAD, async () => {
    await wp(['core', 'download', '--skip-content']);
  });
};
