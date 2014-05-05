#!/usr/bin/env node

// modules
var cli = require('../lib/cli');
var argv = require('optimist').argv;

// init cli
cli(argv);