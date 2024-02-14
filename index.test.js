let { equal } = require('node:assert')
let { test } = require('node:test')
let postcss = require('postcss')

let plugin = require('./')

function run(input, output, opts) {
  let result = postcss([plugin(opts)]).process(input, { from: undefined })
  equal(result.css, output)
  equal(result.warnings().length, 0)
}

test('replaces selectors - dark scheme', () => {
  run(
    `@media (prefers-color-scheme:dark) {
    html.is-a,
    html,
    :root,
    a { }
  }`,
    `@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)).is-a,
    html:where(:not(.is-light)),
    :root:where(:not(.is-light)),
    :where(html:not(.is-light)) a { }
  }
    html:where(.is-dark).is-a,
    html:where(.is-dark),
    :root:where(.is-dark),
    :where(html.is-dark) a { }`
  )
})

test('replaces selectors - light scheme', () => {
  run(
    `@media (prefers-color-scheme:light) {
    html.is-a,
    html,
    :root,
    a { }
  }`,
    `@media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)).is-a,
    html:where(:not(.is-dark)),
    :root:where(:not(.is-dark)),
    :where(html:not(.is-dark)) a { }
  }
    html:where(.is-light).is-a,
    html:where(.is-light),
    :root:where(.is-light),
    :where(html.is-light) a { }`
  )
})

test('replaces selectors - dark and light schemes', () => {
  run(
    `@media (prefers-color-scheme:dark) {
    html.is-a,
    html,
    :root,
    a { }
  }
  @media (prefers-color-scheme:light) {
    html.is-a,
    html,
    :root,
    a { }
  }`,
    `@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)).is-a,
    html:where(:not(.is-light)),
    :root:where(:not(.is-light)),
    :where(html:not(.is-light)) a { }
  }
    html:where(.is-dark).is-a,
    html:where(.is-dark),
    :root:where(.is-dark),
    :where(html.is-dark) a { }
  @media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)).is-a,
    html:where(:not(.is-dark)),
    :root:where(:not(.is-dark)),
    :where(html:not(.is-dark)) a { }
  }
  html:where(.is-light).is-a,
    html:where(.is-light),
    :root:where(.is-light),
    :where(html.is-light) a { }`
  )
})

test('disables :where() of request - dark scheme', () => {
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
    html.is-dark a { }`,
    { useWhere: false }
  )
})

test('disables :where() of request - light scheme', () => {
  run(
    `@media (prefers-color-scheme:light) {
    html.is-a,
    html,
    :root,
    a { }
  }`,
    `@media (prefers-color-scheme:light) {
    html:not(.is-dark).is-a,
    html:not(.is-dark),
    :root:not(.is-dark),
    html:not(.is-dark) a { }
  }
    html.is-light.is-a,
    html.is-light,
    :root.is-light,
    html.is-light a { }`,
    { useWhere: false }
  )
})

test('processes inner at-rules - dark scheme', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    @media (min-width: 500px) {
      a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        a { }
      }
    }
  }`,
    `@media (prefers-color-scheme: dark) {
    @media (min-width: 500px) {
      :where(html:not(.is-light)) a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        :where(html:not(.is-light)) a { }
      }
    }
  }
    @media (min-width: 500px) {
      :where(html.is-dark) a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        :where(html.is-dark) a { }
      }
    }`
  )
})

test('processes inner at-rules - light scheme', () => {
  run(
    `@media (prefers-color-scheme: light) {
    @media (min-width: 500px) {
      a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        a { }
      }
    }
  }`,
    `@media (prefers-color-scheme: light) {
    @media (min-width: 500px) {
      :where(html:not(.is-dark)) a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        :where(html:not(.is-dark)) a { }
      }
    }
  }
    @media (min-width: 500px) {
      :where(html.is-light) a { }
    }
    @media (min-width: 500px) {
      @media (print) {
        :where(html.is-light) a { }
      }
    }`
  )
})

