<template>
  <div class="application-list">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-inner">
        <el-form :inline="true" class="search-form">
          <el-form-item label="公司名称" class="search-item">
            <el-input
              v-model="searchForm.companyName"
              placeholder="搜索公司..."
              clearable
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </el-form-item>
          <el-form-item label="状态" class="search-item">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="search-select">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item class="search-actions">
            <el-button type="primary" class="search-btn btn-glow" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button class="reset-btn" @click="resetSearch">重置</el-button>
            <el-button type="primary" class="add-btn btn-glow" @click="openDialog()">
              <el-icon><Plus /></el-icon>
              新增投递
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto" row-class-name="table-row">
          <el-table-column prop="companyName" label="公司名称" min-width="140">
            <template #default="{ row }">
              <div class="company-cell">
                <el-icon v-if="row.pinned" class="pin-icon"><Star /></el-icon>
                <span class="company-name">{{ row.companyName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="岗位" min-width="120" />
          <el-table-column prop="jobType" label="类型" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="row.jobType === '校招' ? 'primary' : 'success'">
                {{ row.jobType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyDate" label="投递日期" width="110" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
                <el-tag :color="getStatusColor(row.status)" class="status-tag">
                  {{ row.status }}
                </el-tag>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in statusOptions" :key="item" :command="item">
                      <el-tag :color="getStatusColor(item)" size="small" class="status-option-tag">{{ item }}</el-tag>
                    </el-dropdown-item>
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
                class="link-btn"
                @click="openLink(row.applyLink)"
              >
                <el-icon><Link /></el-icon>
                查看进度
              </el-button>
              <span v-else class="text-muted">未设置</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" :type="row.pinned ? 'warning' : 'default'" plain class="action-btn btn-click" @click="togglePin(row)">
                  <el-icon><Star /></el-icon>
                  {{ row.pinned ? '取消置顶' : '置顶' }}
                </el-button>
                <el-button size="small" type="primary" plain class="action-btn btn-click" @click="viewDetail(row)">详情</el-button>
                <el-button size="small" type="primary" class="action-btn btn-click" @click="openDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" plain class="action-btn btn-click" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
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

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑投递' : '新增投递'" width="560px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="dialog-form">
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
        <el-form-item label="投递链接">
          <el-input v-model="form.applyLink" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="投递详情" width="920px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="2" border class="detail-descriptions">
        <el-descriptions-item label="公司名称">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.jobType }}</el-descriptions-item>
        <el-descriptions-item label="投递日期">{{ detailData.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :color="getStatusColor(detailData.status)">{{ detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投递链接">
          <el-button v-if="detailData.applyLink" size="small" type="primary" link @click="openLink(detailData.applyLink)">
            <el-icon><Link /></el-icon>
            {{ detailData.applyLink }}
          </el-button>
          <span v-else>未设置</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- Written Tests Section -->
      <el-divider content-position="left">笔试记录</el-divider>
      <div class="record-section">
        <el-button size="small" type="primary" class="section-add-btn" @click="openWrittenTestDialog">
          <el-icon><Plus /></el-icon>添加笔试记录
        </el-button>
        <el-table :data="writtenTests" stripe size="small" v-if="writtenTests.length" class="record-table">
          <el-table-column prop="testDate" label="日期" width="110" />
          <el-table-column prop="testType" label="类型" width="80" />
          <el-table-column prop="platform" label="平台" width="100" />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" size="small">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questions" label="题目" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="editWrittenTest(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="deleteWrittenTest(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无笔试记录" :image-size="80" />
      </div>

      <!-- Interviews Section -->
      <el-divider content-position="left">面试记录</el-divider>
      <div class="record-section">
        <el-button size="small" type="primary" class="section-add-btn" @click="openInterviewDialog">
          <el-icon><Plus /></el-icon>添加面试记录
        </el-button>
        <el-table :data="interviews" stripe size="small" v-if="interviews.length" class="record-table">
          <el-table-column label="轮次" width="80">
            <template #default="{ row }">第{{ row.round }}轮</template>
          </el-table-column>
          <el-table-column prop="interviewDate" label="日期" width="110" />
          <el-table-column prop="interviewType" label="形式" width="80" />
          <el-table-column prop="interviewer" label="面试官" width="100" />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)" size="small">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questions" label="问题" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="editInterview(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="deleteInterview(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无面试记录" :image-size="80" />
      </div>
    </el-dialog>

    <!-- Written Test Dialog -->
    <el-dialog v-model="writtenTestDialogVisible" :title="editingWrittenTestId ? '编辑笔试' : '新增笔试'" width="560px" class="dialog-card" destroy-on-close>
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
          <el-input v-model="writtenTestForm.platform" placeholder="牛客、赛码等" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="writtenTestForm.result" placeholder="请选择结果">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目记录">
          <el-input v-model="writtenTestForm.questions" type="textarea" :rows="4" placeholder="记录笔试题目" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="writtenTestForm.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="writtenTestDialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="submitWrittenTest">确定</el-button>
      </template>
    </el-dialog>

    <!-- Interview Dialog -->
    <el-dialog v-model="interviewDialogVisible" :title="editingInterviewId ? '编辑面试' : '新增面试'" width="560px" class="dialog-card" destroy-on-close>
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
          <el-input v-model="interviewForm.interviewer" placeholder="面试官信息" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="interviewForm.result" placeholder="请选择结果">
            <el-option label="通过" value="通过" />
            <el-option label="未通过" value="未通过" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题记录">
          <el-input v-model="interviewForm.questions" type="textarea" :rows="4" placeholder="记录面试问题" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="interviewForm.performance" type="textarea" :rows="2" placeholder="表现评价" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="interviewForm.notes" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn btn-glow" @click="submitInterview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, Search, Plus, Link } from '@element-plus/icons-vue'
import { applicationApi, writtenTestApi, interviewApi } from '../api'

const statusOptions = ['待处理', '测评中', '笔试中', '面试中', '已offer', '已淘汰']

const searchForm = reactive({
  companyName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 16,
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
  applyLink: '',
  remark: ''
})

const rules = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }]
}

// Detail related
const detailVisible = ref(false)
const detailData = ref({})
const writtenTests = ref([])
const interviews = ref([])

// Written test related
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

// Interview related
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

const getStatusColor = (status) => {
  const map = {
    '待处理': '#3b82f6',
    '测评中': '#0ea5e9',
    '笔试中': '#6366f1',
    '面试中': '#06b6d4',
    '已offer': '#10b981',
    '已淘汰': '#64748b'
  }
  return map[status] || '#94a3b8'
}

const getResultType = (result) => {
  const map = {
    '通过': 'success',
    '未通过': 'danger',
    '待定': 'warning'
  }
  return map[result] || 'info'
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

const handleStatusChange = async (row, newStatus) => {
  try {
    await applicationApi.update(row.id, { status: newStatus })
    ElMessage.success('状态已更新')
    fetchData()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新失败')
    fetchData()
  }
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
  try {
    const submitData = { ...form }
    if (!editingId.value && !submitData.applyDate) {
      submitData.applyDate = new Date().toISOString().split('T')[0]
    }
    if (editingId.value) {
      await applicationApi.update(editingId.value, submitData)
      ElMessage.success('更新成功')
    } else {
      await applicationApi.create(submitData)
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

const togglePin = async (row) => {
  try {
    await applicationApi.update(row.id, { pinned: !row.pinned })
    ElMessage.success(row.pinned ? '已取消置顶' : '已置顶')
    fetchData()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

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

.search-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
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
  color: var(--text-secondary);
  font-weight: 500;
}

.search-input,
.search-select {
  min-width: 180px;
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
  transform: translateY(-1px);
  box-shadow: var(--glow-primary);
}

.reset-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
}

.reset-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
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

.custom-table {
  font-size: 14px;
}

.custom-table :deep(.el-table__cell) {
  padding: 16px 12px;
}

.custom-table :deep(.el-table__row) {
  transition: background-color 200ms ease;
}

.custom-table :deep(.el-table__row:hover > td) {
  background-color: var(--bg-glass) !important;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-icon {
  color: #fbbf24;
  font-size: 16px;
  animation: iconPulse 2s ease-in-out infinite;
}

.company-name {
  font-weight: 600;
  color: var(--text-primary);
}

.status-tag {
  color: white !important;
  border: none !important;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.status-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-option-tag {
  color: white !important;
  border: none !important;
}

.link-btn {
  font-weight: 500;
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
}

.action-btn {
  border-radius: var(--radius-sm);
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
  margin: 0;
}

.dialog-card :deep(.el-dialog__title) {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.dialog-card :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
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

/* === Detail Dialog === */
.detail-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  background: var(--bg-secondary);
}

.record-section {
  min-height: 120px;
  margin-top: 12px;
}

.section-add-btn {
  background: var(--primary-gradient);
  border: none;
  margin-bottom: 16px;
}

.record-table {
  border-radius: var(--radius-md);
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

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--primary-light);
}

/* === Animations === */
@keyframes iconPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Disable table row transitions for dialog closing UX */
:deep(.el-table__row),
:deep(.el-table__row *) {
  transition: background-color 200ms ease !important;
}
</style>