# PostCSS Dark Theme Class

[PostCSS] plugin to copy CSS from dark theme media query to special class
(by default `html.is-dark`).

[PostCSS]: https://github.com/postcss/postcss

```css
@media (prefers-color-scheme: dark) {
  :root { // <html> for HTML documents
    --text-color: white
  }
  body {
    background: black
  }
}
```

```css
@media (prefers-color-scheme: dark) {
  :root { // <html> for HTML documents
    --text-color: white
  }
  body {
    background: black
  }
}
:root.is-dark { // <html> for HTML documents
  --text-color: white
}
html.is-dark body {
  background: black
}
```


## Usage

```js
postcss([ require('postcss-dark-theme-class') ])
```

See [PostCSS] docs for examples for your environment.


## Options

### `darkClass`

Type: `string`.

Default: `is-dark`.

`html`’s class, which will switch dark theme.
