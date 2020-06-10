const { runLocal } = require('chisel-shared-utils');
const crypto = require('crypto');

const wp = (args, opts) => runLocal(['chisel-scripts', 'wp', ...args], opts);

module.exports = (api) => {
  api.schedule(api.PRIORITIES.ASK, async () => {
    // await api.creator.loadCreator('wp-plugins');

    const tablePrefix =
      crypto
        .randomBytes(32)
        .toString('base64')
        .replace(/[+/=]/g, '')
        .substr(0, 8)
        .toLowerCase() + '_';

    api.creator.data.wp = {
      tablePrefix,
    };
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy(); // template directory

    const { tablePrefix } = api.creator.data.wp;
    await api.modifyFile('wp/wp-config.php', (body) =>
      body
        .replace('wp_', tablePrefix)
        .replace(/put your unique phrase here/g, () =>
          crypto.randomBytes(30).toString('base64')
        )
    );

    const wpDist = require(api.resolve('chisel.config.js')).output.base;
    await api.copy({ from: 'chisel-starter-theme', to: `${wpDist}/..` });
  });

  api.schedule(api.PRIORITIES.WP_DOWNLOAD, async () => {
    await wp(['core', 'download', '--skip-content']);
  });

  api.schedule(api.PRIORITIES.WP_CONFIG, async () => {
    await runLocal(['chisel-scripts', 'wp-config']);
  });

  api.schedule(api.PRIORITIES.WP_INSTALL, async () => {
    // await wp([
    //   'core',
    //   'install',
    //   {
    //     url: this.prompts.url,
    //     title: this.prompts.title,
    //     admin_user: this.prompts.adminUser,
    //     admin_password: this.prompts.adminPassword,
    //     admin_email: this.prompts.adminEmail,
    //   },
    // ]);
  });

  // api.schedule(api.PRIORITIES.WP_INSTALL_PLUGINS, async () => {
  //   await wp([
  //     'plugin',
  //     'install',
  //     'timber-library',
  //     'disable-emojis',
  //     { activate: true },
  //   ]);
  // });

  api.schedule(api.PRIORITIES.WP_THEME_ACTIVATE, async () => {
    // await wp(['theme', 'activate', this.configuration.themeFolder])
  });

  // api.schedule(api.PRIORITIES., async () => {

  // });
};
