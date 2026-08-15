import React, { useState, useEffect, useCallback } from 'react'
import adminDriverApi from '../services/adminDriverApi'
import { useModal } from '../components/ModalContext'
import { User, Clock, CheckCircle, AlertTriangle, ShieldAlert, FileText, Star, Car } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-orange-100 text-orange-700 border-orange-200',
  active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending Approval',
  active:    'Approved / Active',
  rejected:  'Rejected',
  suspended: 'Suspended',
}

// ── Card Skeleton ─────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
    <div className="h-44 bg-gray-100 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
      <div className="h-9 bg-gray-100 rounded-xl mt-4 animate-pulse" />
    </div>
  </div>
)

// ── Sub-component: Driver Detail View ────────────────────────────────────────
const DriverDetailView = ({ driver, onBack, onApprove, onReject, loading }) => {
  if (!driver) return null

  const fullName = driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : (driver.firstName || 'Unknown')

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &larr; Back to Drivers
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
              {driver.profileImage ? (
                <img src={driver.profileImage} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500 mt-1">Status: {driver.status} | Rating: {driver.rating ?? 'N/A'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[driver.lifecycleStatus] || 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABELS[driver.lifecycleStatus] || driver.lifecycleStatus}
          </span>
        </div>

        {/* Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Personal & Contact Info */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <User className="h-5 w-5 text-teal-600" /> Driver Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">NIC Number</span>
                <span className="font-semibold text-gray-900">{driver.nic}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Blood Group</span>
                <span className="font-semibold text-gray-900">{driver.bloodGroup || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Email Address</span>
                <span className="font-semibold text-gray-900 truncate block">{driver.email || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Mobile Number</span>
                <span className="font-semibold text-gray-900 block">{driver.mobileNumber}</span>
                {driver.secondaryMobileNumber && <span className="text-xs text-gray-500 block">{driver.secondaryMobileNumber} (Secondary)</span>}
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 font-medium">Address</span>
                <span className="font-semibold text-gray-900">
                  {[driver.addressLine1, driver.addressLine2].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Driving Credentials */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Car className="h-5 w-5 text-teal-600" /> License & Vehicles
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">License Number</span>
                <span className="font-semibold text-gray-900">{driver.licenseNumber}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">License Expiry</span>
                <span className="font-semibold text-gray-900">{driver.licenseExpiryDate || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 font-medium">Permitted Vehicle Types</span>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {driver.vehicleTypes ? driver.vehicleTypes.split(',').map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100 rounded">
                      {t.trim()}
                    </span>
                  )) : <span className="text-gray-400">—</span>}
                </div>
              </div>
              {driver.assignedVehicle && (
                <div className="col-span-2">
                  <span className="block text-xs text-gray-500 font-medium">Assigned Vehicle</span>
                  <span className="font-semibold text-gray-900">🚘 {driver.assignedVehicle}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Auditing section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <FileText className="h-5 w-5 text-teal-600" /> Verification Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* NIC Front */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">NIC Front Photo</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {driver.nicFrontImage ? (
                    <img src={driver.nicFrontImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminDriverApi.viewDocumentImage(driver.nicFrontImage)} 
                disabled={!driver.nicFrontImage}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>

            {/* NIC Rear */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">NIC Rear Photo</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {driver.nicRearImage ? (
                    <img src={driver.nicRearImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminDriverApi.viewDocumentImage(driver.nicRearImage)} 
                disabled={!driver.nicRearImage}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>

            {/* License Front */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">License Front</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {driver.licenseFrontImage ? (
                    <img src={driver.licenseFrontImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminDriverApi.viewDocumentImage(driver.licenseFrontImage)} 
                disabled={!driver.licenseFrontImage}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>

            {/* License Rear */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">License Rear</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {driver.licenseRearImage ? (
                    <img src={driver.licenseRearImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminDriverApi.viewDocumentImage(driver.licenseRearImage)} 
                disabled={!driver.licenseRearImage}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {driver.lifecycleStatus === 'pending' && (
          <div className="flex gap-4 border-t pt-6 justify-end">
            <button 
              onClick={() => onReject(driver)} 
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 active:bg-red-100 transition disabled:opacity-50 flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" /> Reject Registration
            </button>
            <button 
              onClick={() => onApprove(driver)} 
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Approve & Activate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component: DriverApprovals ──────────────────────────────────────
export default function DriverApprovals() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectingDriver, setRejectingDriver] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const modal = useModal()

  const fetchDriversList = useCallback(async (filter: string) => {
    try {
      setLoading(true)
      setError('')
      const apiStatus = filter === 'All' ? 'all' : (filter === 'Approved' ? 'active' : filter.toLowerCase())
      const data = await adminDriverApi.getAllDrivers(apiStatus)
      setDrivers(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDriversList(statusFilter)
  }, [statusFilter, fetchDriversList])

  const handleApprove = async (driver) => {
    const name = `${driver.firstName} ${driver.lastName}`
    const ok = await modal.showConfirm({
      title:   'Approve Driver',
      message: `Are you sure you want to approve driver "${name}"? They will be activated immediately.`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminDriverApi.approveDriver(driver.id)
      modal.addToast(`✅ Driver "${name}" approved successfully`)
      
      setDrivers(prev => prev.map(d =>
        d.id === driver.id ? { ...d, lifecycleStatus: 'active', status: 'available' } : d
      ))
      if (selectedDriver?.id === driver.id) {
        setSelectedDriver(null)
      }
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (driver) => {
    setRejectingDriver(driver)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      modal.addToast('⚠️ Rejection reason is required')
      return
    }
    const driver = rejectingDriver
    if (!driver) return
    const name = `${driver.firstName} ${driver.lastName}`
    try {
      setActionLoading(true)
      setIsRejectModalOpen(false)
      await adminDriverApi.rejectDriver(driver.id, rejectReason)
      modal.addToast(`🚫 Driver "${name}" registration rejected`)
      
      setDrivers(prev => prev.map(d =>
        d.id === driver.id ? { ...d, lifecycleStatus: 'rejected', status: 'off-duty', rejectionReason: rejectReason } : d
      ))
      if (selectedDriver?.id === driver.id) {
        setSelectedDriver(null)
      }
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
      setRejectingDriver(null)
    }
  }

  // ── Client-side search ─────────────────────────────────────────────────────
  const displayed = drivers.filter(d => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase()
    return (
      name.includes(q) ||
      (d.nic || '').toLowerCase().includes(q) ||
      (d.licenseNumber || d.license || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.mobileNumber || '').includes(q)
    )
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {selectedDriver ? (
        <DriverDetailView
          driver={selectedDriver}
          onBack={() => setSelectedDriver(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Driver Approvals</h1>

          {/* ── Filter Toolbar ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, NIC, license or contact..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>
            <div className="w-36">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 bg-white focus:outline-none"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Error message ────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-red-700">Failed to load drivers</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchDriversList(statusFilter)}
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
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-600 font-semibold text-lg">No drivers found</div>
              <div className="text-gray-400 text-sm mt-1">Try a different status filter or search term</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(driver => {
                const name = `${driver.firstName} ${driver.lastName}`
                return (
                  <div key={driver.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      {/* Card Cover */}
                      <div className="h-44 bg-gray-50 overflow-hidden relative flex items-center justify-center border-b">
                        {driver.profileImage ? (
                          <img src={driver.profileImage} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-12 w-12 text-gray-300" />
                        )}
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[driver.lifecycleStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[driver.lifecycleStatus] || driver.lifecycleStatus}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{name}</h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p><strong>NIC:</strong> {driver.nic}</p>
                          <p><strong>License:</strong> {driver.licenseNumber}</p>
                          <p><strong>Mobile:</strong> {driver.mobileNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1"
                      >
                        Review Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 border animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900">Provide Rejection Reason</h3>
            <p className="text-sm text-gray-500">
              Please enter the reason for rejecting this driver. This feedback will be visible to the agency.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-transparent resize-none"
              placeholder="e.g. Driver photo does not match NIC image, please upload a clear, matching profile picture."
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
