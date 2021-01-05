import { App } from 'vue'
import { Router } from 'vue-router'

export type VueRouterPluginConfig = {
  /**
   * url 中的 key 参数标识
   */
  keyName: string

  /**
   * vue 组件的名称
   */
  componentName: string
}

export type VueRouterPluginOptions = Partial<VueRouterPluginConfig> & {
  /**
   * 路由实例
   */
  router: Router
}

export type VueRouterPluginContext = {
  app: App
  router: Router
}
