import React, { useState } from 'react'
import placeholderImg from '@/assets/images/placeholder.png'
import { Badge } from '@/components/common/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Check,
  CheckCircle,
  X,
  Trash2,
  Power,
  Building2,
  Maximize2
} from 'lucide-react'

// ── Robust Activity Parser ───────────────────────────────────────────────────
const parseActivities = (raw: any): Array<{ description: string; imageUrl?: string }> => {
  if (!raw) return []

  if (Array.isArray(raw)) {
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
      } catch (e) { }
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

import { useAdminCurrency } from '../hooks/AdminCurrencyContext'

export interface PackageDetailsViewProps {
  pkg: any
  onBack?: () => void
  onClose?: () => void
  showClose?: boolean
  onApprove?: (pkg: any) => void
  onReject?: (pkg: any) => void
  onToggle?: (pkg: any) => void
  onDelete?: (pkg: any) => void
  loading?: boolean
}

export default function PackageDetailsView({
  pkg,
  onBack,
  onClose,
  showClose = false,
  onApprove,
  onReject,
  onToggle,
  onDelete,
  loading = false,
}: PackageDetailsViewProps) {
  const { formatPrice } = useAdminCurrency()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!pkg) return null

  const {
    id,
    packageName,
    name,
    title: pkgTitle,
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
    status,
    providerName,
    provider,
    description,
    inclusions,
    includes,
    itinerary,
    days,
    activities,
    imageUrl,
    images,
    photos,
    bookings,
    rejectionReason
  } = pkg

  const title = packageName || name || pkgTitle || 'Travel Package'
  const currentStatus = applicationStatus || status || 'Approved'
  const isApproved = String(currentStatus).trim().toLowerCase() === 'approved' && isActive !== false
  const isPending = String(currentStatus).trim().toLowerCase() === 'pending'
  const isSuspended = String(currentStatus).trim().toLowerCase() === 'suspended' || (!isActive && String(currentStatus).trim().toLowerCase() === 'approved')
  const isRejected = String(currentStatus).trim().toLowerCase() === 'rejected'
  const bookingsCount = Number(bookings || pkg.bookingsCount || 0)

  // Image list extraction
  const imageList: string[] = []
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img: any) => {
      if (typeof img === 'string' && img.trim()) imageList.push(img)
      else if (img?.imageUrl) imageList.push(img.imageUrl)
    })
  } else if (Array.isArray(photos) && photos.length > 0) {
    photos.forEach((p: any) => {
      if (typeof p === 'string' && p.trim()) imageList.push(p)
    })
  } else if (imageUrl) {
    imageList.push(imageUrl)
  }

  const cover = imageList[0] || imageUrl || placeholderImg

  // Normalized itinerary days
  const rawDays = itinerary || days || activities || []
  const normalizedDays = Array.isArray(rawDays) ? rawDays.map((d: any, idx: number) => {
    const actList = parseActivities(d.activities || (d.description ? [{ description: d.description }] : []))

    return {
      dayNumber: d.dayNumber || d.day || idx + 1,
      title: d.title || `Day ${idx + 1}`,
      description: d.description || '',
      district: d.district || '',
      hotelName: d.hotelName || d.hotelNameCustom || '',
      hotelId: d.hotelId || null,
      activities: actList.length > 0 ? actList : (d.description ? [{ description: d.description }] : [])
    }
  }) : []

  // Normalized inclusions
  const rawInclusions = Array.isArray(inclusions)
    ? inclusions
    : (Array.isArray(includes) ? includes : (typeof inclusions === 'string' && inclusions.trim() !== '' ? inclusions.split(',').map((s: string) => s.trim()) : []))
  const normalizedInclusions = rawInclusions.length > 0
    ? rawInclusions
    : ['AC Transport', 'Meals', 'Accommodation', 'Local Guide']

  const handleBack = onBack || onClose || (() => {})

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Bar Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0ea5e9] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition active:scale-95 cursor-pointer"
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
            <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md ${
              isActive !== false
                ? 'bg-[#0ea5e9] text-white border border-white/20'
                : 'bg-red-500 text-white border border-white/20'
            }`}>
              {isActive !== false ? 'Active' : 'Inactive'}
            </span>

            <span className={`backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md flex items-center gap-1.5 border ${
              isApproved
                ? 'bg-emerald-500 text-white border-emerald-400'
                : isPending
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-rose-500 text-white border-rose-400'
            }`}>
              {isApproved && <CheckCircle className="w-3.5 h-3.5" />}
              {isPending && <Clock className="w-3.5 h-3.5" />}
              {isRejected && <X className="w-3.5 h-3.5" />}
              {isApproved ? 'Approved' : (isPending ? 'Pending Approval' : 'Rejected')}
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

            {(providerName || provider) && (
              <span className="text-xs text-gray-400">
                • Provided by <strong className="text-gray-700 font-semibold">{providerName || provider}</strong>
              </span>
            )}
          </div>

          {/* ── Rejection or Suspension Reason Banner ─────────────────── */}
          {(pkg.rejectionReason || rejectionReason) && (isRejected || !isActive || isPending) && (
            <div className="p-4 rounded-2xl bg-amber-50/95 border border-amber-200 shadow-sm flex items-start gap-3 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider">
                  {!isActive ? 'Suspension Reason:' : (isRejected ? 'Rejection Reason:' : 'Admin Note / Reason:')}
                </span>
                <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
                  {pkg.rejectionReason || rejectionReason}
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
                {description || 'Journey through breathtaking destinations with tailored itineraries, expert local guidance, and unforgettable moments in Sri Lanka.'}
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

            {/* Admin Decision Actions Card (if handlers provided) */}
            {(onApprove || onReject || onToggle || onDelete) && (
              <div className="p-6 border border-gray-200/80 rounded-2xl bg-white shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">
                  Admin Decision
                </h3>

                <div className="space-y-3">
                  {/* 1. If Suspended: ONLY show Unsuspend Package in sky blue, removing Reject and Approve buttons */}
                  {isSuspended && onToggle ? (
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
                          {onApprove && (
                            <button
                              onClick={() => onApprove(pkg)}
                              disabled={loading}
                              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Check className="w-4 h-4" /> Approve Package
                            </button>
                          )}

                          {onReject && (
                            <button
                              onClick={() => onReject(pkg)}
                              disabled={loading}
                              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <X className="w-4 h-4" /> Reject Package
                            </button>
                          )}
                        </>
                      )}

                      {/* If Approved & Active: show Suspend */}
                      {isApproved && onToggle && (
                        <button
                          onClick={() => onToggle(pkg)}
                          disabled={loading || (isActive !== false && bookingsCount > 0)}
                          title={isActive !== false && bookingsCount > 0 ? `Cannot suspend: Package has ${bookingsCount} active booking(s)` : 'Suspend Package'}
                          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm border shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                            isActive !== false && bookingsCount > 0
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200 cursor-pointer'
                          }`}
                        >
                          <Power className="w-4 h-4" /> {isActive !== false && bookingsCount > 0 ? `Suspend (${bookingsCount} bookings)` : 'Suspend Package'}
                        </button>
                      )}

                      {/* If Rejected: show Approve option */}
                      {isRejected && onApprove && (
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

                  {onDelete && (
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
                  )}
                </div>
              </div>
            )}

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
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/60 hover:bg-black/90 rounded-full p-2.5 transition border border-white/20 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  )
}
