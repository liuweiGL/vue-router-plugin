import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  server: {
    port: 5000,
    watcher: {
      paths: [
        path.resolve(__dirname, '..', 'dist'),
        path.resolve(__dirname, 'src')
      ]
    }
  },
  alias: {
    dist: path.resolve(__dirname, '..', 'dist')
  }
}
