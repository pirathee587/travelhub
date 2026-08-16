import placeholderImg from '@/assets/images/placeholder.png'
import kandyImg from '@/assets/images/kandy_temple.jpg'
import galleImg from '@/assets/images/galle_fort.jpg'
import React, { useState, useEffect, useCallback } from 'react'
import adminPackageApi from '../services/adminPackageApi'
import { useModal } from '../components/ModalContext'
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Power, 
  ArrowLeft,
  AlertCircle,
  Package as PackageIcon,
  Tag
} from 'lucide-react'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const SRI_LANKA_DISTRICTS = [
  'All Districts',
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

const fmtPrice = (v) => v != null ? `$${Number(v).toFixed(2)}` : '—'

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-col p-5 space-y-4">
    <div className="aspect-[16/10] bg-gray-100 rounded-2xl" />
    <div className="space-y-2">
      <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
    </div>
    <div className="pt-2 flex justify-between items-center">
      <div className="h-4 bg-gray-100 rounded-lg w-20" />
      <div className="h-4 bg-gray-100 rounded-lg w-16" />
    </div>
    <div className="pt-3 flex gap-2 border-t border-gray-50">
      <div className="h-9 bg-gray-100 rounded-xl flex-1" />
      <div className="h-9 w-20 bg-gray-100 rounded-xl" />
    </div>
  </div>
)

