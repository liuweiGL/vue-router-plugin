import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueStackRouter } from 'dist/vue-page-stack.esm'

createApp(App)
  .use(VueStackRouter, { router })
  .mount('#app')
