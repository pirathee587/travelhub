/**
 * adminBookingApi.test.js — Vitest suite for all 4 booking admin endpoints
 *   GET    /admin/bookings
 *   GET    /admin/bookings/{id}
 *   GET    /admin/bookings/status?status=
 *   PATCH  /admin/bookings/{id}/status
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminBookingApi from '../adminBookingApi'

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
const mockBookingList = [
  {
    id: 1, bookingId: 'BK00001',
    touristName: 'Amal Perera', touristEmail: 'amal@example.com',
    packageName: 'Cultural Kandy Tour', destination: 'Kandy',
    category: 'Cultural', imageUrl: 'https://img.jpg',
    startDate: '2024-06-01', endDate: '2024-06-04',
    status: 'pending', progress: 0,
    bookedOn: '2024-05-20T10:30:00', totalPrice: 450.00,
    hotelName: 'Cinnamon Citadel', hotelLocation: 'Kandy',
    agentName: 'Pinnacle Tours',
  },
  {
    id: 2, bookingId: 'BK00002',
    touristName: 'Nimal Silva', touristEmail: 'nimal@example.com',
    packageName: 'Ella Hiking Trail', destination: 'Ella',
    category: 'Adventure', imageUrl: 'https://img2.jpg',
    startDate: '2024-07-10', endDate: '2024-07-15',
    status: 'completed', progress: 100,
    bookedOn: '2024-06-01T08:00:00', totalPrice: 890.00,
    hotelName: '98 Acres Resort', hotelLocation: 'Ella',
    agentName: 'Trail Blazers',
  },
  {
    id: 3, bookingId: 'BK00003',
    touristName: 'Sara Khan', touristEmail: 'sara@example.com',
    packageName: 'Sigiriya Day Trip', destination: 'Sigiriya',
    category: 'Heritage', imageUrl: null,
    startDate: '2024-08-05', endDate: '2024-08-06',
    status: 'confirmed', progress: 30,
    bookedOn: '2024-07-15T14:00:00', totalPrice: 200.00,
    hotelName: null, hotelLocation: null,
    agentName: 'Heritage Trails',
  },
]

const wrap = (data) => ({ data: { success: true, message: 'OK', data } })
beforeEach(() => vi.clearAllMocks())

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GET /admin/bookings
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/bookings — getAllBookings()', () => {
  it('calls correct URL and returns booking list', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList))
    const result = await adminBookingApi.getAllBookings()
    expect(api.get).toHaveBeenCalledWith('/admin/bookings')
    expect(result.data).toHaveLength(3)
    expect(result.data[0].bookingId).toBe('BK00001')
  })

  it('returns empty array when no bookings exist', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminBookingApi.getAllBookings()
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data).toHaveLength(0)
  })

  it('response contains all AdminBookingResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList))
    const result = await adminBookingApi.getAllBookings()
    const b = result.data[0]
    ;['id','bookingId','touristName','touristEmail','packageName','destination',
      'category','startDate','endDate','status','progress','bookedOn',
      'totalPrice','hotelName','hotelLocation','agentName']
      .forEach(f => expect(b).toHaveProperty(f))
  })

  it('bookingId is formatted as BK##### (5 digits)', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList))
    const result = await adminBookingApi.getAllBookings()
    result.data.forEach(b => expect(b.bookingId).toMatch(/^BK\d{5}$/))
  })

  it('status values are one of known statuses', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList))
    const result = await adminBookingApi.getAllBookings()
    const valid = ['pending', 'confirmed', 'completed', 'cancelled']
    result.data.forEach(b => expect(valid).toContain(b.status))
  })

  it('propagates 401 Unauthorized', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 401 } })
    await expect(adminBookingApi.getAllBookings()).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('propagates 403 Forbidden', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminBookingApi.getAllBookings()).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('propagates network error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminBookingApi.getAllBookings()).rejects.toThrow('Network Error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GET /admin/bookings/{id}
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/bookings/{id} — getBookingById()', () => {
  it('fetches single booking by id', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList[0]))
    const result = await adminBookingApi.getBookingById(1)
    expect(api.get).toHaveBeenCalledWith('/admin/bookings/1')
    expect(result.data.id).toBe(1)
    expect(result.data.bookingId).toBe('BK00001')
  })

  it('uses the correct id in the URL', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList[1]))
    await adminBookingApi.getBookingById(2)
    expect(api.get).toHaveBeenCalledWith('/admin/bookings/2')
  })

  it('contains tourist info', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList[0]))
    const result = await adminBookingApi.getBookingById(1)
    expect(result.data.touristName).toBe('Amal Perera')
    expect(result.data.touristEmail).toBe('amal@example.com')
  })

  it('contains financial info', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList[1]))
    const result = await adminBookingApi.getBookingById(2)
    expect(result.data.totalPrice).toBe(890.00)
  })

  it('contains agent name', async () => {
    api.get.mockResolvedValueOnce(wrap(mockBookingList[0]))
    const result = await adminBookingApi.getBookingById(1)
    expect(result.data.agentName).toBe('Pinnacle Tours')
  })

  it('propagates 404 when booking not found', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404, data: { message: 'Booking not found with id: 999' } } })
    await expect(adminBookingApi.getBookingById(999)).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 500 on server error', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500 } })
    await expect(adminBookingApi.getBookingById(1)).rejects.toMatchObject({ response: { status: 500 } })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GET /admin/bookings/status?status=
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/bookings/status — getBookingsByStatus()', () => {
  it('fetches only pending bookings', async () => {
    const pending = mockBookingList.filter(b => b.status === 'pending')
    api.get.mockResolvedValueOnce(wrap(pending))
    const result = await adminBookingApi.getBookingsByStatus('pending')
    expect(api.get).toHaveBeenCalledWith('/admin/bookings/status', { params: { status: 'pending' } })
    expect(result.data.every(b => b.status === 'pending')).toBe(true)
  })

  it('fetches only completed bookings', async () => {
    const completed = mockBookingList.filter(b => b.status === 'completed')
    api.get.mockResolvedValueOnce(wrap(completed))
    const result = await adminBookingApi.getBookingsByStatus('completed')
    expect(api.get).toHaveBeenCalledWith('/admin/bookings/status', { params: { status: 'completed' } })
    expect(result.data[0].status).toBe('completed')
  })

  it('fetches only confirmed bookings', async () => {
    const confirmed = mockBookingList.filter(b => b.status === 'confirmed')
    api.get.mockResolvedValueOnce(wrap(confirmed))
    const result = await adminBookingApi.getBookingsByStatus('confirmed')
    expect(result.data[0].status).toBe('confirmed')
  })

  it('fetches only cancelled bookings (empty list)', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    const result = await adminBookingApi.getBookingsByStatus('cancelled')
    expect(api.get).toHaveBeenCalledWith('/admin/bookings/status', { params: { status: 'cancelled' } })
    expect(result.data).toHaveLength(0)
  })

  it('passes status param correctly', async () => {
    api.get.mockResolvedValueOnce(wrap([]))
    await adminBookingApi.getBookingsByStatus('pending')
    const call = api.get.mock.calls[0]
    expect(call[1]).toEqual({ params: { status: 'pending' } })
  })

  it('propagates 400 for invalid status', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 400 } })
    await expect(adminBookingApi.getBookingsByStatus('INVALID')).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('propagates 403 Forbidden', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminBookingApi.getBookingsByStatus('pending')).rejects.toMatchObject({ response: { status: 403 } })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PATCH /admin/bookings/{id}/status
// ═══════════════════════════════════════════════════════════════════════════════
describe('PATCH /admin/bookings/{id}/status — updateBookingStatus()', () => {
  it('updates status to confirmed', async () => {
    const updated = { ...mockBookingList[0], status: 'confirmed', progress: 30 }
    api.patch.mockResolvedValueOnce(wrap(updated))
    const result = await adminBookingApi.updateBookingStatus(1, 'confirmed')
    expect(api.patch).toHaveBeenCalledWith('/admin/bookings/1/status', { status: 'confirmed' })
    expect(result.data.status).toBe('confirmed')
  })

  it('updates status to completed', async () => {
    const updated = { ...mockBookingList[0], status: 'completed', progress: 100 }
    api.patch.mockResolvedValueOnce(wrap(updated))
    const result = await adminBookingApi.updateBookingStatus(1, 'completed')
    expect(api.patch).toHaveBeenCalledWith('/admin/bookings/1/status', { status: 'completed' })
    expect(result.data.status).toBe('completed')
  })

  it('updates status to cancelled', async () => {
    const updated = { ...mockBookingList[0], status: 'cancelled' }
    api.patch.mockResolvedValueOnce(wrap(updated))
    const result = await adminBookingApi.updateBookingStatus(1, 'cancelled')
    expect(api.patch).toHaveBeenCalledWith('/admin/bookings/1/status', { status: 'cancelled' })
    expect(result.data.status).toBe('cancelled')
  })

  it('sends correct body structure { status }', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockBookingList[0], status: 'confirmed' }))
    await adminBookingApi.updateBookingStatus(1, 'confirmed')
    const body = api.patch.mock.calls[0][1]
    expect(body).toEqual({ status: 'confirmed' })
    expect(Object.keys(body)).toHaveLength(1)
  })

  it('uses correct booking id in URL', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockBookingList[1], status: 'cancelled' }))
    await adminBookingApi.updateBookingStatus(2, 'cancelled')
    expect(api.patch).toHaveBeenCalledWith('/admin/bookings/2/status', { status: 'cancelled' })
  })

  it('response has success: true', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockBookingList[0], status: 'confirmed' }))
    const result = await adminBookingApi.updateBookingStatus(1, 'confirmed')
    expect(result.success).toBe(true)
  })

  it('propagates 404 when booking not found', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(adminBookingApi.updateBookingStatus(999, 'confirmed')).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('propagates 400 for invalid status transition', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Invalid status transition' } } })
    await expect(adminBookingApi.updateBookingStatus(1, 'pending')).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('propagates 403 Forbidden', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 403 } })
    await expect(adminBookingApi.updateBookingStatus(1, 'completed')).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('propagates network error', async () => {
    api.patch.mockRejectedValueOnce(new Error('Network Error'))
    await expect(adminBookingApi.updateBookingStatus(1, 'confirmed')).rejects.toThrow('Network Error')
  })
})
