#!/usr/bin/env node

// modules
const { argv } = require('optimist');
const cli = require('../lib/cli');

// init cli
cli(argv);
