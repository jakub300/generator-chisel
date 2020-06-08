#!/usr/bin/env node

const program = require('commander');

program
  .command('create')
  .description('create a new project powered by Chisel')
  .action((...args) => {
    require('../lib/commands/create')(...args);
  });

(async () => {
  // TODO: check updates

  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
})();
