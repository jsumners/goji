'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/if.html')
);

exports = module.exports = render({foo: 'bar'});