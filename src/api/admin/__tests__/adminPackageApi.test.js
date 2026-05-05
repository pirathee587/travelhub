/**
 * adminPackageApi.test.js — Vitest suite for all 7 package admin endpoints
 *   GET    /admin/packages
 *   GET    /admin/packages/status?status=
 *   GET    /admin/packages/{id}
 *   PATCH  /admin/packages/{id}/approve
 *   PATCH  /admin/packages/{id}/reject
 *   PATCH  /admin/packages/{id}/toggle-active
 *   DELETE /admin/packages/{id}
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminPackageApi from '../adminPackageApi'

vi.mock('../../axios', () => ({
  default: {
    get:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))
import api from '../../axios'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockList = [
  { id: 1, packageName: 'Cultural Kandy Tour', destination: 'Kandy', priceFrom: 150, priceTo: 300, duration: '3 Days', category: 'Cultural', rating: 4.5, reviewCount: 40, trending: true, isActive: true, agentName: 'Pinnacle Tours', applicationStatus: 'Pending' },
  { id: 2, packageName: 'Ella Hiking Trail',   destination: 'Ella',  priceFrom: 200, priceTo: 400, duration: '5 Days', category: 'Adventure', rating: 4.8, reviewCount: 60, trending: false, isActive: true, agentName: 'Trail Blazers', applicationStatus: 'Approved' },
]

const mockDetail = {
  id: 1, packageName: 'Cultural Kandy Tour', destination: 'Kandy', district: 'Central',
  priceFrom: 150, priceTo: 300, images: ['https://img1.jpg'], imageUrl: 'https://img1.jpg',
  duration: '3 Days', providerName: 'Pinnacle Tours', applicationStatus: 'Pending',
  description: 'Explore the cultural capital of Sri Lanka.', inclusions: ['Accommodation', 'Meals', 'Guide'],
  itinerary: [{ dayNumber: 1, title: 'Arrival', description: 'Check in', activities: ['City tour'] }],
  rating: 4.5, reviewCount: 40, category: 'Cultural', trending: true, isActive: true,
}

const wrap = (data) => ({ data: { success: true, message: 'OK', data } })

beforeEach(() => vi.clearAllMocks())

// ── 1. GET /admin/packages ─────────────────────────────────────────────────────
describe('GET /admin/packages — getAllPackages()', () => {
  it('calls correct URL and returns package list', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminPackageApi.getAllPackages()
    expect(api.get).toHaveBeenCalledWith('/admin/packages')
    expect(result.data).toHaveLength(2)
    expect(result.data[0].packageName).toBe('Cultural Kandy Tour')
  })

  it('returns empty array when no packages exist', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminPackageApi.getAllPackages()
    expect(result.data).toHaveLength(0)
  })

  it('response contains all AdminPackageResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminPackageApi.getAllPackages()
    const p = result.data[0]
    ;['id','packageName','destination','priceFrom','priceTo','duration','category','rating','reviewCount','trending','isActive','agentName','applicationStatus']
      .forEach(f => expect(p).toHaveProperty(f))
  })

  it('applicationStatus is Pending/Approved/Rejected', async () => {
    api.get.mockResolvedValueOnce(wrap(mockList))
    const result = await adminPackageApi.getAllPackages()
    result.data.forEach(p => expect(['Pending','Approved','Rejected']).toContain(p.applicationStatus))
  })

  it('propagates 401 Unauthorized', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 401 } })
    await expect(adminPackageApi.getAllPackages()).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('propagates network error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminPackageApi.getAllPackages()).rejects.toThrow('Network Error')
  })
})

// ── 2. GET /admin/packages/status ─────────────────────────────────────────────
describe('GET /admin/packages/status — getPackagesByStatus()', () => {
  it('fetches only Pending packages', async () => {
    const pending = mockList.filter(p => p.applicationStatus === 'Pending')
    api.get.mockResolvedValueOnce(wrap(pending))
    const result = await adminPackageApi.getPackagesByStatus('Pending')
    expect(api.get).toHaveBeenCalledWith('/admin/packages/status', { params: { status: 'Pending' } })
    expect(result.data.every(p => p.applicationStatus === 'Pending')).toBe(true)
  })

  it('fetches only Approved packages', async () => {
    const approved = mockList.filter(p => p.applicationStatus === 'Approved')
    api.get.mockResolvedValueOnce(wrap(approved))
    const result = await adminPackageApi.getPackagesByStatus('Approved')
    expect(api.get).toHaveBeenCalledWith('/admin/packages/status', { params: { status: 'Approved' } })
    expect(result.data[0].applicationStatus).toBe('Approved')
  })

  it('returns empty list for Rejected when none exist', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminPackageApi.getPackagesByStatus('Rejected')
    expect(result.data).toHaveLength(0)
  })

  it('propagates 403 Forbidden', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminPackageApi.getPackagesByStatus('Pending')).rejects.toMatchObject({ response: { status: 403 } })
  })
})

// ── 3. GET /admin/packages/{id} ───────────────────────────────────────────────
describe('GET /admin/packages/{id} — getPackageDetail()', () => {
  it('fetches full detail by id', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminPackageApi.getPackageDetail(1)
    expect(api.get).toHaveBeenCalledWith('/admin/packages/1')
    expect(result.data.id).toBe(1)
    expect(result.data.packageName).toBe('Cultural Kandy Tour')
  })

  it('response contains all AdminPackageDetailResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminPackageApi.getPackageDetail(1)
    ;['id','packageName','destination','district','priceFrom','priceTo','images','imageUrl','duration','providerName','applicationStatus','description','inclusions','itinerary','rating','reviewCount','category','trending','isActive']
      .forEach(f => expect(result.data).toHaveProperty(f))
  })

  it('inclusions is an array', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminPackageApi.getPackageDetail(1)
    expect(Array.isArray(result.data.inclusions)).toBe(true)
    expect(result.data.inclusions).toContain('Accommodation')
  })

  it('itinerary has dayNumber and title', async () => {
    api.get.mockResolvedValueOnce(wrap(mockDetail))
    const result = await adminPackageApi.getPackageDetail(1)
    expect(result.data.itinerary[0]).toHaveProperty('dayNumber')
    expect(result.data.itinerary[0]).toHaveProperty('title')
  })

  it('propagates 404 for non-existent package', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPackageApi.getPackageDetail(999)).rejects.toMatchObject({ response: { status: 404 } })
  })
})

// ── 4. PATCH /admin/packages/{id}/approve ────────────────────────────────────
describe('PATCH /admin/packages/{id}/approve — approvePackage()', () => {
  it('calls correct URL and returns Approved status', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, applicationStatus: 'Approved' }))
    const result = await adminPackageApi.approvePackage(1)
    expect(api.patch).toHaveBeenCalledWith('/admin/packages/1/approve')
    expect(result.data.applicationStatus).toBe('Approved')
  })

  it('response has success: true', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, applicationStatus: 'Approved' }))
    const result = await adminPackageApi.approvePackage(1)
    expect(result.success).toBe(true)
  })

  it('sends no request body', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, applicationStatus: 'Approved' }))
    await adminPackageApi.approvePackage(1)
    expect(api.patch.mock.calls[0]).toHaveLength(1)
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPackageApi.approvePackage(999)).rejects.toMatchObject({ response: { status: 404 } })
  })
})

// ── 5. PATCH /admin/packages/{id}/reject ──────────────────────────────────────
describe('PATCH /admin/packages/{id}/reject — rejectPackage()', () => {
  it('rejects with a reason and returns Rejected status', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, applicationStatus: 'Rejected' }))
    const result = await adminPackageApi.rejectPackage(1, 'Poor quality')
    expect(api.patch).toHaveBeenCalledWith('/admin/packages/1/reject', { reason: 'Poor quality' })
    expect(result.data.applicationStatus).toBe('Rejected')
  })

  it('sends reason: null when omitted', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, applicationStatus: 'Rejected' }))
    await adminPackageApi.rejectPackage(1, null)
    expect(api.patch).toHaveBeenCalledWith('/admin/packages/1/reject', { reason: null })
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPackageApi.rejectPackage(999, 'reason')).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates network error', async () => {
    api.patch.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminPackageApi.rejectPackage(1, 'r')).rejects.toThrow('Network Error')
  })
})

// ── 6. PATCH /admin/packages/{id}/toggle-active ───────────────────────────────
describe('PATCH /admin/packages/{id}/toggle-active — togglePackageActive()', () => {
  it('calls correct URL', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, isActive: false }))
    const result = await adminPackageApi.togglePackageActive(1)
    expect(api.patch).toHaveBeenCalledWith('/admin/packages/1/toggle-active')
    expect(result.data.isActive).toBe(false)
  })

  it('toggles back to active', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, isActive: true }))
    const result = await adminPackageApi.togglePackageActive(1)
    expect(result.data.isActive).toBe(true)
  })

  it('sends no request body', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockDetail, isActive: false }))
    await adminPackageApi.togglePackageActive(1)
    expect(api.patch.mock.calls[0]).toHaveLength(1)
  })

  it('propagates 404', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPackageApi.togglePackageActive(999)).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 403 Forbidden', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminPackageApi.togglePackageActive(1)).rejects.toMatchObject({ response: { status: 403 } })
  })
})

// ── 7. DELETE /admin/packages/{id} ────────────────────────────────────────────
describe('DELETE /admin/packages/{id} — deletePackage()', () => {
  it('calls DELETE on correct URL and returns success', async () => {
    api.delete.mockResolvedValueOnce(wrap(null))
    const result = await adminPackageApi.deletePackage(1)
    expect(api.delete).toHaveBeenCalledWith('/admin/packages/1')
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it('uses the correct id in the URL', async () => {
    api.delete.mockResolvedValueOnce(wrap(null))
    await adminPackageApi.deletePackage(42)
    expect(api.delete).toHaveBeenCalledWith('/admin/packages/42')
  })

  it('propagates 404', async () => {
    api.delete.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPackageApi.deletePackage(999)).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 400 (active bookings)', async () => {
    api.delete.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Has active bookings' } } })
    await expect(adminPackageApi.deletePackage(1)).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('propagates network error', async () => {
    api.delete.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminPackageApi.deletePackage(1)).rejects.toThrow('Network Error')
  })
})
