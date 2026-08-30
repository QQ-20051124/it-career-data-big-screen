const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8080,
    client: {
      overlay: {
        runtimeErrors: (error) => {
          const msg = (error?.message || '').toString().toLowerCase()
          if (msg.includes('script error') || msg.includes('err_aborted') || msg.includes('media')) return false
          return true
        }
      }
    },
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
