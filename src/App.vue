<template>
  <el-container class="app-container">
    <!-- Ambient Background Effect -->
    <div class="ambient-bg">
      <div class="ambient-gradient"></div>
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
    </div>

    <!-- Sidebar -->
    <el-aside width="280px" class="sidebar">
      <!-- Brand Header -->
      <div class="sidebar-header">
        <div class="brand-wrapper">
          <div class="brand-icon">
            <div class="brand-icon-inner">
              <el-icon :size="28"><Document /></el-icon>
            </div>
            <div class="brand-icon-ring"></div>
          </div>
          <div class="brand-text">
            <span class="brand-title">南京邮电大学</span>
            <span class="brand-subtitle">校招投递管理系统</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav-section">
        <div class="nav-label">导航菜单</div>
        <el-menu
          :default-active="$route.path"
          router
          class="side-menu"
          :collapse="false"
        >
          <el-menu-item index="/" class="menu-item">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <span class="menu-text">数据看板</span>
            </div>
          </el-menu-item>
          <el-menu-item index="/applications" class="menu-item">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper">
                <el-icon><List /></el-icon>
              </div>
              <span class="menu-text">投递列表</span>
            </div>
          </el-menu-item>
          <el-menu-item index="/algorithms" class="menu-item">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper">
                <el-icon><Cpu /></el-icon>
              </div>
              <span class="menu-text">算法题库</span>
            </div>
          </el-menu-item>
          <el-menu-item index="/bagus" class="menu-item">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper">
                <el-icon><Notebook /></el-icon>
              </div>
              <span class="menu-text">八股题库</span>
            </div>
          </el-menu-item>
          <el-menu-item index="/interview-records" class="menu-item">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper">
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <span class="menu-text">面试记录</span>
            </div>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <!-- Theme Toggle -->
        <div class="theme-control">
          <div class="theme-toggle-track" :class="{ 'is-dark': isDark }" @click="toggleTheme">
            <div class="theme-toggle-thumb">
              <el-icon v-if="isDark" class="theme-icon"><Moon /></el-icon>
              <el-icon v-else class="theme-icon"><Sunny /></el-icon>
            </div>
          </div>
          <span class="theme-label">{{ isDark ? '暗色主题' : '亮色主题' }}</span>
        </div>

        <!-- Footer Info -->
        <div class="footer-brand">
          <el-icon class="footer-icon"><School /></el-icon>
          <span class="footer-text">NUPT · 2026</span>
        </div>
      </div>
    </el-aside>

    <!-- Main Content Area -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="top-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="title-accent"></div>
        </div>
        <div class="header-right">
          <el-button class="theme-btn btn-click" @click="toggleTheme">
            <el-icon v-if="isDark"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </el-button>
        </div>
      </el-header>

      <!-- Main Content -->
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
    '/applications': '投递列表',
    '/algorithms': '算法题库',
    '/bagus': '八股题库',
    '/interview-records': '面试记录'
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
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style>
/* === Reset & Base === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

/* === App Container === */
.app-container {
  height: 100%;
  display: flex;
  position: relative;
}

/* === Ambient Background === */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ambient-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-gradient);
  top: 10%;
  right: 20%;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  bottom: 20%;
  left: 30%;
  animation-delay: -4s;
}

[data-theme="dark"] .ambient-orb {
  opacity: 0.25;
}

/* === Sidebar === */
.sidebar {
  background: var(--bg-sidebar);
  backdrop-filter: var(--glass-blur-strong);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 100;
}

/* Brand Header */
.sidebar-header {
  padding: 32px 24px 24px;
  border-bottom: 1px solid var(--border-light);
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  position: relative;
  width: 56px;
  height: 56px;
}

.brand-icon-inner {
  width: 56px;
  height: 56px;
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--glow-primary);
  position: relative;
  z-index: 2;
}

.brand-icon-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid var(--primary-light);
  border-radius: var(--radius-xl);
  opacity: 0.3;
  animation: breathe 3s ease-in-out infinite;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

/* Navigation */
.nav-section {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-label {
  padding: 0 24px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.side-menu {
  border-right: none;
  background: transparent;
  padding: 0 12px;
}

.side-menu .el-menu-item {
  height: 52px;
  line-height: 52px;
  margin: 4px 0;
  padding: 0 16px !important;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-icon-wrapper .el-icon {
  font-size: 18px;
  color: var(--text-secondary);
  transition: color 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-text {
  font-size: 15px;
  font-weight: 500;
}

/* Menu Hover */
.side-menu .el-menu-item:hover {
  background: var(--bg-glass) !important;
}

.side-menu .el-menu-item:hover .menu-icon-wrapper {
  background: var(--primary-gradient-subtle);
}

.side-menu .el-menu-item:hover .menu-icon-wrapper .el-icon {
  color: var(--primary-color);
}

.side-menu .el-menu-item:hover .menu-text {
  color: var(--primary-color);
}

/* Menu Active */
.side-menu .el-menu-item.is-active {
  background: var(--primary-gradient) !important;
  color: white !important;
  box-shadow: var(--glow-primary);
}

.side-menu .el-menu-item.is-active .menu-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.side-menu .el-menu-item.is-active .menu-icon-wrapper .el-icon {
  color: white;
}

.side-menu .el-menu-item.is-active .menu-text {
  color: white;
  font-weight: 600;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-light);
}

.theme-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-control:hover {
  background: var(--bg-secondary);
}

.theme-toggle-track {
  width: 52px;
  height: 28px;
  background: linear-gradient(135deg, var(--accent-amber) 0%, var(--accent-coral) 100%);
  border-radius: var(--radius-full);
  position: relative;
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.theme-toggle-track.is-dark {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.theme-toggle-thumb {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.theme-toggle-track.is-dark .theme-toggle-thumb {
  left: 27px;
}

.theme-icon {
  font-size: 12px;
  color: var(--accent-amber);
}

.theme-toggle-track.is-dark .theme-icon {
  color: #3b82f6;
}

.theme-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}

.footer-icon {
  font-size: 16px;
  color: var(--primary-color);
}

.footer-text {
  opacity: 0.8;
}

/* === Main Container === */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 50;
  overflow: hidden;
}

/* Header */
.top-header {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 72px;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
}

.title-accent {
  width: 40px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-btn:hover {
  background: var(--primary-gradient-subtle);
  color: var(--primary-color);
}

.theme-btn .el-icon {
  font-size: 20px;
}

/* Main Content */
.main-content {
  padding: 32px 40px;
  overflow-y: auto;
  position: relative;
}

/* Scrollbar Styling */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* === Float Animation for Ambient === */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(30px, -20px);
  }
  66% {
    transform: translate(-20px, 20px);
  }
}
</style>