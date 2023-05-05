# PostCSS Dark Theme Class

<img align="right" width="135" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="https://postcss.org/logo-leftp.svg">

CSS solution for light/dark/auto theme switcher for websites.

* It doesn’t have [FART] **flash of light theme** during JS initialization.
* **Pure CSS** solution. You need JS only to set HTML class, when user.
* **Automatic theme** provide better UX for users with theme switching
  by subset/sunrise (all operating systems now have theme switching schedule).

[PostCSS] plugin to make switcher to force dark or light theme by copying styles
from media query to special class.

[PostCSS]: https://github.com/postcss/postcss
[FART]: https://css-tricks.com/flash-of-inaccurate-color-theme-fart/

```css
/* Input CSS */

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
/* Output CSS */

@media (prefers-color-scheme: dark) {
  html:not(.is-light) {
    --text-color: white
  }
  html:not(.is-light) body {
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

By default (without classes on `html`), website will use browser dark/light
theme. If user want to use dark theme, you set `html.is-dark` class.
If user want to force light theme, you use `html.is-light`.

<a href="https://evilmartians.com/?utm_source=postcss-dark-theme-class">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-dark-theme-class
```

**Step 2:** Check your project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-dark-theme-class'),
    require('autoprefixer')
  ]
}
```

**Step 4:** Add theme switcher to UI. We recommend to have 3 states: light,
dark, and auto.

**Step 5:** Set `is-dark` and `is-light` classes to `<html>` according
to switcher state:

```html
<select name="themeSwitcher" id="themeSwitcher">
  <option value="auto">Auto</option>
  <option value="light">Light theme</option>
  <option value="dark">Dark theme</option>
</select>
```

```js
const html = document.documentElement
const themeSwitcher = document.getElementById('themeSwitcher')

themeSwitcher.addEventListener('change', () => {

  if (themeSwitcher.value === 'auto') {
    html.classList.remove('is-dark', 'is-light')

  } else if (themeSwitcher.value === 'light') {
    html.classList.add('is-light')
    html.classList.remove('is-dark')

  } else if (themeSwitcher.value === 'dark') {
    html.classList.add('is-dark')
    html.classList.remove('is-light')

  }
})
```

**Step 6:** Save user’s choice in `localStorage`.


```diff
  const html = document.documentElement
  const themeSwitcher = document.getElementById('themeSwitcher')

  themeSwitcher.addEventListener('change', () => {
+   localStorage.theme = themeSwitcher.value

    if (themeSwitcher.value === 'auto') {
      html.classList.remove('is-dark', 'is-light')

    } else if (themeSwitcher.value === 'light') {
      html.classList.add('is-light')
      html.classList.remove('is-dark')

    } else if (themeSwitcher.value === 'dark') {
      html.classList.add('is-dark')
      html.classList.remove('is-light')

    }
  })

+ if (localStorage.theme) {
+   themeSwitcher.value = localStorage.theme ?? "auto";
+   themeSwitcher.dispatchEvent(new Event("change"));
+ }
```

[official docs]: https://github.com/postcss/postcss#usage


## Options

```js
module.exports = {
  plugins: [
    require('postcss-dark-theme-class')({
      darkSelector: '.dark-theme',
      lightSelector: '.light-theme'
    })
  ]
}
```


### `darkSelector`

Type: `string`. Default: `.is-dark`.

Any CSS’s valid selector for `<html>` (alias for `:root`), which will switch
dark theme. Use `darkSelector: '[data-theme="dark"]'` if you will switch theme
by setting `<html data-theme=dark>`


### `lightSelector`

Type: `string`. Default: `.is-light`.

Any CSS’s valid selector, which will switch light theme.
Use `lightSelector: '[data-theme="light"]'` if you will switch theme by setting
`<html data-theme="light">`


## `rootSelector`

Type: `string[]`, `string`. Default: `['html', ':root']`.

Selector for node for CSS Custom properties and dark/light theme classes.
