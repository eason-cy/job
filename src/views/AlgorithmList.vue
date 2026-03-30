<template>
  <div class="algorithm-list">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in statsData" :key="stat.label" :style="{ '--card-index': index }">
        <div class="stat-card-inner">
          <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
            <component :is="stat.icon" :size="24" />
          </div>
          <div class="stat-data">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词" class="search-item">
          <el-input
            v-model="searchForm.keyword"
            placeholder="题号或标题"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="难度" class="search-item">
          <el-select v-model="searchForm.difficulty" placeholder="全部" clearable class="search-select">
            <el-option label="简单" value="Easy" />
            <el-option label="中等" value="Medium" />
            <el-option label="困难" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度" class="search-item">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable class="search-select">
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" class="search-item">
          <el-select v-model="searchForm.tag" placeholder="全部" clearable filterable class="search-select">
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" class="search-btn btn-glow" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
          <el-button type="primary" class="add-btn btn-glow" @click="openDialog()">
            <el-icon><Plus /></el-icon>新增题目
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto" row-key="id" row-class-name="table-row">
          <el-table-column prop="leetcodeId" label="题号" width="80">
            <template #default="{ row }">
              <span class="id-badge">#{{ row.leetcodeId }}</span>
            </template>
          </el-table-column>
          <el-table-column label="题目" min-width="220">
            <template #default="{ row }">
              <el-button link type="primary" class="title-link" @click="openUrl(row.url)">
                {{ row.title }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)" size="small" class="difficulty-tag">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标签" min-width="180">
            <template #default="{ row }">
              <div class="tag-group">
                <el-tag v-for="tag in row.tags?.slice(0, 3)" :key="tag" size="small" class="topic-tag">
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="熟悉度" width="150">
            <template #default="{ row }">
              <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
            </template>
          </el-table-column>
          <el-table-column label="复习次数" width="130">
            <template #default="{ row }">
              <div class="review-count">
                <span class="count-num">{{ row.reviewCount || 0 }}</span>
                <el-button size="small" type="primary" class="review-btn" link @click="incrementReview(row)">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" link class="action-link" @click="openDetail(row)">详情</el-button>
                <el-button size="small" type="warning" link class="action-link" @click="openDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" link class="action-link" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑题目' : '新增题目'" width="560px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="题号" prop="leetcodeId">
          <el-input v-model.number="form.leetcodeId" placeholder="LeetCode题号" style="width: 120px" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="题目标题" />
        </el-form-item>
        <el-form-item label="链接" prop="url">
          <el-input v-model="form.url" placeholder="https://leetcode.cn/problems/..." />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="选择难度">
            <el-option label="简单" value="Easy" />
            <el-option label="中等" value="Medium" />
            <el-option label="困难" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="选择或输入标签" style="width: 100%">
            <el-option v-for="tag in defaultTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-rate v-model="form.familiarity" :max="3" show-text :texts="['不熟', '一般', '熟练']" />
        </el-form-item>
        <el-form-item label="笔记">
          <el-input v-model="form.notes" type="textarea" :rows="4" placeholder="解题思路、注意事项..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="题目详情" width="640px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="1" border class="detail-descriptions">
        <el-descriptions-item label="题号">
          <span class="id-badge">#{{ detailData.leetcodeId }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="链接">
          <el-button link type="primary" @click="openUrl(detailData.url)">
            <el-icon><Link /></el-icon>打开题目
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="难度">
          <el-tag :type="getDifficultyType(detailData.difficulty)" size="small">
            {{ getDifficultyLabel(detailData.difficulty) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标签">
          <div class="tag-group">
            <el-tag v-for="tag in detailData.tags" :key="tag" size="small" class="topic-tag">{{ tag }}</el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="熟悉度">
          <el-rate v-model="detailData.familiarity" :max="3" @change="saveDetailFamiliarity" />
        </el-descriptions-item>
        <el-descriptions-item label="复习次数">
          <div class="review-count">
            <span class="count-num">{{ detailData.reviewCount || 0 }}</span>
            <el-button size="small" type="primary" class="review-btn" link @click="incrementReviewDetail">
              <el-icon><Plus /></el-icon>复习
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="上次复习">{{ detailData.lastReviewDate || '未复习' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">笔记</el-divider>
      <el-input
        v-model="detailData.notes"
        type="textarea"
        :rows="5"
        placeholder="记录解题思路、注意事项..."
        class="notes-input"
      />

      <template #footer>
        <el-button @click="detailVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="saveNotes">保存笔记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Link, Collection, Star, Clock, CircleCheck } from '@element-plus/icons-vue'
import { algorithmApi } from '../api'
import { leetcodeHot100 } from '../data/leetcodeHot100'

const searchForm = reactive({
  keyword: '',
  difficulty: '',
  familiarity: null,
  tag: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const tableData = ref([])
const allTags = ref([])
const statistics = ref({
  total: 0,
  byDifficulty: {},
  byFamiliarity: {},
  needReview: 0
})

const statsData = computed(() => [
  { label: '题目总数', value: statistics.value.total, icon: Collection, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
  { label: '需要复习', value: statistics.value.needReview, icon: Clock, gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' },
  { label: '简单', value: statistics.value.byDifficulty.Easy || 0, icon: CircleCheck, gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { label: '中等', value: statistics.value.byDifficulty.Medium || 0, icon: Star, gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
  { label: '困难', value: statistics.value.byDifficulty.Hard || 0, icon: Star, gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
  { label: '已掌握', value: statistics.value.byFamiliarity[3] || 0, icon: CircleCheck, gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' }
])

const dialogVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const detailData = ref({})

const form = reactive({
  leetcodeId: null,
  title: '',
  url: '',
  difficulty: 'Medium',
  tags: [],
  familiarity: 1,
  notes: ''
})

const rules = {
  leetcodeId: [{ required: true, message: '请输入题号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
}

const defaultTags = [
  '数组', '字符串', '链表', '树', '二叉树', '二叉搜索树',
  '栈', '队列', '堆', '哈希表', '集合',
  '双指针', '滑动窗口', '二分查找', '回溯', '递归',
  '动态规划', '贪心', '分治',
  '深度优先搜索', '广度优先搜索', '拓扑排序',
  '图', '并查集', '前缀树',
  '排序', '归并排序', '快速选择',
  '位运算', '数学', '几何',
  '设计', '模拟'
]

const fetchData = async () => {
  try {
    const response = await algorithmApi.list({
      page: pagination.page - 1,
      size: pagination.size,
      ...searchForm
    })
    tableData.value = response.data.content
    pagination.total = response.data.totalElements
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const sortTableData = () => {
  tableData.value.sort((a, b) => {
    const famA = a.familiarity || 1
    const famB = b.familiarity || 1
    if (famA !== famB) return famA - famB
    const reviewA = a.reviewCount || 0
    const reviewB = b.reviewCount || 0
    if (reviewA !== reviewB) return reviewB - reviewA
    return a.leetcodeId - b.leetcodeId
  })
}

const fetchStatistics = async () => {
  try {
    const response = await algorithmApi.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const fetchTags = async () => {
  try {
    const response = await algorithmApi.getTags()
    allTags.value = response.data
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.difficulty = ''
  searchForm.familiarity = null
  searchForm.tag = ''
  pagination.page = 1
  fetchData()
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      leetcodeId: row.leetcodeId,
      title: row.title,
      url: row.url || '',
      difficulty: row.difficulty,
      tags: row.tags || [],
      familiarity: row.familiarity || 1,
      notes: row.notes || ''
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      leetcodeId: null,
      title: '',
      url: '',
      difficulty: 'Medium',
      tags: [],
      familiarity: 1,
      notes: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    let url = form.url
    if (!url && form.title) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      url = `https://leetcode.cn/problems/${slug}/`
    }

    const submitData = {
      leetcodeId: Number(form.leetcodeId),
      title: form.title,
      titleSlug: form.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      url: url,
      difficulty: form.difficulty,
      tags: form.tags,
      familiarity: form.familiarity,
      notes: form.notes
    }

    if (editingId.value) {
      await algorithmApi.update(editingId.value, submitData)
      ElMessage.success('更新成功')
    } else {
      await algorithmApi.create(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
    fetchStatistics()
    fetchTags()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  }
}

const updateFamiliarity = async (row) => {
  try {
    const response = await algorithmApi.updateFamiliarity(row.id, row.familiarity)
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    sortTableData()
    ElMessage.success('已更新熟悉度')
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const incrementReview = async (row) => {
  try {
    const response = await algorithmApi.incrementReview(row.id)
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    sortTableData()
    ElMessage.success('已记录复习')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const saveDetailFamiliarity = async () => {
  try {
    const response = await algorithmApi.updateFamiliarity(detailData.value.id, detailData.value.familiarity)
    detailData.value = { ...detailData.value, ...response.data }
    const index = tableData.value.findIndex(item => item.id === detailData.value.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    sortTableData()
    ElMessage.success('已更新熟悉度')
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const incrementReviewDetail = async () => {
  try {
    const response = await algorithmApi.incrementReview(detailData.value.id)
    detailData.value = { ...detailData.value, ...response.data }
    const index = tableData.value.findIndex(item => item.id === detailData.value.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    sortTableData()
    ElMessage.success('已记录复习')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const saveNotes = async () => {
  try {
    await algorithmApi.update(detailData.value.id, {
      notes: detailData.value.notes,
      familiarity: detailData.value.familiarity
    })
    ElMessage.success('笔记已保存')
    detailVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除题目 "${row.title}" 吗？`, '提示', { type: 'warning' })
  try {
    await algorithmApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const openUrl = (url) => {
  if (url) window.open(url, '_blank')
}

const getDifficultyType = (difficulty) => {
  const map = { Easy: 'success', Medium: 'warning', Hard: 'danger' }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = { Easy: '简单', Medium: '中等', Hard: '困难' }
  return map[difficulty] || difficulty
}

const initHot100 = async () => {
  try {
    const data = localStorage.getItem('job_tracker_data')
    const parsed = data ? JSON.parse(data) : {}
    const algorithms = parsed.algorithms || []

    if (algorithms.length === 0) {
      const result = await algorithmApi.batchImport(leetcodeHot100)
      console.log(`已自动导入LeetCode Hot 100题目，共${result.data.imported}题`)
    } else if (algorithms.length < leetcodeHot100.length) {
      const existingIds = new Set(algorithms.map(item => item.leetcodeId))
      const missingQuestions = leetcodeHot100.filter(q => !existingIds.has(q.leetcodeId))
      if (missingQuestions.length > 0) {
        const result = await algorithmApi.batchImport(missingQuestions)
        console.log(`已补充${result.data.imported}题`)
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

onMounted(async () => {
  await initHot100()
  fetchData()
  fetchStatistics()
  fetchTags()
})
</script>

<style scoped>
.algorithm-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
}

/* === Stats Grid === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.stat-card {
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--card-index, 0) * 60ms);
  opacity: 0;
}

.stat-card-inner {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-inner:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

/* === Search Section === */
.search-section {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.search-item {
  margin-bottom: 0 !important;
}

.search-item :deep(.el-form-item__label) {
  font-weight: 500;
}

.search-input {
  width: 140px;
}

.search-select {
  width: 110px;
}

.search-actions {
  margin-bottom: 0 !important;
}

.search-btn,
.add-btn {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.search-btn:hover,
.add-btn:hover {
  opacity: 0.9;
  box-shadow: var(--glow-primary);
}

.reset-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
}

/* === Table Section === */
.table-section {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.table-wrapper {
  overflow-x: auto;
}

.custom-table :deep(.el-table__cell) {
  padding: 14px 12px;
}

.custom-table :deep(.el-table__row:hover > td) {
  background-color: var(--bg-glass) !important;
}

.id-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.title-link {
  font-weight: 600;
  font-size: 14px;
}

.difficulty-tag {
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.tag-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.topic-tag {
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.review-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-num {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-btn {
  opacity: 0.7;
}

.review-btn:hover {
  opacity: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-link {
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* === Dialog Styles === */
.dialog-card :deep(.el-dialog) {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.dialog-card :deep(.el-dialog__header) {
  background: var(--primary-gradient);
  padding: 20px 24px;
}

.dialog-card :deep(.el-dialog__title) {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.dialog-card :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.9);
}

.dialog-card :deep(.el-dialog__body) {
  padding: 28px 24px;
  background: var(--bg-card);
}

.dialog-card :deep(.el-dialog__footer) {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 20px 24px;
}

.dialog-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.submit-btn {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.submit-btn:hover {
  opacity: 0.9;
  box-shadow: var(--glow-primary);
}

.detail-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  background: var(--bg-secondary);
}

.notes-input :deep(.el-textarea__inner) {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

/* === Scrollbar === */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: var(--radius-full);
}

/* === Animations === */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>