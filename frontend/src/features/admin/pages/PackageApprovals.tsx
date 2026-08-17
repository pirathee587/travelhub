import placeholderImg from '@/assets/images/placeholder.png'
import kandyImg from '@/assets/images/kandy_temple.jpg'
import galleImg from '@/assets/images/galle_fort.jpg'
import React, { useState, useEffect, useCallback } from 'react'
import adminPackageApi from '../services/adminPackageApi'
import { useModal } from '../components/ModalContext'
import { useAdminCurrency } from '../hooks/AdminCurrencyContext'
import { Badge } from '@/components/common/ui/badge'
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Eye,
  Check,
  CheckCircle,
  X,
  Trash2,
  Power,
  ArrowLeft,
  AlertCircle,
  Package as PackageIcon,
  Tag,
  Building2,
  Maximize2
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

// ── Robust Activity Parser ───────────────────────────────────────────────────
const parseActivities = (raw: any): Array<{ description: string; imageUrl?: string }> => {
  if (!raw) return []

  // Case 1: Array of items
  if (Array.isArray(raw)) {
    // Check if it's an array of broken split strings from the previous backend bug
    // e.g. ['[{"description":"Mirissa whale watching"', '"imageUrl":"..."}']
    const isFragmentedJson = raw.some((item: any) =>
      typeof item === 'string' && (item.includes('{"description"') || item.includes('"imageUrl"') || item.startsWith('[{') || item.endsWith('}]') || item.includes('"description":'))
    )

    if (isFragmentedJson) {
      try {
        const joined = raw.join(',')
        const parsed = JSON.parse(joined)
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'string') return { description: item }
            return { description: item?.description || '', imageUrl: item?.imageUrl || '' }
          }).filter((a: any) => a.description && a.description.trim() !== '')
        }
      } catch (e) {
        // Continue to standard fallback parsing
      }
    }

    return raw.map((item: any) => {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed)
            return { description: parsed.description || '', imageUrl: parsed.imageUrl || '' }
          } catch (e) { }
        }
        return { description: trimmed }
      }
      if (item && typeof item === 'object') {
        return {
          description: item.description || '',
          imageUrl: item.imageUrl || ''
        }
      }
      return { description: String(item || '') }
    }).filter((a: any) => a.description && a.description.trim() !== '')
  }

  // Case 2: String (JSON or comma separated)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parseActivities(parsed)
        }
      } catch (e) { }
    }

    return trimmed.split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((s: string) => ({ description: s }))
  }

  return []
}

// ── Action Reason Modal (Reject / Suspend / Delete) ───────────────────────────
interface PackageActionReasonModalProps {
  type: 'reject' | 'suspend' | 'delete'
  pkg: any
  onConfirm: (reason: string) => Promise<void> | void
  onCancel: () => void
  loading: boolean
}

