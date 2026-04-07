<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div v-for="item in statusStats" :key="item.status" class="stat-card">
        <div class="stat-head">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
        <div class="stat-value">{{ item.count }}</div>
      </div>
    </div>

    <div class="panel actions-panel">
      <h3>快捷操作</h3>
      <div class="actions-grid">
        <button class="action-btn" type="button" @click="router.push('/applications')">新增投递</button>
        <button class="action-btn" type="button" @click="router.push('/applications')">查看列表</button>
        <button class="action-btn" type="button" @click="handleExport">导出备份</button>
        <button class="action-btn" type="button" @click="handleExportTemplate">下载模板</button>
        <el-upload class="upload-btn" :show-file-list="false" accept=".json" :before-upload="handleImport">
          <button class="action-btn" type="button">导入备份</button>
        </el-upload>
      </div>
    </div>

    <div class="panel">
      <h3>待办提醒</h3>
      <el-empty v-if="!todoItems.length" description="暂无待办" :image-size="80" />
      <div v-else class="todo-grid">
        <button
          v-for="item in todoItems"
          :key="item.id"
          class="todo-item"
          type="button"
          @click="router.push(item.path)"
        >
          <div class="todo-title">{{ item.title }}</div>
          <div class="todo-desc">{{ item.desc }}</div>
        </button>
      </div>
    </div>

    <div class="panel" v-loading="loading">
      <h3>状态分布</h3>
      <div ref="pieChartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { init } from 'echarts/core'
import { ElMessage } from 'element-plus'
import { Clock, EditPen, Edit, ChatDotRound, Trophy, CircleClose } from '@element-plus/icons-vue'
import { applicationApi, interviewApi, exportData, exportTemplate, importData } from '../api'
import { logError } from '../utils/logger'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const router = useRouter()
const loading = ref(false)
const pieChartRef = ref(null)
let pieChart = null

const statistics = ref({
  total: 0,
  pending: 0,
  interviewing: 0,
  statusDistribution: {}
})

const todoItems = ref([])

const statusStats = computed(() => {
  const cfg = [
    { status: '待处理', label: '待处理', icon: Clock },
    { status: '测评中', label: '测评中', icon: EditPen },
    { status: '笔试中', label: '笔试中', icon: Edit },
    { status: '面试中', label: '面试中', icon: ChatDotRound },
    { status: '已offer', label: '已 Offer', icon: Trophy },
    { status: '已淘汰', label: '已淘汰', icon: CircleClose }
  ]
  return cfg.map((item) => ({
    ...item,
    count: statistics.value.statusDistribution[item.status] || 0
  }))
})

const getChartColors = () => ({
  待处理: '#3b82f6',
  测评中: '#0ea5e9',
  笔试中: '#6366f1',
  面试中: '#06b6d4',
  已offer: '#10b981',
  已淘汰: '#64748b'
})

const buildTodoItems = (interviews) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  const upcoming = interviews
    .filter((item) => item.interviewDate)
    .filter((item) => {
      const d = new Date(item.interviewDate)
      return d >= start && d <= end
    })
    .slice(0, 3)
    .map((item) => ({
      id: `interview-${item.id}`,
      title: `面试提醒：${item.companyName || '未命名公司'}`,
      desc: `${item.interviewDate} · 第${item.round || 1}轮`,
      path: '/interview-records'
    }))

  const summary = [
    {
      id: 'pending-summary',
      title: `待处理投递 ${statistics.value.pending || 0} 项`,
      desc: '建议补充状态和备注',
      path: '/applications'
    },
    {
      id: 'interview-summary',
      title: `面试中流程 ${statistics.value.interviewing || 0} 项`,
      desc: '建议优先跟进面试反馈',
      path: '/applications'
    }
  ]

  return [...upcoming, ...summary].slice(0, 4)
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  if (pieChart) {
    pieChart.dispose()
  }

  pieChart = init(pieChartRef.value)
  const colorMap = getChartColors()
  const data = Object.entries(statistics.value.statusDistribution).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: colorMap[name] || '#10b981' }
  }))

  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '42%'],
        data,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 600 } }
      }
    ]
  })
}

const fetchStatistics = async () => {
  loading.value = true
  try {
    const [statsResp, interviewsResp] = await Promise.all([
      applicationApi.getStatistics(),
      interviewApi.listAll({})
    ])
    statistics.value = statsResp.data
    todoItems.value = buildTodoItems(interviewsResp.data || [])
    renderPieChart()
  } catch (error) {
    logError('dashboard:statistics', error)
    ElMessage.error('获取统计信息失败')
  } finally {
    loading.value = false
  }
}

const handleExport = () => {
  exportData()
  ElMessage.success('数据已导出')
}

const handleExportTemplate = () => {
  exportTemplate()
  ElMessage.success('模板已导出')
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

const handleResize = () => {
  if (pieChart) {
    pieChart.resize()
  }
}

let themeObserver = null
onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
  themeObserver = new MutationObserver(() => renderPieChart())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (themeObserver) {
    themeObserver.disconnect()
  }
  if (pieChart) {
    pieChart.dispose()
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.stat-card,
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
}

.stat-card {
  padding: 14px;
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.stat-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 700;
}

.panel {
  padding: 18px;
}

.panel h3 {
  margin: 0 0 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.action-btn {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  color: var(--text-primary);
  padding: 10px 12px;
  cursor: pointer;
}

.action-btn:hover {
  border-color: var(--primary-color);
}

.upload-btn {
  display: block;
}

.upload-btn :deep(.el-upload) {
  display: block;
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.todo-item {
  text-align: left;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  padding: 12px;
  cursor: pointer;
}

.todo-title {
  font-weight: 600;
}

.todo-desc {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.chart {
  height: 320px;
}
</style>
