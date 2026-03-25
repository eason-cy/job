<template>
  <div class="algorithm-list">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">题目总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value need-review-val">{{ statistics.needReview }}</div>
            <div class="stat-label">需要复习</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value easy">{{ statistics.byDifficulty.Easy || 0 }}</div>
            <div class="stat-label">简单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value medium">{{ statistics.byDifficulty.Medium || 0 }}</div>
            <div class="stat-label">中等</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card card-hover">
          <div class="stat-content">
            <div class="stat-value hard">{{ statistics.byDifficulty.Hard || 0 }}</div>
            <div class="stat-label">困难</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
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
            placeholder="题号或标题"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="searchForm.difficulty" placeholder="全部" clearable style="width: 100px">
            <el-option label="简单" value="Easy" />
            <el-option label="中等" value="Medium" />
            <el-option label="困难" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-select v-model="searchForm.familiarity" placeholder="全部" clearable style="width: 100px">
            <el-option label="不熟" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="熟练" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="searchForm.tag" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" class="add-btn" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增题目
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card card-hover">
      <div class="table-wrapper">
        <el-table :data="tableData" stripe class="custom-table" table-layout="auto" row-key="id">
        <el-table-column prop="leetcodeId" label="题号" width="80" />
        <el-table-column label="题目" min-width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openUrl(row.url)">
              {{ row.title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="80">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)" size="small">
              {{ getDifficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags?.slice(0, 3)" :key="tag" size="small" class="tag-item">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="熟悉度" width="140">
          <template #default="{ row }">
            <el-rate v-model="row.familiarity" :max="3" @change="updateFamiliarity(row)" />
          </template>
        </el-table-column>
        <el-table-column label="复习次数" width="110">
          <template #default="{ row }">
            <span>{{ row.reviewCount || 0 }}</span>
            <el-button size="small" type="success" link @click="incrementReview(row)" style="margin-left: 4px;">
              <el-icon><Plus /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDetail(row)">详情</el-button>
            <el-button size="small" type="warning" link @click="openDialog(row)">编辑</el-button>
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
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑题目' : '新增题目'" width="550px" class="dialog-card" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题号" prop="leetcodeId">
          <el-input v-model.number="form.leetcodeId" placeholder="LeetCode题号" style="width: 150px" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="题目标题" />
        </el-form-item>
        <el-form-item label="链接" prop="url">
          <el-input v-model="form.url" placeholder="题目链接 (如: https://leetcode.cn/problems/xxx/)" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="选择难度">
            <el-option label="简单" value="Easy" />
            <el-option label="中等" value="Medium" />
            <el-option label="困难" value="Hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="选择或输入标签" style="width: 100%">
            <el-option v-for="tag in defaultTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="熟悉度">
          <el-rate v-model="form.familiarity" :max="3" show-text :texts="['不熟', '一般', '熟练']" />
        </el-form-item>
        <el-form-item label="笔记">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="记录解题思路、注意事项等..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="题目详情" width="600px" class="dialog-card" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="题号">{{ detailData.leetcodeId }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="链接">
          <el-button link type="primary" @click="openUrl(detailData.url)">
            {{ detailData.url }}
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="难度">
          <el-tag :type="getDifficultyType(detailData.difficulty)" size="small">
            {{ getDifficultyLabel(detailData.difficulty) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-for="tag in detailData.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="熟悉度">
          <el-rate v-model="detailData.familiarity" :max="3" @change="saveDetailFamiliarity" />
        </el-descriptions-item>
        <el-descriptions-item label="复习次数">
          {{ detailData.reviewCount || 0 }}
          <el-button size="small" type="success" link @click="incrementReviewDetail" style="margin-left: 4px;">
            <el-icon><Plus /></el-icon>复习
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="上次复习">{{ detailData.lastReviewDate || '未复习' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">笔记</el-divider>
      <el-input
        v-model="detailData.notes"
        type="textarea"
        :rows="4"
        placeholder="记录解题思路、注意事项等..."
      />

      <template #footer>
        <el-button @click="detailVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNotes">保存笔记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { algorithmApi } from '../api'
import { leetcodeHot100 } from '../data/leetcodeHot100'

const searchForm = reactive({
  keyword: '',
  difficulty: '',
  familiarity: null,
  tag: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const tableData = ref([])
const allTags = ref([])
const statistics = ref({
  total: 0,
  byDifficulty: {},
  byFamiliarity: {},
  needReview: 0
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
  difficulty: 'Medium',
  tags: [],
  familiarity: 1,
  notes: ''
})

const rules = {
  leetcodeId: [{ required: true, message: '请输入题号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
}

const defaultTags = [
  '数组', '字符串', '链表', '树', '二叉树', '二叉搜索树',
  '栈', '队列', '堆', '哈希表', '集合',
  '双指针', '滑动窗口', '二分查找', '回溯', '递归',
  '动态规划', '贪心', '分治',
  '深度优先搜索', '广度优先搜索', '拓扑排序',
  '图', '并查集', '前缀树',
  '排序', '归并排序', '快速选择',
  '位运算', '数学', '几何',
  '设计', '模拟'
]

const fetchData = async () => {
  try {
    const response = await algorithmApi.list({
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

// 本地排序函数
const sortTableData = () => {
  tableData.value.sort((a, b) => {
    const reviewA = a.reviewCount || 0
    const reviewB = b.reviewCount || 0
    if (reviewA !== reviewB) {
      return reviewB - reviewA
    }
    const famA = a.familiarity || 1
    const famB = b.familiarity || 1
    if (famA !== famB) {
      return famA - famB
    }
    return a.leetcodeId - b.leetcodeId
  })
}

const fetchStatistics = async () => {
  try {
    const response = await algorithmApi.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const fetchTags = async () => {
  try {
    const response = await algorithmApi.getTags()
    allTags.value = response.data
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.difficulty = ''
  searchForm.familiarity = null
  searchForm.tag = ''
  pagination.page = 1
  fetchData()
}

const openDialog = (row) => {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      leetcodeId: row.leetcodeId,
      title: row.title,
      url: row.url || '',
      difficulty: row.difficulty,
      tags: row.tags || [],
      familiarity: row.familiarity || 1,
      notes: row.notes || ''
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      leetcodeId: null,
      title: '',
      url: '',
      difficulty: 'Medium',
      tags: [],
      familiarity: 1,
      notes: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    // 自动生成URL
    let url = form.url
    if (!url && form.title) {
      // 根据标题生成slug
      const slug = form.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      url = `https://leetcode.cn/problems/${slug}/`
    }

    const submitData = {
      leetcodeId: Number(form.leetcodeId),
      title: form.title,
      titleSlug: form.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      url: url,
      difficulty: form.difficulty,
      tags: form.tags,
      familiarity: form.familiarity,
      notes: form.notes
    }

    if (editingId.value) {
      await algorithmApi.update(editingId.value, submitData)
      ElMessage.success('更新成功')
    } else {
      await algorithmApi.create(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
    fetchStatistics()
    fetchTags()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  }
}

const updateFamiliarity = async (row) => {
  try {
    const response = await algorithmApi.updateFamiliarity(row.id, row.familiarity)
    // 本地更新数据
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    // 本地排序
    sortTableData()
    ElMessage.success('已更新熟悉度')
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

// 增加复习次数
const incrementReview = async (row) => {
  try {
    const response = await algorithmApi.incrementReview(row.id)
    // 本地更新数据
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    // 本地排序
    sortTableData()
    ElMessage.success('已记录复习')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const saveDetailFamiliarity = async () => {
  try {
    const response = await algorithmApi.updateFamiliarity(detailData.value.id, detailData.value.familiarity)
    // 更新详情数据
    detailData.value = { ...detailData.value, ...response.data }
    // 本地更新列表数据
    const index = tableData.value.findIndex(item => item.id === detailData.value.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    // 本地排序
    sortTableData()
    ElMessage.success('已更新熟悉度')
    fetchStatistics()
  } catch (error) {
    console.error('更新失败:', error)
  }
}

// 详情页增加复习次数
const incrementReviewDetail = async () => {
  try {
    const response = await algorithmApi.incrementReview(detailData.value.id)
    // 更新详情数据
    detailData.value = { ...detailData.value, ...response.data }
    // 本地更新列表数据
    const index = tableData.value.findIndex(item => item.id === detailData.value.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...response.data }
    }
    // 本地排序
    sortTableData()
    ElMessage.success('已记录复习')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const openDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const saveNotes = async () => {
  try {
    await algorithmApi.update(detailData.value.id, {
      notes: detailData.value.notes,
      familiarity: detailData.value.familiarity
    })
    ElMessage.success('笔记已保存')
    detailVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除题目 "${row.title}" 吗？`, '提示', { type: 'warning' })
  try {
    await algorithmApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const openUrl = (url) => {
  if (url) window.open(url, '_blank')
}

const getDifficultyType = (difficulty) => {
  const map = { Easy: 'success', Medium: 'warning', Hard: 'danger' }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = { Easy: '简单', Medium: '中等', Hard: '困难' }
  return map[difficulty] || difficulty
}

// 初始化：自动导入Hot 100题目
const initHot100 = async () => {
  try {
    const data = localStorage.getItem('job_tracker_data')
    const parsed = data ? JSON.parse(data) : {}
    const algorithms = parsed.algorithms || []

    // 检查是否需要导入或补充题目
    if (algorithms.length === 0) {
      // 完全空，全部导入
      const result = await algorithmApi.batchImport(leetcodeHot100)
      console.log(`已自动导入LeetCode Hot 100题目，共${result.data.imported}题`)
    } else if (algorithms.length < leetcodeHot100.length) {
      // 有题目但不足，补充缺少的
      const existingIds = new Set(algorithms.map(item => item.leetcodeId))
      const missingQuestions = leetcodeHot100.filter(q => !existingIds.has(q.leetcodeId))
      if (missingQuestions.length > 0) {
        const result = await algorithmApi.batchImport(missingQuestions)
        console.log(`已补充${result.data.imported}题`)
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

onMounted(async () => {
  await initHot100()
  fetchData()
  fetchStatistics()
  fetchTags()
})
</script>

<style scoped>
.algorithm-list {
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

.stat-value.easy {
  color: #22c55e;
}

.stat-value.medium {
  color: #f59e0b;
}

.stat-value.hard {
  color: #ef4444;
}

.stat-value.mastered {
  color: #3b82f6;
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

.tag-item {
  margin-right: 4px;
  margin-bottom: 2px;
}

/* 表格横向滚动容器 */
.table-wrapper {
  overflow-x: auto;
  position: relative;
}

/* 表格行过渡动画 */
:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__body-wrapper) {
  transition: all 0.3s ease;
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