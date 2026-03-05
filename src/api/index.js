// 本地数据存储服务 - 使用 localStorage
const STORAGE_KEY = 'job_tracker_data'

// 获取所有数据
const getData = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  return {
    applications: [],
    writtenTests: [],
    interviews: []
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

    // 排序 - 先按状态优先级，再按投递日期倒序
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

  create(formData) {
    const data = getData()
    const newInterview = {
      id: generateId(),
      ...formData,
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