import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'

// 导入自定义样式
import './styles/variables.css'
import './styles/transitions.css'

const app = createApp(App)

// 注册所有图标
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')
