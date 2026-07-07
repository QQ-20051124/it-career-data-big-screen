const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
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
