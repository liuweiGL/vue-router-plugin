# vue-stack-router

The vue-router plugin for vue3

> Fork from [vue-page-stack](https://github.com/hezhongfeng/vue-page-stack)

## quick start

```
npm install vue-stack-router

```

main.js

```ts
import { VueStackRouter } from 'vue-stack-router'

import router from './router'

createApp(App).use(VueStackRouter, { router }).mount('#app')
```

App.vue

```vue
<template>
  <router-view>
    <template v-slot="{ Component, route }">
      <stack-router-view
        :component="Component"
        :route="route"
      />
    </template>
  </router-view>
</template>
```

### Api

| api       | desc               |
| --------- | ------------------ |
| useAction | Get router action  |
| useStack  | Get current stacks |

## Example

See [Playground Project](playground).

## Contributing

See [Contributing Guide](.github/contributing.md).
