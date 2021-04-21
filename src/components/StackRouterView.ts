import {
  callWithAsyncErrorHandling,
  ComponentInternalInstance,
  defineComponent,
  ErrorCodes,
  getCurrentInstance,
  PropType,
  queuePostFlushCb,
  RendererElement,
  RendererNode,
  setTransitionHooks,
  SuspenseBoundary,
  VNode,
} from 'vue'
import { RouteLocationNormalizedLoaded } from 'vue-router'

import { ShapeFlags } from '@vue/shared'

import { useConfig } from 'src/config'
import { Action } from 'src/config/enum'
import { useAction } from 'src/core/action'
import { useContext } from 'src/core/context'
import { StackItem, useStack } from 'src/core/stack'

type ComponentContext = {
  renderer: any
  activate: (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    isSVG: boolean,
    optimized: boolean
  ) => void
  deactivate: (vnode: VNode) => void
}

const enum MoveType {
  ENTER = 0,
  LEAVE = 1,
  REORDER = 2
}

function resetShapeFlag(vnode: VNode) {
  let shapeFlag = vnode.shapeFlag
  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  }
  if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE
  }
  vnode.shapeFlag = shapeFlag
}

function queuePostRenderEffect(
  fn: Function | Function[],
  suspense: SuspenseBoundary | null
): void {
  if (suspense && suspense.pendingBranch) {
    if (Array.isArray(fn)) {
      suspense.effects.push(...fn)
    } else {
      suspense.effects.push(fn)
    }
  } else {
    queuePostFlushCb(fn)
  }
}

function invokeVNodeHook(
  hook: any,
  instance: ComponentInternalInstance | null,
  vnode: VNode,
  prevVNode: VNode | null = null
) {
  callWithAsyncErrorHandling(hook, instance, ErrorCodes.VNODE_HOOK, [
    vnode,
    prevVNode
  ])
}

function invokeArrayFns (fns: Function[], arg?: any){
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}

/**
 * TODO: 支持 onActivated 跟 onDeactivated 事件
 */
export const StackRouterView = defineComponent({
  inheritRef: true,
  __isKeepAlive: true,
  props: {
    component: {
      type: Object as PropType<VNode>,
      default: undefined
    },
    route: {
      type: Object as PropType<RouteLocationNormalizedLoaded>,
      required: true
    }
  },
  setup(props) {
    const stack = useStack()
    const action = useAction()
    const { keyName } = useConfig()
    const instance = getCurrentInstance() as any
    const sharedContext = instance.ctx as ComponentContext
    const parentSuspense = instance.suspense
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement }
      }
    } = sharedContext
    const storageContainer = createElement('div')

    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance = vnode.component!
      move(vnode, container, anchor, MoveType.ENTER, parentSuspense)
      // in case props have changed
      patch(
        instance.vnode,
        vnode,
        container,
        anchor,
        instance,
        parentSuspense,
        isSVG,
        vnode.slotScopeIds,
        optimized
      )
      queuePostRenderEffect(() => {
        instance.isDeactivated = false
        if ((instance as any).a) {
          invokeArrayFns((instance as any).a)
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance.parent, vnode)
        }
      }, parentSuspense)
    }

    sharedContext.deactivate = (vnode: VNode) => {
      const instance = vnode.component!
      move(vnode, storageContainer, null, MoveType.LEAVE, parentSuspense)
      queuePostRenderEffect(() => {
        if ((instance as any).da) {
          invokeArrayFns((instance as any).da)
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance.parent, vnode)
        }
        instance.isDeactivated = true
      }, parentSuspense)
    }

    function unmount(items?: StackItem[]) {
      if (!items) {
        return
      }
      while (items.length) {
        const item = items.pop()
        if (item) {
          // reset the shapeFlag so it can be properly unmounted
          resetShapeFlag(item.vnode)
          _unmount(item.vnode, instance, parentSuspense)
        }
      }
    }

    return () => {
      const { component, route } = props
      const key = route.query[keyName] as string
      const cachedVNode = stack.find(key)
      const vnode = component

      if (!vnode) {
        return vnode
      }

      if (cachedVNode) {
        unmount(stack.slice(key))

        if (cachedVNode.transition) {
          // recursively update transition hooks on subTree
          setTransitionHooks(cachedVNode, cachedVNode.transition)
        }

        // avoid vnode being mounted as fresh
        cachedVNode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
        return cachedVNode
      }

      if (action.value === Action.REPLACE) {
        unmount(stack.clear())
      }

      stack.push({
        key,
        vnode
      })

      // avoid vnode being unmounted
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  }
})

export const initComponent = () => {
  const { componentName } = useConfig()
  const { app } = useContext()

  app.component(componentName, StackRouterView)
}
