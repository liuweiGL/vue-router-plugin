import { VueRouterPluginContext } from 'src/type/interface'

let context: VueRouterPluginContext

export const setContext = (ctx: VueRouterPluginContext) => {
  context = ctx
}

export const useContext = () => {
  return context
}
