const path = require('path');
const { startCase } = require('lodash');
const execa = require('execa');
const speakingUrl = require('speakingurl');

module.exports = async (api) => {
  // await
  api.schedule(api.PRIORITIES.ASK, async () => {
    // TODO: project exisits

    const userName = execa('git', ['config', 'user.name'], {
      timeout: 2000,
    }).catch(() => ({}));

    const { app } = await api.prompt([
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
        type: 'list',
        name: 'browsers',
        message: 'Which browsers are you supporting?',
        choices: [
          {
            name: 'Modern (3 recent versions of Chrome, Firefox, Safari)',
            value: 'modern',
          },
          {
            name: 'Modern and Internet Explorer 11',
            value: 'modern-and-ie11',
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
};
