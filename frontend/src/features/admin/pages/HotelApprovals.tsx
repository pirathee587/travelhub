import React, { useState, useEffect, useCallback } from 'react'
import adminHotelApi from '../services/adminHotelApi'
import { useModal } from '../components/ModalContext'
import { Badge } from '@/components/common/ui/badge'
import { Switch } from '@/components/common/ui/switch'
import { 
  Star, 
  MapPin, 
  Clock, 
  Eye, 
  Search, 
  Building2, 
  BedDouble, 
  ArrowLeft, 
  Check,
  CheckCircle, 
  CheckCircle2, 
  X, 
  Trash2, 
  Power, 
  AlertCircle, 
  Sparkles, 
  Waves, 
  User, 
  Wifi, 
  Utensils, 
  Car, 
  Coffee, 
  Dumbbell, 
  Wind, 
  Beer, 
  Tv, 
  Shirt, 
  ConciergeBell, 
  ShieldCheck, 
  Trees, 
  Grid, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  ImageOff
} from 'lucide-react'

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

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse border border-gray-100 p-5 space-y-4">
    <div className="aspect-[16/10] bg-gray-100 rounded-2xl" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
    </div>
    <div className="pt-3 border-t border-gray-50 flex gap-2">
      <div className="h-9 bg-gray-100 rounded-xl flex-1" />
    </div>
  </div>
)

// ── Amenity Icon Helper ───────────────────────────────────────────────────────
const getAmenityIcon = (amenity: string) => {
  const lower = (amenity || '').toLowerCase()
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="h-4 w-4" />
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('breakfast') || lower.includes('meal')) return <Utensils className="h-4 w-4" />
  if (lower.includes('pool') || lower.includes('swimming')) return <Waves className="h-4 w-4" />
  if (lower.includes('spa') || lower.includes('massage') || lower.includes('wellness') || lower.includes('sauna')) return <Sparkles className="h-4 w-4" />
  if (lower.includes('parking') || lower.includes('car') || lower.includes('valet')) return <Car className="h-4 w-4" />
  if (lower.includes('coffee') || lower.includes('tea')) return <Coffee className="h-4 w-4" />
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) return <Dumbbell className="h-4 w-4" />
  if (lower.includes('ac') || lower.includes('air conditioning') || lower.includes('cooling')) return <Wind className="h-4 w-4" />
  if (lower.includes('bar') || lower.includes('drink') || lower.includes('cocktail') || lower.includes('wine')) return <Beer className="h-4 w-4" />
  if (lower.includes('tv') || lower.includes('television')) return <Tv className="h-4 w-4" />
  if (lower.includes('laundry') || lower.includes('washing')) return <Shirt className="h-4 w-4" />
  if (lower.includes('service') || lower.includes('concierge')) return <ConciergeBell className="h-4 w-4" />
  if (lower.includes('safe') || lower.includes('security')) return <ShieldCheck className="h-4 w-4" />
  if (lower.includes('garden') || lower.includes('nature') || lower.includes('park')) return <Trees className="h-4 w-4" />
  return <CheckCircle2 className="h-4 w-4" />
}

