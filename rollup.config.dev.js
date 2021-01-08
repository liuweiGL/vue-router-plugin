import merge from 'webpack-merge'

import { commonConfig, LIBRARY_NAME, resolve } from './rollup.config.common'

const devConfig = {
  output: {
    file: resolve(`playground/src/lib/${LIBRARY_NAME}.esm.js`),
    format: 'es',
    sourcemap: true
  },
  watch: {
    clearScreen: true,
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}

export default merge({}, commonConfig, devConfig)
