import { watch } from 'vue'
import { logError } from '../utils/logger'

export const usePersistentQueryState = (key, searchForm, pagination = null) => {
  const load = () => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.searchForm) {
        Object.assign(searchForm, parsed.searchForm)
      }
      if (pagination && parsed.pagination) {
        Object.assign(pagination, parsed.pagination)
      }
    } catch (error) {
      logError('state:load', error, { key })
    }
  }

  const save = () => {
    try {
      const payload = { searchForm: { ...searchForm } }
      if (pagination) {
        payload.pagination = { ...pagination }
      }
      localStorage.setItem(key, JSON.stringify(payload))
    } catch (error) {
      logError('state:save', error, { key })
    }
  }

  watch(searchForm, save, { deep: true })
  if (pagination) {
    watch(pagination, save, { deep: true })
  }

  return { load, save }
}