// ── Hotel Detail View (Pure Real Database Data) ───────────────────────────────
const HotelDetailView = ({ hotel, onBack, onApprove, onReject, onToggle, onDelete, loading }: any) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!hotel) return null

  const {
    id,
    hotelName,
    imageUrl,
    images: rawImages,
    district,
    destination,
    location,
    description,
    rating,
    reviewCount,
    priceFrom,
    priceTo,
    numberOfRooms,
    ownerName,
    ownerEmail,
    ownerNic,
    nicImageUrl,
    nicRearImageUrl,
    businessRegistrationImageUrl,
    rejectionReason,
    phoneNumber,
    hotlineNumber,
    hotelEmail,
    hotelContactNumber,
    amenities: rawAmenities,
    rooms: rawRooms,
    roomTypes,
    applicationStatus,
    isActive
  } = hotel

  const isApproved = String(applicationStatus || '').trim().toLowerCase() === 'approved'
  const isPending = String(applicationStatus || '').trim().toLowerCase() === 'pending'
  const isRejected = String(applicationStatus || '').trim().toLowerCase() === 'rejected'

  // Build images list from database
  const allImages: string[] = []
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    rawImages.forEach((img: any) => {
      if (typeof img === 'string' && img.trim() && !allImages.includes(img.trim())) {
        allImages.push(img.trim())
      } else if (img?.imageUrl && !allImages.includes(img.imageUrl)) {
        allImages.push(img.imageUrl)
      }
    })
  }
  if (imageUrl && !allImages.includes(imageUrl)) {
    allImages.unshift(imageUrl)
  }

  // Normalized rooms list from database
  const normalizedRooms = Array.isArray(rawRooms) && rawRooms.length > 0
    ? rawRooms 
    : (Array.isArray(roomTypes) ? roomTypes.map((rt: any, idx: number) => ({
        id: `R-${idx}`,
        name: rt.name,
        type: rt.name,
        price: null,
        description: rt.description,
        imageUrl: allImages[idx + 1] || null
      })) : [])

  normalizedRooms.forEach((r: any) => {
    if (r.imageUrl && !allImages.includes(r.imageUrl)) {
      allImages.push(r.imageUrl)
    }
  })

  // Amenities list from database
  const amenities = Array.isArray(rawAmenities) ? rawAmenities : []

  // Lightbox handlers
  const openLightbox = (index = 0) => {
    if (allImages.length === 0) return
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }
  const closeLightbox = () => setIsLightboxOpen(false)
  const goLightboxPrev = (e: any) => {
    if (e) e.stopPropagation()
    setLightboxIndex((i) => (i - 1 + (allImages.length || 1)) % (allImages.length || 1))
  }
  const goLightboxNext = (e: any) => {
    if (e) e.stopPropagation()
    setLightboxIndex((i) => (i + 1) % (allImages.length || 1))
  }

  // ── Dynamic Price Calculation ───────────────────────────────────────────────
  const validRoomPrices = normalizedRooms
    .map((r: any) => Number(r.price))
    .filter((p: any) => !isNaN(p) && p > 0)

  const minRoomPrice = validRoomPrices.length > 0 ? Math.min(...validRoomPrices) : null
  const maxRoomPrice = validRoomPrices.length > 0 ? Math.max(...validRoomPrices) : null

  const effectivePriceFrom = (priceFrom != null && Number(priceFrom) > 0)
    ? Number(priceFrom)
    : (minRoomPrice != null ? minRoomPrice : (hotel.price ? Number(hotel.price) : null))

  const effectivePriceTo = (priceTo != null && Number(priceTo) > 0)
    ? Number(priceTo)
    : (maxRoomPrice != null ? maxRoomPrice : effectivePriceFrom)

  const startingPriceText = effectivePriceFrom != null 
    ? `$${Number(effectivePriceFrom).toFixed(0)}` 
    : 'Not Available'

  const formattedAddress = [location, district, destination].filter(Boolean).join(', ')

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">

        {/* ── Top Navigation ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0ea5e9] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hotels
          </button>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm border ${
              isActive 
                ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]' 
                : 'bg-red-500 text-white border-red-500'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>

            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm flex items-center gap-1.5 border ${
              isApproved 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : isPending 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isApproved && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
              {isRejected && <X className="w-3.5 h-3.5 text-rose-600" />}
              {isApproved ? 'Approved' : (isPending ? 'Pending Approval' : 'Rejected')}
            </span>
          </div>
        </div>

        {/* ── Header Section ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {(district || destination) && (
                <Badge variant="outline" className="border-sky-200 text-[#0ea5e9] bg-sky-50 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                  {district || destination}
                </Badge>
              )}
              {rating != null && Number(rating) > 0 ? (
                <div className="flex items-center text-sm font-semibold text-gray-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                  <span>{Number(rating).toFixed(1)}</span>
                  <span className="text-gray-400 font-normal text-xs ml-1">
                    ({reviewCount || 0} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-sm font-medium text-gray-400">
                  <Star className="h-3.5 w-3.5 text-gray-300 mr-1" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {hotelName}
            </h1>

            {formattedAddress && (
              <div className="flex items-center text-gray-500 text-sm font-medium">
                <MapPin className="h-4 w-4 mr-1 text-[#0ea5e9] shrink-0" />
                <span>{formattedAddress}</span>
              </div>
            )}
          </div>

          {/* Pricing & Quick Action */}
          <div className="text-left md:text-right w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none shadow-sm md:shadow-none">
            <span className="text-xs text-gray-400 font-medium block mb-0.5">Starting from</span>
            <div className="flex items-baseline md:justify-end gap-1 mb-3">
              <span className="text-3xl font-bold text-[#0ea5e9]">{startingPriceText}</span>
              {effectivePriceFrom != null && <span className="text-xs text-gray-500 font-medium">/ night</span>}
            </div>
            
            <button
              onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto py-2.5 px-6 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              View Rooms
            </button>
          </div>
        </div>

        {/* ── Photo Gallery Grid (1 Large Left + 2 Stacked Right) ───────────── */}
        <div className="relative">
          {allImages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:h-[440px] items-stretch">
              {/* Main Large Photo */}
              <div
                className="relative group rounded-2xl md:rounded-3xl overflow-hidden shadow-sm h-[320px] lg:h-full cursor-pointer bg-slate-900 border border-gray-200"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={allImages[0]}
                  alt={`${hotelName} main`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* 2 Stacked Smaller Photos */}
              <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 lg:h-full min-h-0">
                {[1, 2].map((idx) => {
                  const img = allImages[idx]
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-2xl md:rounded-3xl overflow-hidden shadow-sm h-[150px] lg:h-full min-h-0 border border-gray-200 ${
                        img ? 'cursor-pointer bg-slate-900' : 'bg-gray-100 flex items-center justify-center'
                      }`}
                      onClick={() => img && openLightbox(idx)}
                    >
                      {img ? (
                        <>
                          <img
                            src={img}
                            alt={`${hotelName} view ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300 gap-1">
                          <Building2 className="w-8 h-8" />
                          <span className="text-[11px] text-gray-400">Photo slot</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-3xl bg-slate-100 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageOff className="w-10 h-10 text-gray-300" />
              <span className="text-sm font-medium">No photos uploaded for this hotel yet</span>
            </div>
          )}

          {/* See All Photos Button */}
          {allImages.length > 0 && (
            <button
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-md border border-gray-200/80 backdrop-blur-md transition active:scale-95"
            >
              <Grid className="w-4 h-4 text-[#0ea5e9]" /> See all {allImages.length} photos
            </button>
          )}
        </div>

        {/* ── Section 1: Hotel Overview ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#0ea5e9]" /> Hotel Overview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">Rating</span>
              <p className="font-bold text-gray-900 flex items-center gap-1">
                {rating != null && Number(rating) > 0 ? (
                  <>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(rating).toFixed(1)}</span>
                    <span className="text-gray-400 font-normal text-xs">({reviewCount || 0} reviews)</span>
                  </>
                ) : (
                  <span className="text-gray-500 font-medium text-xs">No reviews yet</span>
                )}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">Price From</span>
              <p className="font-bold text-gray-900">
                {effectivePriceFrom != null ? `$${Number(effectivePriceFrom).toFixed(0)}` : 'Not Available'}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">Price To</span>
              <p className="font-bold text-gray-900">
                {effectivePriceTo != null ? `$${Number(effectivePriceTo).toFixed(0)}` : 'Not Available'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-400 font-medium block mb-1">Address</span>
              <p className="font-bold text-gray-900 truncate" title={location || formattedAddress}>
                {location || formattedAddress || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">Destination</span>
              <p className="font-bold text-gray-900">{destination || district || 'Not specified'}</p>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">District</span>
              <p className="font-bold text-gray-900">{district || destination || 'Not specified'}</p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Hotel Owner & Verification Information ─────────────── */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-[#0ea5e9]" /> Hotel Owner & Verification Details
            </h3>
            <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 font-semibold px-2.5 py-0.5 rounded-full">
              Admin Verification
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-400 font-medium block mb-1">Owner Name</span>
              <p className="font-bold text-gray-900">{ownerName || '—'}</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-400 font-medium block mb-1">Owner Email</span>
              <p className="font-bold text-gray-900 truncate" title={ownerEmail}>{ownerEmail || '—'}</p>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100">
              <span className="text-xs text-sky-600 font-semibold block mb-1">NIC Number</span>
              <p className="font-mono font-bold text-sky-900 text-base">{ownerNic || '—'}</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-400 font-medium block mb-1">Owner Phone</span>
              <p className="font-bold text-gray-900">{phoneNumber || hotelContactNumber || '—'}</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-400 font-medium block mb-1">Hotline / Contact Number</span>
              <p className="font-bold text-gray-900">{hotlineNumber || hotelContactNumber || '—'}</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-400 font-medium block mb-1">Hotel Email</span>
              <p className="font-bold text-gray-900 truncate" title={hotelEmail}>{hotelEmail || ownerEmail || '—'}</p>
            </div>
          </div>

          {/* Document Previews & Buttons */}
          <div className="pt-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
              Submitted Verification Documents
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* NIC Front */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0ea5e9]" /> NIC Front Photo
                  </span>
                  {nicImageUrl ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Attached</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">Missing</span>
                  )}
                </div>

                {nicImageUrl ? (
                  <button
                    onClick={() => setSelectedImage(nicImageUrl)}
                    className="w-full py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View NIC Front
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                    No NIC Front Uploaded
                  </button>
                )}
              </div>

              {/* NIC Rear */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0ea5e9]" /> NIC Rear Photo
                  </span>
                  {nicRearImageUrl ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Attached</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">Optional</span>
                  )}
                </div>

                {nicRearImageUrl ? (
                  <button
                    onClick={() => setSelectedImage(nicRearImageUrl)}
                    className="w-full py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View NIC Rear
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                    No NIC Rear Uploaded
                  </button>
                )}
              </div>

              {/* Business Registration */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#0ea5e9]" /> Business Registration
                  </span>
                  {businessRegistrationImageUrl ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Attached</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">Missing</span>
                  )}
                </div>

                {businessRegistrationImageUrl ? (
                  <button
                    onClick={() => setSelectedImage(businessRegistrationImageUrl)}
                    className="w-full py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Registration
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                    No Registration Doc
                  </button>
                )}
              </div>
            </div>

            {rejectionReason && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mt-4 text-xs">
                <span className="font-bold">Prior Rejection Reason:</span> {rejectionReason}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 3: About this Hotel ───────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#0ea5e9]" /> About this Hotel
          </h3>
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
            {description ? (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">No description provided for this hotel.</p>
            )}
          </div>
        </section>

        {/* ── Section 4: Popular Amenities ──────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Waves className="h-5 w-5 text-[#0ea5e9]" /> Popular Amenities
          </h3>
          {amenities.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {amenities.map((amenity: string, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border border-gray-200/80 shadow-sm"
                >
                  <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
              <p className="text-gray-400 italic text-sm">No amenities listed for this hotel.</p>
            </div>
          )}
        </section>

        {/* ── Section 5: Available Rooms ────────────────────────────────────── */}
        <section id="available-rooms" className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-[#0ea5e9]" /> Available Rooms
          </h3>

          {normalizedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {normalizedRooms.map((room: any, idx: number) => (
                <div
                  key={room.id || idx}
                  className="group rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
                    {room.imageUrl ? (
                      <img
                        src={room.imageUrl}
                        alt={room.name || 'Room'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                        onClick={() => setSelectedImage(room.imageUrl)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300 gap-1">
                        <BedDouble className="w-10 h-10" />
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                    
                    {room.type && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#0ea5e9] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm capitalize">
                          {room.type}
                        </span>
                      </div>
                    )}
                    
                    {room.price != null && Number(room.price) > 0 && (
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg font-bold text-[#0ea5e9] shadow-sm text-xs border border-white/40">
                        ${Number(room.price).toFixed(0)} <span className="text-[10px] font-normal text-gray-400 uppercase">/ NIGHT</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#0ea5e9] transition-colors">
                        {room.name || `Room ${idx + 1}`}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {room.description || 'Spacious and comfortable room.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
              <p className="text-gray-400 text-sm">No specific rooms listed for this hotel yet.</p>
            </div>
          )}
        </section>

        {/* ── Section 6: Admin Decision & Actions Panel ──────────────────────── */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Admin Approval Decision</h3>
              <p className="text-xs text-gray-500 mt-0.5">Review credentials, verify NIC & registration documents, and set status.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">HOTEL ACTIVE</span>
              <Switch
                checked={Boolean(isActive)}
                onCheckedChange={() => onToggle(hotel)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isApproved && (
              <button 
                onClick={() => onApprove(hotel)} 
                disabled={loading} 
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-60 flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Approve Hotel
              </button>
            )}

            {!isRejected && (
              <button 
                onClick={() => onReject(hotel)} 
                disabled={loading} 
                className="py-2.5 px-6 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-60 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Reject Hotel
              </button>
            )}

            {isApproved && (
              <button 
                onClick={() => onToggle(hotel)} 
                disabled={loading} 
                className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-semibold border shadow-sm transition disabled:opacity-60 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                }`}
              >
                <Power className="w-4 h-4" /> {isActive ? 'Suspend Hotel' : 'Activate Hotel'}
              </button>
            )}

            <button 
              onClick={() => onDelete(hotel)} 
              disabled={loading} 
              className="py-2.5 px-6 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-gray-500" /> Delete Hotel
            </button>
          </div>
        </section>

      </div>

      {/* ── Fullscreen Lightbox Modal ───────────────────────────────────────── */}
      {(isLightboxOpen || selectedImage) && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => { setIsLightboxOpen(false); setSelectedImage(null); }}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            {/* Close button */}
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/60 hover:bg-black/90 rounded-full p-2.5 transition border border-white/20"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); setSelectedImage(null); }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main Image */}
            <img 
              src={selectedImage || allImages[lightboxIndex]} 
              alt="Enlarged preview" 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Arrows for gallery mode */}
            {isLightboxOpen && allImages.length > 1 && (
              <>
                <button
                  onClick={goLightboxPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goLightboxNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Hotel Card (Approvals Grid View) ──────────────────────────────────────────
const HotelCard = ({ hotel, onView }: any) => {
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

          {/* Top-left Glass Status Pill */}
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
                {priceFrom != null && Number(priceFrom) > 0 ? `$${Number(priceFrom).toFixed(2)}` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
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

  const [hotels, setHotels]             = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [search, setSearch]             = useState('')
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [drawerDetail, setDrawerDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingHotel, setRejectingHotel] = useState<any>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchHotels = useCallback(async (status = 'All') => {
    try {
      setLoading(true)
      setError(null)
      const res = status === 'All'
        ? await adminHotelApi.getAllHotels()
        : await adminHotelApi.getHotelsByStatus(status)
      setHotels(res?.data ?? res ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load hotels.')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHotels(statusFilter) }, [statusFilter, fetchHotels])

  // ── Open detail view ─────────────────────────────────────────────────────
  const openDrawer = async (hotel: any) => {
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
  const handleApprove = async (hotel: any) => {
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
        h.id === hotel.id ? { ...h, applicationStatus: 'Approved', isActive: true } : h
      ))
      if (drawerDetail?.id === hotel.id)
        setDrawerDetail((d: any) => ({ ...d, applicationStatus: 'Approved', isActive: true }))
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (hotel: any) => {
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
        setDrawerDetail((d: any) => ({ ...d, applicationStatus: 'Rejected', rejectionReason: rejectReason }))
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
      setRejectingHotel(null)
    }
  }

  const handleDelete = async (hotel: any) => {
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
    } catch (err: any) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggle = async (hotel: any) => {
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
        setDrawerDetail((d: any) => ({ ...d, isActive: updatedIsActive, applicationStatus: updatedIsActive ? 'Approved' : 'Suspended' }))
    } catch (err: any) {
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

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      {selectedHotel ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm font-semibold">Loading hotel details…</div>
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
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Hotel Approvals
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review, approve, suspend and manage all partner hotel listings and owner verifications
            </p>
          </div>

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
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-red-800 text-sm">Failed to load hotels</div>
                  <div className="text-xs text-red-600">{error}</div>
                </div>
              </div>
              <button
                onClick={() => fetchHotels(statusFilter)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-bold text-base">No hotels found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different filter or search term.</p>
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

      {/* ── Rejection Reason Modal ──────────────────────────────────────────── */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Provide Rejection Reason</h3>
            <p className="text-sm text-gray-500">
              Please enter the reason for rejecting this hotel application.
            </p>
            <textarea
              className="w-full min-h-[110px] p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] resize-none"
              placeholder="e.g. Invalid or expired business registration document, or unclear NIC copy."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end pt-2">
              <button
                className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 active:bg-rose-800 transition disabled:opacity-50"
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
