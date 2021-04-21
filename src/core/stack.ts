import { VNode } from 'vue'

export type StackItem = {
  key: string
  vnode: VNode
}

export type StackProps = {
  value?: StackItem[]
}

export class Stack {
  private items: StackItem[]
  constructor(props?: StackProps) {
    this.items = props?.value ?? []
  }
  push(item: StackItem) {
    return this.items.push(item)
  }
  pop() {
    return this.items.pop()
  }
  removeAfter(key: string) {
    const index = this.items.findIndex(item => item.key === key)
    if (index === -1) {
      return undefined
    }
    const start = index + 1
    if (start >= this.items.length) {
      return undefined
    }
    return this.items.splice(start, this.items.length - index - 1)
  }
  clear() {
    const value = this.items
    this.items = []
    return value
  }
  find(key: string) {
    return this.items.find(item => item.key === key)?.vnode
  }
  value(){
    return this.items
  }
}

export const useStack = (() => {
  const stack = new Stack()
  return () => stack
})()
