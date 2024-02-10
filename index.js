const PREFERS_COLOR_ONLY = /^\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)$/
const PREFERS_COLOR = /\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)/g
const LIGHT_DARK = /light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)/g
const STRING = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/dg

function escapeRegExp(string) {
  return string.replace(/[$()*+.?[\\\]^{|}-]/g, '\\$&')
}

function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

function addColorSchemeMedia(isDark, propValue, declaration, postcss) {
  let mediaQuery = postcss.atRule({
    name: 'media',
    params: `(prefers-color-scheme:${isDark ? 'dark' : 'light'})`
  })
  mediaQuery.append(
    postcss.rule({
      nodes: [
        postcss.decl({
          prop: declaration.prop,
          value: propValue
        })
      ],
      selector: declaration.parent.selector
    })
  )
  declaration.parent.after(mediaQuery)
}

function replaceLightDark(isDark, declaration, stringBoundaries) {
  return declaration.value.replaceAll(
    LIGHT_DARK,
    (match, lightColor, darkColor, offset) => {
      let isInsideString = stringBoundaries.some(
        boundary => offset > boundary[0] && offset < boundary[1]
      )
      if (isInsideString) return match
      return isDark ? darkColor : lightColor
    }
  )
}

module.exports = (opts = {}) => {
  let dark = opts.darkSelector || '.is-dark'
  let light = opts.lightSelector || '.is-light'

  let roots = opts.rootSelector || ['html', ':root']
  if (!Array.isArray(roots)) roots = [roots]

  let useWhere = opts.useWhere ?? true

  let uniqueRoots = roots
  if (uniqueRoots.includes('html')) {
    uniqueRoots = uniqueRoots.filter(i => i !== ':root')
  }

  function processSelectors(selectors, add) {
    return selectors.map(selector => {
      let changed = false
      for (let root of roots) {
        if (selector.includes(root)) {
          changed = true
          if (useWhere) {
            selector = replaceAll(selector, root, `${root}:where(${add})`)
          } else {
            selector = replaceAll(selector, root, `${root}${add}`)
          }
        }
      }
      if (!changed) {
        selector = uniqueRoots
          .map(root => {
            if (useWhere) {
              return `:where(${root}${add}) ${selector}`
            } else {
              return `${root}${add} ${selector}`
            }
          })
          .join(',')
      }
      return selector
    })
  }

  function processNodes(parent, add) {
    parent.each(node => {
      if (node.type === 'atrule') {
        processNodes(node, add)
      } else if (node.type === 'rule') {
        node.selectors = processSelectors(node.selectors, add)
      }
    })
  }

  return {
    AtRuleExit: {
      media: atrule => {
        if (!atrule.params.includes('dark') && !atrule.params.includes('light')) return

        let params = atrule.params
        let fixedSelector = params.includes('dark') ? dark : light
        let nodeSelector = `:not(${params.includes('dark') ? light : dark})`

        if (PREFERS_COLOR_ONLY.test(params)) {
          let last = atrule
          atrule.each(node => {
            let fixed
            if (node.type === 'atrule') {
              fixed = node.clone()
              processNodes(fixed, fixedSelector)
              processNodes(node, nodeSelector)
            } else if (node.type === 'rule') {
              if (!node.selector.includes(nodeSelector)) {
                fixed = node.clone({
                  selectors: processSelectors(node.selectors, fixedSelector)
                })
                node.selectors = processSelectors(node.selectors, nodeSelector)
              }
            } else if (node.type === 'comment') {
              fixed = node.clone()
            }
            if (fixed) {
              last.after(fixed)
              last = fixed
            }
          })
        } else if (PREFERS_COLOR.test(params) && params.includes(' and ')) {
          if (atrule.params.includes(' and ')) {
            let fixed = atrule.clone({
              params: atrule.params
                .replace(PREFERS_COLOR, '')
                .replace(/\s+and\s+and/i, ' and')
                .replace(/^\s*and\s+/i, '')
                .replace(/\s+and\s*$/i, '')
            })
            atrule.after(fixed)
            processNodes(fixed, fixedSelector)
            processNodes(atrule, nodeSelector)
          }
        }
      }
    },
    DeclarationExit: (declaration, { postcss }) => {
      if (!declaration.value.includes('light-dark')) return

      let stringBoundaries = []
      let value = declaration.value.slice()
      let match = STRING.exec(value)
      while (match) {
        stringBoundaries.push(match.indices[0])
        match = STRING.exec(value)
      }

      let lightValue = replaceLightDark(false, declaration, stringBoundaries)
      if (declaration.value === lightValue) return
      let darkValue = replaceLightDark(true, declaration, stringBoundaries)

      addColorSchemeMedia(false, lightValue, declaration, postcss)
      addColorSchemeMedia(true, darkValue, declaration, postcss)

      let parent = declaration.parent
      declaration.remove()
      if (parent.nodes.length === 0) {
        parent.remove()
      }
    },
    postcssPlugin: 'postcss-dark-theme-class'
  }
}
module.exports.postcss = true
