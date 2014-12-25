'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/attr.html')
);

var context = {
  baz: {
    id: 'baz',
    foo: 'bazfoo'
  }
};

exports = module.exports = render(context);