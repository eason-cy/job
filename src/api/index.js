// 本地数据存储服务 - 使用 localStorage
const STORAGE_KEY = 'job_tracker_data'

// 获取所有数据
const getData = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    const parsed = JSON.parse(data)
    // 确保所有字段都存在（兼容旧数据）
    return {
      applications: parsed.applications || [],
      writtenTests: parsed.writtenTests || [],
      interviews: parsed.interviews || [],
      algorithms: parsed.algorithms || [],
      bagus: parsed.bagus || []
    }
  }
  return {
    applications: [],
    writtenTests: [],
    interviews: [],
    algorithms: [],   // 算法题
    bagus: []         // 八股题
  }
}

// 保存数据
const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 生成唯一ID
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9)

// 投递记录相关操作
export const applicationApi = {
  list(params = {}) {
    const data = getData()
    let result = [...data.applications]

    // 搜索过滤
    if (params.companyName) {
      result = result.filter(item =>
        item.companyName.toLowerCase().includes(params.companyName.toLowerCase())
      )
    }

    if (params.status) {
      result = result.filter(item => item.status === params.status)
    }

    // 排序 - 先按置顶，再按状态优先级，最后按投递日期倒序
    const statusPriority = {
      '已offer': 1,
      '流程中': 2,
      '面试中': 3,
      '笔试中': 4,
      '测评中': 5,
      '待处理': 6,
      '已拒绝': 7,
      '已淘汰': 8
    }

    result.sort((a, b) => {
      // 置顶记录排在最前面（处理undefined情况）
      const pinnedA = a.pinned === true
      const pinnedB = b.pinned === true
      if (pinnedA !== pinnedB) {
        return pinnedA ? -1 : 1
      }
      const priorityA = statusPriority[a.status] || 99
      const priorityB = statusPriority[b.status] || 99
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      // 状态相同时，按投递日期倒序
      const dateA = a.applyDate ? new Date(a.applyDate) : new Date(a.createTime)
      const dateB = b.applyDate ? new Date(b.applyDate) : new Date(b.createTime)
      return dateB - dateA
    })

    // 分页
    const page = params.page || 0
    const size = params.size || 10
    const total = result.length
    const start = page * size
    const end = start + size
    const content = result.slice(start, end)

    return Promise.resolve({
      data: {
        content,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page
      }
    })
  },

  get(id) {
    const data = getData()
    const app = data.applications.find(item => item.id === id)
    return Promise.resolve({ data: app })
  },

  create(formData) {
    const data = getData()
    const newApp = {
      id: generateId(),
      ...formData,
      pinned: false,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    data.applications.push(newApp)
    saveData(data)
    return Promise.resolve({ data: newApp })
  },

  update(id, formData) {
    const data = getData()
    const index = data.applications.findIndex(item => item.id === id)
    if (index !== -1) {
      data.applications[index] = {
        ...data.applications[index],
        ...formData,
        updateTime: new Date().toISOString()
      }
      saveData(data)
      return Promise.resolve({ data: data.applications[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  delete(id) {
    const data = getData()
    data.applications = data.applications.filter(item => item.id !== id)
    // 同时删除关联的笔试和面试记录
    data.writtenTests = data.writtenTests.filter(item => item.applicationId !== id)
    data.interviews = data.interviews.filter(item => item.applicationId !== id)
    saveData(data)
    return Promise.resolve()
  },

  getStatistics() {
    const data = getData()
    const total = data.applications.length
    const statusDistribution = {}

    data.applications.forEach(app => {
      if (app.status) {
        statusDistribution[app.status] = (statusDistribution[app.status] || 0) + 1
      }
    })

    const pending = statusDistribution['待处理'] || 0
    const interviewing = statusDistribution['面试中'] || 0

    return Promise.resolve({
      data: {
        total,
        pending,
        interviewing,
        statusDistribution
      }
    })
  }
}

// 笔试记录相关操作
export const writtenTestApi = {
  listByApplication(applicationId) {
    const data = getData()
    const result = data.writtenTests
      .filter(item => item.applicationId === applicationId)
      .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
    return Promise.resolve({ data: result })
  },

  create(formData) {
    const data = getData()
    const newTest = {
      id: generateId(),
      ...formData,
      createTime: new Date().toISOString()
    }
    data.writtenTests.push(newTest)
    saveData(data)
    return Promise.resolve({ data: newTest })
  },

  update(id, formData) {
    const data = getData()
    const index = data.writtenTests.findIndex(item => item.id === id)
    if (index !== -1) {
      data.writtenTests[index] = {
        ...data.writtenTests[index],
        ...formData
      }
      saveData(data)
      return Promise.resolve({ data: data.writtenTests[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  delete(id) {
    const data = getData()
    data.writtenTests = data.writtenTests.filter(item => item.id !== id)
    saveData(data)
    return Promise.resolve()
  }
}

// 面试记录相关操作
export const interviewApi = {
  listByApplication(applicationId) {
    const data = getData()
    const result = data.interviews
      .filter(item => item.applicationId === applicationId)
      .sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate))
    return Promise.resolve({ data: result })
  },

  // 获取所有面试记录（用于面试记录汇总页面）
  listAll(params = {}) {
    const data = getData()
    let result = data.interviews.map(item => {
      // 关联公司信息
      const app = data.applications.find(a => a.id === item.applicationId)
      return {
        ...item,
        companyName: app?.companyName || '',
        position: app?.position || ''
      }
    })

    // 按公司筛选
    if (params.companyName) {
      result = result.filter(item => item.companyName.includes(params.companyName))
    }

    // 按日期倒序
    result.sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate))

    return Promise.resolve({ data: result })
  },

  // 获取所有公司列表（用于筛选下拉）
  getCompanies() {
    const data = getData()
    const companies = [...new Set(data.applications.map(app => app.companyName))].filter(Boolean)
    return Promise.resolve({ data: companies })
  },

  create(formData) {
    const data = getData()
    const newInterview = {
      id: generateId(),
      ...formData,
      familiarity: formData.familiarity || 1,
      reviewCount: 0,
      createTime: new Date().toISOString()
    }
    data.interviews.push(newInterview)
    saveData(data)
    return Promise.resolve({ data: newInterview })
  },

  update(id, formData) {
    const data = getData()
    const index = data.interviews.findIndex(item => item.id === id)
    if (index !== -1) {
      data.interviews[index] = {
        ...data.interviews[index],
        ...formData
      }
      saveData(data)
      return Promise.resolve({ data: data.interviews[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  delete(id) {
    const data = getData()
    data.interviews = data.interviews.filter(item => item.id !== id)
    saveData(data)
    return Promise.resolve()
  },

  // 更新熟悉度
  updateFamiliarity(id, familiarity) {
    const data = getData()
    const index = data.interviews.findIndex(item => item.id === id)
    if (index !== -1) {
      data.interviews[index].familiarity = familiarity
      data.interviews[index].reviewCount = (data.interviews[index].reviewCount || 0) + 1
      data.interviews[index].lastReviewDate = new Date().toISOString().split('T')[0]
      saveData(data)
      return Promise.resolve({ data: data.interviews[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  }
}

// 算法题相关操作
export const algorithmApi = {
  list(params = {}) {
    const data = getData()
    let result = [...data.algorithms]

    // 按难度筛选
    if (params.difficulty) {
      result = result.filter(item => item.difficulty === params.difficulty)
    }

    // 按熟悉度筛选
    if (params.familiarity) {
      result = result.filter(item => item.familiarity === params.familiarity)
    }

    // 按标签筛选
    if (params.tag) {
      result = result.filter(item => item.tags && item.tags.includes(params.tag))
    }

    // 关键词搜索
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        String(item.leetcodeId).includes(kw)
      )
    }

    // 排序：熟悉度低的在前，同熟悉度按题号排序
    result.sort((a, b) => {
      if (a.familiarity !== b.familiarity) {
        return a.familiarity - b.familiarity
      }
      return a.leetcodeId - b.leetcodeId
    })

    // 分页
    const page = params.page || 0
    const size = params.size || 20
    const total = result.length
    const start = page * size
    const end = start + size
    const content = result.slice(start, end)

    return Promise.resolve({
      data: {
        content,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page
      }
    })
  },

  get(id) {
    const data = getData()
    const item = data.algorithms.find(item => item.id === id)
    return Promise.resolve({ data: item })
  },

  create(formData) {
    const data = getData()
    const newItem = {
      id: generateId(),
      ...formData,
      familiarity: formData.familiarity || 1,
      reviewCount: 0,
      createTime: new Date().toISOString()
    }
    data.algorithms.push(newItem)
    saveData(data)
    return Promise.resolve({ data: newItem })
  },

  update(id, formData) {
    const data = getData()
    const index = data.algorithms.findIndex(item => item.id === id)
    if (index !== -1) {
      data.algorithms[index] = {
        ...data.algorithms[index],
        ...formData,
        updateTime: new Date().toISOString()
      }
      saveData(data)
      return Promise.resolve({ data: data.algorithms[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  delete(id) {
    const data = getData()
    data.algorithms = data.algorithms.filter(item => item.id !== id)
    saveData(data)
    return Promise.resolve()
  },

  // 批量导入
  batchImport(questions) {
    const data = getData()
    const existingIds = new Set(data.algorithms.map(item => item.leetcodeId))
    const newItems = questions
      .filter(q => !existingIds.has(q.leetcodeId))
      .map(q => ({
        id: generateId(),
        ...q,
        familiarity: 1,
        reviewCount: 0,
        createTime: new Date().toISOString()
      }))
    data.algorithms.push(...newItems)
    saveData(data)
    return Promise.resolve({ data: { imported: newItems.length, skipped: questions.length - newItems.length } })
  },

  // 更新熟悉度
  updateFamiliarity(id, familiarity) {
    const data = getData()
    const index = data.algorithms.findIndex(item => item.id === id)
    if (index !== -1) {
      data.algorithms[index].familiarity = familiarity
      data.algorithms[index].reviewCount = (data.algorithms[index].reviewCount || 0) + 1
      data.algorithms[index].lastReviewDate = new Date().toISOString().split('T')[0]
      saveData(data)
      return Promise.resolve({ data: data.algorithms[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  // 获取统计数据
  getStatistics() {
    const data = getData()
    const total = data.algorithms.length
    const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 }
    const byFamiliarity = { 1: 0, 2: 0, 3: 0 }
    const tags = {}

    data.algorithms.forEach(item => {
      if (item.difficulty) byDifficulty[item.difficulty]++
      if (item.familiarity) byFamiliarity[item.familiarity]++
      if (item.tags) {
        item.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1
        })
      }
    })

    return Promise.resolve({
      data: {
        total,
        byDifficulty,
        byFamiliarity,
        needReview: byFamiliarity[1],
        tags
      }
    })
  },

  // 获取所有标签
  getTags() {
    const data = getData()
    const tags = new Set()
    data.algorithms.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag))
      }
    })
    return Promise.resolve({ data: [...tags] })
  }
}

// 八股题相关操作
export const baguApi = {
  list(params = {}) {
    const data = getData()
    let result = [...data.bagus]

    // 按分类筛选
    if (params.category) {
      result = result.filter(item => item.category === params.category)
    }

    // 按熟悉度筛选
    if (params.familiarity) {
      result = result.filter(item => item.familiarity === params.familiarity)
    }

    // 关键词搜索
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(item =>
        item.question.toLowerCase().includes(kw) ||
        (item.answer && item.answer.toLowerCase().includes(kw))
      )
    }

    // 排序：熟悉度低的在前
    result.sort((a, b) => {
      if (a.familiarity !== b.familiarity) {
        return a.familiarity - b.familiarity
      }
      return new Date(b.createTime) - new Date(a.createTime)
    })

    // 分页
    const page = params.page || 0
    const size = params.size || 20
    const total = result.length
    const start = page * size
    const end = start + size
    const content = result.slice(start, end)

    return Promise.resolve({
      data: {
        content,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size,
        number: page
      }
    })
  },

  get(id) {
    const data = getData()
    const item = data.bagus.find(item => item.id === id)
    return Promise.resolve({ data: item })
  },

  create(formData) {
    const data = getData()
    const newItem = {
      id: generateId(),
      ...formData,
      familiarity: formData.familiarity || 1,
      reviewCount: 0,
      createTime: new Date().toISOString()
    }
    data.bagus.push(newItem)
    saveData(data)
    return Promise.resolve({ data: newItem })
  },

  update(id, formData) {
    const data = getData()
    const index = data.bagus.findIndex(item => item.id === id)
    if (index !== -1) {
      data.bagus[index] = {
        ...data.bagus[index],
        ...formData,
        updateTime: new Date().toISOString()
      }
      saveData(data)
      return Promise.resolve({ data: data.bagus[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  delete(id) {
    const data = getData()
    data.bagus = data.bagus.filter(item => item.id !== id)
    saveData(data)
    return Promise.resolve()
  },

  // 更新熟悉度
  updateFamiliarity(id, familiarity) {
    const data = getData()
    const index = data.bagus.findIndex(item => item.id === id)
    if (index !== -1) {
      data.bagus[index].familiarity = familiarity
      data.bagus[index].reviewCount = (data.bagus[index].reviewCount || 0) + 1
      data.bagus[index].lastReviewDate = new Date().toISOString().split('T')[0]
      saveData(data)
      return Promise.resolve({ data: data.bagus[index] })
    }
    return Promise.reject(new Error('未找到记录'))
  },

  // 获取统计数据
  getStatistics() {
    const data = getData()
    const total = data.bagus.length
    const byCategory = {}
    const byFamiliarity = { 1: 0, 2: 0, 3: 0 }

    data.bagus.forEach(item => {
      if (item.category) byCategory[item.category] = (byCategory[item.category] || 0) + 1
      if (item.familiarity) byFamiliarity[item.familiarity]++
    })

    return Promise.resolve({
      data: {
        total,
        byCategory,
        byFamiliarity,
        needReview: byFamiliarity[1]
      }
    })
  },

  // 获取所有分类
  getCategories() {
    const data = getData()
    const categories = [...new Set(data.bagus.map(item => item.category).filter(Boolean))]
    return Promise.resolve({ data: categories })
  }
}

// 导出数据（备份用）
export const exportData = () => {
  const data = getData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `秋招记录备份_${new Date().toLocaleDateString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入数据
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.applications && data.writtenTests && data.interviews) {
          // 兼容旧数据格式，补充新字段
          if (!data.algorithms) data.algorithms = []
          if (!data.bagus) data.bagus = []
          saveData(data)
          resolve()
        } else {
          reject(new Error('数据格式不正确'))
        }
      } catch (err) {
        reject(new Error('解析文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}