// ── Package Detail View ────────────────────────────────────────────────────────
const PackageDetailView = ({ pkg, onBack, onApprove, onReject, onToggle, onDelete, loading }) => {
  if (!pkg) return null
  const { id, packageName, destination, district, priceFrom, priceTo, basePriceAdult, basePriceChild, duration,
    category, rating, trending, isActive, applicationStatus,
    providerName, description, inclusions, itinerary, imageUrl, images } = pkg

  const cover = (images && images[0]) || imageUrl || placeholderImg

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0ea5e9] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200/80">
          {/* Header Section */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img 
              src={cover} 
              alt={packageName} 
              onError={(e: any) => { e.target.src = placeholderImg }}
              className="w-full h-full object-cover opacity-85" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3444]/90 via-[#0B3444]/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-0.5 rounded-full text-xs font-semibold">
                    {category || 'Travel Package'}
                  </span>
                  {trending && (
                    <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      🔥 Trending
                    </span>
                  )}
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
                    String(applicationStatus).toLowerCase() === 'approved' ? 'bg-emerald-500/80 text-white border-emerald-400' :
                    String(applicationStatus).toLowerCase() === 'pending' ? 'bg-amber-500/80 text-white border-amber-400' :
                    'bg-red-500/80 text-white border-red-400'
                  }`}>
                    {String(applicationStatus || 'Pending')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{packageName}</h1>
                <p className="text-gray-200 text-sm mt-1 flex items-center gap-2">
                  <span>{providerName || 'TravelHub Partner'}</span>
                  <span>•</span>
                  <span>{[destination, district].filter(Boolean).join(', ') || 'Sri Lanka'}</span>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right sm:text-right shrink-0">
                <span className="text-xs text-gray-300 block">Starts from</span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {fmtPrice(basePriceAdult ?? priceFrom)}
                </span>
                <span className="text-[11px] text-gray-300 block">per adult</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel - Package Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4">Package Specifications</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400 font-medium mb-0.5">Duration</div>
                    <div className="text-sm font-bold text-gray-900">{duration || '2 Days / 1 Night'}</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400 font-medium mb-0.5">Category</div>
                    <div className="text-sm font-bold text-gray-900">{category || 'Culture'}</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400 font-medium mb-0.5">Rating</div>
                    <div className="text-sm font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {rating != null && rating > 0 ? Number(rating).toFixed(1) : 'No reviews'}
                    </div>
                  </div>
                </div>

                {description && (
                  <div className="mt-5 pt-5 border-t border-gray-200/60">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Description</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                  </div>
                )}

                {inclusions && inclusions.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200/60">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2.5">Inclusions</div>
                    <div className="flex flex-wrap gap-2">
                      {inclusions.map((inc, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold shadow-sm">
                          ✓ {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Itinerary */}
              {itinerary && itinerary.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Trip Itinerary</h3>
                  <div className="space-y-3">
                    {itinerary.map((day, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="font-bold text-gray-900 text-sm">Day {day.dayNumber || (i + 1)}: {day.title}</div>
                        {day.description && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{day.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-3">Admin Decision</h3>
                
                <div className="space-y-3">
                  {String(applicationStatus).toLowerCase() !== 'approved' && (
                    <button 
                      onClick={() => onApprove(pkg)} 
                      disabled={loading} 
                      className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve Package
                    </button>
                  )}
                  
                  {String(applicationStatus).toLowerCase() !== 'rejected' && (
                    <button 
                      onClick={() => onReject(pkg)} 
                      disabled={loading} 
                      className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject Package
                    </button>
                  )}
                  
                  {String(applicationStatus).toLowerCase() === 'approved' && (
                    <button 
                      onClick={() => onToggle(pkg)} 
                      disabled={loading} 
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm border shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? 'bg-white hover:bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                    >
                      <Power className="w-4 h-4" /> {isActive ? 'Suspend / Deactivate' : 'Activate Package'}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onDelete(pkg)} 
                    disabled={loading} 
                    className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" /> Delete Package
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Package Card (Redesigned matching modern UI requirements) ─────────────────
const PackageCard = ({ pkg, onView, onApprove, onReject, onToggle, onDelete, actionLoading }) => {
  const { id, packageName, destination, district, priceFrom, basePriceAdult, duration, category,
    rating, reviewCount, isActive, applicationStatus, imageUrl, images } = pkg

  const cover = (images && images[0]) || imageUrl || (id % 2 === 0 ? galleImg : kandyImg)
  const isApproved = String(applicationStatus).trim().toLowerCase() === 'approved'
  const isPending = String(applicationStatus).trim().toLowerCase() === 'pending'
  const isSuspended = String(applicationStatus).trim().toLowerCase() === 'suspended'
  const isRejected = String(applicationStatus).trim().toLowerCase() === 'rejected'

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
      
      {/* 1. Cover Image Section with Modern Pill Badges */}
      <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
        <img 
          src={cover} 
          alt={packageName}
          onError={(e: any) => { e.target.src = placeholderImg }} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status Pill on Top-Left */}
        <div className="absolute top-3.5 left-3.5">
          <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
            isApproved 
              ? 'bg-[#0b2838]/75 text-[#38bdf8] border-[#38bdf8]/20' 
              : isPending 
              ? 'bg-[#2d1b06]/75 text-[#fbbf24] border-[#fbbf24]/20' 
              : isSuspended 
              ? 'bg-[#2b1111]/75 text-[#f87171] border-[#f87171]/20' 
              : 'bg-[#2b1111]/75 text-[#f87171] border-[#f87171]/20'
          }`}>
            {isApproved ? 'Active' : (isPending ? 'Pending' : (isSuspended ? 'Suspended' : 'Rejected'))}
          </span>
        </div>
      </div>

      {/* 2. Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between gap-3">
            <h3 
              onClick={() => onView(pkg)}
              className="font-bold text-gray-900 text-base sm:text-lg tracking-tight truncate flex-1 cursor-pointer hover:text-[#0ea5e9] transition"
            >
              {packageName}
            </h3>

            <div className="shrink-0 flex items-center gap-1">
              {rating && Number(rating) > 0 ? (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{Number(rating).toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({reviewCount ?? 1})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-400 font-normal">
                  <Star className="h-3.5 w-3.5 text-gray-300" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{destination || district || 'Sri Lanka'}</span>
          </div>

          {/* Category & Location Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {category && (
              <span className="px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {category}
              </span>
            )}
            {(district || destination) && (
              <span className="px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {district || destination}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Duration & Starts from Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{duration || '2 Days / 1 Night'}</span>
          </div>

          <div className="text-right">
            <span className="block text-[11px] text-gray-400 font-medium">Starts from</span>
            <span className="block text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {fmtPrice(basePriceAdult ?? priceFrom ?? 100)}
            </span>
          </div>
        </div>

        {/* 3. Action Button: Only View Details */}
        <div className="mt-4 pt-1">
          <button
            onClick={() => onView(pkg)}
            className="w-full py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition duration-200 shadow-sm"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function PackageApprovals() {
  const modal = useModal()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [drawerDetail, setDrawerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPackages = useCallback(async (status) => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (!status || status === 'All') {
        res = await adminPackageApi.getAllPackages()
      } else {
        res = await adminPackageApi.getPackagesByStatus(status)
      }
      const data = res?.data ?? res ?? []
      setPackages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages(statusFilter)
  }, [statusFilter, fetchPackages])

  const openDrawer = async (pkg) => {
    setSelected(pkg)
    setDrawerDetail(null)
    setDetailLoading(true)
    try {
      const res = await adminPackageApi.getPackageById(pkg.id)
      setDrawerDetail(res?.data ?? res)
    } catch (err) {
      setDrawerDetail(pkg)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDrawer = () => {
    setSelected(null)
    setDrawerDetail(null)
  }

  const patchLocal = (id, patch) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
    if (selected?.id === id) setSelected(p => ({ ...p, ...patch }))
    if (drawerDetail?.id === id) setDrawerDetail(p => ({ ...p, ...patch }))
  }

  const handleApprove = async (pkg) => {
    if (!await modal.showConfirm({ title: 'Approve Package', message: `Approve "${pkg.packageName}"? It will become visible to tourists.` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.approvePackage(pkg.id)
      modal.addToast(`✅ "${pkg.packageName}" approved`)
      patchLocal(pkg.id, { applicationStatus: 'Approved', isActive: true })
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
    finally { setActionLoading(false) }
  }

  const handleReject = async (pkg) => {
    if (!await modal.showConfirm({ title: 'Reject Package', message: `Reject "${pkg.packageName}"?` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.rejectPackage(pkg.id, 'Rejected by admin')
      modal.addToast(`🚫 "${pkg.packageName}" rejected`)
      patchLocal(pkg.id, { applicationStatus: 'Rejected' })
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
    finally { setActionLoading(false) }
  }

  const handleToggle = async (pkg) => {
    const action = pkg.isActive ? 'suspend' : 'activate'
    if (!await modal.showConfirm({ title: 'Toggle Package', message: `${action.charAt(0).toUpperCase() + action.slice(1)} "${pkg.packageName}"?` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.togglePackageActive(pkg.id)
      modal.addToast(`✅ "${pkg.packageName}" ${action}d`)
      patchLocal(pkg.id, { 
        isActive: !pkg.isActive,
        applicationStatus: !pkg.isActive ? 'Approved' : 'Suspended'
      })
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
    finally { setActionLoading(false) }
  }

  const handleDelete = async (pkg) => {
    if (!await modal.showConfirm({ title: 'Delete Package', message: `Permanently delete "${pkg.packageName}"?` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.deletePackage(pkg.id)
      modal.addToast(`🗑 "${pkg.packageName}" deleted`)
      setPackages(prev => prev.filter(p => p.id !== pkg.id))
      closeDrawer()
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
    finally { setActionLoading(false) }
  }

  // ── Extract Available Districts dynamically ──────────────────────────────
  const availableDistricts = React.useMemo(() => {
    const distSet = new Set<string>()
    packages.forEach((p: any) => {
      if (p.district?.trim()) distSet.add(p.district.trim())
    })
    const customDistricts = Array.from(distSet)
    const all = Array.from(new Set([...SRI_LANKA_DISTRICTS.slice(1), ...customDistricts])).sort()
    return ['All Districts', ...all]
  }, [packages])

  const displayed = packages.filter(p => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [p.packageName, p.destination, p.district, p.location, p.agentName, p.category].some(val => val?.toLowerCase().includes(q))
    const matchesDistrict = districtFilter === 'All' || districtFilter === 'All Districts' || 
      (p.district && p.district.trim().toLowerCase() === districtFilter.trim().toLowerCase())
    return matchesSearch && matchesDistrict
  })

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm font-semibold">Loading package details…</div>
            </div>
          </div>
        ) : (
          <PackageDetailView 
            pkg={drawerDetail ?? selected} 
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
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Package Approvals
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review, approve, suspend and manage all agency travel packages
            </p>
          </div>

          {/* ── Toolbar / Filter Bar ────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input 
                type="text" 
                placeholder="Search by package name, destination, category..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
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
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-red-800 text-sm">Failed to load packages</div>
                  <div className="text-xs text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchPackages(statusFilter)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
              <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-bold text-base">No packages found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria or filter settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
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
