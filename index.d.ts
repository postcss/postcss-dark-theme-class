import type { PluginCreator } from 'postcss'

declare const darkClass: PluginCreator<{
  darkSelector?: string
  lightSelector?: string
  rootSelector?: string | string[]
  useWhere?: boolean
  removeMedia?: boolean
}>

export default darkClass
