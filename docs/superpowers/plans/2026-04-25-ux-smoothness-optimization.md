# 用户体验与流畅度优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化应用的搜索防抖、路由过渡动画、骨架屏加载和数字动画，提升首次加载和日常使用的流畅感。

**Architecture:** 纯 Vue 3 原生 API 实现，不引入新依赖。使用 `watch` + `setTimeout` 实现防抖，`<transition>` 包裹路由实现动画，`el-skeleton` 实现骨架屏，`requestAnimationFrame` 实现数字 count-up。

**Tech Stack:** Vue 3, Element Plus, ECharts, CSS transitions

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/App.vue:119-123` | 修改 | 添加 `<transition>` 包裹 `<keep-alive>` |
| `src/views/Dashboard.vue` | 修改 | 添加骨架屏 + 数字 count-up + 图表动画 |
| `src/views/ApplicationList.vue` | 修改 | 搜索防抖 + 骨架屏 |
| `src/views/AlgorithmList.vue` | 修改 | 搜索防抖 + 骨架屏 |
| `src/views/BaguList.vue` | 修改 | 骨架屏 |
| `src/views/InterviewRecords.vue` | 修改 | 骨架屏 |

---

### Task 1: 路由过渡动画

**Files:**
- Modify: `src/App.vue:119-123`

- [ ] **Step 1: 修改 App.vue 的 router-view 模板**

将 `<router-view>` 部分从：
```vue
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view>
```

改为：
```vue
<router-view v-slot="{ Component }">
  <transition name="fade-scale" mode="out-in">
    <keep-alive>
      <component :is="Component" :key="$route.path" />
    </keep-alive>
  </transition>
</router-view>
```

关键变更：
- 外层包裹 `<transition name="fade-scale" mode="out-in">`
- `<component>` 加 `:key="$route.path"` 确保 keep-alive 按路由缓存
- `transitions.css` 已定义 `.fade-scale-enter-active`（350ms spring 进入，200ms 退出）

- [ ] **Step 2: 验证**

```bash
npm run dev
```

手动测试：依次点击侧栏不同菜单项，确认页面切换有缩放淡入动画（约 350ms），退出时有淡出（约 200ms）。

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: 添加路由切换过渡动画"
```

---

### Task 2: ApplicationList 搜索防抖 + 骨架屏

**Files:**
- Modify: `src/views/ApplicationList.vue`

#### Part A: 搜索防抖

- [ ] **Step 1: 新增防抖相关 state**

在 `const tableLoading = ref(false)` 上方（约 line 313 处），添加：
```js
const searchInput = ref('')
let searchDebounceTimer = null
```

- [ ] **Step 2: 修改 searchForm 初始化**

将 `searchForm` 定义（约 line 300-303）改为：
```js
const searchForm = reactive({
  companyName: '',
  status: ''
})
```

保持不变。但需要添加 watch：
```js
import { watch, onMounted, reactive, ref } from 'vue'
```

在 `const { load: loadQueryState }` 下方（约 line 311），添加 watch：
```js
const { load: loadQueryState } = usePersistentQueryState('job_tracker_application_query', searchForm, pagination)

// 搜索防抖：输入停止 300ms 后才触发查询
watch(searchInput, (val) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchForm.companyName = val
    pagination.page = 1
    fetchData()
  }, 300)
})
```

- [ ] **Step 3: 修改模板中的 v-model**

将 line 7 的 `v-model="searchForm.companyName"` 改为 `v-model="searchInput"`：
```vue
<el-input
  v-model="searchInput"
  placeholder="搜索公司..."
  clearable
/>
```

注意：移除 `@keyup.enter="handleSearch"`，因为防抖已自动触发查询。

- [ ] **Step 4: 修改 resetSearch**

将 `resetSearch` 函数（约 line 415-419）改为：
```js
const resetSearch = () => {
  searchInput.value = ''
  searchForm.companyName = ''
  searchForm.status = ''
  pagination.page = 1
  fetchData()
}
```

#### Part B: 骨架屏

- [ ] **Step 5: 新增 dataLoaded state**

在 `const tableLoading = ref(false)` 下方添加：
```js
const dataLoaded = ref(false)
```

- [ ] **Step 6: 在 fetchData 中标记已加载**

修改 `fetchData` 的 finally 块（约 line 405-407）：
```js
  } finally {
    tableLoading.value = false
    dataLoaded.value = true
  }
```

- [ ] **Step 7: 模板中添加骨架屏**

