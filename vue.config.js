const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8080,
    hot: false,
    liveReload: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/data': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('js')
      .include.add(/node_modules\/three/)
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        configFile: require.resolve('./babel.config.js')
      })
  }
})
