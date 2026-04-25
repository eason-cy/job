<template>
  <div class="algorithm-list">
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

    <div class="panel">
      <el-form v-if="dataLoaded" :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchKeyword" placeholder="题号或标题" clearable />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="searchForm.difficulty" placeholder="全部" clearable>
            <el-option label="简单" value="Easy" />
            <el-option label="中等" value="Medium" />
            <el-option label="困难" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable>
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部" clearable filterable>
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
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
        <el-button size="small" @click="applyDifficultyPreset('')">全部</el-button>
        <el-button size="small" @click="applyDifficultyPreset('Easy')">简单</el-button>
        <el-button size="small" @click="applyDifficultyPreset('Medium')">中等</el-button>
        <el-button size="small" @click="applyFamiliarityPreset(1)">待复习</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-if="dataLoaded" v-loading="tableLoading" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
        <el-table-column prop="leetcodeId" label="题号" width="90" />
        <el-table-column label="题目" min-width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openUrl(row.url)">{{ row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getDifficultyType(row.difficulty)">{{ getDifficultyLabel(row.difficulty) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="tag in (row.tags || []).slice(0, 3)" :key="tag" size="small" class="mr8">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column label="复习次数" width="130">
          <template #default="{ row }">
            <span>{{ row.reviewCount || 0 }}</span>
            <el-button size="small" type="primary" link @click="incrementReview(row)">+1</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑题目' : '新增题目'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="题号" prop="leetcodeId">
          <el-input-number v-model="form.leetcodeId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="form.difficulty" placeholder="请选择">
            <el-option label="Easy" value="Easy" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Hard" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="输入后回车添加" />
        </el-form-item>
        <el-form-item label="解题思路">
          <el-input v-model="form.solution" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="题目详情" width="720px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="题号">{{ detailData.leetcodeId }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="难度">{{ getDifficultyLabel(detailData.difficulty) }}</el-descriptions-item>
        <el-descriptions-item label="熟悉度">{{ detailData.familiarity || 1 }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">{{ (detailData.tags || []).join('、') || '--' }}</el-descriptions-item>
        <el-descriptions-item label="解题思路" :span="2">{{ detailData.solution || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { watch, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { algorithmApi } from '../api'
import { usePersistentQueryState } from '../composables/usePersistentQueryState'
import { logError } from '../utils/logger'

const tableLoading = ref(false)
const searchKeyword = ref('')
let searchDebounceTimer = null
const dataLoaded = ref(false)
const tableData = ref([])
const allTags = ref([])
const stats = ref({
  total: 0,
  needReview: 0,
  byDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
})

const searchForm = reactive({
  keyword: '',
  difficulty: '',
  familiarity: '',
  tag: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

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

const dialogVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const detailData = ref({})

const form = reactive({
  leetcodeId: null,
  title: '',
  url: '',
  difficulty: 'Easy',
  tags: [],
  solution: '',
  familiarity: 1
})

const rules = {
  leetcodeId: [{ required: true, message: '请输入题号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

const getDifficultyType = (difficulty) => {
  if (difficulty === 'Easy') return 'success'
  if (difficulty === 'Medium') return 'warning'
  if (difficulty === 'Hard') return 'danger'
  return 'info'
}

const getDifficultyLabel = (difficulty) => {
  if (difficulty === 'Easy') return '简单'
  if (difficulty === 'Medium') return '中等'
  if (difficulty === 'Hard') return '困难'
  return '--'
}

const fetchStats = async () => {
  try {
    const resp = await algorithmApi.getStatistics()
    stats.value = resp.data
  } catch (error) {
    logError('algorithm:stats', error)
  }
}

const fetchTags = async () => {
  try {
    const resp = await algorithmApi.getTags()
    allTags.value = resp.data || []
  } catch (error) {
    logError('algorithm:tags', error)
  }
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const resp = await algorithmApi.list({
      page: pagination.page - 1,
      size: pagination.size,
      keyword: searchForm.keyword || undefined,
      difficulty: searchForm.difficulty || undefined,
      familiarity: searchForm.familiarity || undefined,
      tag: searchForm.tag || undefined
    })
    tableData.value = resp.data.content
    pagination.total = resp.data.totalElements
  } catch (error) {
    logError('algorithm:list', error)
    ElMessage.error('获取算法列表失败')
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
  clearTimeout(searchDebounceTimer)
  searchKeyword.value = ''
  searchForm.keyword = ''
  searchForm.difficulty = ''
  searchForm.familiarity = ''
  searchForm.tag = ''
  pagination.page = 1
  fetchData()
}

const applyDifficultyPreset = (difficulty) => {
  searchForm.difficulty = difficulty
  handleSearch()
}

const applyFamiliarityPreset = (familiarity) => {
  searchForm.familiarity = familiarity
  handleSearch()
}

const openUrl = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      leetcodeId: row.leetcodeId,
      title: row.title,
      url: row.url,
      difficulty: row.difficulty,
      tags: [...(row.tags || [])],
      solution: row.solution || '',
      familiarity: row.familiarity || 1
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      leetcodeId: null,
      title: '',
      url: '',
      difficulty: 'Easy',
      tags: [],
      solution: '',
      familiarity: 1
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    const payload = {
      ...form,
      tags: Array.isArray(form.tags) ? form.tags : []
    }
    if (editingId.value) {
      await algorithmApi.update(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await algorithmApi.create(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await Promise.all([fetchData(), fetchStats(), fetchTags()])
  } catch (error) {
    logError('algorithm:submit', error, { editingId: editingId.value })
    ElMessage.error('提交失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该题目吗？', '提示', { type: 'warning' })
  try {
    await algorithmApi.delete(row.id)
    ElMessage.success('删除成功')
    await Promise.all([fetchData(), fetchStats(), fetchTags()])
  } catch (error) {
    logError('algorithm:delete', error, { id: row.id })
    ElMessage.error('删除失败')
  }
}

const updateFamiliarity = async (row) => {
  try {
    await algorithmApi.updateFamiliarity(row.id, row.familiarity)
    await Promise.all([fetchData(), fetchStats()])
  } catch (error) {
    logError('algorithm:update-familiarity', error, { id: row.id, familiarity: row.familiarity })
    ElMessage.error('更新熟悉度失败')
  }
}

const incrementReview = async (row) => {
  try {
    await algorithmApi.incrementReview(row.id)
    await Promise.all([fetchData(), fetchStats()])
  } catch (error) {
    logError('algorithm:increment-review', error, { id: row.id })
    ElMessage.error('更新复习次数失败')
  }
}

onMounted(async () => {
  loadQueryState()
  searchKeyword.value = searchForm.keyword
  // 非阻塞加载，避免首次进入显示loading旋转
  Promise.all([fetchData(), fetchStats(), fetchTags()])
})
</script>

<style scoped>
.algorithm-list {
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

.panel :deep(.el-tag) {
  border-radius: 10px;
  border: none;
  font-weight: 500;
  font-size: 11px;
  padding: 3px 10px;
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

.mr8 {
  margin-right: 8px;
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
