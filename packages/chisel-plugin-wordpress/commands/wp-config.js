module.exports = (api, options) => {
  api.registerCommand('wp-config', async () => {
    const { runLocal, copy } = require('chisel-shared-utils');
    const inquirer = require('inquirer');
    const { template } = require('lodash');
    const fs = require('fs-extra');
    const path = require('path');

    const prompts = [
      {
        name: 'databaseHost',
        message: 'Enter the database host:',
        default: '127.0.0.1',
      },
      {
        type: 'number',
        name: 'databasePort',
        message: 'Enter the database port:',
        default: 3306,
      },
      {
        name: 'databaseName',
        message: 'Enter the database name:',
        default: require(api.resolve('package.json')).name,
      },
      {
        name: 'databaseUser',
        message: 'Enter the database user:',
        default: 'root',
      },
      {
        type: 'password',
        name: 'databasePassword',
        message: 'Enter the database password:',
      },
    ];

    const promptAndCreateDB = async () => {
      const answers = await inquirer.prompt(prompts);

      answers.databaseHostPort = `${answers.databaseHost}:${answers.databasePort}`;

      const { url } = options.wp;
      const { tablePrefix } = options.creatorData.wp;

      await copy({
        from: path.join(__dirname, '../template'),
        to: api.resolve(),
        templateData: {
          ...answers,
          documentRoot: api.resolve('wp'),
          serverName: new URL(url).hostname,
          tablePrefix,
        },
      });

      const res = await runLocal(['wp', 'db', 'query', 'SELECT 1'], {
        reject: false,
        silent: true,
      });

      if (res.exitCode !== 0) {
        if (
          res.stderr.includes('ERROR 1049') ||
          res.stderr.includes('Unknown database')
        ) {
          await runLocal(['wp', 'db', 'create']);
        } else {
          console.log(res.stdout);
          console.log(res.stderr);
          throw res;
        }
      } else {
        // exists
        const { useExisting } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useExisting',
            message:
              'Database already exist, do you want to use existing database?',
          },
        ]);

        if (!useExisting) {
          await runLocal(['wp', 'db', 'drop', '--yes']);
          await runLocal(['wp', 'db', 'create']);
        }
      }
    };

    let dbReady = false;
    while (!dbReady) {
      await promptAndCreateDB()
        .then(() => {
          dbReady = true;
        })
        .catch(() => {
          console.log('');
          console.log('Trying again...');
          console.log('');
        });
    }
  });
};
