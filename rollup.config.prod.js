import { terser } from 'rollup-plugin-terser'
import merge from 'webpack-merge'

import { commonConfig, LIBRARY_NAME, resolve } from './rollup.config.common'

const prodConfig = {
  output: [
    {
      file: resolve(`dist/${LIBRARY_NAME}.esm.js`),
      format: 'es',
      sourcemap: true
    },
    {
      name: 'VueRouterPlugin',
      file: resolve(`dist/${LIBRARY_NAME}.umd.js`),
      format: 'umd',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        'vue-router': 'VueRouter'
      }
    }
  ],
  plugins: [terser()]
}

export default merge({}, commonConfig, prodConfig)
