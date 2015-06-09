'use strict';

var NodeCache = require('node-cache');
var sha256 = require('js-sha256').sha256;
var cheerio = require('cheerio');
var exprjs = new (require('exprjs'))();
var fs = require('fs');
var path = require('path');

/**
 * Returns the first directory where a node_modules directory exists.
 * @private
 */
function basePath() {
  var _path = __dirname;

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

function extendObj(a, b) {
  if (!b) {
    return;
  }

  Object.keys(b).forEach(function keyIterator(val) {
    if (a.hasOwnProperty(val)) {
      a[val] = b[val];
    }
  });

  if (!b.hasOwnProperty('partialsDir')) {
    a.partialsDir = a.templatesDir + '/partials';
  }
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
    return new Compiler(options);
  }
  var self = Object.getPrototypeOf(this);

  if (options) {
    extendObj(self.options, options);
  }

  if (self.options.cache) {
    self._cache = new NodeCache({
      stdTTL: self.options.cacheTTL,
      checkperiod: 0 // Needs to be 0 to prevent node-cache from
      // causing Goji to hang indefinitely
    });
  }
}

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

Compiler.prototype = {
  options: {
    cache: true,
    cacheTTL: 300,
    templatesDir: path.resolve(basePath() + '/html'),
    partialsDir: path.resolve(basePath() + '/html/partials'),
    templatesExt: '.html'
  },
  _cache: {}
};

/**
 * <p>Parses for elements that have a <code>g-attr</code> attribute and renders
 * them. A <code>g-attr</code> attribute can have the following expression
 * forms as a value:</p>
 *
 * <ul>
 *   <li>
 *     <code>value</code>: where <code>value</code> is a name of an attribute
 *     to modify/add. For example: <code>g-attr="href"</code>
 *   </li>
 *   <li>
 *     <code>'value'</code>: same as above, but as an actual string
 *     expression
 *   </li>
 *   <li>
 *     <code>['value', 'value', ...]</code>: an array of attribute names to
 *     modify/add. For example: <code>g-attr="['href', 'data-foo']"</code>
 *   </li>
 * </ul>
 *
 * <p>Each named attribute in the <code>g-attr</code> expression will take
 * its value from an attribute, who's value is an expression, named in the
 * format <code>g-attr-attributeName</code>. For example:
 * <code>g-attr="data-foo"</code> will get the value for attribute
 * <code>data-foo</code> from the expression in the value of the
 * <code>g-attr-data-foo</code> attribute.</p>
 *
 * @param {object} $ A cheerio object that represent the template
 * @param {object} context The context for the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.6.0
 * @private
 */
Compiler.prototype._attr = function _attr($, context, gContext) {
  var _$ = (typeof $ === 'function') ? $ : cheerio.load($.toString());
  return _$('[g-attr]').each(function gAttr(i, elem) {
    var $elem = $(elem);
    var attr = $elem.attr('g-attr').trim();
    var exprString = (function() {
      var q = String.fromCharCode(39);
      var c = attr.substring(0,1);
      var result = attr;
      if (c === q) {
        result = '[' + attr + ']';
      } else if (c === '[') {
        result = result;
      } else {
        result = '[' + q + attr + q + ']';
      }
      return result;
    }());
    var expression = exprjs.parse(exprString);
    var result = exprjs.run(expression, context, gContext);

    result.forEach(function gAttrExprEach(val) {
      var attrExpr = exprjs.parse($elem.attr('g-attr-' + val));
      var attrResl = exprjs.run(attrExpr, context, gContext);
      $elem.attr(val, attrResl);
      $elem.removeAttr('g-attr-' + val);
    });

    $elem.removeAttr('g-attr');
  });
};

/**
 * Parses for elements that have a <code>g-class</code> attribute and renders
 * them. If present, the attribute will be evaluated as an expression and the
 * result will be appended to the <code>class</code> attribute (creating it
 * if one does not already exist).
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.3.0
 * @private
 */
Compiler.prototype._class = function _class($, context, gContext) {
  var _$ = (typeof $ === 'function') ? $ : cheerio.load($.toString());
  return _$('[g-class]').each(function gClass(i, elem) {
    var $elem = _$(elem);
    var expression = exprjs.parse($elem.attr('g-class'));
    var result = exprjs.run(expression, context, gContext);

    $elem.addClass(result);
    $elem.removeAttr('g-class');

    return $elem;
  });
};

