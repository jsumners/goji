'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/partial.html')
);

var context = {
  partial: {
    name: 'foo'
  }
};

exports = module.exports = render(context);