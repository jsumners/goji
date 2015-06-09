'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/html.html')
);

var context = {
  foo: {
    bar: 'value <em>of</em> foo.bar'
  },
  rows: [
    {text: '<em>row1</em>'},
    {text: '<strong>row2</strong>'}
  ]
};

exports = module.exports = render(context);