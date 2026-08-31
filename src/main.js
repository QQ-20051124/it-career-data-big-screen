import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 全局拦截浏览器自身行为导致的 ERR_ABORTED 网络错误
// 这些错误来自：路由切换时浏览器取消未完成请求、媒体元素销毁等，并非应用 Bug
const _origConsoleError = console.error
console.error = function (...args) {
  // 检查是否为浏览器网络层的 ERR_ABORTED（字符串中包含 net::ERR_ABORTED）
  const message = args
    .map(a => {
      if (typeof a === 'string') return a
      if (a && typeof a === 'object') return a.message || a.stack || ''
      return ''
    })
    .join(' ')

  if (/ERR_ABORTED/i.test(message)) {
    // 静默丢弃，不影响其他 console.error 调用
    return
  }

  _origConsoleError.apply(console, args)
}

createApp(App).use(router).mount('#app')
