# g-each

The `g-each` attribute provides iteration of an array of objects. The value
for this attribute is an expression in the form
`[iteration variable name] in [array name]`. For example, given the template:

```html
<ul>
  <li g-each="i in numbers">foo</li>
</ul>
```

And the context:

```javascript
{
  numbers: [1, 2, 3]
}
```

The rendered document would be:

```html
<ul>
  <li>foo</li>
  <li>foo</li>
  <li>foo</li>
</ul>
```