/**
 * Parses for elements that have a <code>g-classprepend</code> attribute and
 * renders them. If present, the attribute will be evaluated as an expression
 * and the result will be prepended to the <code>class</code> attribute
 * (creating it if one does not already exist).
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.3.0
 * @private
 */
Compiler.prototype._classprepend = function _classprepend($, context, gContext) {
  var _$ = (typeof $ === 'function') ? $ : cheerio.load($.toString());
  return _$('[g-classprepend]').each(function gClassprepend(i, elem) {
    var $elem = _$(elem);
    var expression = exprjs.parse($elem.attr('g-classprepend'));
    var result = exprjs.run(expression, context, gContext);
    var classes = $elem.attr('class');

    if (classes) {
      $elem.attr('class', result + ' ' + classes);
    } else {
      $elem.addClass(result);
    }

    return $elem;
  });
};

/**
 * <p>Parses for elements that have a <code>g-each</code> attribute and renders
 * them. If the element also has a <code>g-text</code> attribute, then the
 * element is used as the template. Otherwise, the content of the parent
 * element is used as the template. In either case, the final result will be
 * that the parent element's content is replaced with the rendered template.</p>
 *
 * <p>Additionally, an extra context will be present during the parsing of the
 * template. This extra context is an object named <code>iter</code>. It has a
 * property <code>i</code> that indicates the iteration number. It also has
 * two boolean properties: <code>odd</code> and <code>even</code>. These two
 * properties can be used as shortcuts to determine whether the iteration
 * number is odd or even.</p>
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.2.0
 * @private
 */
Compiler.prototype._each = function _each($, context, gContext) {
  var self = this;
  var iterContext = {
    iter: {
      i: 0,
      get odd() {
        return (this.i % 2) !== 0;
      },
      get even() {
        return (this.i % 2) === 0;
      }
    }
  };

  return $('[g-each]').each(function gEach(i, elem) {
    // This thing is a mess
    iterContext.iter.i = 0;
    var $elem = $(elem);
    var parts = $elem.attr('g-each').split(' in ').map(function(val) {
      return val.trim();
    });

    // Retrieve the desired array from the context
    var expr = exprjs.parse(parts[1]);
    var list = exprjs.run(expr, context, gContext);

    // Evaluate the substitution expression if it is directly on the element
    var gText = $elem.attr('g-text');
    if (gText) {
      var expr2 = exprjs.parse($elem.attr('g-text'));
      $elem.removeAttr('g-text');
    }

    $elem.removeAttr('g-each'); // remove it so we don't run it again
    var varName = parts[0];
    var _context = {};
    _context[varName] = '';

    // Prepare our target DOM nodes
    var $parent = $elem.parent();
    var $node = $elem.clone();
    $parent.html('');

    var parseClasses = function() {
      var result = $node;
      if ($node.attr('g-class')) {
        result = self._class($node, _context, iterContext);
      } else if ($node.attr('g-classprepend')) {
        result = self._classprepend($node, _context, iterContext);
      }

      return result;
    };

    var iterRender = function(){};
    if (gText) {
      iterRender = function iterRender1(item) {
        _context[varName] = item;
        var result = exprjs.run(expr2, _context, iterContext);
        $node.html(result);
        var _$node = parseClasses();
        $parent.append(_$node.clone());

        iterContext.iter.i += 1;
      };
    } else {
      var innerTemplate = $node.html();
      iterRender = function iterRender2(item) {
        _context[varName] = item;
        var result = self._render(innerTemplate, _context, iterContext);
        $node.html(result);
        var _$node = parseClasses();
        $parent.append(_$node.clone());

        iterContext.iter.i += 1;
      };
    }

    // Finally loop through and render
    list.forEach(iterRender);

    return $elem;
  });
};

/**
 * If caching is enabled, this method can be used to clear the cache.
 *
 * @since 0.5.0
 */
Compiler.prototype.emptyCache = function emptyCache() {
  if (this.options.cache) {
    this._cache.flushAll();
  }
};

/**
 * Parses for <code>g-if</code> conditional blocks. If the expression
 * evalutates to true, then the block will be rendered. Otherwise, the block
 * will be completely removed.
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.4.0
 * @private
 */
Compiler.prototype._if = function _if($, context, gContext) {
  var self = this;

  return $('[g-if]').each(function gIf(i, elem) {
    var $elem = $(elem);
    var expression = exprjs.parse($elem.attr('g-if'));
    var result = exprjs.run(expression, context, gContext);

    $elem.removeAttr('g-if');
    if (result === true) {
      self._render($elem.toString(), context, gContext);
    } else {
      $elem.remove();
    }

    return $elem;
  });
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

    var child = self.loadTemplateNamed(parts[0], false);

    var parsedChild = self._parse(child);
    var $newContent = $(parts[1], parsedChild);

    action($elem, $newContent);

    return $elem.html();
  });
};

