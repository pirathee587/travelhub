import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminHotelApi from '../services/adminHotelApi'
import { useModal } from '../components/ModalContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES = {
  Pending:   'bg-orange-100 text-orange-700 border-orange-200',
  Approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected:  'bg-red-100 text-red-700 border-red-200',
  Suspended: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_DOT = {
  Pending:  'bg-orange-500',
  Approved: 'bg-emerald-500',
  Rejected: 'bg-red-500',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v) => (v != null ? `$${Number(v).toLocaleString()}` : '—')
const fmtRating = (v) => (v != null ? Number(v).toFixed(1) : '—')

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-44 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-gray-100 rounded-xl flex-1" />
        <div className="h-9 w-9 bg-gray-100 rounded-xl" />
        <div className="h-9 w-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
)

// ── Hotel Detail View ───────────────────────────────────────────────────────
const HotelDetailView = ({ hotel, onBack, onApprove, onReject, onToggle, onDelete, loading }) => {
  if (!hotel) return null

  const { hotelName, imageUrl, district, location, rating, numberOfRooms,
    ownerName, ownerEmail, ownerNic, nicImageUrl, phoneNumber, hotlineNumber,
    amenities, roomTypes, applicationStatus, isActive, id } = hotel

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &lt; Back to Hotels
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Header Title & Rating */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{hotelName}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 font-medium">
            <span className="text-yellow-500">⭐</span>
            <span>{rating != null ? `${Number(rating).toFixed(1)} / 5.0` : 'No rating yet'}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-2xl overflow-hidden shadow-sm h-[300px] w-full">
          {imageUrl ? (
            <img src={imageUrl} alt={hotelName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-6xl">🏨</div>
          )}
        </div>

        {/* Location Details block */}
        <div className="bg-[#f0fdfa] rounded-xl p-6 border border-teal-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Location Details</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Place / District</div>
              <div className="font-semibold text-gray-900">📍 {[location, district].filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Number of Rooms</div>
              <div className="font-semibold text-gray-900">🛏️ {numberOfRooms || 0} rooms</div>
            </div>
          </div>

          {roomTypes && roomTypes.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 font-medium mb-3">Room Types</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomTypes.map((rt, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-teal-50">
                    <div className="font-bold text-gray-900 text-sm mb-1">{rt.name}</div>
                    <div className="text-xs text-gray-500">{rt.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Owner Information */}
        

        {/* Contact Information */}
        <div className="bg-[#f0fdf4] rounded-xl p-6 border border-emerald-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h3>
          <div className="space-y-5">
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Phone Number</div>
              <div className="font-bold text-emerald-600">{phoneNumber || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">NIC Number</div>
              <div className="font-bold text-emerald-600">{ownerNic || '—'}</div>
            </div>
          </div>
        </div>

        {/* Amenities & Facilities */}
        {amenities && amenities.length > 0 && (
          <div className="bg-[#faf5ff] rounded-xl p-6 border border-purple-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities & Facilities</h3>
            <div className="flex flex-wrap gap-3">
              {amenities.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-[#f3e8ff] text-purple-700 rounded-full text-xs font-bold">
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Application Status & Actions */}
        <div className="bg-[#fff7ed] rounded-xl p-6 border border-orange-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Application Status</h3>
              {isActive === false && applicationStatus === 'Approved' ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  Suspended
                </span>
              ) : (
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  String(applicationStatus).trim().toLowerCase() === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                  String(applicationStatus).trim().toLowerCase() === 'pending' ? 'bg-[#ffedd5] text-[#ea580c]' :
                  'bg-red-100 text-red-600'
                }`}>
                  {String(applicationStatus || 'Pending').trim()}
                </span>
              )}
            </div>
            
            {/* Admin Actions */}
            <div className="flex gap-3">
              {String(applicationStatus).trim().toLowerCase() !== 'approved' && (
                <button onClick={() => onApprove(hotel)} disabled={loading} className="px-5 py-2 rounded-lg font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm disabled:opacity-60">
                  Approve Hotel
                </button>
              )}
              {String(applicationStatus).trim().toLowerCase() !== 'rejected' && (
                <button onClick={() => onReject(hotel)} disabled={loading} className="px-5 py-2 rounded-lg font-semibold text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition shadow-sm disabled:opacity-60">
                  Reject Hotel
                </button>
              )}
              {String(applicationStatus).trim().toLowerCase() === 'approved' && (
                isActive === false ? (
                  <button onClick={() => onToggle(hotel)} disabled={loading} className="px-5 py-2 rounded-lg font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm disabled:opacity-60">
                    Activate Hotel
                  </button>
                ) : (
                  <button onClick={() => onToggle(hotel)} disabled={loading} className="px-5 py-2 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition shadow-sm disabled:opacity-60">
                    Suspend Hotel
                  </button>
                )
              )}
              <button onClick={() => onDelete(hotel)} disabled={loading} className="px-5 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition shadow-sm disabled:opacity-60">
                Delete Hotel
              </button>
            </div>
          </div>
        </div>

        {/* NIC Button */}
        {nicImageUrl ? (
          <button onClick={() => window.open(nicImageUrl, '_blank')} className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
            📄 View NIC Photocopy
          </button>
        ) : (
          <button disabled className="w-full py-4 bg-gray-200 text-gray-500 font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-not-allowed">
            No NIC Provided
          </button>
        )}
      </div>
    </div>
  )
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
const HotelCard = ({ hotel, onView, onApprove, onReject, onToggle, onDelete, actionLoading }) => {
  const { hotelName, imageUrl, district, location, rating, reviewCount,
    priceFrom, priceTo, applicationStatus, numberOfRooms } = hotel

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative">
        {imageUrl ? (
          <img src={imageUrl} alt={hotelName} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-5xl">🏨</div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{hotelName}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {district || location || '—'} • {numberOfRooms ?? 0} rooms
        </p>

        {String(applicationStatus).trim().toLowerCase() === 'approved' && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <span>Rating:</span>
            <span className="text-yellow-400 ml-1">⭐</span>
            <span>{fmtRating(rating)}</span>
          </div>
        )}

        <div className="mb-4">
          {hotel.isActive === false && String(hotel.applicationStatus).trim().toLowerCase() === 'approved' ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Suspended
            </span>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              String(applicationStatus).trim().toLowerCase() === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
              String(applicationStatus).trim().toLowerCase() === 'pending' ? 'bg-[#fef0db] text-[#e37400]' :
              'bg-red-100 text-red-600'
            }`}>
              {String(applicationStatus || 'Pending').trim()}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 flex gap-3 border-t border-gray-50">
          {String(applicationStatus).trim().toLowerCase() === 'pending' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onView(hotel); }}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(hotel); }}
                disabled={actionLoading}
                className="w-10 h-10 flex items-center justify-center text-[#22c55e] border border-[#bbf7d0] bg-[#f0fdf4] rounded hover:bg-[#dcfce7] transition disabled:opacity-60"
              >
                ✓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(hotel); }}
                disabled={actionLoading}
                className="w-10 h-10 flex items-center justify-center text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] rounded hover:bg-[#fee2e2] transition disabled:opacity-60"
              >
                ✕
              </button>
            </>
          ) : String(applicationStatus).trim().toLowerCase() === 'approved' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onView(hotel); }}
                className="flex-1 py-2 text-sm font-medium bg-[#3b82f6] text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              {hotel.isActive === false ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(hotel); }}
                  disabled={actionLoading}
                  className="flex-1 py-2 text-sm font-medium bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  ▶ Activate
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(hotel); }}
                  disabled={actionLoading}
                  className="flex-1 py-2 text-sm font-medium bg-[#ef4444] text-white rounded hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  ⭕ Suspend
                </button>
              )}
            </>
          ) : (
             <>
              <button
                onClick={(e) => { e.stopPropagation(); onView(hotel); }}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(hotel); }}
                disabled={actionLoading}
                className="flex-1 py-2 text-sm font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                🗑 Delete
              </button>
             </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HotelApprovals() {
  const modal = useModal()

  const [hotels, setHotels]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]               = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [drawerDetail, setDrawerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const searchTimer = useRef(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchHotels = useCallback(async (status = 'All') => {
    try {
      setLoading(true)
      setError(null)
      const res = status === 'All'
        ? await adminHotelApi.getAllHotels()
        : await adminHotelApi.getHotelsByStatus(status)
      setHotels(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load hotels.')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHotels(statusFilter) }, [statusFilter, fetchHotels])

  // ── Open detail drawer ───────────────────────────────────────────────────
  const openDrawer = async (hotel) => {
    setSelectedHotel(hotel)
    setDrawerDetail(null)
    setDetailLoading(true)
    try {
      const res = await adminHotelApi.getHotelDetail(hotel.id)
      setDrawerDetail(res?.data ?? res)
    } catch {
      setDrawerDetail(hotel) // fallback to list data
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDrawer = () => {
    setSelectedHotel(null)
    setDrawerDetail(null)
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (hotel) => {
    const ok = await modal.showConfirm({
      title:   'Approve Hotel',
      message: `Approve "${hotel.hotelName}" and notify the owner?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminHotelApi.approveHotel(hotel.id)
      modal.addToast(`✅ "${hotel.hotelName}" approved`)
      setHotels(prev => prev.map(h =>
        h.id === hotel.id ? { ...h, applicationStatus: 'Approved' } : h
      ))
      if (drawerDetail?.id === hotel.id)
        setDrawerDetail(d => ({ ...d, applicationStatus: 'Approved' }))
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (hotel) => {
    const ok = await modal.showConfirm({
      title:   'Reject Hotel',
      message: `Reject "${hotel.hotelName}"? The owner will be notified.`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminHotelApi.rejectHotel(hotel.id, 'Rejected by admin')
      modal.addToast(`🚫 "${hotel.hotelName}" rejected`)
      setHotels(prev => prev.map(h =>
        h.id === hotel.id ? { ...h, applicationStatus: 'Rejected' } : h
      ))
      if (drawerDetail?.id === hotel.id)
        setDrawerDetail(d => ({ ...d, applicationStatus: 'Rejected' }))
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (hotel) => {
    const ok = await modal.showConfirm({
      title:   'Delete Hotel',
      message: `Permanently delete "${hotel.hotelName}"? This cannot be undone.`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminHotelApi.deleteHotel(hotel.id)
      modal.addToast(`🗑 "${hotel.hotelName}" deleted`)
      setHotels(prev => prev.filter(h => h.id !== hotel.id))
      closeDrawer()
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggle = async (hotel) => {
    const isSuspending = hotel.isActive !== false
    const action = isSuspending ? 'Suspend' : 'Activate'
    const ok = await modal.showConfirm({
      title:   `${action} Hotel`,
      message: `${action} "${hotel.hotelName}"?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      const res = await adminHotelApi.toggleHotelActive(hotel.id)
      const updatedIsActive = res?.data?.isActive ?? res?.isActive ?? !isSuspending
      modal.addToast(`✅ "${hotel.hotelName}" ${isSuspending ? 'suspended' : 'activated'}`)
      setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, isActive: updatedIsActive, applicationStatus: updatedIsActive ? 'Approved' : 'Suspended' } : h))
      if (drawerDetail?.id === hotel.id)
        setDrawerDetail(d => ({ ...d, isActive: updatedIsActive, applicationStatus: updatedIsActive ? 'Approved' : 'Suspended' }))
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Toggle failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Client-side search filter ────────────────────────────────────────────
  const displayed = hotels.filter(h => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      h.hotelName?.toLowerCase().includes(q) ||
      h.district?.toLowerCase().includes(q) ||
      h.location?.toLowerCase().includes(q) ||
      h.destination?.toLowerCase().includes(q)
    )
  })

  // ── Counts ───────────────────────────────────────────────────────────────
  const counts = {
    total:    hotels.length,
    pending:  hotels.filter(h => String(h.applicationStatus).trim().toLowerCase() === 'pending').length,
    approved: hotels.filter(h => String(h.applicationStatus).trim().toLowerCase() === 'approved').length,
    rejected: hotels.filter(h => String(h.applicationStatus).trim().toLowerCase() === 'rejected').length,
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {selectedHotel ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm">Loading hotel details…</div>
            </div>
          </div>
        ) : (
          <HotelDetailView
            hotel={drawerDetail ?? selectedHotel}
            onBack={closeDrawer}
            onApprove={handleApprove}
            onReject={handleReject}
            onToggle={handleToggle}
            onDelete={handleDelete}
            loading={actionLoading}
          />
        )
      ) : (
        <>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Hotel Approvals</h1>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-full">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              <div className="w-32">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 bg-white focus:outline-none"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Error ───────────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-red-700">Failed to load hotels</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchHotels(statusFilter)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >Retry</button>
            </div>
          )}

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">🏨</div>
              <div className="text-gray-600 font-semibold text-lg">No hotels found</div>
              <div className="text-gray-400 text-sm mt-1">Try a different filter or search term</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onView={openDrawer}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
