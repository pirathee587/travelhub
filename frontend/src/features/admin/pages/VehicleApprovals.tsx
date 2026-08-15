import React, { useState, useEffect, useCallback } from 'react'
import adminVehicleApi from '../services/adminVehicleApi'
import { useModal } from '../components/ModalContext'
import { Car, Clock, CheckCircle, AlertTriangle, ShieldAlert, FileText, User } from 'lucide-react'

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
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[vehicle.lifecycleStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {STATUS_LABELS[vehicle.lifecycleStatus] || vehicle.lifecycleStatus}
          </span>
        </div>

        {/* Cover Image */}
        <div className="rounded-2xl overflow-hidden shadow-sm h-[320px] w-full relative bg-gray-50 border border-gray-100 flex items-center justify-center">
          {vehicle.vehicleImageFront ? (
            <img src={vehicle.vehicleImageFront} alt={vehicleName} className="w-full h-full object-cover" />
          ) : (
            <Car className="h-20 w-20 text-gray-300" />
          )}
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
                <span className="font-semibold text-gray-900">{vehicle.capacity} passengers</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Manufacture Year</span>
                <span className="font-semibold text-gray-900">{vehicle.yearOfManufacture}</span>
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
                    <img src={vehicle.nicFrontImage || vehicle.owner?.nicFrontImage} className="w-full h-full object-cover" />
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
                    <img src={vehicle.nicRearImage || vehicle.owner?.nicRearImage} className="w-full h-full object-cover" />
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
                    <img src={vehicle.insuranceCardFront} className="w-full h-full object-cover" />
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
                    <img src={vehicle.revenueLicenseImage} className="w-full h-full object-cover" />
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
        {vehicle.lifecycleStatus === 'pending' && (
          <div className="flex gap-4 border-t pt-6 justify-end">
            <button 
              onClick={() => onReject(vehicle)} 
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 active:bg-red-100 transition disabled:opacity-50 flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" /> Reject Registration
            </button>
            <button 
              onClick={() => onApprove(vehicle)} 
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

// ── Main Page Component: VehicleApprovals ─────────────────────────────────────
export default function VehicleApprovals() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectingVehicle, setRejectingVehicle] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const modal = useModal()

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

  const handleApprove = async (vehicle) => {
    const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
    const ok = await modal.showConfirm({
      title:   'Approve Vehicle',
      message: `Are you sure you want to approve "${vehicleName}"? It will be activated immediately.`,
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
        setSelectedVehicle(null)
      }
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (vehicle) => {
    setRejectingVehicle(vehicle)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      modal.addToast('⚠️ Rejection reason is required')
      return
    }
    const vehicle = rejectingVehicle
    if (!vehicle) return
    const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
    try {
      setActionLoading(true)
      setIsRejectModalOpen(false)
      await adminVehicleApi.rejectVehicle(vehicle.id, rejectReason)
      modal.addToast(`🚫 "${vehicleName}" registration rejected`)
      
      setVehicles(prev => prev.map(v =>
        v.id === vehicle.id ? { ...v, lifecycleStatus: 'rejected', rejectionReason: rejectReason } : v
      ))
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle(null)
      }
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
      setRejectingVehicle(null)
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
      (v.ownerLastName || '').toLowerCase().includes(q)
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

          {/* ── Filter Toolbar ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by model, registration or owner..."
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
                  <div className="font-semibold text-red-700">Failed to load vehicles</div>
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchVehiclesList(statusFilter)}
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
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-600 font-semibold text-lg">No vehicles found</div>
              <div className="text-gray-400 text-sm mt-1">Try a different status filter or search term</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(vehicle => {
                const name = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration
                const owner = vehicle.owner ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}` : `${vehicle.ownerFirstName || ''} ${vehicle.ownerLastName || ''}`
                return (
                  <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      {/* Card Cover */}
                      <div className="h-44 bg-gray-50 overflow-hidden relative flex items-center justify-center border-b">
                        {vehicle.vehicleImageFront ? (
                          <img src={vehicle.vehicleImageFront} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="h-12 w-12 text-gray-300" />
                        )}
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[vehicle.lifecycleStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[vehicle.lifecycleStatus] || vehicle.lifecycleStatus}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{name}</h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p><strong>Plate:</strong> {vehicle.registration}</p>
                          <p><strong>Owner:</strong> {owner || '—'}</p>
                          <p><strong>Type:</strong> {vehicle.vehicleType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
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
              Please enter the reason for rejecting this vehicle. This feedback will be visible to the agency.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-transparent resize-none"
              placeholder="e.g. Blurry insurance document upload, please scan and upload a clearer photo."
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
