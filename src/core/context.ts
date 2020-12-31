import { VueStackRouterContext } from 'src/type/interface'

let context: VueStackRouterContext

export const setContext = (ctx: VueStackRouterContext) => {
  context = ctx
}

export const useContext = () => {
  return context
}
