import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueRouterPlugin from './lib/vue-router-plugin.esm.js'

createApp(App).use(VueRouterPlugin, { router }).mount('#app')
