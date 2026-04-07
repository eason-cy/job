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
        <el-button size="small" @click="applyFamiliarityPreset(1)">Need Review</el-button>
        <el-button size="small" @click="applyFamiliarityPreset('')">All</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-loading="tableLoading" :data="tableData" stripe row-key="id" table-layout="auto">
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
  await Promise.all([fetchCompanies(), fetchData()])
})
</script>

<style scoped>
.interview-records {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 16px;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-item {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-filters {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.question-preview-btn {
  text-align: left;
  border: none;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
}
</style>
