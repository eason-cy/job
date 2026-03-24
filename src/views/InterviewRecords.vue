<template>
  <div class="interview-records">
    <!-- 搜索栏 -->
    <el-card class="search-card card-hover">
      <el-form :inline="true">
        <el-form-item label="公司">
          <el-select v-model="searchForm.companyName" placeholder="全部公司" clearable filterable style="width: 200px">
            <el-option v-for="company in companies" :key="company" :label="company" :value="company" />
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card card-hover">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto">
        <el-table-column label="公司" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToApplication(row.applicationId)">
              {{ row.companyName }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="岗位" width="120" />
        <el-table-column label="轮次" width="80">
          <template #default="{ row }">第{{ row.round }}轮</template>
        </el-table-column>
        <el-table-column prop="interviewDate" label="日期" width="110" />
        <el-table-column prop="interviewType" label="形式" width="80" />
        <el-table-column label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)" size="small">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="问题" min-width="200">
          <template #default="{ row }">
            <div class="question-preview" @click="openDetail(row)">
              {{ row.questions || '无记录' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="140">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-empty v-if="tableData.length === 0" description="暂无面试记录" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="面试详情" width="700px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公司">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="轮次">第{{ detailData.round }}轮</el-descriptions-item>
        <el-descriptions-item label="日期">{{ detailData.interviewDate }}</el-descriptions-item>
        <el-descriptions-item label="形式">{{ detailData.interviewType }}</el-descriptions-item>
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
        <el-button type="primary" @click="goToApplication(detailData.applicationId)">查看投递记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  padding: 0;
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

.table-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
}

.question-preview {
  cursor: pointer;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.question-preview:hover {
  color: var(--primary-color);
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

.content-box {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.content-box pre {
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
</style>