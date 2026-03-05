<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>数据看板</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">投递总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon interviewing">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.interviewing }}</div>
              <div class="stat-label">面试中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon offer">
              <el-icon :size="32"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ getStatusCount('已offer') }}</div>
              <div class="stat-label">已获Offer</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions-card">
      <div class="quick-actions">
        <el-button type="primary" plain class="action-btn" @click="$router.push('/applications')">
          <el-icon><Plus /></el-icon>新增投递
        </el-button>
        <el-button type="primary" plain class="action-btn" @click="$router.push('/applications')">
          <el-icon><List /></el-icon>查看列表
        </el-button>
        <el-button type="primary" plain class="action-btn" @click="handleExport">
          <el-icon><Download /></el-icon>导出备份
        </el-button>
        <el-upload class="action-upload" :show-file-list="false" accept=".json" :before-upload="handleImport">
          <el-button type="primary" plain class="action-btn">
            <el-icon><Upload /></el-icon>导入备份
          </el-button>
        </el-upload>
      </div>
    </el-card>

    <!-- 图表 -->
    <el-row :gutter="20" class="charts">
      <el-col :span="24">
        <el-card>
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
import { ref, onMounted, computed } from 'vue'
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

const renderPieChart = () => {
  if (!pieChartRef.value) return

  if (pieChart) {
    pieChart.dispose()
  }

  pieChart = echarts.init(pieChartRef.value)

  const colorMap = {
    '待处理': '#909399',
    '测评中': '#e6a23c',
    '笔试中': '#f56c6c',
    '面试中': '#409eff',
    '已offer': '#67c23a',
    '已拒绝': '#f56c6c',
    '已淘汰': '#909399'
  }

  const data = Object.entries(statistics.value.statusDistribution).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: colorMap[name] || '#409eff' }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data,
        label: {
          show: true,
          formatter: '{b}: {c}'
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

onMounted(() => {
  fetchStatistics()
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
  color: #303133;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card-wrapper {
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
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
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.charts {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  height: 320px;
}

.quick-actions-card {
  margin-bottom: 24px;
  border: none;
  border-radius: 16px;
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
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn .el-icon {
  width: 16px;
  flex-shrink: 0;
}
</style>
