<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="260px" class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
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
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/applications">
          <el-icon><List /></el-icon>
          <span>投递列表</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
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
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    '/': '数据看板',
    '/applications': '投递列表'
  }
  return titles[route.path] || '数据看板'
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

/* 侧边栏样式 */
.sidebar {
  background: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text .title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
}

.logo-text .subtitle {
  font-size: 13px;
  color: #909399;
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
  border-radius: 10px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.side-menu .el-menu-item:hover {
  background: #f5f7fa !important;
  color: #1e3a5f;
}

.side-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%) !important;
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
  border-top: 1px solid #f0f2f5;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

.footer-info .el-icon {
  font-size: 16px;
  color: #1e3a5f;
}

/* 主体容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fc;
}

/* 顶部导航 */
.top-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
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
  color: #303133;
  margin: 0;
}

/* 主内容区 */
.main-content {
  padding: 24px 32px;
  background: #f8f9fc;
  overflow-y: auto;
}
</style>