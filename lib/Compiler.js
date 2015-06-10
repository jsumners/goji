'use strict';

// Note: wherever `that` is defined and used, it's because we can't
// invoke a cheerio method with .call(). Cheerio binds `this` to the element
// that its methods is working on.

const cheerio = require('cheerio');
const exprjs = new (require('exprjs'))();
const util = require('./util');

/**
 * <p>An object literal that has the following properties:</p>
 * <ul>
 *   <li>
 *     <code>cache</code>: Set to <code>true</code> (default) to enable
 *     caching of compiled templates. Set to <code>false</code> to compile
 *     templates every load.
 *   </li>
 *   <li>
 *     <code>cacheTTL</code>: Time, in seconds, to keep templates in the cache.
 *     Default value is 300 (5 minutes).
 *   </li>
 *   <li>
 *     <code>templatesDir</code>: The location where templates are stored.
 *     This should be the full path (use `path.resolve`). If it is not present,
 *     then it will be set to an "html" directory that is in the same
 *     directory as a node_modules directory.
 *   </li>
 *   <li>
 *     <code>partialsDir</code>: The location where partial templates are
 *     stored. This should be the full path (use `path.resolve`). If this
 *     option is not present then it will be set to a sub-directory of the
 *     specified <code>templatesDir</code>. The name of the sub-directory
 *     will be <code>partials</code>.
 *   </li>
 *   <li>
 *     <code>templatesExt</code>: The file extension used on template files.
 *     This defaults to ".html". Note that it should include the leading dot.
 *   </li>
 * </ul>
 * @typedef {object} Compiler~Options
 */

/**
 * Provides methods for parsing, compiling, and rendering templates.
 *
 * @param {Compiler~Options} options
 * @returns {Compiler}
 * @constructor
 */
function Compiler(options) {

  this.options = {
    cache: true,
    cacheTTL: 300,
    templatesDir: '',// path.resolve(basePath() + '/html'),
    partialsDir: '',// path.resolve(basePath() + '/html/partials'),
    templatesExt: '.html'
  };

  this.partials = {};

  /*  if (self.options.cache) {
    self._cache = new NodeCache({
      stdTTL: self.options.cacheTTL,
      checkperiod: 0 // Needs to be 0 to prevent node-cache from
      // causing Goji to hang indefinitely
    });
  }*/
}

Compiler.prototype.compile = function compile(template, options) {
  if (options) {
    util.updateProperties(this.options, options);
  }

  return this._render.bind(this, template);
};

Compiler.prototype._if = function _if($, context, gContext) {
  const $ifBlocks = $('[g-if]');

  if ($ifBlocks.length === 0) {
    return $;
  }

  return $ifBlocks.each(function gIf(i, elem) {
    const $elem = $(elem);
    const expression = exprjs.parse($elem.attr('g-if'));
    const result = exprjs.run(expression, context, gContext);

    $elem.removeAttr('g-if');
    if (result !== true) {
      $elem.remove();
    }
  });
};

Compiler.prototype._partial = function _partial($, context, gContext) {
  const $partials = $('[g-partial]');

  if ($partials.length === 0) {
    console.log('bar');
    return $;
  }

  const that = this;
  $partials.each(function gPartial(i, elem) {
    console.log('foo');
    const $elem = $(elem);
    let expression = $elem.attr('g-partial');
    const partialName = (that.partials[expression]) ? expression : undefined;

    $elem.removeAttr('g-partial');

    if (partialName) {
      // the "expression" was just a string name
      $elem.replaceWith(that.partials[partialName]);
      return;
    }

    expression = exprjs.parse(expression);
    const evaledExpr = exprjs.run(expression, context, gContext);

    if (that.partials[evaledExpr]) {
      $elem.replaceWith(that.partials[evaledExpr]);
    }
  });
};

Compiler.prototype._render = function _render(template, context, gContext) {
  let $ = cheerio.load(template);

  //this._if($, context, gContext);
  this._partial($, context, gContext);

  return $.html();
};

Compiler.prototype.registerPartial = function registerPartial(name, partial) {
  const _partial = (typeof partial === 'function') ? partial() : partial;
  this.partials[name] = (Buffer.isBuffer(_partial)) ?
    _partial.toString() : _partial;
};

module.exports = Compiler;