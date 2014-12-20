'use strict';

var Goji = require('../goji');
var goji = new Goji({
  templatesDir: __dirname + '/html'
});

var context = {
  foo: {
    bar: 'value of foo.bar'
  },
  foobar: function foobar() {
    return 'result of foobar()';
  },
  answer: 42
};

var template = goji.loadTemplateNamed('text');
var render = goji.compile(template);
console.log( render(context) );