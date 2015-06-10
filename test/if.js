'use strict';

const fs = require('fs');

const Compiler = require('../lib/Compiler');
const compiler = new Compiler({templatesDir: __dirname + '/html'});

const render = compiler.compile(
  fs.readFileSync('./html/if.html')
);

const doc = render({foo: 'bar'});
console.log(doc);