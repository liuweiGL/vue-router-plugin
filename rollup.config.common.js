import path from 'path'

import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'

import pkg from './package.json'

export const resolve = filePath => path.resolve(__dirname, filePath)

export const LIBRARY_NAME = pkg.name

export const commonConfig = {
  input: 'src/index.ts',
  external: ['vue', 'vue-router'],
  plugins: [
    del({ targets: 'dist' }),
    nodeResolve(),
    typescript(),
    alias({
      entries: [
        {
          find: 'src',
          replacement: resolve('src')
        }
      ]
    })
  ]
}
