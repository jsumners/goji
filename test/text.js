'use strict';

var fs = require('fs');

var Compiler = require('../lib/Compiler'),
    compiler = new Compiler({templatesDir: __dirname + '/html'});

var render = compiler.compile(
  fs.readFileSync('./html/text.html')
);

var context = {
  foo: {
    bar: 'value of foo.bar'
  },
  foobar: function foobar() {
    return 'result of foobar()';
  },
  answer: 42
};

console.log( render(context) );