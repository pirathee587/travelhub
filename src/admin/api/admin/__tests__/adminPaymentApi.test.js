/**
 * adminPaymentApi.test.js — Vitest suite for all 5 payment admin endpoints
 *   GET   /admin/payments/stats
 *   GET   /admin/payments         (+ optional type/status filters)
 *   GET   /admin/payments/{id}
 *   GET   /admin/payments/revenue
 *   PATCH /admin/payments/{id}/status
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminPaymentApi from '../adminPaymentApi'

vi.mock('../../axios', () => ({
  default: {
    get:   vi.fn(),
    patch: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))
import api from '../../axios'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockStats = {
  totalRevenue:  12500.00,
  pendingAmount: 3200.00,
  pendingCount:  5,
  totalRefunds:  800.00,
}

const mockPayments = [
  { id:1, transactionId:'TXN-00001', bookingRef:'BK-1', bookingDate:'2024-05-15', touristName:'Amal Perera', agentName:'Pinnacle Tours', type:'Payment', amount:450.00, status:'Completed' },
  { id:2, transactionId:'TXN-00002', bookingRef:'BK-2', bookingDate:'2024-06-01', touristName:'Nimal Silva',  agentName:'Trail Blazers',  type:'Refund',  amount:200.00, status:'Pending'   },
  { id:3, transactionId:'TXN-00003', bookingRef:'BK-3', bookingDate:'2024-06-10', touristName:'Sara Khan',    agentName:'Heritage Trails', type:'Payment', amount:890.00, status:'Pending'   },
]

const wrap = (data) => ({ data: { success: true, message: 'OK', data } })
beforeEach(() => vi.clearAllMocks())

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GET /admin/payments/stats
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/payments/stats — getPaymentStats()', () => {
  it('calls correct URL', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    await adminPaymentApi.getPaymentStats()
    expect(api.get).toHaveBeenCalledWith('/admin/payments/stats')
  })

  it('returns all 4 stat fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    const result = await adminPaymentApi.getPaymentStats()
    const d = result.data
    expect(d).toHaveProperty('totalRevenue')
    expect(d).toHaveProperty('pendingAmount')
    expect(d).toHaveProperty('pendingCount')
    expect(d).toHaveProperty('totalRefunds')
  })

  it('totalRevenue is a number', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    const result = await adminPaymentApi.getPaymentStats()
    expect(typeof result.data.totalRevenue).toBe('number')
  })

  it('pendingCount is a number', async () => {
    api.get.mockResolvedValueOnce(wrap(mockStats))
    const result = await adminPaymentApi.getPaymentStats()
    expect(typeof result.data.pendingCount).toBe('number')
  })

  it('propagates 401', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 401 } })
    await expect(adminPaymentApi.getPaymentStats()).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('propagates network error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminPaymentApi.getPaymentStats()).rejects.toThrow('Network Error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GET /admin/payments (+ filters)
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/payments — getAllPayments() / filterPayments()', () => {
  it('fetches all payments with no params', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments))
    const result = await adminPaymentApi.filterPayments()
    expect(api.get).toHaveBeenCalledWith('/admin/payments', { params: {} })
    expect(result.data).toHaveLength(3)
  })

  it('returns empty array when no payments', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminPaymentApi.filterPayments()
    expect(result.data).toHaveLength(0)
  })

  it('response contains all AdminPaymentResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments))
    const result = await adminPaymentApi.filterPayments()
    const p = result.data[0]
    ;['id','transactionId','bookingRef','bookingDate','touristName','agentName','type','amount','status']
      .forEach(f => expect(p).toHaveProperty(f))
  })

  it('filters by type=Payment', async () => {
    const payments = mockPayments.filter(p => p.type === 'Payment')
    api.get.mockResolvedValueOnce(wrap(payments))
    const result = await adminPaymentApi.filterPayments({ type: 'Payment' })
    expect(api.get).toHaveBeenCalledWith('/admin/payments', { params: { type: 'Payment' } })
    expect(result.data.every(p => p.type === 'Payment')).toBe(true)
  })

  it('filters by type=Refund', async () => {
    const refunds = mockPayments.filter(p => p.type === 'Refund')
    api.get.mockResolvedValueOnce(wrap(refunds))
    const result = await adminPaymentApi.filterPayments({ type: 'Refund' })
    expect(result.data.every(p => p.type === 'Refund')).toBe(true)
  })

  it('filters by status=Completed', async () => {
    const completed = mockPayments.filter(p => p.status === 'Completed')
    api.get.mockResolvedValueOnce(wrap(completed))
    const result = await adminPaymentApi.filterPayments({ status: 'Completed' })
    expect(api.get).toHaveBeenCalledWith('/admin/payments', { params: { status: 'Completed' } })
    expect(result.data.every(p => p.status === 'Completed')).toBe(true)
  })

  it('filters by status=Pending', async () => {
    const pending = mockPayments.filter(p => p.status === 'Pending')
    api.get.mockResolvedValueOnce(wrap(pending))
    const result = await adminPaymentApi.filterPayments({ status: 'Pending' })
    expect(result.data.every(p => p.status === 'Pending')).toBe(true)
  })

  it('filters by type + status combined', async () => {
    api.get.mockResolvedValueOnce(wrap([mockPayments[2]]))
    const result = await adminPaymentApi.filterPayments({ type: 'Payment', status: 'Pending' })
    expect(api.get).toHaveBeenCalledWith('/admin/payments', { params: { type: 'Payment', status: 'Pending' } })
    expect(result.data[0].type).toBe('Payment')
    expect(result.data[0].status).toBe('Pending')
  })

  it('type values are Payment or Refund', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments))
    const result = await adminPaymentApi.filterPayments()
    result.data.forEach(p => expect(['Payment', 'Refund']).toContain(p.type))
  })

  it('status values are Completed or Pending', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments))
    const result = await adminPaymentApi.filterPayments()
    result.data.forEach(p => expect(['Completed', 'Pending']).toContain(p.status))
  })

  it('propagates 403', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminPaymentApi.filterPayments()).rejects.toMatchObject({ response: { status: 403 } })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GET /admin/payments/{id}
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/payments/{id} — getPaymentById()', () => {
  it('fetches single payment by id', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments[0]))
    const result = await adminPaymentApi.getPaymentById(1)
    expect(api.get).toHaveBeenCalledWith('/admin/payments/1')
    expect(result.data.id).toBe(1)
    expect(result.data.transactionId).toBe('TXN-00001')
  })

  it('uses correct id in URL', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments[1]))
    await adminPaymentApi.getPaymentById(2)
    expect(api.get).toHaveBeenCalledWith('/admin/payments/2')
  })

  it('response has financial fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockPayments[0]))
    const result = await adminPaymentApi.getPaymentById(1)
    expect(result.data.amount).toBe(450.00)
    expect(result.data.type).toBe('Payment')
    expect(result.data.status).toBe('Completed')
  })

  it('propagates 404', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPaymentApi.getPaymentById(999)).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 500', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500 } })
    await expect(adminPaymentApi.getPaymentById(1)).rejects.toMatchObject({ response: { status: 500 } })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. GET /admin/payments/revenue
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/payments/revenue — getTotalRevenue()', () => {
  it('calls correct URL', async () => {
    api.get.mockResolvedValueOnce(wrap({ totalRevenue: 12500.00 }))
    await adminPaymentApi.getTotalRevenue()
    expect(api.get).toHaveBeenCalledWith('/admin/payments/revenue')
  })

  it('response contains totalRevenue', async () => {
    api.get.mockResolvedValueOnce(wrap({ totalRevenue: 12500.00 }))
    const result = await adminPaymentApi.getTotalRevenue()
    expect(result.data).toHaveProperty('totalRevenue')
    expect(result.data.totalRevenue).toBe(12500.00)
  })

  it('totalRevenue is numeric', async () => {
    api.get.mockResolvedValueOnce(wrap({ totalRevenue: 0 }))
    const result = await adminPaymentApi.getTotalRevenue()
    expect(typeof result.data.totalRevenue).toBe('number')
  })

  it('propagates 401', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 401 } })
    await expect(adminPaymentApi.getTotalRevenue()).rejects.toMatchObject({ response: { status: 401 } })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PATCH /admin/payments/{id}/status
// ═══════════════════════════════════════════════════════════════════════════════
describe('PATCH /admin/payments/{id}/status — updatePaymentStatus()', () => {
  it('marks payment as Completed', async () => {
    const updated = { ...mockPayments[1], status: 'Completed' }
    api.patch.mockResolvedValueOnce(wrap(updated))
    const result = await adminPaymentApi.updatePaymentStatus(2, 'Completed')
    expect(api.patch).toHaveBeenCalledWith('/admin/payments/2/status', { status: 'Completed' })
    expect(result.data.status).toBe('Completed')
  })

  it('marks payment as Pending', async () => {
    const updated = { ...mockPayments[0], status: 'Pending' }
    api.patch.mockResolvedValueOnce(wrap(updated))
    const result = await adminPaymentApi.updatePaymentStatus(1, 'Pending')
    expect(api.patch).toHaveBeenCalledWith('/admin/payments/1/status', { status: 'Pending' })
    expect(result.data.status).toBe('Pending')
  })

  it('sends correct body structure { status }', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockPayments[0], status: 'Completed' }))
    await adminPaymentApi.updatePaymentStatus(1, 'Completed')
    const body = api.patch.mock.calls[0][1]
    expect(body).toEqual({ status: 'Completed' })
    expect(Object.keys(body)).toHaveLength(1)
  })

  it('response has success: true', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockPayments[0], status: 'Completed' }))
    const result = await adminPaymentApi.updatePaymentStatus(1, 'Completed')
    expect(result.success).toBe(true)
  })

  it('uses correct payment id in URL', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockPayments[2], status: 'Completed' }))
    await adminPaymentApi.updatePaymentStatus(3, 'Completed')
    expect(api.patch).toHaveBeenCalledWith('/admin/payments/3/status', { status: 'Completed' })
  })

  it('propagates 404 for unknown payment', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminPaymentApi.updatePaymentStatus(999, 'Completed')).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 400 for invalid status', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Invalid status: INVALID' } } })
    await expect(adminPaymentApi.updatePaymentStatus(1, 'INVALID')).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('propagates 403 Forbidden', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminPaymentApi.updatePaymentStatus(1, 'Completed')).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('propagates network error', async () => {
    api.patch.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminPaymentApi.updatePaymentStatus(1, 'Completed')).rejects.toThrow('Network Error')
  })
})
