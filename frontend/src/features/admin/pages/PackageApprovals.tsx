import placeholderImg from '@/assets/images/placeholder.png';
import React, { useState, useEffect, useCallback } from 'react'
import adminPackageApi from '../services/adminPackageApi'
import { useModal } from '../components/ModalContext'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES = {
  Pending:   'bg-orange-100 text-orange-700 border-orange-200',
  Approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected:  'bg-red-100 text-red-700 border-red-200',
  Suspended: 'bg-gray-100 text-gray-600 border-gray-200',
}

const fmtPrice = (v) => v != null ? `$${Number(v).toLocaleString()}` : '—'

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-col">
    <div className="h-48 bg-gray-100" />
    <div className="p-5 space-y-3 flex-1 flex flex-col">
      <div className="h-5 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="mt-auto pt-4 flex gap-3 border-t border-gray-50">
        <div className="h-10 bg-gray-100 rounded flex-1" />
        <div className="h-10 w-10 bg-gray-100 rounded" />
        <div className="h-10 w-10 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
)

// ── Package Detail View ────────────────────────────────────────────────────────
const PackageDetailView = ({ pkg, onBack, onApprove, onReject, onToggle, onDelete, loading }) => {
  if (!pkg) return null
  const { id, packageName, destination, district, priceFrom, priceTo, basePriceAdult, basePriceChild, duration,
    category, rating, trending, isActive, applicationStatus,
    providerName, description, inclusions, itinerary, imageUrl, images } = pkg

  const cover = (images && images[0]) || imageUrl

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &lt; Back to Packages
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="relative">
          {cover ? (
            <img src={cover} alt={packageName} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center text-6xl">
              📦
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{packageName}</h2>
            <div className="flex items-center gap-3 text-sm opacity-90">
              <span>{providerName || 'Unknown Provider'}</span>
              <span>•</span>
              <span>{[destination, district].filter(Boolean).join(', ')}</span>
              {trending && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">🔥 Trending</span>}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 flex flex-col md:flex-row gap-8">
          
          {/* Left Panel - Package Info */}
          <div className="flex-1 space-y-6">
            <div className="bg-[#f0fdf4] rounded-xl p-8 border border-emerald-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Package Details</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Price</div>
                  <div className="text-lg font-bold text-teal-700">
                    {basePriceAdult != null ? (
                      <>
                        {fmtPrice(basePriceAdult)} <span className="text-sm font-medium text-gray-500">/ adult</span>
                        {basePriceChild != null && <div className="text-sm text-gray-500">{fmtPrice(basePriceChild)} <span className="text-xs">/ child</span></div>}
                      </>
                    ) : (
                      <>{fmtPrice(priceFrom)}{priceTo ? ` - ${fmtPrice(priceTo)}` : ''}</>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Duration</div>
                  <div className="text-lg font-bold text-gray-900">{duration || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Category</div>
                  <div className="text-lg font-bold text-gray-900">{category || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Rating</div>
                  <div className="text-lg font-bold text-gray-900">⭐ {rating != null ? Number(rating).toFixed(1) : '—'}</div>
                </div>
              </div>

              {description && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 font-medium mb-2">Description</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                </div>
              )}

              {inclusions && inclusions.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Inclusions</div>
                  <div className="flex flex-wrap gap-2">
                    {inclusions.map((inc, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Itinerary</h3>
                <div className="space-y-4">
                  {itinerary.map((day, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="font-bold text-gray-900 text-sm">Day {day.dayNumber}: {day.title}</div>
                      {day.description && <p className="text-sm text-gray-500 mt-2">{day.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Application Status & Actions */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-[#fff7ed] rounded-xl p-8 border border-orange-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    String(applicationStatus).trim().toLowerCase() === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                    String(applicationStatus).trim().toLowerCase() === 'pending' ? 'bg-[#fef0db] text-[#e37400]' :
                    String(applicationStatus).trim().toLowerCase() === 'suspended' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {String(applicationStatus || 'Pending').trim()}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Visibility</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isActive ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-red-700 border-red-200'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3 shadow-sm mt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Admin Actions</h4>
              
              {String(applicationStatus).trim().toLowerCase() !== 'approved' && (
                <button onClick={() => onApprove(pkg)} disabled={loading} className="w-full py-2.5 rounded-lg font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-60">
                  Approve Package
                </button>
              )}
              
              {String(applicationStatus).trim().toLowerCase() !== 'rejected' && (
                <button onClick={() => onReject(pkg)} disabled={loading} className="w-full py-2.5 rounded-lg font-semibold text-sm bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition disabled:opacity-60">
                  Reject Package
                </button>
              )}
              
              {String(applicationStatus).trim().toLowerCase() === 'approved' && (
                <button onClick={() => onToggle(pkg)} disabled={loading} className={`w-full py-2.5 rounded-lg font-semibold text-sm border transition disabled:opacity-60 ${isActive ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}>
                  {isActive ? 'Deactivate Package' : 'Activate Package'}
                </button>
              )}
              
              <button onClick={() => onDelete(pkg)} disabled={loading} className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition disabled:opacity-60 mt-4">
                Delete Package
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Package Card ──────────────────────────────────────────────────────────────
const PackageCard = ({ pkg, onView, onApprove, onReject, onToggle, onDelete, actionLoading }) => {
  const { packageName, destination, priceFrom, priceTo, basePriceAdult, duration, category,
    rating, agentName, isActive, applicationStatus, imageUrl } = pkg

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative h-48">
        <img 
          src={imageUrl || placeholderImg} 
          alt={packageName}
          onError={(e) => { e.target.src = placeholderImg }} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{packageName}</h3>
        <p className="text-gray-500 text-sm mb-2">
          {[destination, duration].filter(Boolean).join(' • ') || '—'}
        </p>
        <p className="text-teal-600 font-semibold text-sm mb-3">
          {basePriceAdult != null ? `${fmtPrice(basePriceAdult)} / adult` : (priceFrom != null ? fmtPrice(priceFrom) : '—')}
        </p>

        {String(applicationStatus).trim().toLowerCase() === 'approved' && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <span>Rating:</span>
            <span className="text-yellow-400 ml-1">⭐</span>
            <span>{rating != null ? Number(rating).toFixed(1) : '—'}</span>
          </div>
        )}

        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            String(applicationStatus).trim().toLowerCase() === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
            String(applicationStatus).trim().toLowerCase() === 'pending' ? 'bg-[#fef0db] text-[#e37400]' :
            String(applicationStatus).trim().toLowerCase() === 'suspended' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
            'bg-red-100 text-red-600'
          }`}>
            {String(applicationStatus || 'Pending').trim()}
          </span>
        </div>

        <div className="mt-auto pt-4 flex gap-3 border-t border-gray-50">
          {String(applicationStatus).trim().toLowerCase() === 'pending' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onView(pkg); }}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(pkg); }}
                disabled={actionLoading}
                className="w-10 h-10 flex items-center justify-center text-[#22c55e] border border-[#bbf7d0] bg-[#f0fdf4] rounded hover:bg-[#dcfce7] transition disabled:opacity-60"
              >
                ✓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(pkg); }}
                disabled={actionLoading}
                className="w-10 h-10 flex items-center justify-center text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] rounded hover:bg-[#fee2e2] transition disabled:opacity-60"
              >
                ✕
              </button>
            </>
          ) : (String(applicationStatus).trim().toLowerCase() === 'approved' || String(applicationStatus).trim().toLowerCase() === 'suspended') ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onView(pkg); }}
                className="flex-1 py-2 text-sm font-medium bg-[#3b82f6] text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              {String(applicationStatus).trim().toLowerCase() === 'suspended' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(pkg); }}
                  disabled={actionLoading}
                  className="flex-1 py-2 text-sm font-medium bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  ▶ Activate
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(pkg); }}
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
                onClick={(e) => { e.stopPropagation(); onView(pkg); }}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                👁 View
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(pkg); }}
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PackageApprovals() {
  const modal = useModal()

  const [packages, setPackages]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState(null)
  const [statusFilter, setStatusFilter]   = useState('All')
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState(null)
  const [drawerDetail, setDrawerDetail]   = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchPackages = useCallback(async (status = 'All') => {
    try {
      setLoading(true); setError(null)
      const res = status === 'All'
        ? await adminPackageApi.getAllPackages()
        : await adminPackageApi.getPackagesByStatus(status)
      setPackages(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load packages.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPackages(statusFilter) }, [statusFilter, fetchPackages])

  const openDrawer = async (pkg) => {
    setSelected(pkg); setDrawerDetail(null); setDetailLoading(true)
    try {
      const res = await adminPackageApi.getPackageDetail(pkg.id)
      setDrawerDetail(res?.data ?? res)
    } catch { setDrawerDetail(pkg) }
    finally { setDetailLoading(false) }
  }

  const closeDrawer = () => { setSelected(null); setDrawerDetail(null) }

  const patchLocal = (id, changes) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
    setDrawerDetail(d => d?.id === id ? { ...d, ...changes } : d)
  }

  const handleApprove = async (pkg) => {
    if (!await modal.showConfirm({ title: 'Approve Package', message: `Approve "${pkg.packageName}"?` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.approvePackage(pkg.id)
      modal.addToast(`✅ "${pkg.packageName}" approved`)
      patchLocal(pkg.id, { applicationStatus: 'Approved' })
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
    const action = pkg.isActive ? 'deactivate' : 'activate'
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

  const displayed = packages.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.packageName?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q) || p.agentName?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
  })

  const counts = {
    total:    packages.length,
    pending:  packages.filter(p => p.applicationStatus === 'Pending').length,
    approved: packages.filter(p => String(p.applicationStatus).trim().toLowerCase() === 'approved').length,
    rejected: packages.filter(p => String(p.applicationStatus).trim().toLowerCase() === 'rejected').length,
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm">Loading package details…</div>
            </div>
          </div>
        ) : (
          <PackageDetailView pkg={drawerDetail ?? selected} onBack={closeDrawer} onApprove={handleApprove} onReject={handleReject} onToggle={handleToggle} onDelete={handleDelete} loading={actionLoading} />
        )
      ) : (
        <>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Package Approvals</h1>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-full">
                <input
                  type="text"
                  placeholder="Search by name, destination..."
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
                  <div className="font-semibold text-red-700">Failed to load packages</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchPackages(statusFilter)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >Retry</button>
            </div>
          )}

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">📦</div>
              <div className="text-gray-600 font-semibold text-lg">No packages found</div>
              <div className="text-gray-400 text-sm mt-1">Try a different filter or search term</div>
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
