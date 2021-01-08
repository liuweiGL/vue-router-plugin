import { defineComponent, getCurrentInstance, setTransitionHooks } from 'vue';

/**
 * 创建一个随机的字符串 key
 *
 * @param len 字符串的长度
 */
const createKey = (len = 6) => {
    return Math.random()
        .toString(16)
        .substring(2, len + 2);
};
/**
 * 判断值是否为 `null` | `undefined`
 *
 * @param value 值
 */
const isNil = (value) => {
    return value === null || value === undefined;
};
/**
 * 判断值是否为 `isNil` |  `空字符串`
 * @param value 值
 */
const isEmpty = (value) => {
    return isNil(value) || value === '';
};
/**
 * 从对象中获取指定集合的值，忽略 null & undefined 值，返回新的对象
 *
 * @param data 数据源
 * @param keys 键集合
 */
const pick = (data, ...keys) => {
    const result = {};
    if (!(data && keys)) {
        return result;
    }
    for (const key of keys) {
        if (!isNil(data[key])) {
            result[key] = data[key];
        }
    }
    return result;
};

/**
 * 组件的 name 属性
 */
const COMPONENT_NAME = 'StackRouterView';
/**
 * url 中的 key 参数标识
 */
const KEY_NAME = 'page_key';

const defaultConfig = {
    keyName: KEY_NAME,
    componentName: COMPONENT_NAME
};
let config;
const setConfig = (options) => {
    config = {
        ...defaultConfig,
        ...pick(options, 'keyName', 'componentName')
    };
};
const useConfig = () => {
    return config;
};

/**
 * router 执行的动作
 */
var Action;
(function (Action) {
    Action["PUSH"] = "push";
    Action["GO"] = "go";
    Action["REPLACE"] = "replace";
    Action["BACK"] = "back";
    Action["FORWARD"] = "forward";
})(Action || (Action = {}));

const action = { value: Action.PUSH };
const setAction = (value) => {
    action.value = value;
};
const useAction = () => {
    return action;
};

let context;
const setContext = (ctx) => {
    context = ctx;
};
const useContext = () => {
    return context;
};

class Stack {
    constructor(props) {
        this.value = props?.value ?? [];
    }
    push(item) {
        return this.value.push(item);
    }
    pop() {
        return this.value.pop();
    }
    removeAfter(key) {
        const index = this.value.findIndex(item => item.key === key);
        if (index === -1) {
            return undefined;
        }
        const start = index + 1;
        if (start >= this.value.length) {
            return undefined;
        }
        return this.value.splice(start, this.value.length - index - 1);
    }
    clear() {
        const value = this.value;
        this.value = [];
        return value;
    }
    get(key) {
        return this.value.find(item => item.key === key)?.vnode;
    }
}
const useStack = (() => {
    const stack = new Stack();
    return () => stack;
})();

function resetShapeFlag(vnode) {
    let shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
        shapeFlag -= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
    }
    if (shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
        shapeFlag -= 512 /* COMPONENT_KEPT_ALIVE */;
    }
    vnode.shapeFlag = shapeFlag;
}
const StackRouterView = defineComponent({
    inheritRef: true,
    __isKeepAlive: true,
    props: {
        component: {
            type: Object,
            default: undefined
        },
        route: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const stack = useStack();
        const action = useAction();
        const { keyName } = useConfig();
        const instance = getCurrentInstance();
        const sharedContext = instance.ctx;
        const parentSuspense = instance.suspense;
        const { renderer: { m: move, um: _unmount, o: { createElement } } } = sharedContext;
        const storageContainer = createElement('div');
        sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
            move(vnode, container, anchor, 0 /* ENTER */, parentSuspense);
        };
        sharedContext.deactivate = (vnode) => {
            move(vnode, storageContainer, null, 1 /* LEAVE */, parentSuspense);
        };
        function unmount(items) {
            if (!items) {
                return;
            }
            while (items.length) {
                const item = items.pop();
                if (item) {
                    // reset the shapeFlag so it can be properly unmounted
                    resetShapeFlag(item.vnode);
                    _unmount(item.vnode, instance, parentSuspense);
                }
            }
        }
        return () => {
            const { component, route } = props;
            console.log(route);
            const key = route.query[keyName];
            const cachedVNode = stack.get(key);
            const vnode = component;
            if (!vnode) {
                return vnode;
            }
            if (cachedVNode) {
                unmount(stack.removeAfter(key));
                if (cachedVNode.transition) {
                    // recursively update transition hooks on subTree
                    setTransitionHooks(cachedVNode, cachedVNode.transition);
                }
                // avoid vnode being mounted as fresh
                cachedVNode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */;
                return cachedVNode;
            }
            if (action.value === Action.REPLACE) {
                unmount(stack.clear());
            }
            stack.push({
                key,
                vnode
            });
            // avoid vnode being unmounted
            vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
            return vnode;
        };
    }
});
const initComponent = () => {
    const { componentName } = useConfig();
    const { app } = useContext();
    app.component(componentName, StackRouterView);
};

const initGuard = () => {
    const { keyName } = useConfig();
    const { router } = useContext();
    const action = useAction();
    router.beforeEach((to, from) => {
        if (isEmpty(to.query[keyName])) {
            to.query[keyName] = createKey();
            const replace = action.value === Action.REPLACE || isEmpty(from.query[keyName]);
            return {
                hash: to.hash,
                path: to.path,
                name: to.name,
                params: to.params,
                query: to.query,
                meta: to.meta,
                replace: replace
                // force: replace
            };
        }
        return true;
    });
};

/**
 * 包装一层 router api，用于跟踪执行的动作
 */
const initRouterProxy = () => {
    const { app, router } = useContext();
    const routerPush = router.push.bind(router);
    const routerGo = router.go.bind(router);
    const routerReplace = router.replace.bind(router);
    const routerBack = router.back.bind(router);
    const routerForward = router.forward.bind(router);
    // 还没安装 vue-router
    if (!app.config.globalProperties.$router) {
        app.use(router);
    }
    router.push = to => {
        setAction(Action.PUSH);
        return routerPush(to);
    };
    router.go = n => {
        setAction(Action.GO);
        routerGo(n);
    };
    router.replace = to => {
        setAction(Action.REPLACE);
        return routerReplace(to);
    };
    router.back = () => {
        setAction(Action.BACK);
        routerBack();
    };
    router.forward = () => {
        setAction(Action.FORWARD);
        routerForward();
    };
};

const VueRouterPlugin = {
    install(app, options) {
        const { router } = options;
        if (!router) {
            throw Error('\n vue-router is necessary. \n\n');
        }
        setConfig(options);
        setContext({ app, router });
        initRouterProxy();
        initComponent();
        initGuard();
    }
};

export default VueRouterPlugin;
export { useAction, useStack };
//# sourceMappingURL=vue-router-plugin.esm.js.map
