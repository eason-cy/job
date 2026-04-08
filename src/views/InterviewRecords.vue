<template>
  <div class="interview-records">
    <div class="panel stats-panel">
      <div class="stat-item">
        <span>记录总数</span>
        <strong>{{ tableData.length }}</strong>
      </div>
      <div class="stat-item">
        <span>待复盘</span>
        <strong>{{ needReviewCount }}</strong>
      </div>
    </div>

    <div class="panel">
      <el-form :inline="true" class="search-form">
        <el-form-item label="公司">
          <el-select v-model="searchForm.companyName" placeholder="全部" clearable filterable>
            <el-option v-for="c in companies" :key="c" :label="c" :value="c" />
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
          <el-button type="primary" @click="fetchData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="quick-filters">
        <el-button size="small" @click="applyFamiliarityPreset(1)">待复习</el-button>
        <el-button size="small" @click="applyFamiliarityPreset('')">全部</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-loading="tableLoading && tableData.length > 0" element-loading-text="加载中..." :data="tableData" stripe row-key="id" table-layout="auto">
        <el-table-column prop="companyName" label="公司" width="140" />
        <el-table-column prop="position" label="岗位" width="130" />
        <el-table-column prop="round" label="轮次" width="80" />
        <el-table-column prop="interviewDate" label="日期" width="120" />
        <el-table-column prop="interviewType" label="形式" width="100" />
        <el-table-column prop="interviewer" label="面试官" width="120" />
        <el-table-column label="结果" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getResultType(row.result)">{{ row.result || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column label="问题记录" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <button type="button" class="question-preview-btn" @click="openDetail(row)">
              {{ row.questions || '--' }}
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="reviewCount" label="复盘次数" width="90" />
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="面试详情" width="760px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公司">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="轮次">{{ detailData.round }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ detailData.interviewDate }}</el-descriptions-item>
        <el-descriptions-item label="形式">{{ detailData.interviewType }}</el-descriptions-item>
        <el-descriptions-item label="面试官">{{ detailData.interviewer || '--' }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ detailData.result || '--' }}</el-descriptions-item>
        <el-descriptions-item label="熟悉度">{{ detailData.familiarity || 1 }}</el-descriptions-item>
        <el-descriptions-item label="问题记录" :span="2">{{ detailData.questions || '--' }}</el-descriptions-item>
        <el-descriptions-item label="自我评价" :span="2">{{ detailData.performance || '--' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { interviewApi } from '../api'
import { usePersistentQueryState } from '../composables/usePersistentQueryState'
import { logError } from '../utils/logger'

const tableLoading = ref(false)
const tableData = ref([])
const companies = ref([])
const detailVisible = ref(false)
const detailData = ref({})

const searchForm = reactive({
  companyName: '',
  familiarity: ''
})

const { load: loadQueryState } = usePersistentQueryState('job_tracker_interview_query', searchForm)

const needReviewCount = computed(() => tableData.value.filter((item) => Number(item.familiarity || 1) === 1).length)

const getResultType = (result) => {
  if (result === '通过') return 'success'
  if (result === '未通过') return 'danger'
  if (result === '待定') return 'warning'
  return 'info'
}

const fetchCompanies = async () => {
  try {
    const resp = await interviewApi.getCompanies()
    companies.value = resp.data || []
  } catch (error) {
    logError('interview:companies', error)
  }
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const resp = await interviewApi.listAll({
      companyName: searchForm.companyName || undefined,
      familiarity: searchForm.familiarity || undefined
    })
    tableData.value = resp.data || []
  } catch (error) {
    logError('interview:list-all', error)
    ElMessage.error('获取面试记录失败')
  } finally {
    tableLoading.value = false
  }
}

const resetSearch = () => {
  searchForm.companyName = ''
  searchForm.familiarity = ''
  fetchData()
}

const applyFamiliarityPreset = (familiarity) => {
  searchForm.familiarity = familiarity
  fetchData()
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const updateFamiliarity = async (row) => {
  try {
    await interviewApi.updateFamiliarity(row.id, row.familiarity)
    await fetchData()
  } catch (error) {
    logError('interview:update-familiarity', error, { id: row.id, familiarity: row.familiarity })
    ElMessage.error('更新熟悉度失败')
  }
}

onMounted(async () => {
  loadQueryState()
  // 非阻塞加载，避免首次进入显示loading旋转
  Promise.all([fetchCompanies(), fetchData()])
})
</script>

<style scoped>
.interview-records {
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.question-preview-btn {
  text-align: left;
  border: none;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: all 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.question-preview-btn:hover {
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
</style>
