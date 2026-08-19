import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import adminVehicleApi from '../services/adminVehicleApi'
import { useModal } from '../components/ModalContext'
import { Car, CheckCircle, ShieldAlert, FileText, User, Search, Eye, Building2, ExternalLink, X, AlertTriangle, Check, Sparkles } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-orange-100 text-orange-700 border-orange-200',
  active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  active:    'Approved',
  approved:  'Approved',
  rejected:  'Rejected',
  suspended: 'Suspended',
}

const PRESET_VEHICLE_REASONS = [
  'Revenue license is expired or invalid',
  'Insurance certificate is expired or invalid',
  'Document images are blurry or illegible',
  'License plate number does not match submitted papers',
  'Vehicle photos do not clearly display exterior condition',
  'Owner identity verification documents missing or incomplete',
]

// ── Card Skeleton ─────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
    <div className="h-44 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-9 bg-gray-100 rounded-xl mt-4" />
    </div>
  </div>
)

// ── Sub-component: Vehicle Detail View ────────────────────────────────────────
const VehicleDetailView = ({ vehicle, onBack, onApprove, onReject, loading }) => {
  const navigate = useNavigate()
  if (!vehicle) return null

  const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
  const ownerName = vehicle.owner ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}` : `${vehicle.ownerFirstName || ''} ${vehicle.ownerLastName || ''}`
  const ownerNic = vehicle.owner ? vehicle.owner.nicNumber : (vehicle.nicNumber || '—')
  const ownerEmail = vehicle.owner ? vehicle.owner.email : (vehicle.ownerEmail || '—')
  const ownerMobile = vehicle.owner ? vehicle.owner.mobileNumber : (vehicle.mobileNumber || '—')
  const ownerSecondaryMobile = vehicle.owner ? vehicle.owner.secondaryMobileNumber : (vehicle.secondaryMobileNumber || '—')
  const ownerAddress = vehicle.owner 
    ? [vehicle.owner.addressLine1, vehicle.owner.addressLine2].filter(Boolean).join(', ') 
    : [vehicle.addressLine1, vehicle.addressLine2].filter(Boolean).join(', ')
  const isPending = (vehicle.lifecycleStatus || vehicle.status || '').toLowerCase() === 'pending'
  const isRejected = (vehicle.lifecycleStatus || vehicle.status || '').toLowerCase() === 'rejected'

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &larr; Back to Vehicles
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{vehicleName}</h2>
            <p className="text-sm text-gray-500 mt-1">Type: {vehicle.vehicleType} | Color: {vehicle.color}</p>
          </div>
          <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[vehicle.lifecycleStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {STATUS_LABELS[vehicle.lifecycleStatus] || vehicle.lifecycleStatus}
          </span>
        </div>

        {/* Rejection Notice Banner if Rejected */}
        {isRejected && vehicle.rejectionReason && (
          <div className="bg-red-50/90 border border-red-200 rounded-xl p-5 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-900">Rejection Reason Provided by Admin</h4>
              <p className="text-sm text-red-700 leading-relaxed">{vehicle.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Cover Image */}
        <div className="rounded-2xl overflow-hidden shadow-sm h-[320px] w-full relative bg-gray-50 border border-gray-100 flex items-center justify-center">
          {vehicle.vehicleImageFront ? (
            <img src={vehicle.vehicleImageFront} alt={vehicleName} className="w-full h-full object-cover" />
          ) : (
            <Car className="h-20 w-20 text-gray-300" />
          )}
        </div>

        {/* Assigned Travel Agency Box */}
        <div className="bg-sky-50/60 rounded-xl p-6 border border-sky-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100/80 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sky-600" /> Assigned Travel Agency
            </h3>
            <button
              type="button"
              onClick={() => {
                if (vehicle.agentId) {
                  navigate(`/admin/agents/${vehicle.agentId}`)
                } else {
                  navigate('/admin/agents')
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <span>View Agency Approvals</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-gray-500 font-medium">Agency Business Name</span>
              <button
                type="button"
                onClick={() => {
                  if (vehicle.agentId) {
                    navigate(`/admin/agents/${vehicle.agentId}`)
                  } else {
                    navigate('/admin/agents')
                  }
                }}
                className="font-bold text-base text-sky-600 hover:text-sky-800 hover:underline text-left mt-0.5"
              >
                {vehicle.agencyName || 'Agency Partner'}
              </button>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-medium">Agency Owner / Representative</span>
              <span className="font-semibold text-gray-900 block mt-0.5">{vehicle.agentOwnerName || '—'}</span>
            </div>
          </div>
        </div>

        {/* Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Owner Information */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <User className="h-5 w-5 text-teal-600" /> Owner Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">Name</span>
                <span className="font-semibold text-gray-900">{ownerName || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">NIC Number</span>
                <span className="font-semibold text-gray-900">{ownerNic}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Email Address</span>
                <span className="font-semibold text-gray-900 truncate block">{ownerEmail}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Phone Numbers</span>
                <span className="font-semibold text-gray-900 block">{ownerMobile}</span>
                {ownerSecondaryMobile && <span className="text-xs text-gray-500 block">{ownerSecondaryMobile} (Secondary)</span>}
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 font-medium">Billing Address</span>
                <span className="font-semibold text-gray-900">{ownerAddress || '—'}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Vehicle Specifications */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Car className="h-5 w-5 text-teal-600" /> Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">License Plate</span>
                <span className="font-semibold text-gray-900">{vehicle.registration}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Seat Capacity</span>
                <span className="font-semibold text-gray-900">{vehicle.capacity || vehicle.seatingCapacity || '—'} passengers</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Manufacture Year</span>
                <span className="font-semibold text-gray-900">{vehicle.yearOfManufacture || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Insurance Expiry</span>
                <span className="font-semibold text-gray-900">{vehicle.insuranceExpiryDate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Auditing section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <FileText className="h-5 w-5 text-teal-600" /> Verification Documents & Photos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* NIC Front */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">NIC Front Photo</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {vehicle.nicFrontImage || vehicle.owner?.nicFrontImage ? (
                    <img src={vehicle.nicFrontImage || vehicle.owner?.nicFrontImage} className="w-full h-full object-cover" alt="NIC Front" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminVehicleApi.viewDocumentImage(vehicle.nicFrontImage || vehicle.owner?.nicFrontImage)} 
                disabled={!(vehicle.nicFrontImage || vehicle.owner?.nicFrontImage)}
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
                  {vehicle.nicRearImage || vehicle.owner?.nicRearImage ? (
                    <img src={vehicle.nicRearImage || vehicle.owner?.nicRearImage} className="w-full h-full object-cover" alt="NIC Rear" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminVehicleApi.viewDocumentImage(vehicle.nicRearImage || vehicle.owner?.nicRearImage)} 
                disabled={!(vehicle.nicRearImage || vehicle.owner?.nicRearImage)}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>

            {/* Insurance card */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">Insurance Card</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {vehicle.insuranceCardFront ? (
                    <img src={vehicle.insuranceCardFront} className="w-full h-full object-cover" alt="Insurance Card" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminVehicleApi.viewDocumentImage(vehicle.insuranceCardFront)} 
                disabled={!vehicle.insuranceCardFront}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>

            {/* Revenue License */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700">Revenue License</span>
                <div className="aspect-video w-full rounded bg-gray-50 overflow-hidden relative border mt-2 flex items-center justify-center">
                  {vehicle.revenueLicenseImage ? (
                    <img src={vehicle.revenueLicenseImage} className="w-full h-full object-cover" alt="Revenue License" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => adminVehicleApi.viewDocumentImage(vehicle.revenueLicenseImage)} 
                disabled={!vehicle.revenueLicenseImage}
                className="w-full py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition disabled:opacity-50"
              >
                View Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {isPending && (
          <div className="flex gap-4 border-t pt-6 justify-end">
            <button 
              onClick={() => onReject(vehicle)} 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 active:bg-red-100 transition disabled:opacity-50 flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4 text-red-600" /> Reject Vehicle Registration
            </button>
            <button 
              onClick={() => onApprove(vehicle)} 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Approve & Activate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component: VehicleApprovals ─────────────────────────────────────
export default function VehicleApprovals() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectingVehicle, setRejectingVehicle] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const modal = useModal()
  const navigate = useNavigate()

  const fetchVehiclesList = useCallback(async (filter: string) => {
    try {
      setLoading(true)
      setError('')
      const apiStatus = filter === 'All' ? 'all' : (filter === 'Approved' ? 'active' : filter.toLowerCase())
      const data = await adminVehicleApi.getAllVehicles(apiStatus)
      setVehicles(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehiclesList(statusFilter)
  }, [statusFilter, fetchVehiclesList])

  const handleApprove = async (vehicle: any) => {
    const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
    const ok = await modal.showConfirm({
      title:   'Approve Vehicle',
      message: `Are you sure you want to approve "${vehicleName}" (${vehicle.registration})? It will be activated immediately.`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminVehicleApi.approveVehicle(vehicle.id)
      modal.addToast(`✅ "${vehicleName}" approved successfully`)
      
      setVehicles(prev => prev.map(v =>
        v.id === vehicle.id ? { ...v, lifecycleStatus: 'active' } : v
      ))
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle((prev: any) => prev ? { ...prev, lifecycleStatus: 'active' } : null)
      }
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (vehicle: any) => {
    setRejectingVehicle(vehicle)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      modal.addToast('⚠️ Rejection reason is required. Please provide a clear explanation.')
      return
    }
    const vehicle = rejectingVehicle
    if (!vehicle) return
    const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
    try {
      setActionLoading(true)
      await adminVehicleApi.rejectVehicle(vehicle.id, rejectReason.trim())
      modal.addToast(`🚫 "${vehicleName}" registration rejected`)
      
      setVehicles(prev => prev.map(v =>
        v.id === vehicle.id ? { ...v, lifecycleStatus: 'rejected', rejectionReason: rejectReason.trim() } : v
      ))
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle((prev: any) => prev ? { ...prev, lifecycleStatus: 'rejected', rejectionReason: rejectReason.trim() } : null)
      }
      setIsRejectModalOpen(false)
      setRejectingVehicle(null)
      setRejectReason('')
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Client-side search ─────────────────────────────────────────────────────
  const displayed = vehicles.filter(v => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${v.brand || ''} ${v.model || ''}`.toLowerCase()
    return (
      name.includes(q) ||
      (v.registration || '').toLowerCase().includes(q) ||
      (v.ownerFirstName || '').toLowerCase().includes(q) ||
      (v.ownerLastName || '').toLowerCase().includes(q) ||
      (v.agencyName || '').toLowerCase().includes(q) ||
      (v.agentOwnerName || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {selectedVehicle ? (
        <VehicleDetailView
          vehicle={selectedVehicle}
          onBack={() => setSelectedVehicle(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Vehicle Approvals</h1>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search vehicles by plate, model, brand, agency or owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] shadow-sm transition"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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

          {/* ── Error message ────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-red-800 text-sm">Failed to load vehicles</div>
                  <div className="text-xs text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchVehiclesList(statusFilter)}
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
              <Car className="h-14 w-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-bold text-base">No vehicles found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different status filter or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(vehicle => {
                const name = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
                const owner = vehicle.owner ? `${vehicle.owner.firstName || ''} ${vehicle.owner.lastName || ''}` : `${vehicle.ownerFirstName || ''} ${vehicle.ownerLastName || ''}`
                const statusKey = String(vehicle.lifecycleStatus || vehicle.status || 'active').trim().toLowerCase()
                const isApproved = statusKey === 'active' || statusKey === 'approved'
                const isPending = statusKey === 'pending'
                const isSuspended = statusKey === 'suspended'

                return (
                  <div key={vehicle.id} className="bg-white rounded-2xl md:rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
                    <div>
                      {/* Card Cover */}
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative flex items-center justify-center">
                        {vehicle.vehicleImageFront ? (
                          <img src={vehicle.vehicleImageFront} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <Car className="h-16 w-16 text-gray-300" />
                        )}

                        {/* Top-left Translucent Glass Status Pill */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
                            isApproved 
                              ? 'bg-[#062d1b]/85 text-[#34d399] border-[#34d399]/25' 
                              : isPending 
                              ? 'bg-[#2d1b06]/85 text-[#fbbf24] border-[#fbbf24]/25' 
                              : isSuspended 
                              ? 'bg-[#2b1111]/85 text-[#f87171] border-[#f87171]/25' 
                              : 'bg-[#2b1111]/85 text-[#f87171] border-[#f87171]/25'
                          }`}>
                            {isApproved ? 'Approved' : (isPending ? 'Pending' : (isSuspended ? 'Suspended' : 'Rejected'))}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="font-bold text-gray-900 text-base sm:text-lg tracking-tight truncate flex-1 cursor-pointer hover:text-[#0ea5e9] transition"
                          >
                            {name}
                          </h4>
                          <span className="text-xs bg-sky-50 text-[#0ea5e9] px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                            {vehicle.registration}
                          </span>
                        </div>

                        {/* Vehicle Type & Attributes Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {vehicle.vehicleType && (
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {vehicle.vehicleType}
                            </span>
                          )}
                          {(vehicle.capacity || vehicle.seatingCapacity) && (
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {vehicle.capacity || vehicle.seatingCapacity} Seats
                            </span>
                          )}
                          {vehicle.fuelType && (
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {vehicle.fuelType}
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-3.5" />

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400">Plate Number</span>
                            <span className="font-semibold text-gray-800 truncate block mt-0.5">{vehicle.registration}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400">Owner</span>
                            <span className="font-semibold text-gray-800 truncate block mt-0.5">{owner?.trim() || 'Agency Partner'}</span>
                          </div>
                          <div className="col-span-2 mt-1 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <span className="block text-[10px] uppercase font-bold text-gray-400">Assigned Agency</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (vehicle.agentId) {
                                    navigate(`/admin/agents/${vehicle.agentId}`)
                                  } else {
                                    navigate('/admin/agents')
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 font-bold text-xs text-sky-600 hover:text-sky-800 hover:underline transition mt-0.5 max-w-full text-left group/agency"
                                title={`View ${vehicle.agencyName || 'Agency'} Approvals`}
                              >
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-sky-500 group-hover/agency:scale-110 transition-transform" />
                                <span className="truncate">{vehicle.agencyName || 'Agency Partner'}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70 group-hover/agency:opacity-100" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rejection reason snippet on rejected cards */}
                        {!isPending && !isApproved && vehicle.rejectionReason && (
                          <div className="mt-3 p-2.5 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-700">
                            <span className="font-semibold block text-[10px] uppercase text-red-800">Reason</span>
                            <span className="line-clamp-2">{vehicle.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="w-full py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition duration-200 flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Rejection Reason Modal ────────────────────────────────────────── */}
      {isRejectModalOpen && rejectingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border border-gray-100 animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reject Vehicle Registration</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Target: <span className="font-bold text-gray-800">{rejectingVehicle.brand} {rejectingVehicle.model} ({rejectingVehicle.registration})</span>
                    {rejectingVehicle.agencyName && <span> • {rejectingVehicle.agencyName}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !actionLoading && setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Rejection feedback is mandatory</span>
              </div>
              <p className="text-amber-700 leading-normal">
                This explanation will be sent immediately as an official notice to the travel agency and displayed on the vehicle profile.
              </p>
            </div>

            {/* Quick Preset Reasons */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#0ea5e9]" />
                <span>Quick Preset Reasons (Click to insert)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_VEHICLE_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRejectReason(prev => {
                        if (!prev.trim()) return preset
                        if (prev.includes(preset)) return prev
                        return `${prev.trim()}; ${preset}`
                      })
                    }}
                    className="px-2.5 py-1 text-xs rounded-xl bg-gray-50 hover:bg-sky-50 text-gray-700 hover:text-sky-700 border border-gray-200 hover:border-sky-300 transition active:scale-95 text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Reason Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-gray-700">Detailed Reason for Rejection *</label>
                <span className={`text-[11px] ${rejectReason.trim().length === 0 ? 'text-gray-400' : 'text-sky-600 font-semibold'}`}>
                  {rejectReason.length} characters
                </span>
              </div>
              <textarea
                className="w-full min-h-[110px] p-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder-gray-400 resize-none shadow-2xs leading-relaxed"
                placeholder="Type the exact reason for rejection (e.g. Revenue license has expired on 2025-12-31, please upload a valid renewed license)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 active:bg-red-800 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                onClick={submitRejection}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
