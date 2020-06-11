#!/usr/bin/env node

const minimist = require('minimist');
const Service = require('../lib/Service');

const argv = minimist(process.argv.slice(2));
const command = argv._[0];
const service = new Service();

service.run(command, argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
