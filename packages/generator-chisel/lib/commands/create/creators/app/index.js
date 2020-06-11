const path = require('path');
const { startCase } = require('lodash');
const execa = require('execa');
const speakingUrl = require('speakingurl');
const { installDependencies } = require('chisel-shared-utils');

module.exports = async (api) => {
  // await
  api.schedule(api.PRIORITIES.ASK, async () => {
    // TODO: project exisits

    const userName = execa('git', ['config', 'user.name'], {
      timeout: 2000,
    }).catch(() => ({}));

    const app = await api.prompt([
      {
        name: 'name',
        message: 'Please enter the project name:',
        default: () => startCase(path.basename(process.cwd())),
        validate: (val) => Boolean(val),
      },
      {
        name: 'author',
        message: 'Please enter author name:',
        default: async () => (await userName).stdout,
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'Please select project type:',
        choices: [
          {
            name: 'WordPress Website',
            value: 'wp-with-fe',
          },
          {
            name: 'Front-end Templates (not supported)',
            value: 'fe',
            disabled: true,
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'browsers',
        message: 'Which browsers are you supporting?',
        choices: [
          {
            name: 'Modern (3 recent versions of popular browsers)',
            short: 'Modern',
            value: 'modern',
            checked: true,
          },
          {
            name: 'Edge 18 (last Edge version before engine change)',
            short: 'Edge 18',
            value: 'edge18',
            checked: true,
          },
          {
            name: 'Internet Explorer 11',
            value: 'ie11',
          },
        ],
      },
    ]);

    const { projectType } = app;

    app.nameSlug = speakingUrl(app.name)
      .replace(/(?<=[^\d])-(\d+)/g, (_, d) => d)
      .replace(/[^a-z0-9-]/g, '-');
    // app.nameCamel = camelCase(app.nameSlug);
    app.hasJQuery = false;

    if (projectType == 'wp-with-fe') {
      await api.creator.loadCreator('wp');
    }
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy();
  });

  api.schedule(api.PRIORITIES.INSTALL_DEPENDENCIES, () => {
    return installDependencies();
  });
};
