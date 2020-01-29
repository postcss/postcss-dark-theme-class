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

it('supports combined queries', () => run(
  `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    a { color: white }
  }`,
  `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    html:not(.is-light) a { color: white }
  }@media (min-width: 60px) {
    html.is-dark a { color: white }
  }`
))

it('supports combined queries in the middle', () => run(
  `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    a { color: white }
  }`,
  `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    html:not(.is-light) a { color: white }
  }@media (width > 0) and (width > 0) {
    html.is-dark a { color: white }
  }`
))

it('allows to change class', () => run(
  `@media (prefers-color-scheme: dark) {
    a { color: white }
  }`,
  `@media (prefers-color-scheme: dark) {
    html:not(.light-theme) a { color: white }
  }
    html.dark-theme a { color: white }`,
  { darkSelector: '.dark-theme', lightSelector: '.light-theme' }
))

it('throws on old options', () => {
  expect(() => {
    run('', '', { darkClass: 'dark', lightSelector: '.light' })
  }).toThrow("Update darkClass: 'dark' to darkSelector: '.dark'")
  expect(() => {
    run('', '', { darkSelector: '.dark', lightClass: 'light' })
  }).toThrow("Update lightClass: 'light' to lightSelector: '.light'")
})
