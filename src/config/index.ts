import { pick } from 'src/lib/utils'
import { VueStackRouterConfig } from 'src/type/interface'

import { COMPONENT_NAME, KEY_NAME } from './constant'

const defaultConfig: VueStackRouterConfig = {
  keyName: KEY_NAME,
  componentName: COMPONENT_NAME
}

let config: VueStackRouterConfig

export const setConfig = (options: Partial<VueStackRouterConfig>) => {
  config = {
    ...defaultConfig,
    ...pick(options, 'keyName', 'componentName')
  }
}

export const useConfig = () => {
  return config
}
