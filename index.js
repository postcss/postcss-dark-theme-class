let postcss = require('postcss')

const PREFERS_COLOR_ONLY = /^\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/
const PREFERS_COLOR = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/

function checkClass (cls) {
  if (typeof cls !== 'undefined' && cls.startsWith('.')) {
    let fixed = cls.replace(/^./, '')
    throw new Error(
      `Replace "${ cls }" to "${ fixed }" in postcss-dark-theme-class option`
    )
  }
}

module.exports = postcss.plugin('postcss-dark-theme-class', (opts = { }) => {
  checkClass(opts.darkClass)
  checkClass(opts.lightClass)

  let dark = '.' + (opts.darkClass || 'is-dark')
  let light = ':not(.' + (opts.lightClass || 'is-light') + ')'

  function processSelectors (selectors, add) {
    return selectors.map(i => {
      if (i.includes('html')) {
        return i.replace(/html/g, 'html' + add)
      } else if (i.includes(':root')) {
        return i.replace(/:root/g, ':root' + add)
      } else {
        return `html${ add } ${ i }`
      }
    })
  }

  function processNodes (parent, add) {
    parent.each(node => {
      if (node.type === 'atrule') {
        processNodes(node, add)
      } else if (node.type === 'rule') {
        node.selectors = processSelectors(node.selectors, add)
      }
    })
  }

  return root => {
    root.walkAtRules(atrule => {
      if (atrule.name !== 'media' || !atrule.params.includes('dark')) return
      let params = atrule.params
      if (PREFERS_COLOR_ONLY.test(params)) {
        let last = atrule
        atrule.each(node => {
          let fixed
          if (node.type === 'atrule') {
            fixed = node.clone()
            processNodes(fixed, dark)
            processNodes(node, light)
          } else if (node.type === 'rule') {
            fixed = node.clone({
              selectors: processSelectors(node.selectors, dark)
            })
            node.selectors = processSelectors(node.selectors, light)
          }
          last.after(fixed)
          last = fixed
        })
      } else if (PREFERS_COLOR.test(params) && params.includes(' and ')) {
        if (atrule.params.includes(' and ')) {
          let fixed = atrule.clone({
            params: atrule.params
              .replace(PREFERS_COLOR, '')
              .replace(/^\s*and\s*/i, '')
              .replace(/\s*and\s*$/i, '')
          })
          atrule.after(fixed)
          processNodes(fixed, dark)
          processNodes(atrule, light)
        }
      }
    })
  }
})
