<template>
  <div class="dashboard">
    <!-- 统计卡片区域 -->
    <section class="stats-section">
      <div class="section-header">
        <h2>投递概览</h2>
        <span class="section-desc">实时追踪你的投递进度</span>
      </div>
      <div class="stats-grid">
        <!-- 骨架屏 -->
        <div v-if="!dataLoaded" v-for="i in 6" :key="'sk-' + i" class="stat-card">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="circle" style="width:44px;height:44px" />
              <el-skeleton-item variant="text" style="width:50px;height:28px;margin-left:14px" />
            </template>
          </el-skeleton>
        </div>
        <!-- 动画数字 -->
        <div
          v-for="(item, index) in animatedCount"
          v-else
          :key="item.status"
          class="stat-card"
          :class="{ 'stat-card--highlight': index === 4 && item.count.value > 0 }"
        >
          <div class="stat-card__icon" :style="{ background: item.gradient }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ item.count.value }}</span>
            <span class="stat-card__label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷操作区域 -->
    <section class="actions-section">
      <div class="section-header">
        <h2>快捷操作</h2>
      </div>
      <div class="actions-grid">
        <button class="action-card" type="button" @click="router.push('/applications')">
          <div class="action-card__icon action-card__icon--primary">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="action-card__content">
            <span class="action-card__title">新增投递</span>
            <span class="action-card__desc">添加新的投递记录</span>
          </div>
        </button>
        <button class="action-card" type="button" @click="router.push('/applications')">
          <div class="action-card__icon">
            <el-icon><List /></el-icon>
          </div>
          <div class="action-card__content">
            <span class="action-card__title">查看列表</span>
            <span class="action-card__desc">管理所有投递</span>
          </div>
        </button>
        <button class="action-card" type="button" @click="handleExport">
          <div class="action-card__icon">
            <el-icon><Download /></el-icon>
          </div>
          <div class="action-card__content">
            <span class="action-card__title">导出备份</span>
            <span class="action-card__desc">下载全部数据</span>
          </div>
        </button>
        <button class="action-card" type="button" @click="handleExportTemplate">
          <div class="action-card__icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="action-card__content">
            <span class="action-card__title">下载模板</span>
            <span class="action-card__desc">获取导入模板</span>
          </div>
        </button>
        <el-upload class="action-upload" :show-file-list="false" accept=".json" :before-upload="handleImport">
          <button class="action-card" type="button">
            <div class="action-card__icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="action-card__content">
              <span class="action-card__title">导入备份</span>
              <span class="action-card__desc">恢复历史数据</span>
            </div>
          </button>
        </el-upload>
      </div>
    </section>

    <!-- 待办提醒与状态分布 -->
    <div class="bottom-grid">
      <!-- 待办提醒 -->
      <section class="todo-section">
        <div class="section-header">
          <h2>待办提醒</h2>
          <span class="section-badge" v-if="todoItems.length">{{ todoItems.length }}</span>
        </div>
        <el-empty v-if="!todoItems.length" description="暂无待办事项" :image-size="64" />
        <div v-else class="todo-list">
          <button
            v-for="item in todoItems"
            :key="item.id"
            class="todo-item"
            type="button"
            @click="router.push(item.path)"
          >
            <div class="todo-item__indicator"></div>
            <div class="todo-item__content">
              <span class="todo-item__title">{{ item.title }}</span>
              <span class="todo-item__desc">{{ item.desc }}</span>
            </div>
            <el-icon class="todo-item__arrow"><ArrowRight /></el-icon>
          </button>
        </div>
      </section>

      <!-- 状态分布图表 -->
      <section class="chart-section" v-loading="loading">
        <div class="section-header">
          <h2>状态分布</h2>
        </div>
        <div v-if="!dataLoaded" class="chart-skeleton">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="circle" style="width:200px;height:200px;margin:20px auto" />
            </template>
          </el-skeleton>
        </div>
        <div v-else ref="pieChartRef" class="chart-container"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { init } from 'echarts/core'
import { ElMessage } from 'element-plus'
import { Clock, EditPen, Edit, ChatDotRound, Trophy, CircleClose, Plus, List, Download, Upload, Document, ArrowRight } from '@element-plus/icons-vue'
import { applicationApi, interviewApi, exportData, exportTemplate, importData } from '../api'
import { logError } from '../utils/logger'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const router = useRouter()
const loading = ref(false)
const dataLoaded = ref(false)
const pieChartRef = ref(null)
let pieChart = null

