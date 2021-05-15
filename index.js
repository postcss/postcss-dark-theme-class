const PREFERS_COLOR_ONLY = /^\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/
const PREFERS_COLOR = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/g

module.exports = (opts = {}) => {
  let dark = opts.darkSelector || '.is-dark'
  let light = `:not(${opts.lightSelector || '.is-light'})`

  function processSelectors(selectors, add) {
    return selectors.map(i => {
      if (i.includes('html')) {
        return i.replace(/html/g, 'html' + add)
      } else if (i.includes(':root')) {
        return i.replace(/:root/g, ':root' + add)
      } else {
        return `html${add} ${i}`
      }
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
    postcssPlugin: 'postcss-dark-theme-class',
    AtRule: {
      media: atrule => {
        if (!atrule.params.includes('dark')) return
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
            } else if (node.type === 'comment') {
              fixed = node.clone()
            }
            last.after(fixed)
            last = fixed
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
            processNodes(fixed, dark)
            processNodes(atrule, light)
          }
        }
      }
    }
  }
}
module.exports.postcss = true
