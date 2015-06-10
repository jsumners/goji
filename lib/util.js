'use strict';

/**
 * Returns the first directory where a node_modules directory exists.
 */
function basePath() {
  const fs = require('fs');
  const path = require('path');
  let _path = path.dirname(process.mainModule.filename);

  if (_path.indexOf('node_modules/goji') !== -1) {
    while (!fs.existsSync(_path + '/node_modules') || _path.substr(-4) === 'goji') {
      _path = path.resolve(_path + '/..');
    }
  } else {
    while (!fs.existsSync(_path + '/node_modules')) {
      _path = path.resolve(_path + '/..');
    }
  }

  return _path;
}

/**
 * Update the properties of object `a` with matching properties from
 * object `b`. Any other properties of `b` are ignored.
 *
 * The passed in `a` object <strong>will be mutated</strong> if `b` has
 * matching properties.
 *
 * @param a The object to be updated.
 * @param b The object with the new values.
 */
function updateProperties(a, b) {
  if (!b) {
    return;
  }

  Object.keys(b).forEach(function keyIterator(key) {
    if (a.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  });
}

module.exports.basePath = basePath;
module.exports.updateProperties = updateProperties;