<template>
  <div class="application-list">
    <div class="search-section">
      <el-form v-if="dataLoaded" :inline="true" class="search-form">
        <el-form-item label="公司名称">
          <el-input
            v-model="searchInput"
            placeholder="搜索公司..."
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
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
            新增投递
          </el-button>
        </el-form-item>
      </el-form>
      <div v-else class="skeleton-form">
        <el-skeleton animated :rows="2" />
      </div>
    </div>

    <div class="table-section">
      <el-table
        v-if="dataLoaded"
        v-loading="tableLoading"
        element-loading-text="加载中..."
        :data="tableData"
        stripe
        table-layout="auto"
      >
        <el-table-column prop="companyName" label="公司" min-width="160">
          <template #default="{ row }">
            <div class="company-cell">
              <el-icon v-if="row.pinned" class="pin-icon"><Star /></el-icon>
              <span>{{ row.companyName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="岗位" min-width="140" />
        <el-table-column prop="jobType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.jobType === '校招' ? 'primary' : 'success'">{{ row.jobType || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="投递日期" width="120" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
              <el-tag :color="getStatusColor(row.status)" effect="dark" class="clickable">{{ row.status }}</el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in statusOptions" :key="item" :command="item">{{ item }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column label="投递链接" min-width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.applyLink"
              size="small"
              type="primary"
              link
              @click="openLink(row.applyLink)"
            >
              <el-icon><Link /></el-icon>
              查看
            </el-button>
            <span v-else class="muted">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <el-button size="small" :type="row.pinned ? 'warning' : 'default'" plain @click="togglePin(row)">
                {{ row.pinned ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button size="small" type="primary" plain @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
            </div>
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
          :page-sizes="[16, 20, 30, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑投递' : '新增投递'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" />
        </el-form-item>
        <el-form-item label="岗位名称" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select v-model="form.jobType" placeholder="请选择">
            <el-option label="校招" value="校招" />
            <el-option label="实习" value="实习" />
          </el-select>
        </el-form-item>
        <el-form-item label="投递日期">
          <el-date-picker v-model="form.applyDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="投递链接">
          <el-input v-model="form.applyLink" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="投递详情" width="960px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公司名称">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.jobType || '--' }}</el-descriptions-item>
        <el-descriptions-item label="投递日期">{{ detailData.applyDate || '--' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :color="getStatusColor(detailData.status)" effect="dark">{{ detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投递链接">
          <el-button v-if="detailData.applyLink" size="small" type="primary" link @click="openLink(detailData.applyLink)">
            {{ detailData.applyLink }}
          </el-button>
          <span v-else>未设置</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '--' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>笔试记录</el-divider>
      <div class="record-toolbar">
        <el-button type="primary" size="small" @click="openWrittenTestDialog">新增笔试</el-button>
      </div>
      <el-table :data="writtenTests" size="small" border>
        <el-table-column prop="testDate" label="日期" width="120" />
        <el-table-column prop="testType" label="类型" width="100" />
        <el-table-column prop="platform" label="平台" min-width="120" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getResultType(row.result)">{{ row.result || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="questions" label="题目记录" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editWrittenTest(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteWrittenTest(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider>面试记录</el-divider>
      <div class="record-toolbar">
        <el-button type="primary" size="small" @click="openInterviewDialog">新增面试</el-button>
      </div>
      <el-table :data="interviews" size="small" border>
        <el-table-column prop="round" label="轮次" width="80" />
        <el-table-column prop="interviewDate" label="日期" width="120" />
        <el-table-column prop="interviewType" label="形式" width="100" />
        <el-table-column prop="interviewer" label="面试官" min-width="120" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getResultType(row.result)">{{ row.result || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="questions" label="问题记录" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editInterview(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteInterview(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="writtenTestDialogVisible" :title="editingWrittenTestId ? '编辑笔试' : '新增笔试'" width="560px" destroy-on-close>
      <el-form :model="writtenTestForm" label-width="100px">
        <el-form-item label="日期">
          <el-date-picker v-model="writtenTestForm.testDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="writtenTestForm.testType" placeholder="请选择">
            <el-option label="在线" value="在线" />
            <el-option label="现场" value="现场" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-input v-model="writtenTestForm.platform" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="writtenTestForm.result" placeholder="请选择">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目记录">
          <el-input v-model="writtenTestForm.questions" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="writtenTestForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="writtenTestDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitWrittenTest">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="interviewDialogVisible" :title="editingInterviewId ? '编辑面试' : '新增面试'" width="560px" destroy-on-close>
      <el-form :model="interviewForm" label-width="100px">
        <el-form-item label="轮次">
          <el-input-number v-model="interviewForm.round" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="interviewForm.interviewDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="形式">
          <el-select v-model="interviewForm.interviewType" placeholder="请选择">
            <el-option label="视频" value="视频" />
            <el-option label="电话" value="电话" />
            <el-option label="现场" value="现场" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试官">
          <el-input v-model="interviewForm.interviewer" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="interviewForm.result" placeholder="请选择">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题记录">
          <el-input v-model="interviewForm.questions" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="interviewForm.performance" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="interviewForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInterview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { watch, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Link, Plus, Search, Star } from '@element-plus/icons-vue'
import { applicationApi, interviewApi, writtenTestApi } from '../api'
import { usePersistentQueryState } from '../composables/usePersistentQueryState'
import { logError } from '../utils/logger'

const route = useRoute()
const router = useRouter()

const statusOptions = ['待处理', '测评中', '笔试中', '面试中', '已offer', '已淘汰']

const searchForm = reactive({
  companyName: '',
  status: ''
})

const searchInput = ref('')
let searchDebounceTimer = null

const pagination = reactive({
  page: 1,
  size: 16,
  total: 0
})

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

const tableLoading = ref(false)
const dataLoaded = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const form = reactive({
  companyName: '',
  position: '',
  jobType: '',
  applyDate: '',
  status: '待处理',
  applyLink: '',
  remark: ''
})

const rules = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }]
}

const detailVisible = ref(false)
const detailData = ref({})
const writtenTests = ref([])
const interviews = ref([])

const writtenTestDialogVisible = ref(false)
const editingWrittenTestId = ref(null)
const writtenTestForm = reactive({
  applicationId: null,
  testDate: '',
  testType: '',
  platform: '',
  result: '',
  questions: '',
  notes: ''
})

const interviewDialogVisible = ref(false)
const editingInterviewId = ref(null)
const interviewForm = reactive({
  applicationId: null,
  round: 1,
  interviewDate: '',
  interviewType: '',
  interviewer: '',
  result: '',
  questions: '',
  performance: '',
  notes: ''
})

const getStatusColor = (status) => {
  const map = {
    待处理: '#3b82f6',
    测评中: '#0ea5e9',
    笔试中: '#6366f1',
    面试中: '#06b6d4',
    已offer: '#10b981',
    已淘汰: '#64748b'
  }
  return map[status] || '#94a3b8'
}

const getResultType = (result) => {
  const map = {
    通过: 'success',
    未通过: 'danger',
    待定: 'warning'
  }
  return map[result] || 'info'
}

const openLink = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const response = await applicationApi.list({
      page: pagination.page - 1,
      size: pagination.size,
      companyName: searchForm.companyName || undefined,
      status: searchForm.status || undefined
    })
    tableData.value = response.data.content
    pagination.total = response.data.totalElements
  } catch (error) {
    logError('application:list', error)
    ElMessage.error('获取投递列表失败')
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
  searchInput.value = ''
  searchForm.companyName = ''
  searchForm.status = ''
  pagination.page = 1
  fetchData()
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      companyName: row.companyName,
      position: row.position,
      jobType: row.jobType,
      applyDate: row.applyDate,
      status: row.status,
      applyLink: row.applyLink,
      remark: row.remark
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      companyName: '',
      position: '',
      jobType: '',
      applyDate: '',
      status: '待处理',
      applyLink: '',
      remark: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  const payload = { ...form }
  if (!editingId.value && !payload.applyDate) {
    payload.applyDate = new Date().toISOString().split('T')[0]
  }

  try {
    if (editingId.value) {
      await applicationApi.update(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await applicationApi.create(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    logError('application:submit', error, { editingId: editingId.value })
    ElMessage.error('提交失败')
  }
}

const handleStatusChange = async (row, status) => {
  try {
    await applicationApi.update(row.id, { status })
    ElMessage.success('状态已更新')
    fetchData()
  } catch (error) {
    logError('application:update-status', error, { id: row.id, status })
    ElMessage.error('状态更新失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除这条投递记录？关联笔试和面试也会被删除。', '提示', { type: 'warning' })
  try {
    await applicationApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    logError('application:delete', error, { id: row.id })
    ElMessage.error('删除失败')
  }
}

const togglePin = async (row) => {
  try {
    await applicationApi.update(row.id, { pinned: !row.pinned })
    ElMessage.success(row.pinned ? '已取消置顶' : '已置顶')
    fetchData()
  } catch (error) {
    logError('application:pin', error, { id: row.id })
    ElMessage.error('操作失败')
  }
}

const fetchWrittenTests = async (applicationId) => {
  try {
    const response = await writtenTestApi.listByApplication(applicationId)
    writtenTests.value = response.data
  } catch (error) {
    logError('written-test:list', error, { applicationId })
  }
}

const fetchInterviews = async (applicationId) => {
  try {
    const response = await interviewApi.listByApplication(applicationId)
    interviews.value = response.data
  } catch (error) {
    logError('interview:list', error, { applicationId })
  }
}

const viewDetail = async (row) => {
  detailData.value = row
  detailVisible.value = true
  await Promise.all([fetchWrittenTests(row.id), fetchInterviews(row.id)])
  router.replace({ query: { ...route.query, applicationId: row.id } })
}

const openDetailFromRouteQuery = async () => {
  const applicationId = route.query.applicationId
  if (!applicationId) return

  const target = tableData.value.find((item) => String(item.id) === String(applicationId))
  if (target) {
    await viewDetail(target)
    return
  }

  try {
    const response = await applicationApi.get(applicationId)
    if (response.data) {
      await viewDetail(response.data)
    }
  } catch (error) {
    logError('application:route-detail', error, { applicationId })
  }
}

const openWrittenTestDialog = () => {
  editingWrittenTestId.value = null
  Object.assign(writtenTestForm, {
    applicationId: detailData.value.id,
    testDate: '',
    testType: '',
    platform: '',
    result: '',
    questions: '',
    notes: ''
  })
  writtenTestDialogVisible.value = true
}

const editWrittenTest = (row) => {
  editingWrittenTestId.value = row.id
  Object.assign(writtenTestForm, {
    applicationId: detailData.value.id,
    testDate: row.testDate,
    testType: row.testType,
    platform: row.platform,
    result: row.result,
    questions: row.questions,
    notes: row.notes
  })
  writtenTestDialogVisible.value = true
}

const submitWrittenTest = async () => {
  try {
    if (editingWrittenTestId.value) {
      await writtenTestApi.update(editingWrittenTestId.value, { ...writtenTestForm })
      ElMessage.success('笔试记录已更新')
    } else {
      await writtenTestApi.create({ ...writtenTestForm })
      ElMessage.success('笔试记录已新增')
    }
    writtenTestDialogVisible.value = false
    fetchWrittenTests(detailData.value.id)
  } catch (error) {
    logError('written-test:submit', error, { editingWrittenTestId: editingWrittenTestId.value })
    ElMessage.error('笔试提交失败')
  }
}

const deleteWrittenTest = async (row) => {
  await ElMessageBox.confirm('确定删除这条笔试记录？', '提示', { type: 'warning' })
  try {
    await writtenTestApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchWrittenTests(detailData.value.id)
  } catch (error) {
    logError('written-test:delete', error, { id: row.id })
    ElMessage.error('删除失败')
  }
}

const openInterviewDialog = () => {
  editingInterviewId.value = null
  Object.assign(interviewForm, {
    applicationId: detailData.value.id,
    round: 1,
    interviewDate: '',
    interviewType: '',
    interviewer: '',
    result: '',
    questions: '',
    performance: '',
    notes: ''
  })
  interviewDialogVisible.value = true
}

const editInterview = (row) => {
  editingInterviewId.value = row.id
  Object.assign(interviewForm, {
    applicationId: detailData.value.id,
    round: row.round,
    interviewDate: row.interviewDate,
    interviewType: row.interviewType,
    interviewer: row.interviewer,
    result: row.result,
    questions: row.questions,
    performance: row.performance,
    notes: row.notes
  })
  interviewDialogVisible.value = true
}

const submitInterview = async () => {
  try {
    if (editingInterviewId.value) {
      await interviewApi.update(editingInterviewId.value, { ...interviewForm })
      ElMessage.success('面试记录已更新')
    } else {
      await interviewApi.create({ ...interviewForm })
      ElMessage.success('面试记录已新增')
    }
    interviewDialogVisible.value = false
    fetchInterviews(detailData.value.id)
  } catch (error) {
    logError('interview:submit', error, { editingInterviewId: editingInterviewId.value })
    ElMessage.error('面试提交失败')
  }
}

const deleteInterview = async (row) => {
  await ElMessageBox.confirm('确定删除这条面试记录？', '提示', { type: 'warning' })
  try {
    await interviewApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchInterviews(detailData.value.id)
  } catch (error) {
    logError('interview:delete', error, { id: row.id })
    ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  loadQueryState()
  // 非阻塞加载数据，避免首次进入显示loading旋转
  fetchData().then(() => {
    openDetailFromRouteQuery()
  })
})
</script>

<style scoped>
.application-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section,
.table-section {
  background: var(--bg-card);
  border: none;
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-card);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-secondary);
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.search-form :deep(.el-select) {
  width: 140px;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.pin-icon {
  color: #f59e0b;
  transition: transform 200ms ease;
}

.pin-icon:hover {
  transform: scale(1.15);
}

/* Table Styling */
.table-section :deep(.el-table) {
  border-radius: 14px;
  overflow: hidden;
}

.table-section :deep(.el-table th.el-table__cell) {
  background: var(--bg-secondary);
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 14px 0;
}

.table-section :deep(.el-table td.el-table__cell) {
  padding: 16px 0;
  font-size: 13px;
}

.table-section :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: var(--bg-secondary);
}

.table-section :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%) !important;
}

.table-section :deep(.el-table__body tr) {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Status Tags */
.table-section :deep(.el-tag) {
  border-radius: 10px;
  font-weight: 500;
  border: none;
  padding: 4px 12px;
  font-size: 11px;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.table-section :deep(.el-tag:hover) {
  transform: scale(1.05);
}

.table-section :deep(.el-tag.clickable) {
  cursor: pointer;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.actions :deep(.el-button) {
  border-radius: 10px;
  font-weight: 500;
  font-size: 12px;
  padding: 6px 12px;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.actions :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.actions :deep(.el-button:active) {
  transform: scale(0.96);
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination-wrap :deep(.el-pagination button) {
  border-radius: 10px;
}

.pagination-wrap :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 500;
}

.record-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}

.muted {
  color: var(--text-muted);
  font-size: 12px;
}

.clickable {
  cursor: pointer;
}

/* Dialog Styling */
:deep(.el-dialog) {
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 17px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 10px;
}

/* Descriptions */
:deep(.el-descriptions) {
  border-radius: 14px;
  overflow: hidden;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  background: var(--bg-secondary);
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

.skeleton-form {
  padding: 8px 0;
}

.skeleton-table {
  padding: 8px 0;
}
</style>
