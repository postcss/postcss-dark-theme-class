let postcss = require('postcss')

const PREFERS_COLOR = /^\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/

module.exports = postcss.plugin('postcss-dark-theme-class', (opts = { }) => {
  let darkClass = opts.darkClass || 'is-dark'

  function processSelectors (selectors) {
    return selectors.map(i => {
      if (i.includes('html')) {
        return i.replace(/html/g, 'html.' + darkClass)
      } else if (i.includes(':root')) {
        return i.replace(/:root/g, ':root.' + darkClass)
      } else {
        return 'html.' + darkClass + ' ' + i
      }
    })
  }

  function processNodes (parent) {
    parent.each(node => {
      if (node.type === 'atrule') {
        processNodes(node)
      } else if (node.type === 'rule') {
        node.selectors = processSelectors(node.selectors)
      }
    })
  }

  return root => {
    root.walkAtRules(atrule => {
      if (atrule.name !== 'media' || !atrule.params.includes('dark')) return
      if (!PREFERS_COLOR.test(atrule.params)) return

      let last = atrule
      atrule.each(node => {
        let fixed
        if (node.type === 'atrule') {
          fixed = node.clone()
          processNodes(fixed)
        } else if (node.type === 'rule') {
          fixed = node.clone({ selectors: processSelectors(node.selectors) })
        }
        last.after(fixed)
        last = fixed
      })
    })
  }
})
