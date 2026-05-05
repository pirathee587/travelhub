/**
 * adminHotelApi.test.js
 * Vitest test suite for all 6 hotel admin endpoints:
 *   GET    /admin/hotels
 *   GET    /admin/hotels/status?status=Pending
 *   GET    /admin/hotels/{id}
 *   PATCH  /admin/hotels/{id}/approve
 *   PATCH  /admin/hotels/{id}/reject
 *   DELETE /admin/hotels/{id}
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminHotelApi from '../adminHotelApi';

// ── Mock axios instance ────────────────────────────────────────────────────────
vi.mock('../../axios', () => ({
  default: {
    get:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
    post:   vi.fn(),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../axios';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockHotelList = [
  {
    id: 1,
    hotelName: 'Cinnamon Lakeside',
    destination: 'Colombo',
    location: 'Beira Lake, Colombo',
    description: 'Luxury lakeside hotel',
    priceFrom: 150,
    priceTo: 400,
    rating: 4.5,
    reviewCount: 120,
    imageUrl: 'https://example.com/hotel1.jpg',
    district: 'Colombo',
    applicationStatus: 'Pending',
  },
  {
    id: 2,
    hotelName: 'Heritance Kandalama',
    destination: 'Dambulla',
    location: 'Kandalama, Dambulla',
    description: 'Eco-friendly heritage hotel',
    priceFrom: 200,
    priceTo: 600,
    rating: 4.8,
    reviewCount: 98,
    imageUrl: 'https://example.com/hotel2.jpg',
    district: 'Matale',
    applicationStatus: 'Approved',
  },
];

const mockHotelDetail = {
  id: 1,
  hotelName: 'Cinnamon Lakeside',
  rating: 4.5,
  imageUrl: 'https://example.com/hotel1.jpg',
  district: 'Colombo',
  location: 'Beira Lake, Colombo',
  numberOfRooms: 50,
  roomTypes: [
    { name: 'Deluxe Room',  description: 'Spacious room with lake view' },
    { name: 'Suite',        description: 'Premium suite with balcony'   },
  ],
  ownerName:    'John Silva',
  ownerEmail:   'john@cinnamonlakeside.lk',
  ownerNic:     '123456789V',
  nicImageUrl:  'https://example.com/nic1.jpg',
  phoneNumber:  '+94112345678',
  hotlineNumber:'+94777123456',
  amenities:    ['Pool', 'Gym', 'Spa', 'Restaurant', 'WiFi'],
  applicationStatus: 'Pending',
};

// Helper: wrap data in the ApiResponse shape the backend returns
const wrap = (data) => ({
  data: { success: true, message: 'OK', data }
});

beforeEach(() => { vi.clearAllMocks(); });

// ═════════════════════════════════════════════════════════════════════════════
// 1. GET /admin/hotels
// ═════════════════════════════════════════════════════════════════════════════
describe('GET /admin/hotels  — getAllHotels()', () => {

  it('calls GET /admin/hotels and returns the full list', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelList));

    const result = await adminHotelApi.getAllHotels();

    expect(api.get).toHaveBeenCalledOnce();
    expect(api.get).toHaveBeenCalledWith('/admin/hotels');
    expect(result.data).toHaveLength(2);
    expect(result.data[0].hotelName).toBe('Cinnamon Lakeside');
    expect(result.data[1].hotelName).toBe('Heritance Kandalama');
  });

  it('returns an empty array when there are no hotels', async () => {
    api.get.mockResolvedValueOnce(wrap([]));

    const result = await adminHotelApi.getAllHotels();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('response contains all AdminHotelResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelList));

    const result = await adminHotelApi.getAllHotels();
    const h = result.data[0];

    const requiredFields = [
      'id','hotelName','destination','location','description',
      'priceFrom','priceTo','rating','reviewCount','imageUrl',
      'district','applicationStatus',
    ];
    requiredFields.forEach(f => expect(h).toHaveProperty(f));
  });

  it('applicationStatus values are one of Pending/Approved/Rejected', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelList));

    const result = await adminHotelApi.getAllHotels();
    const valid = ['Pending', 'Approved', 'Rejected'];
    result.data.forEach(h => expect(valid).toContain(h.applicationStatus));
  });

  it('propagates 401 Unauthorized', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 401 } });
    await expect(adminHotelApi.getAllHotels()).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('propagates 403 Forbidden', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 403 } });
    await expect(adminHotelApi.getAllHotels()).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('propagates network error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'));
    await expect(adminHotelApi.getAllHotels()).rejects.toThrow('Network Error');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. GET /admin/hotels/status?status=
// ═════════════════════════════════════════════════════════════════════════════
describe('GET /admin/hotels/status  — getHotelsByStatus()', () => {

  it('fetches only Pending hotels', async () => {
    const pending = mockHotelList.filter(h => h.applicationStatus === 'Pending');
    api.get.mockResolvedValueOnce(wrap(pending));

    const result = await adminHotelApi.getHotelsByStatus('Pending');

    expect(api.get).toHaveBeenCalledWith('/admin/hotels/status', { params: { status: 'Pending' } });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].applicationStatus).toBe('Pending');
  });

  it('fetches only Approved hotels', async () => {
    const approved = mockHotelList.filter(h => h.applicationStatus === 'Approved');
    api.get.mockResolvedValueOnce(wrap(approved));

    const result = await adminHotelApi.getHotelsByStatus('Approved');

    expect(api.get).toHaveBeenCalledWith('/admin/hotels/status', { params: { status: 'Approved' } });
    expect(result.data.every(h => h.applicationStatus === 'Approved')).toBe(true);
  });

  it('fetches only Rejected hotels (empty list)', async () => {
    api.get.mockResolvedValueOnce(wrap([]));

    const result = await adminHotelApi.getHotelsByStatus('Rejected');

    expect(api.get).toHaveBeenCalledWith('/admin/hotels/status', { params: { status: 'Rejected' } });
    expect(result.data).toHaveLength(0);
  });

  it('passes the status param correctly to the URL', async () => {
    api.get.mockResolvedValueOnce(wrap([]));
    await adminHotelApi.getHotelsByStatus('Pending');
    expect(api.get).toHaveBeenCalledWith('/admin/hotels/status', { params: { status: 'Pending' } });
  });

  it('propagates 400 for invalid status', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 400 } });
    await expect(adminHotelApi.getHotelsByStatus('INVALID')).rejects.toMatchObject({ response: { status: 400 } });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. GET /admin/hotels/{id}
// ═════════════════════════════════════════════════════════════════════════════
describe('GET /admin/hotels/{id}  — getHotelDetail()', () => {

  it('fetches full hotel detail by id', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelDetail));

    const result = await adminHotelApi.getHotelDetail(1);

    expect(api.get).toHaveBeenCalledWith('/admin/hotels/1');
    expect(result.data.id).toBe(1);
    expect(result.data.hotelName).toBe('Cinnamon Lakeside');
  });

  it('response contains all AdminHotelDetailResponse fields', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelDetail));

    const result = await adminHotelApi.getHotelDetail(1);
    const d = result.data;

    expect(d).toHaveProperty('id');
    expect(d).toHaveProperty('hotelName');
    expect(d).toHaveProperty('rating');
    expect(d).toHaveProperty('district');
    expect(d).toHaveProperty('location');
    expect(d).toHaveProperty('numberOfRooms');
    expect(d).toHaveProperty('ownerName');
    expect(d).toHaveProperty('ownerEmail');
    expect(d).toHaveProperty('ownerNic');
    expect(d).toHaveProperty('nicImageUrl');
    expect(d).toHaveProperty('phoneNumber');
    expect(d).toHaveProperty('hotlineNumber');
    expect(d).toHaveProperty('amenities');
    expect(d).toHaveProperty('roomTypes');
    expect(d).toHaveProperty('applicationStatus');
  });

  it('amenities is an array of strings', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelDetail));
    const result = await adminHotelApi.getHotelDetail(1);
    expect(Array.isArray(result.data.amenities)).toBe(true);
    expect(result.data.amenities).toContain('Pool');
    expect(result.data.amenities).toContain('WiFi');
  });

  it('roomTypes is an array with name and description', async () => {
    api.get.mockResolvedValueOnce(wrap(mockHotelDetail));
    const result = await adminHotelApi.getHotelDetail(1);
    expect(Array.isArray(result.data.roomTypes)).toBe(true);
    expect(result.data.roomTypes[0]).toHaveProperty('name');
    expect(result.data.roomTypes[0]).toHaveProperty('description');
  });

  it('propagates 404 when hotel not found', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404, data: { message: 'Hotel not found with id: 999' } } });
    await expect(adminHotelApi.getHotelDetail(999)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('propagates 500 server error', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(adminHotelApi.getHotelDetail(1)).rejects.toMatchObject({ response: { status: 500 } });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. PATCH /admin/hotels/{id}/approve
// ═════════════════════════════════════════════════════════════════════════════
describe('PATCH /admin/hotels/{id}/approve  — approveHotel()', () => {

  it('calls the correct endpoint and returns Approved status', async () => {
    const approved = { ...mockHotelDetail, applicationStatus: 'Approved' };
    api.patch.mockResolvedValueOnce(wrap(approved));

    const result = await adminHotelApi.approveHotel(1);

    expect(api.patch).toHaveBeenCalledWith('/admin/hotels/1/approve');
    expect(result.data.applicationStatus).toBe('Approved');
    expect(result.data.id).toBe(1);
  });

  it('response has success: true', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockHotelDetail, applicationStatus: 'Approved' }));
    const result = await adminHotelApi.approveHotel(1);
    expect(result.success).toBe(true);
  });

  it('does not send a request body', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockHotelDetail, applicationStatus: 'Approved' }));
    await adminHotelApi.approveHotel(1);
    // Called with only the URL, no second argument
    expect(api.patch).toHaveBeenCalledWith('/admin/hotels/1/approve');
    expect(api.patch.mock.calls[0]).toHaveLength(1);
  });

  it('propagates 404 when hotel not found', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } });
    await expect(adminHotelApi.approveHotel(999)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('propagates 403 Forbidden', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 403 } });
    await expect(adminHotelApi.approveHotel(1)).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('propagates 500 on server error', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(adminHotelApi.approveHotel(1)).rejects.toMatchObject({ response: { status: 500 } });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. PATCH /admin/hotels/{id}/reject
// ═════════════════════════════════════════════════════════════════════════════
describe('PATCH /admin/hotels/{id}/reject  — rejectHotel()', () => {

  it('rejects a hotel with a reason string', async () => {
    const rejected = { ...mockHotelDetail, applicationStatus: 'Rejected' };
    api.patch.mockResolvedValueOnce(wrap(rejected));

    const result = await adminHotelApi.rejectHotel(1, 'Incomplete documentation');

    expect(api.patch).toHaveBeenCalledWith(
      '/admin/hotels/1/reject',
      { reason: 'Incomplete documentation' }
    );
    expect(result.data.applicationStatus).toBe('Rejected');
  });

  it('sends reason: null when no reason provided', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockHotelDetail, applicationStatus: 'Rejected' }));

    await adminHotelApi.rejectHotel(1, null);

    expect(api.patch).toHaveBeenCalledWith('/admin/hotels/1/reject', { reason: null });
  });

  it('sends reason: undefined when called with no reason argument', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockHotelDetail, applicationStatus: 'Rejected' }));

    await adminHotelApi.rejectHotel(1);

    expect(api.patch).toHaveBeenCalledWith('/admin/hotels/1/reject', { reason: undefined });
  });

  it('returns Rejected applicationStatus', async () => {
    api.patch.mockResolvedValueOnce(wrap({ ...mockHotelDetail, applicationStatus: 'Rejected' }));
    const result = await adminHotelApi.rejectHotel(1, 'reason');
    expect(result.data.applicationStatus).toBe('Rejected');
  });

  it('propagates 404 for non-existent hotel', async () => {
    api.patch.mockRejectedValueOnce({ response: { status: 404 } });
    await expect(adminHotelApi.rejectHotel(999, 'reason')).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('propagates network error', async () => {
    api.patch.mockRejectedValueOnce(new Error('Network Error'));
    await expect(adminHotelApi.rejectHotel(1, 'reason')).rejects.toThrow('Network Error');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. DELETE /admin/hotels/{id}
// ═════════════════════════════════════════════════════════════════════════════
describe('DELETE /admin/hotels/{id}  — deleteHotel()', () => {

  it('calls DELETE on the correct URL', async () => {
    api.delete.mockResolvedValueOnce(wrap(null));

    const result = await adminHotelApi.deleteHotel(1);

    expect(api.delete).toHaveBeenCalledWith('/admin/hotels/1');
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('uses the correct hotel id in the URL', async () => {
    api.delete.mockResolvedValueOnce(wrap(null));
    await adminHotelApi.deleteHotel(42);
    expect(api.delete).toHaveBeenCalledWith('/admin/hotels/42');
  });

  it('propagates 404 when hotel not found', async () => {
    api.delete.mockRejectedValueOnce({ response: { status: 404 } });
    await expect(adminHotelApi.deleteHotel(999)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('propagates 400 (active bookings constraint)', async () => {
    api.delete.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Cannot delete hotel with active bookings' } }
    });
    await expect(adminHotelApi.deleteHotel(1)).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('propagates 403 Forbidden', async () => {
    api.delete.mockRejectedValueOnce({ response: { status: 403 } });
    await expect(adminHotelApi.deleteHotel(1)).rejects.toMatchObject({ response: { status: 403 } });
  });

  it('propagates network error', async () => {
    api.delete.mockRejectedValueOnce(new Error('Network Error'));
    await expect(adminHotelApi.deleteHotel(1)).rejects.toThrow('Network Error');
  });
});
