/**
 * adminAgentApi.test.js — Vitest suite for all 11 agent admin endpoints
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminAgentApi from '../adminAgentApi'

vi.mock('../../axios', () => ({
  default: {
    get:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
    interceptors: { request:{use:vi.fn()}, response:{use:vi.fn()} },
  },
}))
import api from '../../axios'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockList = [
  { id:1, agentName:'Pinnacle Tours', companyName:'Pinnacle Pvt Ltd', ownerName:'Arun Silva', email:'arun@pinnacle.lk', phone:'+94771234567', location:'Colombo', applicationStatus:'Pending', submittedDate:'2024-01-15', isActive:true },
  { id:2, agentName:'Trail Blazers',  companyName:'Trail Co',          ownerName:'Nimal Perera', email:'nimal@trail.lk', phone:'+94769876543', location:'Kandy',   applicationStatus:'Approved', submittedDate:'2023-06-10', isActive:true },
]
const mockDetail = { id:1, initials:'PT', agentName:'Pinnacle Tours', companyName:'Pinnacle Pvt Ltd', profileImage:null, ownerName:'Arun Silva', email:'arun@pinnacle.lk', phone:'+94771234567', location:'Colombo', memberSince:'2024-01-15', applicationStatus:'Pending', submittedDate:'2024-01-15', nicImageUrl:'https://nic.jpg', rating:4.2, totalTrips:34, experienceYears:5, isActive:true }
const mockStats   = { agentId:1, agentName:'Pinnacle Tours', companyName:'Pinnacle Pvt Ltd', agentRating:4.2, totalRevenue:125000, totalTrips:34, averageRating:4.2, cancellationRate:3.5 }
const mockPkgs    = [{ id:10, packageName:'Kandy Cultural Tour', applicationStatus:'Approved' }, { id:11, packageName:'Ella Trail', applicationStatus:'Pending' }]
const mockRevenue = { period:'Monthly', labels:['J','F','M','A','M','J','J','A','S','O','N','D'], data:[5000,6200,7800,4500,9100,11000,8200,7600,6800,9500,10200,12400] }

const wrap = (data) => ({ data: { success:true, message:'OK', data } })
beforeEach(() => vi.clearAllMocks())

// ── 1. GET /admin/agents ───────────────────────────────────────────────────────
describe('GET /admin/agents — getAllAgents()', () => {
  it('calls correct URL and returns agent list', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminAgentApi.getAllAgents()
    expect(api.get).toHaveBeenCalledWith('/admin/agents')
    expect(result.data).toHaveLength(2)
    expect(result.data[0].agentName).toBe('Pinnacle Tours')
  })

  it('returns empty array when no agents', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminAgentApi.getAllAgents()
    expect(result.data).toHaveLength(0)
  })

  it('response contains all AdminAgentListResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminAgentApi.getAllAgents()
    const a = result.data[0]
    ;['id','agentName','companyName','ownerName','email','phone','location','applicationStatus','submittedDate','isActive']
      .forEach(f => expect(a).toHaveProperty(f))
  })

  it('applicationStatus is one of Pending/Approved/Rejected', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminAgentApi.getAllAgents()
    result.data.forEach(a => expect(['Pending','Approved','Rejected']).toContain(a.applicationStatus))
  })

  it('propagates 401', async () => {
    api.get.mockRejectedValueOnce({response:{status:401}})
    await expect(adminAgentApi.getAllAgents()).rejects.toMatchObject({response:{status:401}})
  })

  it('propagates network error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminAgentApi.getAllAgents()).rejects.toThrow('Network Error')
  })
})

// ── 2. GET /admin/agents/status ───────────────────────────────────────────────
describe('GET /admin/agents/status — getAgentsByStatus()', () => {
  it('fetches Pending agents', async () => {
    const pending = mockList.filter(a=>a.applicationStatus==='Pending')
    api.get.mockResolvedValueOnce(wrap(pending))
    const result = await adminAgentApi.getAgentsByStatus('Pending')
    expect(api.get).toHaveBeenCalledWith('/admin/agents/status', {params:{status:'Pending'}})
    expect(result.data[0].applicationStatus).toBe('Pending')
  })

  it('fetches Approved agents', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList.filter(a=>a.applicationStatus==='Approved')))
    const result = await adminAgentApi.getAgentsByStatus('Approved')
    expect(api.get).toHaveBeenCalledWith('/admin/agents/status', {params:{status:'Approved'}})
    expect(result.data[0].applicationStatus).toBe('Approved')
  })

  it('returns empty for Rejected when none exist', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminAgentApi.getAgentsByStatus('Rejected')
    expect(result.data).toHaveLength(0)
  })

  it('propagates 403', async () => {
    api.get.mockRejectedValueOnce({response:{status:403}})
    await expect(adminAgentApi.getAgentsByStatus('Pending')).rejects.toMatchObject({response:{status:403}})
  })
})

// ── 3. GET /admin/agents/search ───────────────────────────────────────────────
describe('GET /admin/agents/search — searchAgents()', () => {
  it('passes keyword param and returns results', async () => {
    api.get.mockResolvedValueOnce(wrap([mockList[0]]))
    const result = await adminAgentApi.searchAgents('Pinnacle')
    expect(api.get).toHaveBeenCalledWith('/admin/agents/search', {params:{keyword:'Pinnacle'}})
    expect(result.data[0].agentName).toBe('Pinnacle Tours')
  })

  it('returns empty array when no match', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminAgentApi.searchAgents('xyz123')
    expect(result.data).toHaveLength(0)
  })

  it('propagates 400 for empty keyword', async () => {
    api.get.mockRejectedValueOnce({response:{status:400}})
    await expect(adminAgentApi.searchAgents('')).rejects.toMatchObject({response:{status:400}})
  })
})

// ── 4. GET /admin/agents/{id} ─────────────────────────────────────────────────
describe('GET /admin/agents/{id} — getAgentDetail()', () => {
  it('fetches full detail by id', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminAgentApi.getAgentDetail(1)
    expect(api.get).toHaveBeenCalledWith('/admin/agents/1')
    expect(result.data.id).toBe(1)
    expect(result.data.agentName).toBe('Pinnacle Tours')
  })

  it('response contains all AdminAgentDetailResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminAgentApi.getAgentDetail(1)
    ;['id','initials','agentName','companyName','ownerName','email','phone','location','memberSince','applicationStatus','nicImageUrl','rating','totalTrips','experienceYears','isActive']
      .forEach(f => expect(result.data).toHaveProperty(f))
  })

  it('propagates 404', async () => {
    api.get.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.getAgentDetail(999)).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 5. GET /admin/agents/{id}/packages ───────────────────────────────────────
describe('GET /admin/agents/{id}/packages — getAgentPackages()', () => {
  it('fetches packages for agent', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPkgs))
    const result = await adminAgentApi.getAgentPackages(1)
    expect(api.get).toHaveBeenCalledWith('/admin/agents/1/packages')
    expect(result.data).toHaveLength(2)
    expect(result.data[0].packageName).toBe('Kandy Cultural Tour')
  })

  it('returns empty array for agent with no packages', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminAgentApi.getAgentPackages(1)
    expect(result.data).toHaveLength(0)
  })

  it('propagates 404', async () => {
    api.get.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.getAgentPackages(999)).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 6. GET /admin/agents/{id}/stats ──────────────────────────────────────────
describe('GET /admin/agents/{id}/stats — getAgentStats()', () => {
  it('fetches stats for agent', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    const result = await adminAgentApi.getAgentStats(1)
    expect(api.get).toHaveBeenCalledWith('/admin/agents/1/stats')
    expect(result.data.agentId).toBe(1)
  })

  it('response contains all stat fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    const result = await adminAgentApi.getAgentStats(1)
    ;['agentId','agentName','companyName','agentRating','totalRevenue','totalTrips','averageRating','cancellationRate']
      .forEach(f => expect(result.data).toHaveProperty(f))
  })

  it('propagates 404', async () => {
    api.get.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.getAgentStats(999)).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 7. GET /admin/agents/{id}/revenue ────────────────────────────────────────
describe('GET /admin/agents/{id}/revenue — getAgentRevenue()', () => {
  it('fetches revenue with year param', async () => {
    api.get.mockResolvedValueOnce(wrap(mockRevenue))
    const result = await adminAgentApi.getAgentRevenue(1, 2024)
    expect(api.get).toHaveBeenCalledWith('/admin/agents/1/revenue', {params:{year:2024}})
    expect(result.data.period).toBe('Monthly')
    expect(result.data.labels).toHaveLength(12)
    expect(result.data.data).toHaveLength(12)
  })

  it('data array contains numeric values', async () => {
    api.get.mockResolvedValueOnce(wrap(mockRevenue))
    const result = await adminAgentApi.getAgentRevenue(1, 2024)
    result.data.data.forEach(v => expect(typeof v).toBe('number'))
  })

  it('propagates 404', async () => {
    api.get.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.getAgentRevenue(999,2024)).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 8. PATCH /admin/agents/{id}/approve ──────────────────────────────────────
describe('PATCH /admin/agents/{id}/approve — approveAgent()', () => {
  it('calls correct URL', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, applicationStatus:'Approved'}))
    const result = await adminAgentApi.approveAgent(1)
    expect(api.patch).toHaveBeenCalledWith('/admin/agents/1/approve')
    expect(result.data.applicationStatus).toBe('Approved')
  })

  it('sends no body', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, applicationStatus:'Approved'}))
    await adminAgentApi.approveAgent(1)
    expect(api.patch.mock.calls[0]).toHaveLength(1)
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.approveAgent(999)).rejects.toMatchObject({response:{status:404}})
  })

  it('propagates 403', async () => {
    api.patch.mockRejectedValueOnce({response:{status:403}})
    await expect(adminAgentApi.approveAgent(1)).rejects.toMatchObject({response:{status:403}})
  })
})

// ── 9. PATCH /admin/agents/{id}/reject ───────────────────────────────────────
describe('PATCH /admin/agents/{id}/reject — rejectAgent()', () => {
  it('rejects with a reason', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, applicationStatus:'Rejected'}))
    const result = await adminAgentApi.rejectAgent(1, 'Incomplete docs')
    expect(api.patch).toHaveBeenCalledWith('/admin/agents/1/reject', {reason:'Incomplete docs'})
    expect(result.data.applicationStatus).toBe('Rejected')
  })

  it('sends reason: null when omitted', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, applicationStatus:'Rejected'}))
    await adminAgentApi.rejectAgent(1, null)
    expect(api.patch).toHaveBeenCalledWith('/admin/agents/1/reject', {reason:null})
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.rejectAgent(999,'r')).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 10. PATCH /admin/agents/{id}/toggle-active ───────────────────────────────
describe('PATCH /admin/agents/{id}/toggle-active — toggleAgentActive()', () => {
  it('calls correct URL', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, isActive:false}))
    const result = await adminAgentApi.toggleAgentActive(1)
    expect(api.patch).toHaveBeenCalledWith('/admin/agents/1/toggle-active')
    expect(result.data.isActive).toBe(false)
  })

  it('toggles back to true', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, isActive:true}))
    const result = await adminAgentApi.toggleAgentActive(1)
    expect(result.data.isActive).toBe(true)
  })

  it('sends no body', async () => {
    api.patch.mockResolvedValueOnce(wrap({...mockDetail, isActive:false}))
    await adminAgentApi.toggleAgentActive(1)
    expect(api.patch.mock.calls[0]).toHaveLength(1)
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.toggleAgentActive(999)).rejects.toMatchObject({response:{status:404}})
  })
})

// ── 11. DELETE /admin/agents/{id} ────────────────────────────────────────────
describe('DELETE /admin/agents/{id} — deleteAgent()', () => {
  it('calls DELETE on correct URL', async () => {
    api.delete.mockResolvedValueOnce(wrap(null))
    const result = await adminAgentApi.deleteAgent(1)
    expect(api.delete).toHaveBeenCalledWith('/admin/agents/1')
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it('uses the correct id in URL', async () => {
    api.delete.mockResolvedValueOnce(wrap(null))
    await adminAgentApi.deleteAgent(42)
    expect(api.delete).toHaveBeenCalledWith('/admin/agents/42')
  })

  it('propagates 404', async () => {
    api.delete.mockRejectedValueOnce({response:{status:404}})
    await expect(adminAgentApi.deleteAgent(999)).rejects.toMatchObject({response:{status:404}})
  })

  it('propagates 400 (active packages)', async () => {
    api.delete.mockRejectedValueOnce({response:{status:400,data:{message:'Agent has active packages'}}})
    await expect(adminAgentApi.deleteAgent(1)).rejects.toMatchObject({response:{status:400}})
  })

  it('propagates network error', async () => {
    api.delete.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminAgentApi.deleteAgent(1)).rejects.toThrow('Network Error')
  })
})
