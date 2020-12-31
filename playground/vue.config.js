const path = require('path')

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map',
    resolve: {
      alias: {
        dist: path.resolve(__dirname, '..', 'dist')
      }
    },
  }
}