在 `.search-section` 卡片内部，在 `<el-form>` 外层包裹条件渲染。将 `.search-section` 的整个内容（line 4-29）替换为：
```vue
<div class="search-section">
  <el-form v-if="dataLoaded" :inline="true" class="search-form">
    <!-- existing form content unchanged -->
  </el-form>
  <div v-else class="skeleton-form">
    <el-skeleton animated :rows="2" />
  </div>
</div>
```

在 `.table-section` 中（line 32-107），将 `el-table` 区域替换为：
```vue
<div class="table-section">
  <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe table-layout="auto">
    <!-- existing columns unchanged -->
  </el-table>
  <div v-else class="skeleton-table">
    <el-skeleton animated :rows="10" />
  </div>
  <!-- pagination unchanged, only show when dataLoaded -->
  <div v-if="dataLoaded" class="pagination-wrap">
    <!-- existing pagination -->
  </div>
</div>
```

- [ ] **Step 8: 添加骨架屏样式**

在 `<style scoped>` 末尾添加：
```css
.skeleton-form {
  padding: 8px 0;
}

.skeleton-table {
  padding: 8px 0;
}
```

- [ ] **Step 9: 验证**

```bash
npm run dev
```

清除 localStorage 后刷新 `/applications` 页面，应先显示骨架屏闪烁，随后渐变为真实数据。搜索框输入时观察 300ms 防抖效果。

- [ ] **Step 10: Commit**

```bash
git add src/views/ApplicationList.vue
git commit -m "feat: 投递列表添加搜索防抖和骨架屏加载"
```

---

### Task 3: AlgorithmList 搜索防抖 + 骨架屏

**Files:**
- Modify: `src/views/AlgorithmList.vue`

- [ ] **Step 1: 新增防抖 state 和 import**

修改 import（line 158）：
```js
import { watch, onMounted, reactive, ref } from 'vue'
```

在 `const tableLoading = ref(false)` 下方添加：
```js
const searchKeyword = ref('')
let searchDebounceTimer = null
const dataLoaded = ref(false)
```

- [ ] **Step 2: 添加 watch**

在 `const { load: loadQueryState }` 下方（约 line 187），添加：
```js
const { load: loadQueryState } = usePersistentQueryState('job_tracker_algorithm_query', searchForm, pagination)

// 搜索防抖
watch(searchKeyword, (val) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchForm.keyword = val
    pagination.page = 1
    fetchData()
  }, 300)
})
```

- [ ] **Step 3: 修改模板**

将 line 21 的 `v-model="searchForm.keyword"` 改为 `v-model="searchKeyword"`，移除 `@keyup.enter="handleSearch"`：
```vue
<el-input v-model="searchKeyword" placeholder="题号或标题" clearable />
```

- [ ] **Step 4: 修改 resetSearch**

```js
const resetSearch = () => {
  searchKeyword.value = ''
  searchForm.keyword = ''
  searchForm.difficulty = ''
  searchForm.familiarity = ''
  searchForm.tag = ''
  pagination.page = 1
  fetchData()
}
```

- [ ] **Step 5: 标记 dataLoaded**

修改 `fetchData` 的 finally 块（约 line 258-260）：
```js
  } finally {
    tableLoading.value = false
    dataLoaded.value = true
  }
```

- [ ] **Step 6: 添加骨架屏模板**

将 stats panel（line 3-16）替换为：
```vue
<div class="panel stats-panel">
  <template v-if="dataLoaded">
    <div class="stat-item">
      <span>总题数</span>
      <strong>{{ stats.total }}</strong>
    </div>
    <div class="stat-item">
      <span>待复习</span>
      <strong>{{ stats.needReview }}</strong>
    </div>
    <div class="stat-item">
      <span>简/中/难</span>
      <strong>{{ stats.byDifficulty.Easy }}/{{ stats.byDifficulty.Medium }}/{{ stats.byDifficulty.Hard }}</strong>
    </div>
  </template>
  <template v-else>
    <el-skeleton animated v-for="i in 3" :key="i">
      <template #template>
        <el-skeleton-item variant="text" style="width:60px;height:20px" />
        <el-skeleton-item variant="text" style="width:80px;height:24px;margin-left:auto" />
      </template>
    </el-skeleton>
  </template>
</div>
```

将表格 panel（line 62-110）包裹条件：
```vue
<div class="panel">
  <el-form v-if="dataLoaded" :inline="true" class="search-form">
    <!-- existing form unchanged -->
  </el-form>
  <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
    <!-- existing columns unchanged -->
  </el-table>
  <div v-if="!dataLoaded" class="skeleton-table">
    <el-skeleton animated :rows="10" />
  </div>
  <div v-if="dataLoaded" class="pagination-wrap">
    <!-- existing pagination -->
  </div>
</div>
```