const statistics = ref({
  total: 0,
  pending: 0,
  interviewing: 0,
  statusDistribution: {}
})

const todoItems = ref([])

// 数字缓动动画工具
const useCountUp = (target, duration = 800) => {
  const value = ref(0)
  let rafId = null
  const animate = () => {
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      value.value = Math.floor(eased * target)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }
  const cancel = () => { if (rafId) cancelAnimationFrame(rafId) }
  return { value, animate, cancel }
}

// 动画数字 refs（数据加载后初始化）
const animatedCount = ref([])

const initAnimatedStats = () => {
  // 取消旧的动画循环
  animatedCount.value.forEach(item => item.cancel())

  const cfg = [
    { status: '待处理', label: '待处理', icon: Clock, gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
    { status: '测评中', label: '测评中', icon: EditPen, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' },
    { status: '笔试中', label: '笔试中', icon: Edit, gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' },
    { status: '面试中', label: '面试中', icon: ChatDotRound, gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
    { status: '已offer', label: '已Offer', icon: Trophy, gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { status: '已淘汰', label: '已淘汰', icon: CircleClose, gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)' }
  ]
  animatedCount.value = cfg.map((item) => {
    const target = statistics.value.statusDistribution[item.status] || 0
    const { value, animate, cancel } = useCountUp(target, 800)
    return { ...item, count: value, animate, cancel }
  })
  // stagger 启动动画
  animatedCount.value.forEach((item, i) => {
    setTimeout(() => item.animate(), i * 80)
  })
}

const getChartColors = () => ({
  '待处理': '#3b82f6',
  '测评中': '#0ea5e9',
  '笔试中': '#6366f1',
  '面试中': '#06b6d4',
  '已offer': '#10b981',
  '已淘汰': '#64748b'
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
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'var(--border-color)',
      borderWidth: 1,
      textStyle: { color: 'var(--text-primary)' }
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: { color: 'var(--text-secondary)', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '45%'],
        data,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 600 },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.1)' }
        }
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
    initAnimatedStats()
    renderPieChart()
  } catch (error) {
    logError('dashboard:statistics', error)
    ElMessage.error('获取统计信息失败')
  } finally {
    loading.value = false
    dataLoaded.value = true
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
  gap: 28px;
}

/* 通用区块头部 */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.section-badge {
  background: var(--primary-gradient);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

/* ========== 统计卡片区域 ========== */
.stats-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  transition: all 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  background: var(--bg-secondary);
}

.stat-card--highlight {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-card--highlight .stat-card__label,
.stat-card--highlight .stat-card__value {
  color: white;
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-card__icon .el-icon {
  font-size: 20px;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}

.stat-card__label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ========== 快捷操作区域 ========== */
.actions-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--bg-glass);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-card:hover {
  background: var(--primary-gradient-subtle);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-card:hover .action-card__icon--primary {
  background: var(--primary-gradient);
  color: white;
}

.action-card:hover .action-card__icon--primary .el-icon {
  color: white;
}

.action-card:active {
  transform: scale(0.98);
}

.action-card__icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-card__icon--primary {
  background: var(--primary-gradient-subtle);
}

.action-card__icon .el-icon {
  font-size: 18px;
  color: var(--primary-color);
}

.action-card__icon--primary .el-icon {
  color: var(--primary-dark);
}

.action-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-card__desc {
  font-size: 11px;
  color: var(--text-muted);
}

.action-upload {
  display: block;
}

.action-upload :deep(.el-upload) {
  display: block;
  width: 100%;
}

/* ========== 底部双栏布局 ========== */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 待办提醒 */
.todo-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-glass);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 220ms cubic-bezier(0.4, 0, 0.2, 1);
}

.todo-item:hover {
  background: var(--primary-gradient-subtle);
  transform: translateX(4px);
}

.todo-item__indicator {
  width: 4px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: 2px;
  flex-shrink: 0;
}

.todo-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.todo-item__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.todo-item__desc {
  font-size: 11px;
  color: var(--text-muted);
}

.todo-item__arrow {
  font-size: 14px;
  color: var(--text-light);
  transition: transform 200ms ease, color 200ms ease;
}

.todo-item:hover .todo-item__arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

/* 状态分布图表 */
.chart-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.chart-container {
  height: 280px;
}

/* ========== 动画 ========== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
}

/* ========== 响应式布局 ========== */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .actions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>