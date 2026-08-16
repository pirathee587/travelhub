import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminHotelApi from '../services/adminHotelApi'
import { useModal } from '../components/ModalContext'
import { Star, MapPin, Clock, Eye, Search, Building2, Bed } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const SRI_LANKA_DISTRICTS = [
  'All Districts',
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

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
    ownerName, ownerEmail, ownerNic, nicImageUrl, businessRegistrationImageUrl, rejectionReason, phoneNumber, hotlineNumber,
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
        <div className="bg-[#eff6ff] rounded-xl p-6 border border-blue-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Owner Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Owner Name</div>
              <div className="font-semibold text-gray-900">{ownerName || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Owner Email</div>
              <div className="font-semibold text-gray-900">{ownerEmail || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">NIC Number</div>
              <div className="font-bold text-blue-600">{ownerNic || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium mb-1">Phone Number</div>
              <div className="font-bold text-blue-600">{phoneNumber || '—'}</div>
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

        {/* Verification Documents */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Verification Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nicImageUrl ? (
              <button onClick={() => window.open(nicImageUrl, '_blank')} className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                📄 NIC Image
              </button>
            ) : (
              <button disabled className="w-full py-4 bg-gray-200 text-gray-500 font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-not-allowed">
                No NIC Image
              </button>
            )}

            {businessRegistrationImageUrl ? (
              <button onClick={() => window.open(businessRegistrationImageUrl, '_blank')} className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                📄 Business Registration
              </button>
            ) : (
              <button disabled className="w-full py-4 bg-gray-200 text-gray-500 font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-not-allowed">
                No Business Registration
              </button>
            )}
          </div>
          {rejectionReason && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4 border border-red-200">
              <span className="font-bold">Rejection Reason:</span> {rejectionReason}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
const HotelCard = ({ hotel, onView }) => {
  const { hotelName, imageUrl, district, location, destination, rating, reviewCount,
    priceFrom, numberOfRooms, applicationStatus, isActive } = hotel

  const isApproved = ['active', 'approved'].includes(String(applicationStatus || '').trim().toLowerCase()) && isActive !== false
  const isPending = String(applicationStatus || '').trim().toLowerCase() === 'pending'
  const isSuspended = isActive === false || String(applicationStatus || '').trim().toLowerCase() === 'suspended'

  const hasReview = rating != null && Number(rating) > 0

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
      <div>
        {/* Cover Image */}
        <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={hotelName} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-5xl">
              🏨
            </div>
          )}

          {/* Top-left Translucent Glass Status Pill */}
          <div className="absolute top-3.5 left-3.5">
            <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
              isApproved 
                ? 'bg-[#0b2838]/85 text-[#38bdf8] border-[#38bdf8]/25' 
                : isPending 
                ? 'bg-[#2d1b06]/85 text-[#fbbf24] border-[#fbbf24]/25' 
                : isSuspended 
                ? 'bg-[#2b1111]/85 text-[#f87171] border-[#f87171]/25' 
                : 'bg-[#2b1111]/85 text-[#f87171] border-[#f87171]/25'
            }`}>
              {isApproved ? 'Active' : (isPending ? 'Pending' : (isSuspended ? 'Suspended' : 'Rejected'))}
            </span>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="p-5">
          {/* Row 1: Title and Rating */}
          <div className="flex items-start justify-between gap-3">
            <h4 
              onClick={(e) => { e.stopPropagation(); onView(hotel); }}
              className="font-bold text-gray-900 text-base sm:text-lg tracking-tight truncate flex-1 cursor-pointer hover:text-[#0ea5e9] transition"
            >
              {hotelName}
            </h4>

            <div className="flex items-center gap-1 shrink-0">
              {hasReview ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {Number(rating).toFixed(1)} {reviewCount ? `(${reviewCount})` : ''}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Star className="h-3.5 w-3.5 text-gray-300" />
                  No reviews yet
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 font-medium">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{location || district || destination || 'Sri Lanka'}</span>
          </div>

          {/* Row 3: Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="px-3 py-0.5 rounded-full bg-gray-100/90 text-gray-600 text-xs font-medium">
              HOTEL
            </span>
            {(district || location) && (
              <span className="px-3 py-0.5 rounded-full bg-gray-100/90 text-gray-600 text-xs font-medium">
                {district || location}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Row 4: Rooms Info & Starts From Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{numberOfRooms ? `${numberOfRooms} Rooms` : 'Standard Rooms'}</span>
            </div>

            <div className="text-right">
              <span className="block text-[11px] text-gray-400 font-medium leading-none mb-0.5">Starts from</span>
              <span className="block text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                ${Number(priceFrom || 180).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions - Sky Blue View Details Button */}
      <div className="p-5 pt-0">
        <button
          onClick={(e) => { e.stopPropagation(); onView(hotel); }}
          className="w-full py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition duration-200 flex items-center justify-center gap-1.5"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
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
  const [districtFilter, setDistrictFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [drawerDetail, setDrawerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingHotel, setRejectingHotel] = useState(null)
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

  const handleReject = (hotel) => {
    setRejectingHotel(hotel)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      modal.addToast('⚠️ Rejection reason is required')
      return
    }
    const hotel = rejectingHotel
    if (!hotel) return

    try {
      setActionLoading(true)
      setIsRejectModalOpen(false)
      await adminHotelApi.rejectHotel(hotel.id, rejectReason)
      modal.addToast(`🚫 "${hotel.hotelName}" rejected`)
      setHotels(prev => prev.map(h =>
        h.id === hotel.id ? { ...h, applicationStatus: 'Rejected' } : h
      ))
      if (drawerDetail?.id === hotel.id)
        setDrawerDetail(d => ({ ...d, applicationStatus: 'Rejected', rejectionReason: rejectReason }))
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
      setRejectingHotel(null)
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

  // ── Extract Available Districts dynamically ──────────────────────────────
  const availableDistricts = React.useMemo(() => {
    const distSet = new Set<string>()
    hotels.forEach((h: any) => {
      if (h.district?.trim()) distSet.add(h.district.trim())
    })
    const customDistricts = Array.from(distSet)
    const all = Array.from(new Set([...SRI_LANKA_DISTRICTS.slice(1), ...customDistricts])).sort()
    return ['All Districts', ...all]
  }, [hotels])

  // ── Client-side search and district filter ────────────────────────────────
  const displayed = hotels.filter(h => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [h.hotelName, h.district, h.location, h.destination].some(val => val?.toLowerCase().includes(q))
    const matchesDistrict = districtFilter === 'All' || districtFilter === 'All Districts' || 
      h.district?.trim().toLowerCase() === districtFilter.trim().toLowerCase()
    return matchesSearch && matchesDistrict
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
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search hotels by name, location or district..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] shadow-sm transition"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* District Filter */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm text-sm text-gray-700 font-medium">
                <MapPin className="w-4 h-4 text-gray-400" />
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2 max-w-[150px] truncate"
                >
                  {availableDistricts.map((d: string) => (
                    <option key={d} value={d}>
                      {d === 'All Districts' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm text-sm text-gray-700 font-medium">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Error ───────────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-red-800 text-sm">Failed to load hotels</div>
                  <div className="text-xs text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchHotels(statusFilter)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
              >Retry</button>
            </div>
          )}

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
              <div className="text-5xl mb-3">🏨</div>
              <h3 className="text-gray-700 font-bold text-base">No hotels found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different filter or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onView={openDrawer}
                />
              ))}
            </div>
          )}
        </>
      )}

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 border animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900">Provide Rejection Reason</h3>
            <p className="text-sm text-gray-500">
              Please enter the reason for rejecting this hotel.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-transparent resize-none"
              placeholder="e.g. Incomplete business registration details."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 active:bg-red-800 transition disabled:opacity-50"
                onClick={submitRejection}
                disabled={actionLoading}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
