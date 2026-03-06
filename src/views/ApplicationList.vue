<template>
  <div class="application-list">
    <div class="page-header">
      <h2>投递列表</h2>
      <el-button type="primary" class="add-btn" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新增投递
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card card-hover">
      <el-form :inline="true">
        <el-form-item label="公司名称" class="input-focus">
          <el-input
            v-model="searchForm.companyName"
            placeholder="请输入公司名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态" class="input-focus">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="reset-btn" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card card-hover">
      <el-table :data="tableData" stripe class="custom-table">
        <el-table-column prop="companyName" label="公司名称" min-width="120" />
        <el-table-column prop="position" label="岗位" min-width="120" />
        <el-table-column prop="jobType" label="类型" width="80" />
        <el-table-column prop="applyDate" label="投递日期" width="110" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" class="tag-glow">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hrContact" label="HR联系方式" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" plain class="btn-click" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="primary" class="btn-click" @click="openDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" plain class="btn-click" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑投递' : '新增投递'" width="550px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="岗位名称" prop="position">
          <el-input v-model="form.position" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select v-model="form.jobType" placeholder="请选择岗位类型">
            <el-option label="校招" value="校招" />
            <el-option label="实习" value="实习" />
          </el-select>
        </el-form-item>
        <el-form-item label="投递日期">
          <el-date-picker v-model="form.applyDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="HR联系方式">
          <el-input v-model="form.hrContact" placeholder="请输入HR联系方式" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="投递详情" width="900px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公司名称">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.jobType }}</el-descriptions-item>
        <el-descriptions-item label="投递日期">{{ detailData.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)" class="tag-glow">{{ detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="HR联系方式">{{ detailData.hrContact }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 笔试记录 -->
      <el-divider content-position="left">笔试记录</el-divider>
      <div class="record-section">
        <el-button size="small" type="primary" @click="openWrittenTestDialog" style="margin-bottom: 12px;">
          添加笔试记录
        </el-button>
        <el-table :data="writtenTests" stripe size="small" v-if="writtenTests.length">
          <el-table-column prop="testDate" label="日期" width="110" />
          <el-table-column prop="testType" label="类型" width="80" />
          <el-table-column prop="platform" label="平台" width="100" />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" size="small" class="tag-glow">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questions" label="题目" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" link type="primary" @click="editWrittenTest(row)">编辑</el-button>
                <el-button size="small" link type="danger" @click="deleteWrittenTest(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无笔试记录" :image-size="60" />
      </div>

      <!-- 面试记录 -->
      <el-divider content-position="left">面试记录</el-divider>
      <div class="record-section">
        <el-button size="small" type="primary" @click="openInterviewDialog" style="margin-bottom: 12px;">
          添加面试记录
        </el-button>
        <el-table :data="interviews" stripe size="small" v-if="interviews.length">
          <el-table-column prop="round" label="轮次" width="80">
            <template #default="{ row }">第{{ row.round }}轮</template>
          </el-table-column>
          <el-table-column prop="interviewDate" label="日期" width="110" />
          <el-table-column prop="interviewType" label="形式" width="80" />
          <el-table-column prop="interviewer" label="面试官" width="100" />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" size="small" class="tag-glow">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questions" label="问题" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" link type="primary" @click="editInterview(row)">编辑</el-button>
                <el-button size="small" link type="danger" @click="deleteInterview(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无面试记录" :image-size="60" />
      </div>
    </el-dialog>

    <!-- 笔试记录对话框 -->
    <el-dialog v-model="writtenTestDialogVisible" :title="editingWrittenTestId ? '编辑笔试' : '新增笔试'" width="550px" class="dialog-card" destroy-on-close>
      <el-form ref="writtenTestFormRef" :model="writtenTestForm" label-width="100px">
        <el-form-item label="笔试日期">
          <el-date-picker v-model="writtenTestForm.testDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="笔试类型">
          <el-select v-model="writtenTestForm.testType" placeholder="请选择类型">
            <el-option label="在线" value="在线" />
            <el-option label="现场" value="现场" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-input v-model="writtenTestForm.platform" placeholder="如：牛客、赛码等" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="writtenTestForm.result" placeholder="请选择结果">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目记录">
          <el-input v-model="writtenTestForm.questions" type="textarea" :rows="4" placeholder="请记录笔试题目" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="writtenTestForm.notes" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="writtenTestDialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="submitWrittenTest">确定</el-button>
      </template>
    </el-dialog>

    <!-- 面试记录对话框 -->
    <el-dialog v-model="interviewDialogVisible" :title="editingInterviewId ? '编辑面试' : '新增面试'" width="550px" class="dialog-card" destroy-on-close>
      <el-form ref="interviewFormRef" :model="interviewForm" label-width="100px">
        <el-form-item label="面试轮次">
          <el-input-number v-model="interviewForm.round" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="面试日期">
          <el-date-picker v-model="interviewForm.interviewDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="面试形式">
          <el-select v-model="interviewForm.interviewType" placeholder="请选择形式">
            <el-option label="视频" value="视频" />
            <el-option label="电话" value="电话" />
            <el-option label="现场" value="现场" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试官">
          <el-input v-model="interviewForm.interviewer" placeholder="请输入面试官信息" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="interviewForm.result" placeholder="请选择结果">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题记录">
          <el-input v-model="interviewForm.questions" type="textarea" :rows="4" placeholder="请记录面试问题" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="interviewForm.performance" type="textarea" :rows="2" placeholder="请输入表现评价" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="interviewForm.notes" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="submitInterview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationApi, writtenTestApi, interviewApi } from '../api'

const statusOptions = ['待处理', '流程中', '测评中', '笔试中', '面试中', '已offer', '已拒绝', '已淘汰']

const searchForm = reactive({
  companyName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

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
  hrContact: '',
  remark: ''
})

const rules = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }]
}

