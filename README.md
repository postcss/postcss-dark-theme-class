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

**Step 1:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 2:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-dark-theme-class'),
    require('autoprefixer')
  ]
}
```

**Step 3:** Add theme switcher to UI. We recommend to have 3 states: light,
dark, and auto.

**Step 4:** Set `is-dark` and `is-light` classes to `<html>` according
to switcher state:

```js
let html = document.documentElement
themeSwitcher.addEventListener('change', () => {
  if (themeSwitcher.value === 'auto') {
    themeSwitcher.classList.remove('is-dark', 'is-light')
  } else if (themeSwitcher.value === 'light') {
    themeSwitcher.classList.add('is-light')
    themeSwitcher.classList.remove('is-dark')
  } else if (themeSwitcher.value === 'dark') {
    themeSwitcher.classList.add('is-dark')
    themeSwitcher.classList.remove('is-light')
  }
})
```

[official docs]: https://github.com/postcss/postcss#usage


## Options

### `darkClass`

Type: `string`.

Default: `is-dark`.

`html`’s class, which will switch dark theme.
