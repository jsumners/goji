'use strict';

var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

var testScripts = grunt.file.expand({
  cwd: './test/'
}, '*.js');

grunt.initConfig({
  shell: {
    doc: {
      command: './node_modules/.bin/jsdoc -c jsdoc.conf .'
    }
  },

  githubPages: {
    target: {
      options: {
        commitMessage: 'Publishing new documentation'
      },
      src: 'doc'
    }
  }
});

grunt.registerTask('doc', ['shell:doc']);
grunt.registerTask('publishdoc', ['githubPages:target']);