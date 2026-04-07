import { beforeEach, describe, expect, it } from 'vitest'
import { applicationApi, interviewApi } from '../src/api/index.js'

const STORAGE_KEY = 'job_tracker_data'

describe('api data layer', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it('creates application and lists it', async () => {
    await applicationApi.create({
      companyName: 'A Corp',
      position: 'FE',
      status: '待处理',
      applyDate: '2026-01-01'
    })

    const res = await applicationApi.list({ page: 0, size: 10 })
    expect(res.data.totalElements).toBe(1)
    expect(res.data.content[0].companyName).toBe('A Corp')
  })

  it('filters interview list by familiarity', async () => {
    const createRes = await applicationApi.create({
      companyName: 'B Corp',
      position: 'BE',
      status: '面试中',
      applyDate: '2026-01-02'
    })
    const appId = createRes.data.id

    await interviewApi.create({
      applicationId: appId,
      round: 1,
      interviewDate: '2026-03-01',
      familiarity: 1
    })
    await interviewApi.create({
      applicationId: appId,
      round: 2,
      interviewDate: '2026-03-02',
      familiarity: 3
    })

    const res = await interviewApi.listAll({ familiarity: 1 })
    expect(res.data.length).toBe(1)
    expect(res.data[0].familiarity).toBe(1)
  })
})
