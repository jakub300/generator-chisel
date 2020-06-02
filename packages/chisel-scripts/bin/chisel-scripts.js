#!/usr/bin/env node

// TODO: temporary
process.env.NODE_ENV = 'production';
const minimist = require('minimist');
const Service = require('../lib/Service')

const argv = minimist(process.argv.slice(2));
const command = argv._[0];
const service = new Service();

service.run(command, argv);
