<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>数据看板</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper card-hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value number-animate">{{ statistics.total }}</div>
              <div class="stat-label">投递总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper card-hover">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value number-animate">{{ statistics.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper card-hover">
          <div class="stat-card">
            <div class="stat-icon interviewing">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value number-animate">{{ statistics.interviewing }}</div>
              <div class="stat-label">面试中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper card-hover">
          <div class="stat-card">
            <div class="stat-icon offer">
              <el-icon :size="32"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value number-animate">{{ getStatusCount('已offer') }}</div>
              <div class="stat-label">已获Offer</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions-card card-hover">
      <div class="quick-actions">
        <el-button type="primary" class="action-btn btn-click" @click="$router.push('/applications')">
          <el-icon><Plus /></el-icon>新增投递
        </el-button>
        <el-button type="primary" class="action-btn btn-click" @click="$router.push('/applications')">
          <el-icon><List /></el-icon>查看列表
        </el-button>
        <el-button type="primary" class="action-btn btn-click" @click="handleExport">
          <el-icon><Download /></el-icon>导出备份
        </el-button>
        <el-upload class="action-upload" :show-file-list="false" accept=".json" :before-upload="handleImport">
          <el-button type="primary" class="action-btn btn-click">
            <el-icon><Upload /></el-icon>导入备份
          </el-button>
        </el-upload>
      </div>
    </el-card>

    <!-- 图表 -->
    <el-row :gutter="20" class="charts">
      <el-col :span="24">
        <el-card class="chart-card card-hover">
          <template #header>
            <div class="card-header">
              <span>状态分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { applicationApi, exportData, importData } from '../api'
import { ElMessage } from 'element-plus'

const statistics = ref({
  total: 0,
  pending: 0,
  interviewing: 0,
  statusDistribution: {}
})

const pieChartRef = ref(null)
let pieChart = null

const getStatusCount = (status) => {
  return statistics.value.statusDistribution[status] || 0
}

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
      '待处理': '#94a3b8',
      '测评中': '#fbbf24',
      '笔试中': '#f97316',
      '面试中': '#60a5fa',
      '已offer': '#4ade80',
      '已拒绝': '#f87171',
      '已淘汰': '#94a3b8',
      '流程中': '#a78bfa'
    }
  }
  return {
    '待处理': '#909399',
    '测评中': '#e6a23c',
    '笔试中': '#f56c6c',
    '面试中': '#409eff',
    '已offer': '#67c23a',
    '已拒绝': '#f56c6c',
    '已淘汰': '#909399',
    '流程中': '#b37feb'
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
    itemStyle: { color: colorMap[name] || '#409eff' }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderColor: isDark ? '#334155' : '#e4e7ed',
      textStyle: {
        color: isDark ? '#f1f5f9' : '#1f2937'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: isDark ? '#94a3b8' : '#6b7280'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data,
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: isDark ? '#94a3b8' : '#6b7280'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
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

// 监听主题变化
const handleThemeChange = () => {
  renderPieChart()
}

onMounted(() => {
  fetchStatistics()
  // 监听主题变化
  const observer = new MutationObserver(handleThemeChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  if (pieChart) {
    pieChart.dispose()
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card-wrapper {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
  backdrop-filter: var(--glass-blur);
}

.stat-card-wrapper:hover {
  box-shadow: var(--shadow-lg) !important;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  box-shadow: var(--shadow-md);
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.interviewing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.offer {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.charts {
  margin-top: 24px;
}

.chart-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  height: 320px;
}

.quick-actions-card {
  margin-bottom: 24px;
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
  backdrop-filter: var(--glass-blur);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 0;
  justify-content: flex-start;
}

.action-upload {
  display: inline-flex !important;
  width: auto !important;
}

.action-upload :deep(.el-upload) {
  display: inline-flex !important;
}

.action-upload :deep(.el-upload-list) {
  display: none !important;
}

.action-btn {
  width: 140px;
  height: 44px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--primary-gradient);
  border: none;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn .el-icon {
  width: 16px;
  flex-shrink: 0;
}
</style>