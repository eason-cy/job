<template>
  <div class="interview-records">
    <!-- Search Section -->
    <div class="search-section">
      <el-form :inline="true" class="search-form">
        <el-form-item label="公司" class="search-item">
          <el-select v-model="searchForm.companyName" placeholder="全部公司" clearable filterable class="search-select">
            <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度" class="search-item">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable class="search-select-sm">
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
        </el-form-item>
      </el-form>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto">
          <el-table-column label="公司" width="160">
            <template #default="{ row }">
              <el-button link type="primary" class="company-link" @click="goToApplication(row.applicationId)">
                {{ row.companyName }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="岗位" width="130" />
          <el-table-column label="轮次" width="90">
            <template #default="{ row }">
              <span class="round-badge">第{{ row.round }}轮</span>
            </template>
          </el-table-column>
          <el-table-column prop="interviewDate" label="日期" width="120">
            <template #default="{ row }">
              <span class="date-text">{{ row.interviewDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="interviewType" label="形式" width="90">
            <template #default="{ row }">
              <el-tag size="small" class="type-tag">{{ row.interviewType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="结果" width="90">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" size="small">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="问题" min-width="220">
            <template #default="{ row }">
              <div class="question-preview" @click="openDetail(row)">
                {{ row.questions || '无记录' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="熟悉度" width="150">
            <template #default="{ row }">
              <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link class="action-link" @click="openDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-if="tableData.length === 0" description="暂无面试记录" />
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="面试详情" width="720px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="2" border class="detail-descriptions">
        <el-descriptions-item label="公司">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="轮次">
          <span class="round-badge">第{{ detailData.round }}轮</span>
        </el-descriptions-item>
        <el-descriptions-item label="日期">{{ detailData.interviewDate }}</el-descriptions-item>
        <el-descriptions-item label="形式">
          <el-tag size="small" class="type-tag">{{ detailData.interviewType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="面试官">{{ detailData.interviewer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="getResultType(detailData.result)" size="small">{{ detailData.result }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="熟悉度">
          <el-rate v-model="detailData.familiarity" :max="3" @change="updateDetailFamiliarity" />
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">问题记录</el-divider>
      <div class="content-box">
        <pre>{{ detailData.questions || '无记录' }}</pre>
      </div>

      <el-divider content-position="left">自我评价</el-divider>
      <div class="content-box">
        <pre>{{ detailData.performance || '无评价' }}</pre>
      </div>

      <el-divider content-position="left">备注</el-divider>
      <div class="content-box">
        <pre>{{ detailData.notes || '无备注' }}</pre>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="goToApplication(detailData.applicationId)">
          查看投递记录
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { interviewApi } from '../api'

const router = useRouter()

const searchForm = reactive({
  companyName: '',
  familiarity: null
})

const tableData = ref([])
const companies = ref([])
const detailVisible = ref(false)
const detailData = ref({})

const fetchData = async () => {
  try {
    const response = await interviewApi.listAll(searchForm)
    tableData.value = response.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const fetchCompanies = async () => {
  try {
    const response = await interviewApi.getCompanies()
    companies.value = response.data
  } catch (error) {
    console.error('获取公司列表失败:', error)
  }
}

const handleSearch = () => {
  fetchData()
}

const resetSearch = () => {
  searchForm.companyName = ''
  searchForm.familiarity = null
  fetchData()
}

const updateFamiliarity = async (row) => {
  try {
    await interviewApi.updateFamiliarity(row.id, row.familiarity)
    ElMessage.success('已更新熟悉度')
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const updateDetailFamiliarity = async () => {
  try {
    await interviewApi.updateFamiliarity(detailData.value.id, detailData.value.familiarity)
    ElMessage.success('已更新熟悉度')
    fetchData()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const goToApplication = (applicationId) => {
  if (applicationId) {
    router.push({ path: '/applications', query: { id: applicationId } })
  }
}

const getResultType = (result) => {
  const map = {
    '通过': 'success',
    '未通过': 'danger',
    '待定': 'warning'
  }
  return map[result] || 'info'
}

onMounted(() => {
  fetchData()
  fetchCompanies()
})
</script>

<style scoped>
.interview-records {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
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

.search-select {
  width: 200px;
}

.search-select-sm {
  width: 120px;
}

.search-actions {
  margin-bottom: 0 !important;
}

.search-btn {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.search-btn:hover {
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

.company-link {
  font-weight: 600;
  font-size: 14px;
}

.round-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.date-text {
  color: var(--text-muted);
  font-size: 13px;
}

.type-tag {
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.question-preview {
  cursor: pointer;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  transition: color 200ms ease;
}

.question-preview:hover {
  color: var(--primary-color);
}

.action-link {
  font-weight: 500;
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

.detail-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  background: var(--bg-secondary);
}

.content-box {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
}

.content-box pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
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

.content-box::-webkit-scrollbar {
  width: 6px;
}

.content-box::-webkit-scrollbar-track {
  background: transparent;
}

.content-box::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);
}
</style>