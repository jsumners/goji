'use strict';

var Compiler = require('../lib/Compiler');
var compiler = new Compiler({templatesDir: __dirname + '/html'});

var newLine = String.fromCharCode(10);

// Load template based on name instead of manually doing it
var time1 = new Date();
var template = compiler.loadTemplateNamed('include');
var render = compiler.compile(template);
var time2 = new Date();
console.log( render() + newLine );
console.log(
  'Took %d milliseconds' + newLine,
  time2.getMilliseconds() - time1.getMilliseconds()
);

// Step through to verify the cache is hit
time1 = new Date();
template = compiler.loadTemplateNamed('include');
render = compiler.compile(template);
time2 = new Date();
console.log( render() +  newLine);
console.log(
  'Lookup took %d milliseconds' + newLine,
  time2.getMilliseconds() - time1.getMilliseconds()
);