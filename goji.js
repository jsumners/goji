'use strict';

var Compiler = require('./lib/Compiler');
var compiler = new Compiler();

exports = module.exports = {
  compile: function(template, options) {
    return compiler.compile(template, options);
  }
};