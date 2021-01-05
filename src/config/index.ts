import { pick } from 'src/lib/utils'
import { VueRouterPluginConfig } from 'src/type/interface'

import { COMPONENT_NAME, KEY_NAME } from './constant'

const defaultConfig: VueRouterPluginConfig = {
  keyName: KEY_NAME,
  componentName: COMPONENT_NAME
}

let config: VueRouterPluginConfig

export const setConfig = (options: Partial<VueRouterPluginConfig>) => {
  config = {
    ...defaultConfig,
    ...pick(options, 'keyName', 'componentName')
  }
}

export const useConfig = () => {
  return config
}
