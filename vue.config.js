const { InjectManifest } = require('workbox-webpack-plugin')

module.exports = {
  assetsDir: 'static',
  configureWebpack (config) {
    config.plugins.push(
      new InjectManifest({
        swSrc: './src/utils/service-worker.js',
        importsDirectory: 'static/js',
        importWorkboxFrom: 'disabled', // 不使用谷歌workerbox的cdn
        exclude: [/\.map$/, /^manifest.*\.js$/, /\.html$/]
      })
    )
  }
}
