'use strict';

var cheerio = require('cheerio');
var exprjs = new (require('exprjs'))();
var fs = require('fs');
var path = require('path');

/**
 * Returns the first directory where a node_modules directory exists.
 */
function basePath() {
  var _path = __dirname;

  while (!fs.existsSync(_path + '/node_modules') || _path.substr(-4) === 'goji') {
    _path = path.resolve(_path + '/..');
  }

  return _path;
}

function extendObj(a, b) {
  Object.keys(b).forEach(function keyIterator(val) {
    if (a.hasOwnProperty(val)) {
      a[val] = b[val];
    }
  });
}

function loadTemplateNamed(name) {
  // TODO: cache these?
  return fs.readFileSync(path.resolve(name)).toString();
}

/**
 * Provides methods for parsing, compiling, and rendering templates.
 *
 * @param options
 * @returns {Compiler}
 * @constructor
 */
function Compiler(options) {
  if (! (this instanceof Compiler)) {
    return new Compiler();
  }

  if (options) {
    var self = Object.getPrototypeOf(this);
    extendObj(self.options, options);
  }
}

Compiler.prototype = {
  options: {
    templatesDir: path.resolve(basePath() + '/html'),
    templatesExt: '.html'
  }
};

/**
 * This method is used to parse a given <code>template</code> for included
 * blocks from other templates. An include does not replace the element on
 * which the <code>g-include</code> attribute is present. The include takes
 * the content of the denoted template and inserts it as the content of
 * <code>g-include</code> element.
 *
 * @param template A template to parse for elements with <code>g-include</code>
 *        attributes
 * @returns {string} The parsed template with includes replaced
 * @private
 */
Compiler.prototype._include = function _include(template) {
  var $ = cheerio.load(template);

  this._ir($, 'g-include', function($elem, $newContent) {
    $elem.html($newContent.html());
    $elem.attr('g-include', null);
  });

  return $.html();
};

/**
 * This method is used to parse a given <code>template</code> for replaced
 * blocks from other templates. A replace fully replaces the element on
 * which the <code>g-replace</code> attribute is present. The replace takes
 * the content of the denoted template and inserts it in the same DOM location
 * of <code>g-replace</code> element.
 *
 * @param template A template to parse for elements with <code>g-replace</code>
 *        attributes
 * @returns {string} The parsed template with includes replaced
 * @private
 */
Compiler.prototype._replace = function _replace(template) {
  var $ = cheerio.load(template);

  this._ir($, 'g-replace', function($elem, $content) {
    $elem.replaceWith($content);
  });

  return $.html();
};

/**
 * Utility method used by {@link Compiler#_include} and
 * {@link Compiler#replace}.
 *
 * @param $ A cheerio object representing a template to work on
 * @param {string} attrName The attribute to look for, 'g-include' or 'g-replace'
 * @param {Function} action A function accepting <code>$elem</code> and <code>$newContent</code>
 * @returns {object} The modified cheerio object
 * @private
 */
Compiler.prototype._ir = function _ir($, attrName, action) {
  var self = this;

  return $('[' + attrName + ']').each(function _irParser(i, elem) {
    var $elem = $(elem);
    var parts = $elem.attr(attrName).split('::').map(function(elem) {
      return elem.trim();
    });

    var child = loadTemplateNamed(
      self.options.templatesDir + '/' + parts[0] + self.options.templatesExt
    );

    var parsedChild = self._parse(child);
    var $newContent = $(parts[1], parsedChild);

    action($elem, $newContent);

    return $elem.html();
  });
};

/**
 * Used to perform all parsing operations necessary to compile a template.
 *
 * @param template The template to parse for compilation
 * @returns {string} The fully parsed (compiled) template
 * @private
 */
Compiler.prototype._parse = function _parse(template) {
  var _template = this._include(template);
  _template = this._replace(_template);
  return _template;
};

/**
 * Used to run through all supported attributes of a compiled template and
 * perform their actions.
 *
 * @param template A template as compiled by {@link Compiler#_parse}
 * @param context The object to use as the context for actions
 * @returns {string} The rendered template
 * @private
 */
Compiler.prototype._render = function _render(template, context) {
  var $ = cheerio.load(template);

  this._text($, context);

  return $.html();
};

/**
 * Looks through a compiled template for <code>g-text</code> attributes and
 * parses them.
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the the template actions
 * @returns {object} The modified cheerio object
 * @private
 */
Compiler.prototype._text = function _text($, context) {
  return $('[g-text]').each(function(i, elem) {
    var $elem = $(elem);
    var expression = $elem.attr('g-text');
    var parsed = exprjs.parse(expression);
    var result = exprjs.run(parsed, context);

    $elem.text(result);
    $elem.attr('g-text', null);
    return $elem;
  });
};

/**
 * Returned from the {@link Compiler#compile} method when a template has been
 * compiled. This function allows you to render the compiled template
 * with substitued values.
 *
 * @typedef {Function} Compiler~RenderFunction
 * @param {object} context An object of values that will be substituted in
 *        the rendered template
 * @param {object} options Not used (yet)
 */

/**
 * <p>An object literal that has the following properties:</p>
 * <ul>
 *   <li>
 *     <code>templatesDir</code>: The location where templates are stored.
 *     This should be the full path (use `path.resolve`). If it is not present,
 *     then it will be set to an "html" directory that is in the same
 *     directory as a node_modules directory.
 *   </li>
 *   <li>
 *     <code>templatesExt</code>: The file extension used on template files.
 *     This defaults to ".html". Note that it should include the leading dot.
 *   </li>
 * </ul>
 * @typedef {object} Compiler~Options
 */

/**
 * Parses a given <code>template</code> for <code>g-include</code> and
 * <code>g-replace</code> blocks. Said blocks are dealt with appropriately.
 *
 * @param {string} template The template to compile
 * @param {Compiler~Options} options Options to be used by the compiler
 * @returns {Compiler~RenderFunction} A function to use for rendering the
 *          compiled template
 */
Compiler.prototype.compile = function compile(template, options) {
  var self = this;

  if (options) {
    // TODO: decouple this from the full options so that we are not
    // overwriting global Compiler options every compile
    extendObj(self.options, options);
  }

  var compiledTemplate = self._parse(template);

  return function(context, options) {
    return self._render(compiledTemplate, context);
  };
};

exports = module.exports = Compiler;