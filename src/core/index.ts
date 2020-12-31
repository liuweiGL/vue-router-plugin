import { Plugin } from 'vue'

import { initComponent } from 'src/components/StackRouterView'
import { setConfig } from 'src/config'
import { VueStackRouterOptions } from 'src/type/interface'

import { setContext } from './context'
import { initGuard } from './guard'
import { initRouterProxy } from './proxy'

const VueStackRouter: Plugin = {
  install(app, options: VueStackRouterOptions) {
    const { router } = options
    if (!router) {
      throw Error('\n vue-router is necessary. \n\n')
    }

    setConfig(options)
    setContext({ app, router })

    initRouterProxy()
    initComponent()
    initGuard()
  }
}

export default VueStackRouter