注意：quick-filters 和搜索表单都只在 `dataLoaded` 时显示。

- [ ] **Step 7: 添加样式**

在 `<style scoped>` 末尾添加：
```css
.skeleton-table {
  padding: 8px 0;
}
```

- [ ] **Step 8: 验证**

```bash
npm run dev
```

访问 `/algorithms` 确认骨架屏和防抖效果。

- [ ] **Step 9: Commit**

```bash
git add src/views/AlgorithmList.vue
git commit -m "feat: 算法题库添加搜索防抖和骨架屏加载"
```

---

### Task 4: Dashboard 骨架屏 + 数字动画

**Files:**
- Modify: `src/views/Dashboard.vue`

- [ ] **Step 1: 新增 state**

在 `const loading = ref(false)` 下方添加：
```js
const dataLoaded = ref(false)
```

- [ ] **Step 2: 添加 count-up 工具函数**

在 `getChartColors` 函数上方（约 line 165），添加：
```js
// 数字缓动动画
const useCountUp = (target, duration = 800) => {
  const value = ref(0)
  const animate = () => {
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      value.value = Math.floor(eased * target)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  return { value, animate }
}
```

- [ ] **Step 3: 创建动画数字 refs**

在 `const statusStats` computed 下方，添加：
```js
// 为每个统计卡片创建 count-up 动画
const animatedStats = statusStats.value.map((item) => ({
  ...item,
  ...useCountUp(item.count)
}))
```

不对，computed 是响应式的，需要在数据加载后创建。改为在 `fetchStatistics` 完成后创建：

在 `const statusStats = computed(...)` 下方添加：
```js
// 动画数字 refs（数据加载后初始化）
const animatedCount = ref([])

const initAnimatedStats = () => {
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
    const { value, animate } = useCountUp(target, 800)
    return { ...item, count: value, animate }
  })
  // stagger 启动动画
  animatedCount.value.forEach((item, i) => {
    setTimeout(() => item.animate(), i * 80)
  })
}
```

- [ ] **Step 4: 修改 fetchStatistics 调用 initAnimatedStats**

修改 `fetchStatistics`（约 line 259-275），在 `renderPieChart()` 后添加调用：
```js
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
```

- [ ] **Step 5: 修改模板 - 统计卡片使用动画数字**

将 stats-grid 区域（line 9-24）替换为：
```vue
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
```

- [ ] **Step 6: 添加图表动画**

修改 `renderPieChart` 中的 `setOption`（约 line 226），添加动画配置：
```js
  pieChart.setOption({
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    tooltip: {
      // ... rest unchanged
```

- [ ] **Step 7: 添加图表区域骨架屏**

将 chart-section（line 111-116）替换为：
```vue
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
```

- [ ] **Step 8: 添加样式**

在 `<style scoped>` 末尾添加：
```css
.chart-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
}
```

- [ ] **Step 9: 验证**

```bash
npm run dev
```

访问 `/` 确认：
1. 统计卡片先显示骨架屏，随后数字从 0 跳动到实际值
2. 图表扇区有展开动画
3. 图表区域加载时有圆形骨架

- [ ] **Step 10: Commit**

```bash
git add src/views/Dashboard.vue
git commit -m "feat: Dashboard 添加骨架屏和数字动画"
```

---

### Task 5: BaguList 骨架屏

**Files:**
- Modify: `src/views/BaguList.vue`

- [ ] **Step 1: 新增 dataLoaded state**

在 `const tableLoading = ref(false)` 下方添加：
```js
const dataLoaded = ref(false)
```

- [ ] **Step 2: 标记加载完成**

修改 `fetchData` 的 finally 块（约 line 207-209）：
```js
  } finally {
    tableLoading.value = false
    dataLoaded.value = true
  }
```

- [ ] **Step 3: 添加骨架屏模板**

将 stats panel（line 3-16）替换为：
```vue
<div class="panel stats-panel">
  <template v-if="dataLoaded">
    <div class="stat-item">
      <span>总题数</span>
      <strong>{{ stats.total }}</strong>
    </div>
    <div class="stat-item">
      <span>待复习</span>
      <strong>{{ stats.needReview }}</strong>
    </div>
    <div class="stat-item">
      <span>分类数</span>
      <strong>{{ categories.length }}</strong>
    </div>
  </template>
  <template v-else>
    <el-skeleton animated v-for="i in 3" :key="i">
      <template #template>
        <el-skeleton-item variant="text" style="width:60px;height:20px" />
        <el-skeleton-item variant="text" style="width:80px;height:24px;margin-left:auto" />
      </template>
    </el-skeleton>
  </template>
</div>
```

