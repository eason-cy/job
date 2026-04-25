<template>
  <div class="bagu-list">
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

    <div class="panel">
      <el-form v-if="dataLoaded" :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="问题/答案关键词" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部" clearable filterable>
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable>
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增题目
          </el-button>
        </el-form-item>
      </el-form>
      <div class="quick-filters">
        <el-button size="small" @click="applyCategoryPreset('')">全部</el-button>
        <el-button size="small" @click="applyFamiliarityPreset(1)">待复习</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="问题" min-width="260">
          <template #default="{ row }">
            <button type="button" class="question-btn" @click="openDetail(row)">{{ row.question }}</button>
          </template>
        </el-table-column>
        <el-table-column label="答案" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.answer || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="reviewCount" label="复习次数" width="100" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDetail(row)">详情</el-button>
            <el-button size="small" type="warning" link @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!dataLoaded" class="skeleton-table">
        <el-skeleton animated :rows="10" />
      </div>

      <div v-if="dataLoaded" class="pagination-wrap">
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑八股题' : '新增八股题'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="例如：Java基础" />
        </el-form-item>
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="答案">
          <el-input v-model="form.answer" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-rate v-model="form.familiarity" :max="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="八股题详情" width="760px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="分类">{{ detailData.category }}</el-descriptions-item>
        <el-descriptions-item label="问题">{{ detailData.question }}</el-descriptions-item>
        <el-descriptions-item label="答案">{{ detailData.answer || '--' }}</el-descriptions-item>
        <el-descriptions-item label="熟悉度">{{ detailData.familiarity || 1 }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { baguApi } from '../api'
import { usePersistentQueryState } from '../composables/usePersistentQueryState'
import { logError } from '../utils/logger'

const tableLoading = ref(false)
const dataLoaded = ref(false)
const tableData = ref([])
const categories = ref([])
const stats = ref({
  total: 0,
  needReview: 0
})

const searchForm = reactive({
  keyword: '',
  category: '',
  familiarity: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const { load: loadQueryState } = usePersistentQueryState('job_tracker_bagu_query', searchForm, pagination)

const dialogVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const detailData = ref({})

const form = reactive({
  category: '',
  question: '',
  answer: '',
  familiarity: 1
})

const rules = {
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }]
}

const fetchStats = async () => {
  try {
    const resp = await baguApi.getStatistics()
    stats.value = resp.data
  } catch (error) {
    logError('bagu:stats', error)
  }
}

const fetchCategories = async () => {
  try {
    const resp = await baguApi.getCategories()
    categories.value = resp.data || []
  } catch (error) {
    logError('bagu:categories', error)
  }
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const resp = await baguApi.list({
      page: pagination.page - 1,
      size: pagination.size,
      keyword: searchForm.keyword || undefined,
      category: searchForm.category || undefined,
      familiarity: searchForm.familiarity || undefined
    })
    tableData.value = resp.data.content
    pagination.total = resp.data.totalElements
  } catch (error) {
    logError('bagu:list', error)
    ElMessage.error('获取八股题列表失败')
  } finally {
    tableLoading.value = false
    dataLoaded.value = true
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.familiarity = ''
  pagination.page = 1
  fetchData()
}

const applyCategoryPreset = (category) => {
  searchForm.category = category
  handleSearch()
}

const applyFamiliarityPreset = (familiarity) => {
  searchForm.familiarity = familiarity
  handleSearch()
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      category: row.category,
      question: row.question,
      answer: row.answer || '',
      familiarity: row.familiarity || 1
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      category: '',
      question: '',
      answer: '',
      familiarity: 1
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    const payload = { ...form }
    if (editingId.value) {
      await baguApi.update(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await baguApi.create(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await Promise.all([fetchData(), fetchStats(), fetchCategories()])
  } catch (error) {
    logError('bagu:submit', error, { editingId: editingId.value })
    ElMessage.error('提交失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该题目吗？', '提示', { type: 'warning' })
  try {
    await baguApi.delete(row.id)
    ElMessage.success('删除成功')
    await Promise.all([fetchData(), fetchStats(), fetchCategories()])
  } catch (error) {
    logError('bagu:delete', error, { id: row.id })
    ElMessage.error('删除失败')
  }
}

const updateFamiliarity = async (row) => {
  try {
    await baguApi.updateFamiliarity(row.id, row.familiarity)
    await Promise.all([fetchData(), fetchStats()])
  } catch (error) {
    logError('bagu:update-familiarity', error, { id: row.id, familiarity: row.familiarity })
    ElMessage.error('更新熟悉度失败')
  }
}

onMounted(async () => {
  loadQueryState()
  // 非阻塞加载，避免首次进入显示loading旋转
  Promise.all([fetchData(), fetchStats(), fetchCategories()])
})
</script>

<style scoped>
.bagu-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  background: var(--bg-card);
  border: none;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-item {
  background: var(--bg-glass);
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  transition: all 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-item:hover {
  background: var(--primary-gradient-subtle);
  transform: translateY(-2px);
}

.stat-item span {
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-item strong {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.quick-filters {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.quick-filters :deep(.el-button) {
  border-radius: 10px;
  font-weight: 500;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quick-filters :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.question-btn {
  border: none;
  background: transparent;
  color: var(--primary-color);
  text-align: left;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: all 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.question-btn:hover {
  color: var(--primary-dark);
}

/* Table Styling */
.panel :deep(.el-table) {
  border-radius: 14px;
  overflow: hidden;
}

.panel :deep(.el-table th.el-table__cell) {
  background: var(--bg-secondary);
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 14px 0;
}

.panel :deep(.el-table td.el-table__cell) {
  padding: 16px 0;
  font-size: 13px;
}

.panel :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%) !important;
}

.panel :deep(.el-rate) {
  height: 20px;
}

.panel :deep(.el-button--small) {
  border-radius: 8px;
  font-size: 12px;
}

.pagination-wrap {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.pagination-wrap :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-table {
  padding: 8px 0;
}
</style>
