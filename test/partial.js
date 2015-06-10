'use strict';

const fs = require('fs');

const Compiler = require('../lib/Compiler');
const compiler = new Compiler();

const template = fs.readFileSync('./html/partial.html');
const fooPartial = fs.readFileSync('./html/partials/foo.html');
const parentPartial = '<div g-partial="bar">child partial</div>';

compiler.registerPartial('foo', fooPartial);
compiler.registerPartial('bar', '<section>bar</section>');
compiler.registerPartial('parentPartial', parentPartial);

const context = {
  partial: {
    name: 'foo'
  }
};
const doc = compiler.compile(template)(context);
console.log(doc);