<template>
  <div class="bagu-list">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">题目总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value need-review-val">{{ statistics.needReview }}</div>
            <div class="stat-label">需要复习</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value normal">{{ statistics.byFamiliarity[2] || 0 }}</div>
            <div class="stat-label">一般</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value mastered">{{ statistics.byFamiliarity[3] || 0 }}</div>
            <div class="stat-label">已掌握</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card card-hover">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索问题或答案"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable style="width: 100px">
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" class="add-btn" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增八股题
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card card-hover">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto">
        <el-table-column label="问题" min-width="250">
          <template #default="{ row }">
            <div class="question-cell" @click="openDetail(row)">
              {{ row.question }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="140">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="reviewCount" label="复习次数" width="90" />
        <el-table-column label="上次复习" width="100">
          <template #default="{ row }">
            {{ row.lastReviewDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑八股题' : '新增八股题'" width="600px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
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
        <el-button type="primary" class="submit-btn" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="题目详情" width="700px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="问题">{{ detailData.question }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag size="small" type="info">{{ detailData.category }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="熟悉度">
          <el-rate v-model="detailData.familiarity" :max="3" @change="updateDetailFamiliarity" />
        </el-descriptions-item>
        <el-descriptions-item label="复习次数">{{ detailData.reviewCount || 0 }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">答案</el-divider>
      <div class="answer-content">
        <pre>{{ detailData.answer || '暂无答案' }}</pre>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="openDialog(detailData)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
}

.stat-content {
  text-align: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.need-review-val {
  color: #ef4444;
}

.stat-value.normal {
  color: #f59e0b;
}

.stat-value.mastered {
  color: #22c55e;
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.search-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
  margin-bottom: 16px;
}

.search-btn {
  background: var(--primary-gradient);
  border: none;
}

.add-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
}

.table-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.question-cell {
  cursor: pointer;
  color: var(--primary-color);
}

.question-cell:hover {
  text-decoration: underline;
}

/* 表格横向滚动容器 */
.table-wrapper {
  overflow-x: auto;
  position: relative;
}

/* 美化滚动条 */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  opacity: 0.8;
}

.answer-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.answer-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

/* 对话框样式 */
.dialog-card :deep(.el-dialog__header) {
  background: var(--primary-gradient);
  padding: 16px 20px;
  margin: 0;
}

.dialog-card :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.dialog-card :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.dialog-card :deep(.el-dialog__body) {
  padding: 24px;
  background: var(--bg-card);
}

.submit-btn {
  background: var(--primary-gradient);
  border: none;
}
</style>