将搜索表单和表格区域包裹条件：
```vue
<div class="panel">
  <el-form v-if="dataLoaded" :inline="true" class="search-form">
    <!-- existing form unchanged -->
  </el-form>
  <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
    <!-- existing columns unchanged -->
  </el-table>
  <div v-if="!dataLoaded" class="skeleton-table">
    <el-skeleton animated :rows="10" />
  </div>
  <div v-if="dataLoaded" class="pagination-wrap">
    <!-- existing pagination unchanged -->
  </div>
</div>
```

- [ ] **Step 4: 添加样式**

在 `<style scoped>` 末尾添加：
```css
.skeleton-table {
  padding: 8px 0;
}
```

- [ ] **Step 5: 验证**

```bash
npm run dev
```

访问 `/bagus` 确认骨架屏效果。

- [ ] **Step 6: Commit**

```bash
git add src/views/BaguList.vue
git commit -m "feat: 八股题库添加骨架屏加载"
```

---

### Task 6: InterviewRecords 骨架屏

**Files:**
- Modify: `src/views/InterviewRecords.vue`

- [ ] **Step 1: 新增 dataLoaded state**

在 `const tableLoading = ref(false)` 下方添加：
```js
const dataLoaded = ref(false)
```

- [ ] **Step 2: 标记加载完成**

修改 `fetchData` 的 finally 块（约 line 139-141）：
```js
  } finally {
    tableLoading.value = false
    dataLoaded.value = true
  }
```

- [ ] **Step 3: 添加骨架屏模板**

将 stats panel（line 3-12）替换为：
```vue
<div class="panel stats-panel">
  <template v-if="dataLoaded">
    <div class="stat-item">
      <span>记录总数</span>
      <strong>{{ tableData.length }}</strong>
    </div>
    <div class="stat-item">
      <span>待复盘</span>
      <strong>{{ needReviewCount }}</strong>
    </div>
  </template>
  <template v-else>
    <el-skeleton animated v-for="i in 2" :key="i">
      <template #template>
        <el-skeleton-item variant="text" style="width:60px;height:20px" />
        <el-skeleton-item variant="text" style="width:80px;height:24px;margin-left:auto" />
      </template>
    </el-skeleton>
  </template>
</div>
```

将搜索表单和表格区域包裹条件：
```vue
<div class="panel">
  <el-form v-if="dataLoaded" :inline="true" class="search-form">
    <!-- existing form unchanged -->
  </el-form>
  <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
    <!-- existing columns unchanged -->
  </el-table>
  <div v-if="!dataLoaded" class="skeleton-table">
    <el-skeleton animated :rows="10" />
  </div>
</div>
```

注意：InterviewRecords 没有分页组件，所以不需要包裹分页。

- [ ] **Step 4: 添加样式**

在 `<style scoped>` 末尾添加：
```css
.skeleton-table {
  padding: 8px 0;
}
```

- [ ] **Step 5: 验证**

```bash
npm run dev
```

访问 `/interview-records` 确认骨架屏效果。

- [ ] **Step 6: Commit**

```bash
git add src/views/InterviewRecords.vue
git commit -m "feat: 面试记录添加骨架屏加载"
```

---

### Task 7: 最终验证与构建

- [ ] **Step 1: 运行构建**

```bash
npm run build
```

确认无错误输出。

- [ ] **Step 2: 手动全量测试**

依次访问以下路由，确认：

| 路由 | 验证项 |
|------|--------|
| `/` | 骨架屏 → 数字动画 → 图表动画 |
| `/applications` | 骨架屏 → 搜索防抖 → 路由动画 |
| `/algorithms` | 骨架屏 → 搜索防抖 → 路由动画 |
| `/bagus` | 骨架屏 → 路由动画 |
| `/interview-records` | 骨架屏 → 路由动画 |

重点验证：
- 首次进入（清除 localStorage 后）显示骨架屏
- 路由切换有 fade-scale 动画
- 搜索框输入停止后才触发查询（300ms）
- 数字从 0 跳动到实际值

- [ ] **Step 3: 运行测试（如有）**

```bash
npm test
```

- [ ] **Step 4: 最终 Commit**

```bash
git status
```

确认所有改动已提交。
