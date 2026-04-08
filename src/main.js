import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
import './styles/variables.css'
import './styles/transitions.css'
import { leetcodeHot100 } from './data/leetcodeHot100'

// 初始化预设数据 - 确保所有用户都能看到算法题
const STORAGE_KEY = 'job_tracker_data'
const initPresetData = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  let data = stored ? JSON.parse(stored) : null

  // 如果数据不存在或格式不正确，创建空结构
  if (!data || !Array.isArray(data.algorithms)) {
    data = {
      applications: [],
      writtenTests: [],
      interviews: [],
      algorithms: [],
      bagus: []
    }
  }

  // 检查算法题是否需要初始化
  const existingIds = new Set(data.algorithms.map(item => item.leetcodeId))
  const missingQuestions = leetcodeHot100.filter(q => !existingIds.has(q.leetcodeId))

  if (missingQuestions.length > 0) {
    const now = new Date().toISOString()
    const newItems = missingQuestions.map(q => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      ...q,
      familiarity: 1,
      reviewCount: 0,
      createTime: now
    }))
    data.algorithms.push(...newItems)
    data.schemaVersion = 2
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log(`已自动初始化 ${newItems.length} 题算法题`)
  }
}

// 在应用挂载前执行初始化
initPresetData()

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')
