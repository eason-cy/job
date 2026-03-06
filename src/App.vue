<template>
  <el-container class="app-container theme-transition">
    <!-- 侧边栏 -->
    <el-aside width="260px" class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <el-icon :size="36"><Document /></el-icon>
          </div>
          <div class="logo-text">
            <span class="title">南京邮电大学</span>
            <span class="subtitle">校招投递记录系统</span>
          </div>
        </div>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        class="side-menu"
        :collapse="false"
      >
        <el-menu-item index="/" class="menu-item-hover">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/applications" class="menu-item-hover">
          <el-icon><List /></el-icon>
          <span>投递列表</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <!-- 主题切换按钮 -->
        <div class="theme-toggle" @click="toggleTheme">
          <div class="toggle-wrapper" :class="{ 'is-dark': isDark }">
            <div class="toggle-thumb">
              <el-icon v-if="isDark"><Moon /></el-icon>
              <el-icon v-else><Sunny /></el-icon>
            </div>
          </div>
          <span class="toggle-text">{{ isDark ? '暗色模式' : '亮色模式' }}</span>
        </div>
        <div class="footer-info">
          <el-icon><School /></el-icon>
          <span>南京邮电大学</span>
        </div>
      </div>
    </el-aside>

    <!-- 主体区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="top-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <el-button class="header-btn" circle @click="toggleTheme">
            <el-icon v-if="isDark"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="slide-left" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDark = ref(localStorage.getItem('theme') === 'dark')

const pageTitle = computed(() => {
  const titles = {
    '/': '数据看板',
    '/applications': '投递列表'
  }
  return titles[route.path] || '数据看板'
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  height: 100%;
  display: flex;
}

/* 侧边栏样式 - 玻璃拟态 */
.sidebar {
  background: var(--bg-sidebar);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-gradient);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text .title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.logo-text .subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

/* 菜单样式 */
.side-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  padding: 12px 0;
}

.side-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  padding: 0 16px !important;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.side-menu .el-menu-item:hover {
  background: var(--bg-glass) !important;
  color: var(--primary-color);
}

.side-menu .el-menu-item.is-active {
  background: var(--primary-gradient) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
}

.side-menu .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 12px;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

/* 主题切换 */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--bg-glass);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--bg-secondary);
}

.toggle-wrapper {
  width: 44px;
  height: 24px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-wrapper.is-dark {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-wrapper.is-dark .toggle-thumb {
  left: 22px;
}

.toggle-thumb .el-icon {
  font-size: 12px;
  color: #f59e0b;
}

.toggle-wrapper.is-dark .toggle-thumb .el-icon {
  color: #6366f1;
}

.toggle-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.footer-info .el-icon {
  font-size: 16px;
  color: var(--primary-color);
}

/* 主体容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

/* 顶部导航 */
.top-header {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
}

.header-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 主内容区 */
.main-content {
  padding: 24px 32px;
  background: var(--bg-primary);
  overflow-y: auto;
}
</style>