/**
 * Looks for a file in the templates direcory with the given name. If the
 * file exists, it will be loaded and returned as a string.
 *
 * @param {string} name The name of the template to load
 * @param {boolean} isPartial If set, then the defined partials directory will
 *                            be used as the base path for loading the
 *                            template
 * @returns {string | null} The template or <code>null</code> (wasn't found)
 * @since 0.5.0
 */
Compiler.prototype.loadTemplateNamed = function loadTemplateNamed(name, isPartial) {
  var result;
  var baseDir = (isPartial) ?
    this.options.partialsDir : this.options.templatesDir;
  var fullPath = path.resolve(
    baseDir + '/' + name + this.options.templatesExt
  );

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  if (this.options.cache) {
    result = this._cache.get(fullPath);
    if (!result) {
      result = fs.readFileSync(fullPath).toString();
      this._cache.set(fullPath, result);
    }
  } else {
    result = fs.readFileSync(fullPath).toString();
  }

  return result;
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
 * Parses for elements with <code>g-partial</code> attributes. Any partial
 * attributes are then evaluated as expressions, the result of which should be
 * template names that can be loaded with {@link Compiler#loadTemplateNamed}.
 * Said template is loaded, rendered, and injected as the content of the
 * element upon which the <code>g-partial</code> attribute is present.
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.7.0
 * @private
 */
Compiler.prototype._partial = function _partial($, context, gContext) {
  var _$ = (typeof $ === 'function') ? $ : cheerio.load($.toString());
  var self = this;

  return _$('[g-partial]').each(function gPartial(i, elem) {
    var $elem = _$(elem);
    var expression = exprjs.parse($elem.attr('g-partial'));
    var templateName = exprjs.run(expression, context, gContext);

    var partialTemplate = self.loadTemplateNamed(templateName, true);
    $elem.html(self._render(partialTemplate, context, gContext));
    $elem.removeAttr('g-partial');

    return $elem;
  });
};

/**
 * Used to run through all supported attributes of a compiled template and
 * perform their actions.
 *
 * @param {string} template A template as compiled by {@link Compiler#_parse}
 * @param {object} context The object to use as the context for actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {string} The rendered template
 * @private
 */
Compiler.prototype._render = function _render(template, context, gContext) {
  var $ = cheerio.load(template);

  this._if($, context, gContext);
  this._each($, context, gContext); // Should be parsed first
  this._partial($, context, gContext);
  this._class($, context, gContext);
  this._classprepend($, context, gContext);
  this._text($, context, gContext);
  this._html($, context, gContext);
  this._attr($, context, gContext);

  return $.html();
};

/**
 * Looks through a compiled template for <code>g-text</code> attributes and
 * parses them.
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @private
 */
Compiler.prototype._text = function _text($, context, gContext) {
  return $('[g-text]').each(function(i, elem) {
    var $elem = $(elem);
    var expression = $elem.attr('g-text');
    var parsed = exprjs.parse(expression);
    var result = exprjs.run(parsed, context, gContext);

    $elem.text(result);
    $elem.attr('g-text', null);
    return $elem;
  });
};

/**
 * Looks through a compiled template for <code>g-html</code> attributes and
 * parses them.
 *
 * @param {object} $ A cheerio object that respresents the template
 * @param {object} context The context for the the template actions
 * @param {object} gContext A context of extra information provided by Goji
 * @returns {object} The modified cheerio object
 * @since 0.9.0
 * @private
 */
Compiler.prototype._html = function _html($, context, gContext) {
  return $('[g-html]').each(function(i, elem) {
    var $elem = $(elem);
    var expression = $elem.attr('g-html');
    var parsed = exprjs.parse(expression);
    var result = exprjs.run(parsed, context, gContext);

    $elem.html(result);
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

  var compiledTemplate;
  if (self.options.cache) {
    var hash = sha256(template.toString());
    var result = self._cache.get(hash);

    if (result) {
      compiledTemplate = result;
    } else {
      compiledTemplate = self._parse(template);
      self._cache.set(hash, compiledTemplate);
    }
  } else {
    compiledTemplate = self._parse(template);
  }

  return function(context, options) {
    return self._render(compiledTemplate, context);
  };
};

exports = module.exports = Compiler;