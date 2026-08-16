import React, { useState, useEffect, useCallback, useMemo } from 'react'
import adminHotelApi from '../services/adminHotelApi'
import { useModal } from '../components/ModalContext'
import {
  Building2,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Star,
  Check,
  X,
  Trash2,
  AlertCircle,
  Eye,
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  ShieldAlert,
  Sparkles,
  BedDouble,
  ExternalLink,
  RefreshCw,
  PowerOff,
  Power,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended']

const STATUS_CONFIG = {
  Pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  Approved: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  Rejected: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Rejected',
  },
  Suspended: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    label: 'Suspended',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v) => (v != null && !isNaN(v) ? `$${Number(v).toFixed(2)}` : null)
const fmtRating = (v) => (v != null && !isNaN(v) ? Number(v).toFixed(1) : '0.0')

// ── Card Skeleton ─────────────────────────────────────────────────────────────
const HotelCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-[380px]">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full mt-2" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="flex gap-2 mt-2">
        <div className="h-5 bg-gray-200 rounded-md w-16" />
        <div className="h-5 bg-gray-200 rounded-md w-20" />
      </div>
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
        <div className="h-6 bg-gray-200 rounded w-28" />
        <div className="h-8 bg-gray-200 rounded-lg w-20" />
      </div>
    </div>
  </div>
)

