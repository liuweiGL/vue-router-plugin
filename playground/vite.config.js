import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  alias: {
    dist: path.resolve(__dirname, '..', 'dist')
  }
}
