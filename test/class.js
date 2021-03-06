'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/class.html')
);

var context = {
  foo: {
    class: 'foo'
  },
  items: [
    'list item 1',
    'list item 2',
    'list item 3'
  ],
  rows: [
    {cell1: 'r1c1', cell2: 'r1c2'},
    {cell1: 'r2c1', cell2: 'r2c2'}
  ]
};

exports = module.exports = render(context);