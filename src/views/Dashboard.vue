<template>
  <div class="dashboard">
    <!-- Hero Stats Grid -->
    <div class="stats-hero">
      <div
        class="stat-card"
        v-for="(stat, index) in statusStats"
        :key="stat.status"
        :style="{ '--card-index': index }"
      >
        <div class="stat-card-inner">
          <div class="stat-glow" :style="{ background: stat.gradient }"></div>
          <div class="stat-visual">
            <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
              <component :is="stat.icon" :size="28" />
            </div>
            <div class="stat-ring"></div>
          </div>
          <div class="stat-data">
            <div class="stat-value number-animate">{{ stat.count }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-indicator">
            <div class="indicator-bar" :style="{ background: stat.gradient, width: stat.percentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="actions-section">
      <div class="section-header">
        <h3 class="section-title">快捷操作</h3>
        <div class="section-accent"></div>
      </div>
      <div class="actions-grid">
        <div class="action-card btn-click" @click="$router.push('/applications')">
          <div class="action-icon">
            <el-icon :size="24"><Plus /></el-icon>
          </div>
          <span class="action-text">新增投递</span>
        </div>
        <div class="action-card btn-click" @click="$router.push('/applications')">
          <div class="action-icon">
            <el-icon :size="24"><List /></el-icon>
          </div>
          <span class="action-text">查看列表</span>
        </div>
        <div class="action-card btn-click" @click="handleExport">
          <div class="action-icon">
            <el-icon :size="24"><Download /></el-icon>
          </div>
          <span class="action-text">导出备份</span>
        </div>
        <el-upload class="action-upload" :show-file-list="false" accept=".json" :before-upload="handleImport">
          <div class="action-card btn-click">
            <div class="action-icon">
              <el-icon :size="24"><Upload /></el-icon>
            </div>
            <span class="action-text">导入备份</span>
          </div>
        </el-upload>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="section-header">
        <h3 class="section-title">状态分布</h3>
        <div class="section-accent"></div>
      </div>
      <div class="chart-container-wrapper">
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { applicationApi, exportData, importData } from '../api'
import { ElMessage } from 'element-plus'
import { Clock, EditPen, Edit, ChatDotRound, Trophy, CircleClose, Plus, List, Download, Upload } from '@element-plus/icons-vue'

const statistics = ref({
  total: 0,
  pending: 0,
  interviewing: 0,
  statusDistribution: {}
})

const pieChartRef = ref(null)
let pieChart = null

const statusStats = computed(() => {
  const configs = [
    { status: '待处理', label: '待处理', icon: Clock, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
    { status: '测评中', label: '测评中', icon: EditPen, gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    { status: '笔试中', label: '笔试中', icon: Edit, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    { status: '面试中', label: '面试中', icon: ChatDotRound, gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' },
    { status: '已offer', label: '已获Offer', icon: Trophy, gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { status: '已淘汰', label: '已淘汰', icon: CircleClose, gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)' }
  ]

  const total = statistics.value.total || 1
  return configs.map(config => ({
    ...config,
    count: statistics.value.statusDistribution[config.status] || 0,
    percentage: Math.round((statistics.value.statusDistribution[config.status] || 0) / total * 100)
  }))
})

const fetchStatistics = async () => {
  try {
    const response = await applicationApi.getStatistics()
    statistics.value = response.data
    renderPieChart()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const getChartColors = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  if (isDark) {
    return {
      '待处理': '#0ea5e9',
      '测评中': '#fbbf24',
      '笔试中': '#a78bfa',
      '面试中': '#2dd4bf',
      '已offer': '#34d399',
      '已淘汰': '#94a3b8'
    }
  }
  return {
    '待处理': '#0ea5e9',
    '测评中': '#f59e0b',
    '笔试中': '#8b5cf6',
    '面试中': '#14b8a6',
    '已offer': '#10b981',
    '已淘汰': '#64748b'
  }
}

const renderPieChart = () => {
  if (!pieChartRef.value) return

  if (pieChart) {
    pieChart.dispose()
  }

  pieChart = echarts.init(pieChartRef.value)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const colorMap = getChartColors()

  const data = Object.entries(statistics.value.statusDistribution).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: colorMap[name] || '#10b981' }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: 12,
      padding: [12, 16],
      textStyle: {
        color: isDark ? '#f1f5f9' : '#0f172a',
        fontSize: 14,
        fontWeight: 500
      },
      extraCssText: 'box-shadow: 0 8px 16px rgba(0,0,0,0.1);'
    },
    legend: {
      orient: 'horizontal',
      bottom: 24,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 24,
      textStyle: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 13,
        fontWeight: 500
      },
      icon: 'circle'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#1e293b' : '#fff',
          borderWidth: 3
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#0f172a'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowColor: 'rgba(0, 0, 0, 0.25)'
          }
        },
        data
      }
    ]
  }

  pieChart.setOption(option)
}

const handleExport = () => {
  exportData()
  ElMessage.success('数据已导出')
}

const handleImport = async (file) => {
  try {
    await importData(file)
    ElMessage.success('数据导入成功')
    fetchStatistics()
  } catch (error) {
    ElMessage.error(error.message)
  }
  return false
}

const handleThemeChange = () => {
  renderPieChart()
}

let themeObserver = null

onMounted(() => {
  fetchStatistics()
  themeObserver = new MutationObserver(handleThemeChange)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  if (pieChart) {
    pieChart.resize()
  }
}

onUnmounted(() => {
  if (pieChart) {
    pieChart.dispose()
  }
  if (themeObserver) {
    themeObserver.disconnect()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1400px;
}

/* === Stats Hero Grid === */
.stats-hero {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.stat-card {
  position: relative;
  animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--card-index, 0) * 80ms);
  opacity: 0;
}

.stat-card-inner {
  position: relative;
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stat-card-inner:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--border-strong);
}

.stat-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0.06;
  pointer-events: none;
}

.stat-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
}

.stat-ring {
  position: absolute;
  width: 68px;
  height: 68px;
  border: 2px dashed var(--border-color);
  border-radius: 50%;
  opacity: 0.5;
}

.stat-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.04em;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  text-align: center;
}

.stat-indicator {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.indicator-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: calc(var(--card-index, 0) * 100ms + 400ms);
}

/* === Section Headers === */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-accent {
  width: 32px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

/* === Actions Section === */
.actions-section {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  background: var(--primary-gradient-subtle);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.action-card:hover .action-icon {
  background: var(--primary-gradient);
  color: white;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--primary-color);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.action-card:hover .action-text {
  color: var(--primary-color);
}

.action-upload {
  display: block !important;
}

.action-upload :deep(.el-upload) {
  display: block !important;
}

/* === Charts Section === */
.charts-section {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.chart-container-wrapper {
  height: 340px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

/* === Animations === */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>