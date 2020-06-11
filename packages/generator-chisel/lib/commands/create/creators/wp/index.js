const { runLocal } = require('chisel-shared-utils');
const crypto = require('crypto');
const execa = require('execa');

const wp = (args, opts) => runLocal(['chisel-scripts', 'wp', ...args], opts);

const gitConfig = (field) =>
  execa('git', ['config', field], { timeout: 2000 }).catch(() => ({}));

module.exports = (api) => {
  api.schedule(api.PRIORITIES.ASK, async () => {
    // await api.creator.loadCreator('wp-plugins');

    const userName = gitConfig('user.name');
    const userEmail = gitConfig('user.email');

    await api.prompt([
      {
        name: 'title',
        message: 'Enter title for the new site:',
        default: api.creator.data.app.name,
      },
      {
        name: 'url',
        message: 'Enter URL:',
        default: 'http://' + api.creator.data.app.nameSlug + '.test/',
      },
      {
        name: 'adminUser',
        message: 'Enter admin user:',
        default: async () => {
          const nameParts = ((await userName).stdout || '').trim().split(' ');
          if (!nameParts[0]) return undefined;
          return (
            nameParts[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000)
          );
        },
      },
      {
        name: 'adminPassword',
        message: 'Enter admin password:',
        type: 'password',
        validate: (str) => str.length > 0,
      },
      {
        name: 'adminEmail',
        message: 'Enter admin email:',
        validate: (str) => /.+@.+/.test(str),
        default: async () => {
          const email = ((await userEmail).stdout || '').trim();
          return /.+@.+/.test(email) ? email : undefined;
        },
      },
      // {
      //   type: 'list',
      //   name: 'srcPlacement',
      //   message: "Where do you want to place the 'src' folder:",
      //   choices: [
      //     {
      //       name: 'Project root folder',
      //       value: 'root',
      //     },
      //     {
      //       name: 'WordPress theme folder',
      //       value: 'theme',
      //     },
      //   ],
      // },
    ]);

    api.creator.data.wp.tablePrefix =
      crypto
        .randomBytes(32)
        .toString('base64')
        .replace(/[+/=]/g, '')
        .substr(0, 8)
        .toLowerCase() + '_';
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
    if (api.creator.cmd.skipWpDownload) return;

    await wp(['core', 'download', '--skip-content']);
  });

  api.schedule(api.PRIORITIES.WP_CONFIG, async () => {
    if (api.creator.cmd.skipWpConfig) return;

    await runLocal(['chisel-scripts', 'wp-config']);
  });

  api.schedule(api.PRIORITIES.WP_INSTALL, async () => {
    if (api.creator.cmd.skipWpInstall) return;

    const { wp: wpData } = api.creator.data;

    await wp([
      'core',
      'install',
      {
        url: wpData.url,
        title: wpData.title,
        admin_user: wpData.adminUser,
        admin_password: wpData.adminPassword,
        admin_email: wpData.adminEmail,
      },
    ]);

    delete wpData.adminPassword;
  });

  api.schedule(api.PRIORITIES.WP_INSTALL_PLUGINS, async () => {
    await wp([
      'plugin',
      'install',
      'timber-library',
      'disable-emojis',
      { activate: true },
    ]);
  });

  api.schedule(api.PRIORITIES.WP_THEME_ACTIVATE, async () => {
    const themeName = require(api.resolve('chisel.config.js')).wp.themeName;
    await wp(['theme', 'activate', themeName]);
  });

  // api.schedule(api.PRIORITIES., async () => {

  // });
};
