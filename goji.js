'use strict';

var Compiler = require('./lib/Compiler');
var compiler;
/**
 * Goji is a template engine inspired by
 * <a href="http://thymeleaf.org/">Thymeleaf</a>. It uses regular HTML
 * as the template "language".
 *
 * @param {Complier~Options} options Defines the options Goji will use during
 *        compilation and rendering
 * @returns {Gogi}
 * @constructor
 */
function Gogi(options) {
  if (! (this instanceof Gogi)) {
    return new Gogi(options);
  }

  compiler = new Compiler(options);
}

/**
 * Takes a string template and parses it for includes.
 *
 * @param {string} template An HTML document or snippet
 * @param {Compiler~Options} options Defines the options Goji will use during
 *        compilation and rendering. Note: this will overwrite whatever
 *        options were specified in the initial constructor.
 * @returns {Compiler~RenderFunction}
 */
Gogi.prototype.compile = function gojiCompile(template, options) {
  return compiler.compile(template, options);
};

/**
 * Clears Goji's internal cache of templates. Does nothing if you disabled
 * caching.
 */
Gogi.prototype.emptyCache = function gojiEmptyCache() {
  compiler.emptyCache();
};

/**
 * Looks for a template with the given name in the templates directory
 * (as specified by the {@link Compiler~Options}). Once found, the template
 * is read in and returned as a string. This string can then be used
 * with the {@link Goji#compile} method.
 *
 * @param {string} name The name of a template. E.g. if you have a template
 *        file "foo.html", you would simply provide "foo" as the name
 * @returns {string|null} The template as a string or null if the template
 *          could not be found
 */
Gogi.prototype.loadTemplateNamed = function gogiLoadTemplate(name) {
  return compiler.loadTemplateNamed(name);
};

exports = module.exports = Gogi;