test('checks media params deeply', () => {
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

test('ignores whitespaces', () => {
  run(
    `@media ( prefers-color-scheme:dark ) {
    a { color: white }
  }`,
    `@media ( prefers-color-scheme:dark ) {
    :where(html:not(.is-light)) a { color: white }
  }
    :where(html.is-dark) a { color: white }`
  )
})

test('reserve comments', () => {
  run(
    `@media (prefers-color-scheme:dark) {
    /* a */
    a { color: white }
    @media (min-width: 500px) { /* b */ a { } }
  }`,
    `@media (prefers-color-scheme:dark) {
    /* a */
    :where(html:not(.is-light)) a { color: white }
    @media (min-width: 500px) { /* b */ :where(html:not(.is-light)) a { } }
  }
    /* a */
    :where(html.is-dark) a { color: white }
    @media (min-width: 500px) { /* b */ :where(html.is-dark) a { } }`
  )
})

test('supports combined queries - dark scheme', () => {
  run(
    `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    a { color: white }
  }`,
    `@media (min-width: 60px) and (prefers-color-scheme: dark) {
    :where(html:not(.is-light)) a { color: white }
  }@media (min-width: 60px) {
    :where(html.is-dark) a { color: white }
  }`
  )
})

test('supports combined queries - light scheme', () => {
  run(
    `@media (min-width: 60px) and (prefers-color-scheme: light) {
    a { color: white }
  }`,
    `@media (min-width: 60px) and (prefers-color-scheme: light) {
    :where(html:not(.is-dark)) a { color: white }
  }@media (min-width: 60px) {
    :where(html.is-light) a { color: white }
  }`
  )
})

test('supports combined queries in the middle - dark scheme', () => {
  run(
    `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    a { color: white }
  }`,
    `@media (width > 0) and (prefers-color-scheme: dark) and (width > 0) {
    :where(html:not(.is-light)) a { color: white }
  }@media (width > 0) and (width > 0) {
    :where(html.is-dark) a { color: white }
  }`
  )
})

test('supports combined queries in the middle - light scheme', () => {
  run(
    `@media (width > 0) and (prefers-color-scheme: light) and (width > 0) {
    a { color: white }
  }`,
    `@media (width > 0) and (prefers-color-scheme: light) and (width > 0) {
    :where(html:not(.is-dark)) a { color: white }
  }@media (width > 0) and (width > 0) {
    :where(html.is-light) a { color: white }
  }`
  )
})

test('allows to change class', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    a { color: white }
  }`,
    `@media (prefers-color-scheme: dark) {
    :where(html:not(.light-theme)) a { color: white }
  }
    :where(html.dark-theme) a { color: white }`,
    { darkSelector: '.dark-theme', lightSelector: '.light-theme' }
  )
})

test('changes root selectors', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    html, .s { --bg: black }
    p { color: white }
  }
  html, .s { --bg: white }
  p { color: black }`,
    `@media (prefers-color-scheme: dark) {
    html:where(:not(.is-light)), .s:where(:not(.is-light)) { --bg: black }
    :where(html:not(.is-light)) p,:where(.s:not(.is-light)) p { color: white }
  }
    html:where(.is-dark), .s:where(.is-dark) { --bg: black }
    :where(html.is-dark) p,:where(.s.is-dark) p { color: white }
  html, .s { --bg: white }
  p { color: black }`,
    { rootSelector: ['html', ':root', '.s'] }
  )
})

