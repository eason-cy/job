<template>
  <div class="bagu-list">
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
            placeholder="搜索问题或答案"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类" class="search-item">
          <el-select v-model="searchForm.category" placeholder="全部" clearable filterable class="search-select">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度" class="search-item">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable class="search-select">
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
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
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto" row-key="id">
          <el-table-column label="问题" min-width="280">
            <template #default="{ row }">
              <div class="question-cell" @click="openDetail(row)">
                {{ row.question }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag size="small" class="category-tag">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="熟悉度" width="150">
            <template #default="{ row }">
              <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="reviewCount" label="复习次数" width="100">
            <template #default="{ row }">
              <span class="review-num">{{ row.reviewCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上次复习" width="110">
            <template #default="{ row }">
              <span class="date-text">{{ row.lastReviewDate || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" link class="action-link" @click="openDialog(row)">编辑</el-button>
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
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑八股题' : '新增八股题'" width="620px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" placeholder="请输入问题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" allow-create filterable style="width: 100%">
            <el-option label="Java" value="Java" />
            <el-option label="数据库" value="数据库" />
            <el-option label="网络" value="网络" />
            <el-option label="操作系统" value="操作系统" />
            <el-option label="Spring" value="Spring" />
            <el-option label="Redis" value="Redis" />
            <el-option label="分布式" value="分布式" />
            <el-option label="微服务" value="微服务" />
            <el-option label="设计模式" value="设计模式" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="8" placeholder="请输入答案/解析" />
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-rate v-model="form.familiarity" :max="3" show-text :texts="['不熟', '一般', '熟练']" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="题目详情" width="720px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="1" border class="detail-descriptions">
        <el-descriptions-item label="问题">
          <div class="question-text">{{ detailData.question }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag size="small" class="category-tag">{{ detailData.category }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="熟悉度">
          <el-rate v-model="detailData.familiarity" :max="3" @change="updateDetailFamiliarity" />
        </el-descriptions-item>
        <el-descriptions-item label="复习次数">
          <span class="review-num">{{ detailData.reviewCount || 0 }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">答案</el-divider>
      <div class="answer-content">
        <pre>{{ detailData.answer || '暂无答案' }}</pre>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="openDialog(detailData)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Notebook, Clock, CircleCheck, Star } from '@element-plus/icons-vue'
import { baguApi } from '../api'

const searchForm = reactive({
  keyword: '',
  category: '',
  familiarity: null
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const tableData = ref([])
const categories = ref([])
const statistics = ref({
  total: 0,
  byCategory: {},
  byFamiliarity: {},
  needReview: 0
})

const statsData = computed(() => [
  { label: '题目总数', value: statistics.value.total, icon: Notebook, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
  { label: '需要复习', value: statistics.value.needReview, icon: Clock, gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' },
  { label: '一般', value: statistics.value.byFamiliarity[2] || 0, icon: Star, gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
  { label: '已掌握', value: statistics.value.byFamiliarity[3] || 0, icon: CircleCheck, gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' }
])

const dialogVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const detailData = ref({})

const form = reactive({
  question: '',
  category: '',
  answer: '',
  familiarity: 1
})

const rules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const fetchData = async () => {
  try {
    const response = await baguApi.list({
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

const fetchStatistics = async () => {
  try {
    const response = await baguApi.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const fetchCategories = async () => {
  try {
    const response = await baguApi.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.familiarity = null
  pagination.page = 1
  fetchData()
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      question: row.question,
      category: row.category,
      answer: row.answer,
      familiarity: row.familiarity || 1
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      question: '',
      category: '',
      answer: '',
      familiarity: 1
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (editingId.value) {
      await baguApi.update(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await baguApi.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
    fetchStatistics()
    fetchCategories()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const updateFamiliarity = async (row) => {
  try {
    await baguApi.updateFamiliarity(row.id, row.familiarity)
    ElMessage.success('已更新熟悉度')
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const updateDetailFamiliarity = async () => {
  try {
    await baguApi.updateFamiliarity(detailData.value.id, detailData.value.familiarity)
    ElMessage.success('已更新熟悉度')
    fetchData()
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除这道八股题吗？', '提示', { type: 'warning' })
  try {
    await baguApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  fetchData()
  fetchStatistics()
  fetchCategories()
})
</script>

<style scoped>
.bagu-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
}

/* === Stats Grid === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  animation: fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--card-index, 0) * 80ms);
  opacity: 0;
}

.stat-card-inner {
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-inner:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
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
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
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
  width: 180px;
}

.search-select {
  width: 130px;
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

.question-cell {
  cursor: pointer;
  color: var(--primary-color);
  font-weight: 500;
  transition: color 200ms ease;
}

.question-cell:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.category-tag {
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.review-num {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.date-text {
  color: var(--text-muted);
  font-size: 13px;
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

.question-text {
  font-weight: 600;
  color: var(--text-primary);
}

.answer-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 20px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
}

.answer-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
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

.answer-content::-webkit-scrollbar {
  width: 6px;
}

.answer-content::-webkit-scrollbar-track {
  background: transparent;
}

.answer-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
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