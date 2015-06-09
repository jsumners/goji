# Goji

*Goji* is a template engine for [Node.js](https://nodejs.org/) that conforms 
to the [Hapi](https://hapijs.com/) view engine
[requirements](http://hapijs.com/api/8.0.0#serverviewsoptions).

*Goji* was inspired by [Thymeleaf](https://www.thymeleaf.org/). The name was
picked from Wikipedia's [list of herbs](https://en.wikipedia.org/wiki/Category:Herbs)
based on whimsy and availability.

*Goji's* templates are (mostly) valid HTML. *Goji* templates rely on custom
attributes that are replaced during the compilation and rendering process.

For the API documentation see --
[http://jsumners.github.io/goji/Goji.html](http://jsumners.github.io/goji/Goji.html)

For a short example project see --
[https://github.com/jsumners/goji-hapi-example](https://github.com/jsumners/goji-hapi-example)

# Install

```bash
$ npm install --save goji
```

# Example

## Template

```html
<!DOCTYPE html>
<html>
<head></head>
<body>

  <div g-text="foo.bar">This should be replaced with the value of foo.bar</div>
  <div g-text="foobar()">This should be replaced with the result of foobar()</div>
  <div g-text="answer === 41 ? foo.bar : 'nope'"></div>
  <div g-text="(answer === 42) ? foo.bar : 'nope'"></div>

</body>
</html>
```

## Processing

```javascript
var Goji = require('goji');
var goji = new Goji();
var template = goji.loadTemplateNamed('template');

var renderer = goji.compile(template);
var context = {
  foo: {
    bar: 'foo.bar'
  },
  foobar: function foobar() {
    return 'foobar() invoked';
  },
  answer: 42
};

console.log(renderer(context));
```

# Compiler Options

*Goji's* compiler will load templates based on name when parsing
`g-include` or `g-replace` attributes, and when using the
`loadTemplateNamed(name)` method.

By default, the compiler will look for templates with a file extension of
".html" in an "html" directory that is in the same directory as your
project's `node_modules` directory. Said templates will be cached for
five minutes. If you need to change this behavior, you
can use the
[Compiler Options](http://jsumners.github.io/goji/Compiler.html#Options)
object:

* `cache`: Set to `true` (default) to enable caching of compiled templates.
  Set to `false` to compile templates every load.
* `cacheTTL`: Time, in seconds, to keep templates in the cache.
  Default value is 300 (5 minutes).
* `templatesDir`: The location where templates are stored. This should be
  the full path (use `path.resolve`). If it is not present, then it will
  be set to an "html" directory that is in the same directory as a
  `node_modules` directory.
* `partialsDir`: The location where partial templates are stored. Partials
  are snippets of html that will be included via the `g-partial`
  attribute. The default value for this is `(templatesDir + '/partials')`.
* `templatesExt`: The file extension used on template files. This defaults
  to ".html". Note that it should include the leading dot.

```javascript
{
  cache: true,
  cacheTTL: 300,
  templatesDir: '/path/to/your/templates/directory',
  partialsDir: '/path/to/your/templates/partials/directory',
  templatesExt: '.html'
}
```

The compiler options can be passed to the *Goji* constructor, or to the
`compile` method.

# Template Language

As mentioned in the introduction, *Goji* uses custom attributes on standard
HTML elements. Thus *Goji's* templating "language" is really just
vanilla HTML.

However, the values of those attributes are not standard. *Gogi's*
attribute values are a mixture of a JavaScript expression language
and simple identifiers.

## Expression Language

*Goji's* expression language is a subset of vanilla JavaScript. It will
evaluate simple calculations, ternary operations, object lookups, and
invoke methods.

Any time an expression is evaluated it is done so within a *context*. The
context is a regular JavaScript object literal. For example, the following
literal is a completely valid context that can be used as normal within
the expression:

```javascript
{
  foo: {
    bar: [1, 2, 3]
  },
  foobar: function foobar() {
    return 'result of foobar()';
  },
  bar: 'bar',
  baz: 42
}
```

The expression language used is
[exprjs](https://github.com/jleibund/exprjs/). To see a complete rundown
of the available expressions, view their
[test-expr.js](https://github.com/jleibund/exprjs/blob/master/test/test-expr.js).

## Supported Attributes

### g-attr
`g-attr` allows you to modify any generic attribute. `g-attr`
attribute values are an expression in the form:

* `value`: where `value` is the name of an attribute to modify/add.
  For example: `g-attr="href"`. This is a shortcut for a single string
  expression
* `'value'`: same as above, but as an actual string expression
* `['value', 'value', ...]`: an array of attribute names to modify/add.
  For example: `g-attr="['href', 'data-foo']"`

Each named attribute in the `g-attr` expression will take its value from
an attribute, who's value is an expression, named in the format
`g-attr-attributeName`. For example: `g-attr="data-foo"` will get the
value for attribute `data-foo` from the expression in the value of the
`g-attr-data-foo` attribute.

Thus, the following template:

```html
<a g-attr="['href', 'id']" g-attr-href="foo.url" g-attr-id="foo.id">foo</a>
```

With the context:

```javascript
{
  foo: {
    url: 'http://example.com/foo',
    id: 'foobar'
  }
}
```

Will render to:

```html
<a href="http://example.com/foo" id="foobar">foo</a>
```

**Note:** if you modify the `class` attribute with this method then
it will overwrite any class names in a pre-existing class attribute.
To append or prepend classes, use `g-class` and `g-classprepend`.

### g-class
`g-class` appends the result of an expression to the element's class
attribute. For example, given the following HTML:

```html
<div g-class="foo.class" class="bar">placeholder</div>
```

The rendered template would be:

```html
<div class="bar foo">placeholder</div>
```

Where the expression `foo.class` evaluates to "foo".

If the element does not already have a class attribute, the the
attribute will be added.

### g-classprepend
`g-classprepend` works like `g-class` except it prepends the class
attribute with the result of the `g-classprepend` expression.

### g-text
`g-text` substitutes the result of an expression in place of the element's
content. For example, given the following HTML:

```html
<p>Hello <span g-text="'world'">??</span>!</p>
```

The rendered template would be:

```html
<p>Hello <span>world</span>!</p>
```

### g-html
`g-html` works the same as `g-text` except it renders embedded HTML.
For example, given the following HTML:

```html
<p>Hello <span g-html="'<strong>world</strong>'">??</span>!</p>
```

The rendered template would be:

```html
<p>Hello <span><strong>world</strong></span>!</p>
```

With the browser rendering the `strong` element appropriately, e.g. **world**.
Whereas with `g-text`, the browser would render the text
"`<strong>world</strong>`".

### g-each
`g-each` is used to iterate over an array. It uses a simple expression to
select the array and name the iteration variable. The expression is in
the form `[iteration variable name] in [array name]`. For example:

```html
<ul>
  <li g-each="item in items" g-text="item">placeholder</li>
</ul>
```

If the context is:

```javascript
{items: ['list item 1', 'list item 2', 'list item 3']}
```

Then the rendered content would be:

```html
<ul>
  <li>list item 1</li>
  <li>list item 2</li>
  <li>list item 3</li>
</ul>
```

However, if the template is:

```html
<table>
  <tr g-each="row in rows">
    <td g-text="row.cell1">cell1</td>
    <td g-text="row.cell2">cell2</td>
  </tr>
</table>
```

And the context is:

```javascript
{
  rows: [
    {cell1: 'r1c1', cell2: 'r1c2'},
    {cell1: 'r2c1', cell2: 'r2c2'}
  ]
}
```

Then the rendered content would be:

```html
<table>
  <tr>
    <td>r1c1</td>
    <td>r1c2</td>
  </tr>
  <tr>
    <td>r2c1</td>
    <td>r2c2</td>
  </tr>
</table>
```

There are a few things to notice in these examples:

1. If the template element has both `g-each` and `g-text` attributes,
   then the template element will be used as the template for the
   iterations.
2. If the template element only has a `g-each` attribute, then the *parent
   element's content* will be used as the template for the iterations.
3. In either case 1 or 2, the content of the *parent element* will be
   replaced with the rendered content.

`g-each` includes the following extra context on each iteration:

```javascript
{
  iter: {
    i: `number`,
    odd: `boolean`,
    even: `boolean`
  }
}
```

Thus, on the third iteration, the extra context would be:

```javascript
{
  iter: {
    i: 2,
    odd: false,
    even: true
  }
}
```

Combined with `g-class`, you can render the following template:

```html
<ul>
    <li g-each="item in items"
        g-text="item"
        g-class="(iter.odd) ? 'odd' : 'even'">placeholder</li>
  </ul>
```

Into:

```html
<ul>
  <li class="even">list item 1</li>
  <li class="odd">list item 2</li>
  <li class="even">list item 3</li>
</ul>
```

Given the same context as the first example in this section.

### g-if
`g-if` is *Goji's* conditional attribute. If the expression supplied
in a `g-if` attribute value evaluates to `true` then the whole block
will be parsed and rendered. If the expression evaluates to `false`,
then the whole block will be removed without futher processing.

For example:

```html
<div g-if="1 === 1">
  <p g-text="'This will be rendered'">placeholder</p>
  <p g-if="1 === 1" g-text="'As will this'">placeholder</p>
  <p g-if="1 === 1">This will not</p>
</div>
```

Will render to the following:

```html
<div>
  <p>This will be rendered</p>
  <p>As will this</p>
</div>
```

### g-include
`g-include` inserts the content of a fragment in place of the element's
content. The value of `g-include` is a simple identifier in the form
`[templateName]::[fragmentId]`. For example, given the following HTML:

```html
<div class="container">
  <div g-include="fooTemplate::#bar">This will be replaced</div>
</div>
```

*Goji* will look for a template file named "fooTemplate", parse it, and then
retrieve the content from an element with an `id` attribute value of "bar".
So, if fooTemplate's content is:

```html
<p id="bar">bar's content</p>
```

Then the rendered template will be:

```html
<div class="container">
  <div>bar's content</div>
</div>
```

### g-replace
`g-replace` works much like `g-include`, the difference is that `g-replace`
replaces the element on which it is an attribute. Thus, given the same
example as in `g-include` the rendered template would be:

```html
<div class="container">
  <p id="bar">bar's content</p>
</div>
```

### g-partial
`g-partial` is similar to `g-include` and `g-replace`. The difference is
that `g-partial` is 1) processed during the render phase and 2) the
attribute value is an expression. The result of the expression is expected
to be the name of another template file. Said template is then loaded,
rendered, and injected as the body of the element upon which the
`g-partial` attribute is present.

Thus, given the following document:

```html
<html>
<head></head>
<body>

  <main g-partial="partial.name">
    placeholder
  </main>

</body>
</html>
```

With a partial template named "indexBody.html" in the templates directory
who's content is merely:

```html
<p>Hello world!</p>
```

And a context of:

```javascript
{
  partial: {
    name: 'indexBody'
  }
}
```

Then the rendered document would be:

```html
<html>
<head></head>
<body>

  <main>
    <p>Hello world!</p>
  </main>

</body>
</html>
```

**Note:** as of *Goji* version **0.8.0** the default path for partials
is in a sub-directory of the main templates directory. The default name
for this sub-directory is `partials`.

# License

[http://jsumners.mit-license.org](http://jsumners.mit-license.org/)

THE MIT LICENSE (MIT) Copyright © 2014 James Sumners james.sumners@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.