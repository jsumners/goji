# Goji

*Goji* is a template engine for [Node.js](https://nodejs.org/) that conforms 
to the [Hapi](https://hapijs.com/) view engine requirements.

*Goji* was inspired by [Thymeleaf](https://www.thymeleaf.org/). The name was
picked from Wikipedia's [list of herbs](https://en.wikipedia.org/wiki/Category:Herbs)
based on whimsy and availability.

*Goji's* templates are (mostly) valid HTML. *Goji* templates rely on custom
attributes that are replaced during the compilation and rendering process.

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
var goji = require('goji');
var fs = require('fs');
var template = fs.readFileSync('./template.html');

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

By default, the compiler will look for templates with a file extension of
".html" in an "html" directory that is in the same directory as your
project's `node_modules` directory. If you need to change this behavior, you
can use the
[Compiler Options](http://jsumners.github.io/goji/Compiler.html#Options)
object.

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

# License

[http://jsumners.mit-license.org](http://jsumners.mit-license.org/)

THE MIT LICENSE (MIT) Copyright © 2014 James Sumners james.sumners@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.