// 详情相关
const detailVisible = ref(false)
const detailData = ref({})
const writtenTests = ref([])
const interviews = ref([])

// 笔试记录相关
const writtenTestDialogVisible = ref(false)
const editingWrittenTestId = ref(null)
const writtenTestFormRef = ref(null)
const writtenTestForm = reactive({
  applicationId: null,
  testDate: '',
  testType: '',
  platform: '',
  result: '',
  questions: '',
  notes: ''
})

// 面试记录相关
const interviewDialogVisible = ref(false)
const editingInterviewId = ref(null)
const interviewFormRef = ref(null)
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

const getStatusType = (status) => {
  const map = {
    '待处理': 'info',
    '流程中': 'success',
    '测评中': 'warning',
    '笔试中': 'warning',
    '面试中': 'primary',
    '已offer': 'success',
    '已拒绝': 'danger',
    '已淘汰': 'danger'
  }
  return map[status] || 'info'
}

const getResultType = (result) => {
  const map = {
    '通过': 'success',
    '未通过': 'danger',
    '待定': 'warning'
  }
  return map[result] || 'info'
}

const fetchData = async () => {
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
    console.error('获取数据失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
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
      hrContact: row.hrContact,
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
      hrContact: '',
      remark: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (editingId.value) {
      await applicationApi.update(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await applicationApi.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除这条投递记录吗？关联的笔试和面试记录也会被删除', '提示', {
    type: 'warning'
  })
  try {
    await applicationApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 详情相关
const viewDetail = async (row) => {
  detailData.value = row
  detailVisible.value = true
  fetchWrittenTests(row.id)
  fetchInterviews(row.id)
}

const fetchWrittenTests = async (applicationId) => {
  try {
    const response = await writtenTestApi.listByApplication(applicationId)
    writtenTests.value = response.data
  } catch (error) {
    console.error('获取笔试记录失败:', error)
  }
}

const fetchInterviews = async (applicationId) => {
  try {
    const response = await interviewApi.listByApplication(applicationId)
    interviews.value = response.data
  } catch (error) {
    console.error('获取面试记录失败:', error)
  }
}

// 笔试记录相关
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
      await writtenTestApi.update(editingWrittenTestId.value, writtenTestForm)
      ElMessage.success('更新成功')
    } else {
      await writtenTestApi.create(writtenTestForm)
      ElMessage.success('创建成功')
    }
    writtenTestDialogVisible.value = false
    fetchWrittenTests(detailData.value.id)
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const deleteWrittenTest = async (row) => {
  await ElMessageBox.confirm('确定要删除这条笔试记录吗？', '提示', { type: 'warning' })
  try {
    await writtenTestApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchWrittenTests(detailData.value.id)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 面试记录相关
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
      await interviewApi.update(editingInterviewId.value, interviewForm)
      ElMessage.success('更新成功')
    } else {
      await interviewApi.create(interviewForm)
      ElMessage.success('创建成功')
    }
    interviewDialogVisible.value = false
    fetchInterviews(detailData.value.id)
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const deleteInterview = async (row) => {
  await ElMessageBox.confirm('确定要删除这条面试记录吗？', '提示', { type: 'warning' })
  try {
    await interviewApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchInterviews(detailData.value.id)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.application-list {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.add-btn {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-sm);
}

.add-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.search-card {
  margin-bottom: 20px;
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
  backdrop-filter: var(--glass-blur);
}

.search-btn {
  background: var(--primary-gradient);
  border: none;
}

.reset-btn {
  border-color: var(--border-color);
}

.table-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-card) !important;
  backdrop-filter: var(--glass-blur);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.record-section {
  min-height: 120px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
}

/* 对话框样式 */
.dialog-card .el-dialog {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

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

.dialog-card :deep(.el-dialog__footer) {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 16px 20px;
}

.submit-btn {
  background: var(--primary-gradient);
  border: none;
}

.submit-btn:hover {
  opacity: 0.9;
}

/* 修复：禁用表格行的全局主题过渡，避免对话框关闭时的刷新感 */
:deep(.el-table__row),
:deep(.el-table__row *),
:deep(.el-table__header-row),
:deep(.el-table__header-row *) {
  transition: none !important;
}
</style>