test('changes root selector', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    body { --bg: black }
    p { color: white }
  }
  body { --bg: white }
  p { color: black }`,
    `@media (prefers-color-scheme: dark) {
    body:where(:not(.is-light)) { --bg: black }
    :where(body:not(.is-light)) p { color: white }
  }
    body:where(.is-dark) { --bg: black }
    :where(body.is-dark) p { color: white }
  body { --bg: white }
  p { color: black }`,
    { rootSelector: 'body' }
  )
})

test('ignores already transformed rules - dark scheme', () => {
  run(
    `@media (prefers-color-scheme: dark) {
    :root:not(.is-light) { --bg: black }
    p { color: white }
  }
  :root { --bg: white }`,
    `@media (prefers-color-scheme: dark) {
    :root:not(.is-light) { --bg: black }
    :where(html:not(.is-light)) p { color: white }
  }
    :where(html.is-dark) p { color: white }
  :root { --bg: white }`
  )
})

test('ignores already transformed rules - light scheme', () => {
  run(
    `@media (prefers-color-scheme: light) {
    :root:not(.is-dark) { --bg: black }
    p { color: white }
  }
  :root { --bg: white }`,
    `@media (prefers-color-scheme: light) {
    :root:not(.is-dark) { --bg: black }
    :where(html:not(.is-dark)) p { color: white }
  }
    :where(html.is-light) p { color: white }
  :root { --bg: white }`
  )
})

test('transforms light-dark()', () => {
  run(
    `html {
  border: 1px solid light-dark(white, black)
}`,
    `@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)) {
        border: 1px solid black
    }
}
html:where(.is-dark) {
    border: 1px solid black
}
@media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)) {
        border: 1px solid white
    }
}
html:where(.is-light) {
    border: 1px solid white
}`
  )
})

test('transforms light-dark() with various color formats', () => {
  run(
    `html {
  border: 1px solid light-dark(rgb(0, 0, 0), var(--color));
  color: light-dark( hsla(120, 100%, 50%, 0.3) , hsl(
    var(--red-hue)
    var(--red-sat)
    calc(var(--red-lit) - 20%)
  ));
}`,
    `@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)) {
        color: hsl(
    var(--red-hue)
    var(--red-sat)
    calc(var(--red-lit) - 20%)
  )
    }
}
html:where(.is-dark) {
    color: hsl(
    var(--red-hue)
    var(--red-sat)
    calc(var(--red-lit) - 20%)
  )
}
@media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)) {
        color: hsla(120, 100%, 50%, 0.3)
    }
}
html:where(.is-light) {
    color: hsla(120, 100%, 50%, 0.3)
}
@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)) {
        border: 1px solid var(--color)
    }
}
html:where(.is-dark) {
    border: 1px solid var(--color)
}
@media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)) {
        border: 1px solid rgb(0, 0, 0)
    }
}
html:where(.is-light) {
    border: 1px solid rgb(0, 0, 0)
}`
  )
})

test('does not transform light-dark() inside strings', () => {
  run(
    `html {
  content: ' light-dark(white, black) \
    light-dark(purple, yellow)
  ';
  background: url("light-dark(red, blue).png");
  quotes: "light-dark(white, black)" "light-dark(red, green)";
}`,
    `html {
  content: ' light-dark(white, black) \
    light-dark(purple, yellow)
  ';
  background: url("light-dark(red, blue).png");
  quotes: "light-dark(white, black)" "light-dark(red, green)";
}`
  )
})

test('transforms light-dark() and disables :where() of request', () => {
  run(
    `section {
  color: light-dark(#888, #eee)
}`,
    `@media (prefers-color-scheme:dark) {
    html:not(.is-light) section {
        color: #eee
    }
}
html.is-dark section {
    color: #eee
}
@media (prefers-color-scheme:light) {
    html:not(.is-dark) section {
        color: #888
    }
}
html.is-light section {
    color: #888
}`,
    { useWhere: false }
  )
})

test('processes inner at-rules with light-dark()', () => {
  run(
    `@media (min-width: 500px) {
      @media (print) {
        a {
          background-color: light-dark(white, black)
        }
      }
    }`,
    `@media (min-width: 500px) {
      @media (print) {
        @media (prefers-color-scheme:dark) {
                  :where(html:not(.is-light)) a {
                        background-color: black
                  }
            }
        :where(html.is-dark) a {
                  background-color: black
            }
        @media (prefers-color-scheme:light) {
                  :where(html:not(.is-dark)) a {
                        background-color: white
                  }
            }
        :where(html.is-light) a {
                  background-color: white
            }
      }
    }`
  )
})

test('ignores whitespaces for light-dark()', () => {
  run(
    `a { background: radial-gradient(light-dark( red ,  yellow  ),
light-dark( white ,  black  ),
rgb(30 144 255)); }
`,
    `@media (prefers-color-scheme:dark) {
    :where(html:not(.is-light)) a {
        background: radial-gradient(yellow,
black,
rgb(30 144 255))
    }
}
:where(html.is-dark) a {
    background: radial-gradient(yellow,
black,
rgb(30 144 255))
}
@media (prefers-color-scheme:light) {
    :where(html:not(.is-dark)) a {
        background: radial-gradient(red,
white,
rgb(30 144 255))
    }
}
:where(html.is-light) a {
    background: radial-gradient(red,
white,
rgb(30 144 255))
}
`
  )
})

test('changes root selectors for light-dark()', () => {
  run(
    `html, .s {--bg: light-dark(white, black)}
    p {color: light-dark(red, blue)}
`,
    `@media (prefers-color-scheme:dark) {
    html:where(:not(.is-light)), .s:where(:not(.is-light)) {
        --bg: black
    }
}
html:where(.is-dark), .s:where(.is-dark) {
    --bg: black
}
@media (prefers-color-scheme:light) {
    html:where(:not(.is-dark)), .s:where(:not(.is-dark)) {
        --bg: white
    }
}
html:where(.is-light), .s:where(.is-light) {
    --bg: white
}
    @media (prefers-color-scheme:dark) {
    :where(html:not(.is-light)) p,:where(.s:not(.is-light)) p {
        color: blue
    }
}
    :where(html.is-dark) p,:where(.s.is-dark) p {
    color: blue
}
    @media (prefers-color-scheme:light) {
    :where(html:not(.is-dark)) p,:where(.s:not(.is-dark)) p {
        color: red
    }
}
    :where(html.is-light) p,:where(.s.is-light) p {
    color: red
}
`,
    { rootSelector: ['html', ':root', '.s'] }
  )
})

test('changes root selector for light-dark()', () => {
  run(
    `body {--bg: light-dark(white, black)}
    p {color: light-dark(green, yellow)}
`,
    `@media (prefers-color-scheme:dark) {
    body:where(:not(.is-light)) {
        --bg: black
    }
}
body:where(.is-dark) {
    --bg: black
}
@media (prefers-color-scheme:light) {
    body:where(:not(.is-dark)) {
        --bg: white
    }
}
body:where(.is-light) {
    --bg: white
}
    @media (prefers-color-scheme:dark) {
    :where(body:not(.is-light)) p {
        color: yellow
    }
}
    :where(body.is-dark) p {
    color: yellow
}
    @media (prefers-color-scheme:light) {
    :where(body:not(.is-dark)) p {
        color: green
    }
}
    :where(body.is-light) p {
    color: green
}
`,
    { rootSelector: 'body' }
  )
})