// ── Reject Reason Dialog ──────────────────────────────────────────────────────
const RejectDialog = ({ isOpen, hotel, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) setReason('')
  }, [isOpen])

  if (!isOpen || !hotel) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scale-in">
        <div className="flex items-center gap-3 mb-4 text-rose-600">
          <div className="p-2.5 bg-rose-50 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Reject Application</h3>
            <p className="text-xs text-gray-500">{hotel.hotelName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for rejecting this hotel application. The owner will be notified with this feedback.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Incomplete documentation, invalid NIC or license photocopy..."
          className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-5 resize-none"
        />

        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(hotel, reason)}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
          >
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── NIC Photocopy Viewer Modal ────────────────────────────────────────────────
const NicModal = ({ isOpen, imageUrl, ownerName, onClose }) => {
  if (!isOpen || !imageUrl) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
        <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-gray-900 text-base">NIC Document Photocopy</h3>
              <p className="text-xs text-gray-500">Owner: {ownerName || 'Verified User'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-100 flex items-center justify-center overflow-auto max-h-[65vh]">
          <img
            src={imageUrl}
            alt="NIC Photocopy"
            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-gray-200"
          />
        </div>

        <div className="p-4 px-6 border-t border-gray-100 flex justify-between items-center bg-white">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
          </a>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Hotel Detail View ─────────────────────────────────────────────────────────
const HotelDetailView = ({
  hotel,
  onBack,
  onApprove,
  onReject,
  onToggle,
  onDelete,
  loading,
}) => {
  const [showNicModal, setShowNicModal] = useState(false)

  if (!hotel) return null

  const {
    id,
    hotelName,
    imageUrl,
    district,
    location,
    rating,
    numberOfRooms,
    ownerName,
    ownerEmail,
    ownerNic,
    nicImageUrl,
    phoneNumber,
    hotlineNumber,
    hotelEmail,
    hotelContactNumber,
    amenities,
    roomTypes,
    applicationStatus,
    isActive,
    description,
    priceFrom,
    priceTo,
  } = hotel

  const rawStatus = String(applicationStatus || 'Pending').trim()
  const isSuspended = isActive === false && rawStatus.toLowerCase() === 'approved'
  const currentStatus = isSuspended ? 'Suspended' : rawStatus
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-xl gap-2 font-semibold text-gray-700 bg-white hover:bg-gray-50 border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hotels
        </Button>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${statusCfg.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Cover Hero Banner */}
        <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={hotelName}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center">
              <Building2 className="h-20 w-20 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Hero Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  ID: #{id}
                </span>
                <div className="flex items-center gap-1 bg-amber-400/90 text-amber-950 px-2 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{rating != null ? Number(rating).toFixed(1) : '0.0'} / 5.0</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{hotelName}</h2>
              <div className="flex items-center gap-1.5 text-sm text-gray-200">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>{[location, district].filter(Boolean).join(', ') || 'Sri Lanka'}</span>
              </div>
            </div>

            {/* Price Preview in Hero */}
            {(priceFrom != null || priceTo != null) && (
              <div className="bg-white/95 backdrop-blur-md p-3 px-4 rounded-xl text-right shadow-md">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Price Range
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {fmtPrice(priceFrom)} – {fmtPrice(priceTo)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Description */}
          {description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                About Hotel
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-100">
                {description}
              </p>
            </div>
          )}

          {/* Location & Room Specs */}
          <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Property & Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">District</span>
                <span className="font-bold text-gray-800 text-sm">{district || '—'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">Exact Address / Town</span>
                <span className="font-bold text-gray-800 text-sm">{location || '—'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">Total Rooms</span>
                <span className="font-bold text-emerald-600 text-sm flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" /> {numberOfRooms || 0} Rooms
                </span>
              </div>
            </div>

            {/* Room Types */}
            {roomTypes && roomTypes.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-700 mb-2 block">Room Categories</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomTypes.map((rt, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs"
                    >
                      <div className="font-bold text-gray-900 text-sm">{rt.name}</div>
                      {rt.description && (
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {rt.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner & Verification Information */}
          <div className="bg-sky-50/60 rounded-2xl p-6 border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-600" />
              Owner & Verification Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">Owner Name</span>
                <span className="font-bold text-gray-800 text-sm">{ownerName || '—'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">Owner Email</span>
                <span className="font-bold text-sky-600 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {ownerEmail || '—'}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">Contact Phone</span>
                <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  {phoneNumber || hotelContactNumber || '—'}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold block mb-1">NIC Number</span>
                <span className="font-mono font-bold text-gray-800 text-sm">
                  {ownerNic || 'Not provided'}
                </span>
              </div>
            </div>

            {/* NIC Document Button */}
            <div className="pt-2">
              {nicImageUrl ? (
                <Button
                  onClick={() => setShowNicModal(true)}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm gap-2 font-semibold h-11"
                >
                  <Eye className="h-4 w-4" /> View NIC Document Photocopy
                </Button>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  No NIC document photocopy uploaded by owner yet.
                </div>
              )}
            </div>
          </div>

          {/* Amenities & Facilities */}
          {amenities && amenities.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Amenities & Facilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Admin Decision Actions */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-900 text-base">Application Decision</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage approval, suspension, or deletion of this listing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {rawStatus.toLowerCase() !== 'approved' && (
                <Button
                  onClick={() => onApprove(hotel)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold shadow-sm"
                >
                  <Check className="h-4 w-4" /> Approve Hotel
                </Button>
              )}

              {rawStatus.toLowerCase() !== 'rejected' && (
                <Button
                  onClick={() => onReject(hotel)}
                  disabled={loading}
                  variant="outline"
                  className="border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl gap-2 font-bold shadow-2xs"
                >
                  <X className="h-4 w-4" /> Reject Hotel
                </Button>
              )}

              {rawStatus.toLowerCase() === 'approved' && (
                <Button
                  onClick={() => onToggle(hotel)}
                  disabled={loading}
                  variant="outline"
                  className={
                    isActive === false
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl gap-2 font-bold'
                      : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl gap-2 font-bold'
                  }
                >
                  {isActive === false ? (
                    <>
                      <Power className="h-4 w-4" /> Activate Hotel
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-4 w-4" /> Suspend Hotel
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => onDelete(hotel)}
                disabled={loading}
                variant="ghost"
                className="text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NIC Modal */}
      <NicModal
        isOpen={showNicModal}
        imageUrl={nicImageUrl}
        ownerName={ownerName}
        onClose={() => setShowNicModal(false)}
      />
    </div>
  )
}

// ── Hotel Card Component (Matching the Template) ───────────────────────────────
const HotelCard = ({ hotel, onView }) => {
  const {
    id,
    hotelName,
    imageUrl,
    district,
    location,
    rating,
    priceFrom,
    priceTo,
    applicationStatus,
    isActive,
    description,
    amenities = [],
  } = hotel

  const rawStatus = String(applicationStatus || 'Pending').trim()
  const isSuspended = isActive === false && rawStatus.toLowerCase() === 'approved'
  const currentStatus = isSuspended ? 'Suspended' : rawStatus
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending

  const hasPrice = Number.isFinite(priceFrom) && Number.isFinite(priceTo)

  return (
    <div
      onClick={() => onView(hotel)}
      className="group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl bg-white border-2 border-gray-100 hover:border-emerald-500/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer h-full min-h-[350px]"
    >
      {/* Card Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={hotelName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <Building2 className="h-12 w-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top Left: Admin Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border border-gray-100">
          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
          <span className={statusCfg.badge.split(' ')[1]}>{currentStatus}</span>
        </div>

        {/* Top Right: Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 shadow-sm border border-gray-100 transition-transform hover:scale-105">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-extrabold text-gray-900">{fmtRating(rating)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          {/* Hotel Name */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {hotelName}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 mt-1">
            <MapPin className="h-3.5 w-3.5 text-cyan-600 flex-shrink-0" />
            <span className="line-clamp-1">{location || district || 'Sri Lanka'}</span>
          </div>

          {/* Description snippet with left border */}
          {description && (
            <p className="text-[13px] text-gray-500 leading-relaxed mt-2 line-clamp-2 border-l-2 border-gray-200 pl-2 italic">
              {description}
            </p>
          )}

          {/* Amenities pill tags */}
          {amenities && amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {amenities.slice(0, 2).map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium border border-emerald-200 shadow-2xs"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 2 && (
                <span className="text-xs text-gray-400 px-1 py-0.5 font-medium self-center">
                  +{amenities.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row: Price & Details button */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-auto">
          {/* Price Range */}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
              Price Range
            </span>
            {hasPrice ? (
              <span className="text-base font-extrabold text-cyan-600">
                ${Number(priceFrom).toFixed(2)} – ${Number(priceTo).toFixed(2)}
              </span>
            ) : Number.isFinite(priceFrom) ? (
              <span className="text-base font-extrabold text-cyan-600">
                From ${Number(priceFrom).toFixed(2)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-400">Not Available</span>
            )}
          </div>

          {/* Details button */}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView(hotel)
            }}
            className="h-8 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white shadow-2xs text-xs px-3 font-semibold transition-all rounded-lg"
          >
            Details
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HotelApprovals() {
  const modal = useModal()

  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  // Detailed View & Dialogs
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [drawerDetail, setDrawerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [rejectDialogState, setRejectDialogState] = useState({ open: false, hotel: null })

  // ── Fetch Hotels ────────────────────────────────────────────────────────────
  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminHotelApi.getAllHotels()
      setHotels(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load hotels.')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  // ── Open Detail View ────────────────────────────────────────────────────────
  const openDetail = async (hotel) => {
    setSelectedHotel(hotel)
    setDrawerDetail(null)
    setDetailLoading(true)
    try {
      const res = await adminHotelApi.getHotelDetail(hotel.id)
      setDrawerDetail(res?.data ?? res)
    } catch {
      setDrawerDetail(hotel)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedHotel(null)
    setDrawerDetail(null)
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (hotel) => {
    const ok = await modal.showConfirm({
      title: 'Approve Hotel',
      message: `Approve "${hotel.hotelName}" and activate the hotel owner?`,
    })
    if (!ok) return

    try {
      setActionLoading(true)
      await adminHotelApi.approveHotel(hotel.id)
      modal.addToast(`✅ "${hotel.hotelName}" approved successfully!`)
      setHotels((prev) =>
        prev.map((h) =>
          h.id === hotel.id
            ? { ...h, applicationStatus: 'Approved', isActive: true }
            : h
        )
      )
      if (drawerDetail?.id === hotel.id) {
        setDrawerDetail((d) => ({ ...d, applicationStatus: 'Approved', isActive: true }))
      }
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenRejectDialog = (hotel) => {
    setRejectDialogState({ open: true, hotel })
  }

  const handleConfirmReject = async (hotel, reason) => {
    try {
      setActionLoading(true)
      await adminHotelApi.rejectHotel(hotel.id, reason || 'Rejected by administrator')
      modal.addToast(`🚫 "${hotel.hotelName}" rejected.`)
      setHotels((prev) =>
        prev.map((h) =>
          h.id === hotel.id ? { ...h, applicationStatus: 'Rejected' } : h
        )
      )
      if (drawerDetail?.id === hotel.id) {
        setDrawerDetail((d) => ({ ...d, applicationStatus: 'Rejected' }))
      }
      setRejectDialogState({ open: false, hotel: null })
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggle = async (hotel) => {
    const isSuspending = hotel.isActive !== false
    const action = isSuspending ? 'Suspend' : 'Activate'
    const ok = await modal.showConfirm({
      title: `${action} Hotel`,
      message: `Are you sure you want to ${action.toLowerCase()} "${hotel.hotelName}"?`,
    })
    if (!ok) return

    try {
      setActionLoading(true)
      const res = await adminHotelApi.toggleHotelActive(hotel.id)
      const updatedIsActive =
        res?.data?.isActive ?? res?.isActive ?? !isSuspending
      modal.addToast(`✅ "${hotel.hotelName}" ${isSuspending ? 'suspended' : 'activated'}`)
      setHotels((prev) =>
        prev.map((h) =>
          h.id === hotel.id
            ? {
                ...h,
                isActive: updatedIsActive,
                applicationStatus: updatedIsActive ? 'Approved' : 'Suspended',
              }
            : h
        )
      )
      if (drawerDetail?.id === hotel.id) {
        setDrawerDetail((d) => ({
          ...d,
          isActive: updatedIsActive,
          applicationStatus: updatedIsActive ? 'Approved' : 'Suspended',
        }))
      }
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Toggle failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (hotel) => {
    const ok = await modal.showConfirm({
      title: 'Delete Hotel',
      message: `Permanently delete "${hotel.hotelName}"? This action cannot be undone.`,
    })
    if (!ok) return

    try {
      setActionLoading(true)
      await adminHotelApi.deleteHotel(hotel.id)
      modal.addToast(`🗑 "${hotel.hotelName}" deleted.`)
      setHotels((prev) => prev.filter((h) => h.id !== hotel.id))
      closeDetail()
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Dynamic District List ───────────────────────────────────────────────────
  const dynamicDistricts = useMemo(() => {
    const unique = new Set(
      hotels
        .map((h) => h.district)
        .filter(Boolean)
        .map((d) => d.replace(/ district$/i, '').trim())
    )
    return Array.from(unique).sort()
  }, [hotels])

  // ── Counts ──────────────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const getStatus = (h) => {
      if (h.isActive === false && String(h.applicationStatus).trim().toLowerCase() === 'approved')
        return 'suspended'
      return String(h.applicationStatus || 'pending').trim().toLowerCase()
    }
    return {
      total: hotels.length,
      pending: hotels.filter((h) => getStatus(h) === 'pending').length,
      approved: hotels.filter((h) => getStatus(h) === 'approved').length,
      rejected: hotels.filter((h) => getStatus(h) === 'rejected').length,
      suspended: hotels.filter((h) => getStatus(h) === 'suspended').length,
    }
  }, [hotels])

  // ── Filtered & Sorted Hotels ────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // Status filter
        const rawStatus = String(hotel.applicationStatus || 'Pending').trim().toLowerCase()
        const isSusp = hotel.isActive === false && rawStatus === 'approved'
        const currentStatus = isSusp ? 'suspended' : rawStatus

        if (statusFilter.toLowerCase() !== 'all') {
          if (currentStatus !== statusFilter.toLowerCase()) return false
        }

        // District filter
        if (selectedDistrict !== 'all') {
          const hDist = (hotel.district || '').replace(/ district$/i, '').trim().toLowerCase()
          const sDist = selectedDistrict.replace(/ district$/i, '').trim().toLowerCase()
          if (hDist !== sDist) return false
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesName = hotel.hotelName?.toLowerCase().includes(q)
          const matchesDest = hotel.destination?.toLowerCase().includes(q)
          const matchesLoc = hotel.location?.toLowerCase().includes(q)
          const matchesDist = hotel.district?.toLowerCase().includes(q)
          if (!matchesName && !matchesDest && !matchesLoc && !matchesDist) return false
        }

        return true
      })
      .sort((a, b) => {
        const getPrice = (h) => (Number.isFinite(h?.priceFrom) ? h.priceFrom : null)
        const aPrice = getPrice(a)
        const bPrice = getPrice(b)

        if (sortBy === 'price-low') {
          if (aPrice == null && bPrice == null) return 0
          if (aPrice == null) return 1
          if (bPrice == null) return -1
          return aPrice - bPrice
        }
        if (sortBy === 'price-high') {
          if (aPrice == null && bPrice == null) return 0
          if (aPrice == null) return 1
          if (bPrice == null) return -1
          return bPrice - aPrice
        }
        if (sortBy === 'rating-low') return (a.rating || 0) - (b.rating || 0)
        if (sortBy === 'name-asc') return (a.hotelName || '').localeCompare(b.hotelName || '')
        // default: highest rated
        return (b.rating || 0) - (a.rating || 0)
      })
  }, [hotels, statusFilter, selectedDistrict, searchQuery, sortBy])

  return (
    <div className="p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      {selectedHotel ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm font-medium">Loading hotel details…</div>
            </div>
          </div>
        ) : (
          <HotelDetailView
            hotel={drawerDetail ?? selectedHotel}
            onBack={closeDetail}
            onApprove={handleApprove}
            onReject={handleOpenRejectDialog}
            onToggle={handleToggle}
            onDelete={handleDelete}
            loading={actionLoading}
          />
        )
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <section className="animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                  <Building2 className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Hotels</h1>
                  <p className="text-muted-foreground text-sm">
                    Find the perfect stay for your journey
                  </p>
                </div>
              </div>

              {/* Status Tabs / Counts Pill Header */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {STATUS_OPTIONS.map((status) => {
                  const key = status.toLowerCase()
                  const count = counts[key] ?? 0
                  const isSelected = statusFilter.toLowerCase() === key

                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{status}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── Toolbar: Search & Select Dropdowns ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotels..."
                className="pl-10 bg-white border-gray-200 rounded-xl h-11 shadow-2xs focus-visible:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* District Dropdown */}
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-full sm:w-[210px] bg-white border-gray-200 rounded-xl h-11 shadow-2xs">
                <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-gray-100">
                <SelectItem value="all">All Districts</SelectItem>
                {dynamicDistricts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sorting Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[210px] bg-white border-gray-200 rounded-xl h-11 shadow-2xs">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Highest Rated" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-gray-100">
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="rating-low">Lowest Rating</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Error Banner ─────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-700">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <div>
                  <div className="font-bold text-sm">Failed to load hotels</div>
                  <div className="text-xs text-rose-600">{error}</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={fetchHotels}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          )}

          {/* ── Hotel Card Grid ─────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg">No hotels found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                No hotel listings match your selected status, district, or search criteria.
              </p>
              {(searchQuery || statusFilter !== 'All' || selectedDistrict !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('All')
                    setSelectedDistrict('all')
                  }}
                  className="mt-4 rounded-xl text-xs font-bold"
                >
                  Reset all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onView={openDetail}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <RejectDialog
        isOpen={rejectDialogState.open}
        hotel={rejectDialogState.hotel}
        onClose={() => setRejectDialogState({ open: false, hotel: null })}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />
    </div>
  )
}
