let postcss = require('postcss')

let plugin = require('./')

function run (input, output, opts) {
  let result = postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('replaces selectors', () => run(
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
))

it('processes inner at-rules', () => run(
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
))

it('checks media params deeply', () => run(
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
))

it('ignores whitespaces', () => run(
  `@media ( prefers-color-scheme:dark ) {
    a { color: white }
  }`,
  `@media ( prefers-color-scheme:dark ) {
    html:not(.is-light) a { color: white }
  }
    html.is-dark a { color: white }`
))

it('allows to change class', () => run(
  `@media (prefers-color-scheme: dark) {
    a { color: white }
  }`,
  `@media (prefers-color-scheme: dark) {
    html:not(.light-theme) a { color: white }
  }
    html.dark-theme a { color: white }`,
  { darkClass: 'dark-theme', lightClass: 'light-theme' }
))

it('throws on dot in class options', () => {
  expect(() => {
    run('', '', { darkClass: '.dark', lightClass: 'light' })
  }).toThrowError(/"dark"/)
  expect(() => {
    run('', '', { darkClass: 'dark', lightClass: '.light' })
  }).toThrowError(/"light"/)
})
