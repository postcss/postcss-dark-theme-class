# PostCSS Dark Theme Class

[PostCSS] plugin to copy CSS from dark theme media query to special class
(by default `html.is-dark`).

[PostCSS]: https://github.com/postcss/postcss

```css
@media (prefers-color-scheme: dark) {
  html {
    --text-color: white
  }
  body {
    background: black
  }
}
```

```css
@media (prefers-color-scheme: dark) {
  html {
    --text-color: white
  }
  body {
    background: black
  }
}
html.is-dark {
  --text-color: white
}
html.is-dark body {
  background: black
}
```

## Options

### `darkClass`

Type: `string`.

Default: `is-dark`.

`html`’s class, which will switch dark theme.

## Usage

```js
postcss([ require('postcss-dark-theme-class') ])
```

See [PostCSS] docs for examples for your environment.
