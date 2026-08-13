import { ref } from 'vue'

const jobDataCache = ref(null)
const loadingCache = ref(false)
const errorCache = ref(null)
const listeners = new Set()

export function useJobData() {
  const data = jobDataCache
  const loading = loadingCache
  const error = errorCache

  async function loadData() {
    if (jobDataCache.value) {
      return jobDataCache.value
    }
    if (loadingCache.value) {
      return new Promise((resolve) => {
        listeners.add(resolve)
      })
    }

    loadingCache.value = true
    errorCache.value = null

    try {
      const response = await fetch('/data/all_cleaned_jobs.json')
      if (!response.ok) {
        throw new Error(`数据加载失败: ${response.status}`)
      }
      const json = await response.json()
      jobDataCache.value = json
      loadingCache.value = false
      listeners.forEach(fn => fn(json))
      listeners.clear()
      return json
    } catch (err) {
      errorCache.value = err.message
      loadingCache.value = false
      listeners.forEach(fn => fn(null))
      listeners.clear()
      throw err
    }
  }

  return { data, loading, error, loadData }
}
