let postcss = require('postcss')

let plugin = require('./')

function run(input, output, opts) {
  let result = postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('replaces selectors', () => {
  run(
    `@media (prefers-color-scheme:dark) {
    html.is-a,
    html,
    :root,
    a { }
  }`,
    `@media (prefers-color-scheme:dark) {
    html:not(.is-light).is-a,
    html:not(.is-light),
    :root:not(.is-light),
    html:not(.is-light) a { }
  }
    html.is-dark.is-a,
    html.is-dark,
    :root.is-dark,
    html.is-dark a { }`
  )
})

it('processes inner at-rules', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    @media (min-width: 500px) { a { } }
    @media (min-width: 500px) { @media (print) { a { } } }
  }`,
    `@media (prefers-color-scheme: dark) {
    @media (min-width: 500px) { html:not(.is-light) a { } }
    @media (min-width: 500px) { @media (print) { html:not(.is-light) a { } } }
  }
    @media (min-width: 500px) { html.is-dark a { } }
    @media (min-width: 500px) { @media (print) { html.is-dark a { } } }`
  )
})

it('checks media params deeply', () => {
  run(
    `@media (x-dark: true) {
    a { color: white }
  }
  @unknown (prefers-color-scheme: dark) {
    a { color: white }
  }`,
    `@media (x-dark: true) {
    a { color: white }
  }
  @unknown (prefers-color-scheme: dark) {
    a { color: white }
  }`
  )
})

it('ignores whitespaces', () => {
  run(
    `@media ( prefers-color-scheme:dark ) {
    a { color: white }
  }`,
    `@media ( prefers-color-scheme:dark ) {
    html:not(.is-light) a { color: white }
  }
    html.is-dark a { color: white }`
  )
})

it('reserve comments', () => {
  run(
    `@media (prefers-color-scheme:dark) {
    /* some comments */
    a { color: white }
    @media (min-width: 500px) { /* another comments */ a { } }
  }`,
    `@media (prefers-color-scheme:dark) {
    /* some comments */
    html:not(.is-light) a { color: white }
    @media (min-width: 500px) { /* another comments */ html:not(.is-light) a { } }
  }
    /* some comments */
    html.is-dark a { color: white }
    @media (min-width: 500px) { /* another comments */ html.is-dark a { } }`
  )
})

it('supports combined queries', () => {
  run(
    `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    a { color: white }
  }`,
    `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    html:not(.is-light) a { color: white }
  }@media (min-width: 60px) {
    html.is-dark a { color: white }
  }`
  )
})

it('supports combined queries in the middle', () => {
  run(
    `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    a { color: white }
  }`,
    `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    html:not(.is-light) a { color: white }
  }@media (width > 0) and (width > 0) {
    html.is-dark a { color: white }
  }`
  )
})

it('allows to change class', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    a { color: white }
  }`,
    `@media (prefers-color-scheme: dark) {
    html:not(.light-theme) a { color: white }
  }
    html.dark-theme a { color: white }`,
    { darkSelector: '.dark-theme', lightSelector: '.light-theme' }
  )
})

it('changes root selectors', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    html, .storybook { --bg: black }
    p { color: white }
  }
  html, .storybook { --bg: white }
  p { color: black }`,
    `@media (prefers-color-scheme: dark) {
    html:not(.is-light), .storybook:not(.is-light) { --bg: black }
    html:not(.is-light) p,.storybook:not(.is-light) p { color: white }
  }
    html.is-dark, .storybook.is-dark { --bg: black }
    html.is-dark p,.storybook.is-dark p { color: white }
  html, .storybook { --bg: white }
  p { color: black }`,
    { rootSelector: ['html', ':root', '.storybook'] }
  )
})

it('changes root selector', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    body { --bg: black }
    p { color: white }
  }
  body { --bg: white }
  p { color: black }`,
    `@media (prefers-color-scheme: dark) {
    body:not(.is-light) { --bg: black }
    body:not(.is-light) p { color: white }
  }
    body.is-dark { --bg: black }
    body.is-dark p { color: white }
  body { --bg: white }
  p { color: black }`,
    { rootSelector: 'body' }
  )
})

it('ignores already transformed rules', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    :root:not(.is-light) { --bg: black }
    p { color: white }
  }
  :root { --bg: white }`,
    `@media (prefers-color-scheme: dark) {
    :root:not(.is-light) { --bg: black }
    html:not(.is-light) p { color: white }
  }
    html.is-dark p { color: white }
  :root { --bg: white }`
  )
})