const PackageActionReasonModal: React.FC<PackageActionReasonModalProps> = ({
  type,
  pkg,
  onConfirm,
  onCancel,
  loading
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const isReject = type === 'reject'
  const isSuspend = type === 'suspend'
  const isDelete = type === 'delete'

  const title = isReject
    ? 'Reject Package Application'
    : isSuspend
    ? 'Suspend Travel Package'
    : 'Delete Package Permanently'

  const subtitle = isReject
    ? 'Please provide a clear reason for rejecting this travel package. This will be sent to the agency.'
    : isSuspend
    ? 'Please provide a reason for temporarily suspending this package. This will be sent to the agency.'
    : 'Please provide a reason for permanently deleting this package.'

  const placeholder = isReject
    ? 'e.g. Incomplete itinerary details, inaccurate pricing, missing hotel details, or quality standards not met.'
    : isSuspend
    ? 'e.g. Policy violation, safety concerns, temporary maintenance, or pending verification.'
    : 'e.g. Package discontinued, duplicate listing, or requested by agency.'

  const actionLabel = isReject
    ? 'Confirm Rejection'
    : isSuspend
    ? 'Confirm Suspension'
    : 'Confirm Delete'

  const actionButtonClass = isReject
    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
    : isSuspend
    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'

  const pkgTitle = pkg?.packageName || pkg?.name || 'Travel Package'
  const agencyName = pkg?.providerName || pkg?.agentName || 'Travel Agency'
  const bookingsCount = Number(pkg?.bookings || pkg?.bookingsCount || 0)
  const hasBookings = (isDelete || isSuspend) && bookingsCount > 0

  const handleConfirm = () => {
    if (hasBookings) {
      setError(`Cannot ${isSuspend ? 'suspend' : 'delete'}: This package currently has ${bookingsCount} active booking(s).`)
      return
    }
    if (!reason.trim()) {
      setError('Please enter a reason.')
      return
    }
    setError('')
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button 
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Package & Recipient Agency Details Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium flex items-center gap-1.5">
              <PackageIcon className="w-3.5 h-3.5 text-[#0ea5e9]" /> Target Package:
            </span>
            <span className="font-bold text-gray-900 truncate max-w-[240px]" title={pkgTitle}>
              {pkgTitle}
            </span>
          </div>

          <div className="border-t border-slate-200/60 pt-2.5 flex items-start justify-between text-xs">
            <span className="text-gray-500 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0ea5e9]" /> Travel Agency:
            </span>
            <span className="font-bold text-gray-900">{agencyName}</span>
          </div>

          {pkg?.bookings !== undefined && (
            <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0ea5e9]" /> Active Bookings:
              </span>
              <span className={`font-bold ${bookingsCount > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                {bookingsCount} booking(s)
              </span>
            </div>
          )}
        </div>

        {/* If trying to delete or suspend a package with bookings */}
        {hasBookings && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-bold">Cannot {isSuspend ? 'suspend' : 'delete'} package with active bookings</p>
              <p className="mt-0.5">This package currently has {bookingsCount} active booking(s). Packages with active bookings cannot be {isSuspend ? 'suspended' : 'removed'} to prevent disruptions to tourists and existing reservations.</p>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Reason / Message to Agency <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full min-h-[110px] p-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition ${
              error
                ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-200 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]'
            }`}
            placeholder={placeholder}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError('')
            }}
            disabled={loading || hasBookings}
          />
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button
            className="px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-5 py-2.5 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2 ${actionButtonClass}`}
            onClick={handleConfirm}
            disabled={loading || !reason.trim() || hasBookings}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Package Detail View (Exact Modern Template) ───────────────────────────────
const PackageDetailView = ({ pkg, onBack, onApprove, onReject, onToggle, onDelete, loading }: any) => {
  const { formatPrice } = useAdminCurrency()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!pkg) return null

  const {
    id,
    packageName,
    name,
    destination,
    district,
    startPlace,
    endPlace,
    packageType,
    priceFrom,
    priceTo,
    basePriceAdult,
    basePriceChild,
    duration,
    category,
    rating,
    reviewCount,
    trending,
    isActive,
    applicationStatus,
    providerName,
    description,
    inclusions,
    itinerary,
    days,
    imageUrl,
    images,
    bookings,
    rejectionReason
  } = pkg

  const title = packageName || name || 'Travel Package'
  const isApproved = String(applicationStatus || '').trim().toLowerCase() === 'approved' && isActive !== false
  const isPending = String(applicationStatus || '').trim().toLowerCase() === 'pending'
  const isSuspended = String(applicationStatus || '').trim().toLowerCase() === 'suspended' || (!isActive && String(applicationStatus || '').trim().toLowerCase() === 'approved')
  const isRejected = String(applicationStatus || '').trim().toLowerCase() === 'rejected'
  const bookingsCount = Number(bookings || pkg.bookingsCount || 0)

  // Image list extraction
  const imageList: string[] = []
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img: any) => {
      if (typeof img === 'string' && img.trim()) imageList.push(img)
      else if (img?.imageUrl) imageList.push(img.imageUrl)
    })
  } else if (imageUrl) {
    imageList.push(imageUrl)
  }

  const cover = imageList[0] || imageUrl || placeholderImg

  // Normalized itinerary days
  const rawDays = itinerary || days || []
  const normalizedDays = Array.isArray(rawDays) ? rawDays.map((d: any, idx: number) => {
    const actList = parseActivities(d.activities)

    return {
      dayNumber: d.dayNumber || idx + 1,
      title: d.title || `Day ${idx + 1}`,
      description: d.description || '',
      district: d.district || '',
      hotelName: d.hotelName || d.hotelNameCustom || '',
      hotelId: d.hotelId || null,
      activities: actList
    }
  }) : []

  // Normalized inclusions
  const rawInclusions = Array.isArray(inclusions)
    ? inclusions
    : (typeof inclusions === 'string' && inclusions.trim() !== '' ? inclusions.split(',').map((s: string) => s.trim()) : [])
  const normalizedInclusions = rawInclusions.length > 0
    ? rawInclusions
    : ['AC Transport', 'Meals', 'Accommodation', 'Local Guide']

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Bar Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0ea5e9] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Quick Header Badges / Status */}
          <div className="flex items-center gap-2" />
        </div>

        {/* ── 1. Big Hero Image Banner with Floating Pills ──────────────────── */}
        <div className="relative h-64 sm:h-80 md:h-[400px] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-gray-200/80 group">
          <img
            src={cover}
            alt={title}
            onError={(e: any) => { e.target.src = placeholderImg }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Badges on Top Right of Cover */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md ${isActive
                ? 'bg-[#0ea5e9] text-white border border-white/20'
                : 'bg-red-500 text-white border border-white/20'
              }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>

            <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md flex items-center gap-1.5 border ${isApproved
                ? 'bg-emerald-500 text-white border-emerald-400'
                : isPending
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-rose-500 text-white border-rose-400'
              }`}>
              {isApproved && <CheckCircle className="w-3.5 h-3.5" />}
              {isPending && <Clock className="w-3.5 h-3.5" />}
              {isRejected && <X className="w-3.5 h-3.5" />}
              {isApproved ? 'Approved' : (isPending ? 'Pending Approval' : (isSuspended ? 'Suspended' : 'Rejected'))}
            </span>
          </div>

          {/* Enlarge Cover Button */}
          <button
            onClick={() => setSelectedImage(cover)}
            className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/70 text-white p-2 rounded-xl backdrop-blur-md transition border border-white/20"
            title="View Full Cover Image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Header Info Row (Title, Tags, Specifications) ─────────────── */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <Badge variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {packageType === 'MULTI_DISTRICT' ? 'Multi District' : 'Single District'}
            </Badge>
          </div>

          {/* Subtitle Tags Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1 font-medium text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{district || destination || 'Sri Lanka'}</span>
            </div>

            {(startPlace || endPlace) && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium border border-gray-200/60">
                {[startPlace || district, endPlace || destination].filter(Boolean).join(' → ')}
              </span>
            )}

            {category && (
              <span className="text-xs bg-sky-50 text-sky-600 px-2.5 py-0.5 rounded-full font-medium border border-sky-100 capitalize">
                {category.toLowerCase()}
              </span>
            )}

            {providerName && (
              <span className="text-xs text-gray-400">
                • Provided by <strong className="text-gray-700 font-semibold">{providerName}</strong>
              </span>
            )}
          </div>

          {/* ── Rejection / Suspension Reason Banner ────────────────── */}
          {rejectionReason && (isRejected || isSuspended || !isActive) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-start gap-3 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider">
                  {isSuspended || !isActive ? 'Suspension Reason:' : 'Rejection Reason:'}
                </span>
                <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
                  {rejectionReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Key Info Specifications Strip ──────────────────────────────── */}
        <div className="border border-gray-200/80 rounded-2xl bg-white p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Duration
            </span>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {duration || '2 Days / 1 Night'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Base Adult
            </span>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {formatPrice(basePriceAdult ?? priceFrom ?? 120)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Base Child
            </span>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {formatPrice(basePriceChild ?? 70)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Bookings
            </span>
            <p className="text-sm sm:text-base font-bold text-gray-900">
              {bookings ?? 0}
            </p>
          </div>
        </div>

        {/* ── 4. Main Two Column Grid (Details vs Included & Actions) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Description, Itinerary & Gallery */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {description || 'Journey from the sacred cultural city of Kandy up into the misty tea estates and waterfalls of Nuwara Eliya.'}
              </p>
            </div>

            {/* Itinerary Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Itinerary</h3>

              {normalizedDays.length > 0 ? (
                <div className="space-y-6 pl-4 border-l-2 border-sky-100 relative">
                  {normalizedDays.map((day: any, dayIdx: number) => (
                    <div key={dayIdx} className="relative pl-6 pb-2 group/day">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full bg-[#0ea5e9] border-4 border-white shadow-sm ring-2 ring-[#0ea5e9]/20" />

                      <div className="space-y-3">
                        {/* Day Title and Pill */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-0.5 rounded-md">
                            Day {day.dayNumber || (dayIdx + 1)}
                          </span>
                          <h4 className="font-bold text-gray-900 text-base">
                            {day.title}
                          </h4>
                        </div>

                        {/* Day Description */}
                        {day.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {day.description}
                          </p>
                        )}

                        {/* Badges for District & Hotel */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {day.district && (
                            <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200/60 font-medium">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {day.district}
                            </span>
                          )}
                          {day.hotelName && (
                            <span className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md text-xs border border-sky-200/60 font-medium">
                              <Building2 className="w-3.5 h-3.5 text-sky-600" />
                              <span>{day.hotelName}</span>
                              <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.2 rounded-full ml-0.5">
                                Approved
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Activities within the Day */}
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-3 space-y-2.5">
                            {day.activities.map((act: any, actIdx: number) => (
                              <div
                                key={actIdx}
                                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/70 hover:bg-slate-50 transition"
                              >
                                <div className="h-6 w-6 shrink-0 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center text-xs font-bold mt-0.5">
                                  {actIdx + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {act.description}
                                  </p>
                                  {act.imageUrl && (
                                    <div
                                      className="rounded-lg overflow-hidden h-28 w-44 border border-gray-200 cursor-pointer group/actimg"
                                      onClick={() => setSelectedImage(act.imageUrl)}
                                    >
                                      <img
                                        src={act.imageUrl}
                                        alt={`Activity ${actIdx + 1}`}
                                        className="w-full h-full object-cover group-hover/actimg:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No itinerary details provided.</p>
              )}
            </div>

            {/* Gallery Section */}
            {imageList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {imageList.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[16/10] rounded-xl overflow-hidden border border-gray-200/80 bg-gray-100 cursor-pointer group shadow-sm hover:shadow-md transition"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => { e.target.src = placeholderImg }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: What's Included & Admin Decisions */}
          <div className="space-y-6">

            {/* What's Included Card */}
            <div className="p-6 border border-gray-200/80 rounded-2xl bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-900">What's Included</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {normalizedInclusions.map((item: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-sm text-gray-700 font-medium"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Decision Actions Card */}
            <div className="p-6 border border-gray-200/80 rounded-2xl bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                Admin Decision
              </h3>

              <div className="space-y-3">
                {/* 1. If Suspended: ONLY show Unsuspend Package in sky blue, removing Reject and Approve buttons */}
                {isSuspended ? (
                  <button
                    onClick={() => onToggle(pkg)}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Unsuspend Package
                  </button>
                ) : (
                  <>
                    {/* If Pending: show Approve and Reject */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => onApprove(pkg)}
                          disabled={loading}
                          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Approve Package
                        </button>

                        <button
                          onClick={() => onReject(pkg)}
                          disabled={loading}
                          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject Package
                        </button>
                      </>
                    )}

                    {/* If Approved & Active: show Suspend */}
                    {isApproved && (
                      <button
                        onClick={() => onToggle(pkg)}
                        disabled={loading || (isActive && bookingsCount > 0)}
                        title={isActive && bookingsCount > 0 ? `Cannot suspend: Package has ${bookingsCount} active booking(s)` : 'Suspend Package'}
                        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm border shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                          isActive && bookingsCount > 0
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200 cursor-pointer'
                        }`}
                      >
                        <Power className="w-4 h-4" /> {isActive && bookingsCount > 0 ? `Suspend (${bookingsCount} bookings)` : 'Suspend Package'}
                      </button>
                    )}

                    {/* If Rejected: show Approve option */}
                    {isRejected && (
                      <button
                        onClick={() => onApprove(pkg)}
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Approve Package
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => onDelete(pkg)}
                  disabled={loading || (bookingsCount > 0)}
                  title={bookingsCount > 0 ? `Cannot delete: Package has ${bookingsCount} active booking(s)` : 'Delete Package'}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm border transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                    bookingsCount > 0
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200 cursor-pointer'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" /> {bookingsCount > 0 ? `Delete Package (${bookingsCount} bookings)` : 'Delete Package'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Image Lightbox Modal ────────────────────────────────────────────── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/60 hover:bg-black/90 rounded-full p-2.5 transition border border-white/20"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Package Card (Approvals Grid View) ────────────────────────────────────────
const PackageCard = ({ pkg, onView, onApprove, onReject, onToggle, onDelete, actionLoading }: any) => {
  const { formatPrice } = useAdminCurrency()
  const { id, packageName, destination, district, priceFrom, basePriceAdult, duration, category,
    rating, reviewCount, isActive, applicationStatus, imageUrl, images, rejectionReason, bookings } = pkg

  const cover = (images && images[0]) || imageUrl || (id % 2 === 0 ? galleImg : kandyImg)
  const isApproved = String(applicationStatus || '').trim().toLowerCase() === 'approved'
  const isPending = String(applicationStatus || '').trim().toLowerCase() === 'pending'
  const isSuspended = String(applicationStatus || '').trim().toLowerCase() === 'suspended'
  const isRejected = String(applicationStatus || '').trim().toLowerCase() === 'rejected'

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
          <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${isApproved
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
            {bookings !== undefined && Number(bookings) > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                {bookings} booking{bookings > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Rejection / Suspension Note if present */}
          {rejectionReason && (isRejected || isSuspended) && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                <strong>{isSuspended ? 'Suspended:' : 'Rejected:'}</strong> {rejectionReason}
              </span>
            </div>
          )}
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
              {formatPrice(basePriceAdult ?? priceFrom ?? 100)}
            </span>
          </div>
        </div>

        {/* 3. Action Button: View Details */}
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
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [selected, setSelected] = useState<any>(null)
  const [drawerDetail, setDrawerDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Reason Modal State (for Reject / Suspend / Delete)
  const [reasonModal, setReasonModal] = useState<{
    open: boolean
    type: 'reject' | 'suspend' | 'delete'
    pkg: any
  }>({
    open: false,
    type: 'reject',
    pkg: null
  })

  const fetchPackages = useCallback(async (status: string) => {
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
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages(statusFilter)
  }, [statusFilter, fetchPackages])

  const openDrawer = async (pkg: any) => {
    setSelected(pkg)
    setDrawerDetail(null)
    setDetailLoading(true)
    try {
      const res = await adminPackageApi.getPackageDetail(pkg.id)
      const data = res?.data ?? res
      setDrawerDetail(data)
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

  const patchLocal = (id: number, patch: any) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
    if (selected?.id === id) setSelected((p: any) => ({ ...p, ...patch }))
    if (drawerDetail?.id === id) setDrawerDetail((p: any) => ({ ...p, ...patch }))
  }

  const handleOpenReasonModal = (type: 'reject' | 'suspend' | 'delete', pkg: any) => {
    const bookingsCount = Number(pkg?.bookings || pkg?.bookingsCount || 0)
    if ((type === 'delete' || type === 'suspend') && bookingsCount > 0) {
      modal.addToast(`⚠️ Cannot ${type} package: "${pkg.packageName || pkg.name}" has ${bookingsCount} active booking(s).`)
      return
    }
    setReasonModal({ open: true, type, pkg })
  }

  const handleReasonConfirm = async (reason: string) => {
    const { type, pkg } = reasonModal
    if (!pkg) return
    try {
      setActionLoading(true)
      if (type === 'reject') {
        await adminPackageApi.rejectPackage(pkg.id, reason)
        modal.addToast(`🚫 "${pkg.packageName || pkg.name}" rejected`)
        patchLocal(pkg.id, { applicationStatus: 'Rejected', isActive: false, rejectionReason: reason })
      } else if (type === 'suspend') {
        await adminPackageApi.togglePackageActive(pkg.id, reason)
        modal.addToast(`⏸ "${pkg.packageName || pkg.name}" suspended`)
        patchLocal(pkg.id, { applicationStatus: 'Suspended', isActive: false, rejectionReason: reason })
      } else if (type === 'delete') {
        await adminPackageApi.deletePackage(pkg.id, reason)
        modal.addToast(`🗑 "${pkg.packageName || pkg.name}" deleted`)
        setPackages(prev => prev.filter(p => p.id !== pkg.id))
        closeDrawer()
      }
      setReasonModal({ open: false, type: 'reject', pkg: null })
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || err?.message || 'Action failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (pkg: any) => {
    if (!await modal.showConfirm({ title: 'Approve Package', message: `Approve "${pkg.packageName || pkg.name}"? It will become visible to tourists.` })) return
    try {
      setActionLoading(true)
      await adminPackageApi.approvePackage(pkg.id)
      modal.addToast(`✅ "${pkg.packageName || pkg.name}" approved`)
      patchLocal(pkg.id, { applicationStatus: 'Approved', isActive: true, rejectionReason: null })
    } catch (err: any) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
    finally { setActionLoading(false) }
  }

  const handleReject = (pkg: any) => {
    handleOpenReasonModal('reject', pkg)
  }

  const handleToggle = async (pkg: any) => {
    const isCurrentlySuspended = pkg.isActive === false || String(pkg.applicationStatus).toLowerCase() === 'suspended'
    if (!isCurrentlySuspended) {
      handleOpenReasonModal('suspend', pkg)
    } else {
      if (!await modal.showConfirm({ title: 'Unsuspend Package', message: `Unsuspend "${pkg.packageName || pkg.name}"? It will become active and visible to tourists.` })) return
      try {
        setActionLoading(true)
        await adminPackageApi.togglePackageActive(pkg.id)
        modal.addToast(`✅ "${pkg.packageName || pkg.name}" unsuspended successfully`)
        patchLocal(pkg.id, {
          isActive: true,
          applicationStatus: 'Approved',
          rejectionReason: null
        })
      } catch (err: any) { modal.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`) }
      finally { setActionLoading(false) }
    }
  }

  const handleDelete = (pkg: any) => {
    handleOpenReasonModal('delete', pkg)
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
    const matchesSearch = !q || [p.packageName, p.name, p.destination, p.district, p.location, p.agentName, p.category].some(val => val?.toLowerCase().includes(q))
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

      {/* ── Package Action Reason Modal (Reject / Suspend / Delete) ─────────── */}
      {reasonModal.open && (
        <PackageActionReasonModal
          type={reasonModal.type}
          pkg={reasonModal.pkg}
          onConfirm={handleReasonConfirm}
          onCancel={() => setReasonModal({ open: false, type: 'reject', pkg: null })}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
