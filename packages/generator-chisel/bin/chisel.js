#!/usr/bin/env node

const program = require('commander');

const handlePromise = promise => promise.catch((err) => {
  console.error(err);
  process.exit(1);
});

program
  .command('create')
  .description('create a new project powered by Chisel')
  .action((...args) => {
    handlePromise(require('../lib/commands/create')(...args));
  });

(async () => {
  // TODO: check updates

  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
})();
