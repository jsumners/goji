# g-partial

The `g-partial` attribute loads snippets of HTML from other templates.
These snippets are inserted in place of the element associated with the
`g-partial` attribute.

So, given the snippet:

```html
<section id="toBeIncludedElsewhere">
  <p>A snippet</p>
</section>
```

And the template:

```html
<div>foo</div>
<div g-partial="elsewhere">bar</div>
```

The resulting document would be:

```html
<div>foo</div>
<section id="toBeIncludedElsewhere">
  <p>A snippet</p>
</section>
```

## Registering A Partial

Partials are registered through the `registerPartial(name, partial)` method.
The `partial` parameter will be registered with **Goji** under the given name.
The `partial` can either be a string or a function. If it is a function, that
function will be invoked and the result will be what is registered. This result
should be a string.

Partials are not processed for other attributes at the time they are
registered. If a partial contains other attributes, those attributes will
be processed when a template that references the partial is rendered.
