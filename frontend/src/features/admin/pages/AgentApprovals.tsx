import { useState, useEffect, useCallback, useRef } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import { useModal } from '../components/ModalContext'
import {
  Search,
  MapPin,
  Clock,
  Star,
  Eye,
  Check,
  X,
  Building2,
  User,
  Calendar,
  ChevronRight,
  Package,
  Briefcase
} from 'lucide-react'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended']

const CARD_GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-700',
]

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Suspended: 'bg-gray-100 text-gray-600',
}

// NIC verification status badge styles
const NIC_STATUS_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  PENDING: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '🕐', label: 'NIC Pending' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: '✅', label: 'NIC Verified' },
  REJECTED: { bg: 'bg-red-50 text-red-700 border border-red-200', icon: '❌', label: 'NIC Rejected' },
  SUSPENDED: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', icon: '🚫', label: 'Suspended' },
}

const fmtDate = (s?: string | null) => {
  try {
    return s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
  } catch {
    return s || '—'
  }
}

const initials = (name = '') => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
    <div className="flex gap-3.5 items-center mb-4">
      <div className="h-14 w-14 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="h-3 bg-gray-100 rounded w-full mt-1" />
    <div className="h-3 bg-gray-100 rounded w-5/6 mt-2" />
    <div className="flex gap-2.5 mt-4">
      <div className="h-4 bg-gray-100 rounded w-14" />
      <div className="h-4 bg-gray-100 rounded w-16" />
      <div className="h-4 bg-gray-100 rounded w-20" />
    </div>
    <div className="h-9 bg-gray-100 rounded-xl w-full mt-auto pt-4" />
  </div>
)

// ── Message Modal ─────────────────────────────────────────────────────────────
interface MessageModalProps {
  title: string
  placeholder: string
  actionLabel: string
  actionClass: string
  onConfirm: (message: string) => void
  onCancel: () => void
  required?: boolean
}

const MessageModal = ({ title, placeholder, actionLabel, actionClass, onConfirm, onCancel, required = true }: MessageModalProps) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full mx-4 overflow-hidden"
        style={{ maxWidth: 480, animation: 'fadeInScale .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition text-sm">✕</button>
        </div>
        <div className="p-7">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message to Agency {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
          {required && !message.trim() && (
            <p className="text-xs text-gray-400 mt-1">This message will be visible to the agency.</p>
          )}
        </div>
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={() => onConfirm(message.trim())}
            disabled={required && !message.trim()}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${actionClass}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Agent Packages Modal ──────────────────────────────────────────────────────
const PKG_STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  Approved: { badge: 'bg-green-100 text-green-700', label: 'Approved' },
  Pending: { badge: 'bg-orange-100 text-orange-700', label: 'Pending' },
  Rejected: { badge: 'bg-red-100 text-red-700', label: 'Rejected' },
}

interface AgentPackagesModalProps {
  agentName: string
  packages?: any[]
  loading: boolean
  onClose: () => void
}

const AgentPackagesModal = ({ agentName, packages = [], loading, onClose }: AgentPackagesModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-[#f4f6fb] rounded-2xl shadow-2xl w-full mx-4 overflow-hidden"
        style={{ maxWidth: 900, maxHeight: '88vh', animation: 'fadeInScale .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Agency Packages</h2>
            <p className="text-sm text-gray-400 mt-0.5">{agentName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition text-lg"
          >✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(88vh - 78px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-500">Loading packages…</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-3xl">📦</div>
              <p className="text-gray-700 font-semibold text-lg">No packages found</p>
              <p className="text-gray-400 text-sm mt-1">This agency hasn't added any packages yet.</p>
            </div>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {packages.map((pkg: any) => {
                const status = PKG_STATUS_STYLES[pkg.applicationStatus] || PKG_STATUS_STYLES.Pending
                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="relative w-full" style={{ height: 190 }}>
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.packageName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <span className="text-4xl">🗺️</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate">{pkg.packageName || '—'}</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {pkg.destination || '—'}
                        {pkg.duration ? ` • ${pkg.duration}` : ''}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.badge}`}>
                          {status.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pkg.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}

// ── Agency Avatar Component with Error Fallback ──────────────────────────────
const AgencyAvatar = ({
  src,
  name,
  gradient = 'from-sky-500 to-blue-600',
  size = 'md',
}: {
  src?: string | null
  name: string
  gradient?: string
  size?: 'md' | 'lg'
}) => {
  const [imgError, setImgError] = useState(false)
  const avatarInitials = initials(name)
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-lg'

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shadow-sm border border-gray-100 flex-shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full shadow-sm flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradient}`}
    >
      {avatarInitials}
    </div>
  )
}

// ── NIC Status Badge ──────────────────────────────────────────────────────────
const NicStatusBadge = ({ status }: { status?: string }) => {
  const s = NIC_STATUS_STYLES[status || 'PENDING'] || NIC_STATUS_STYLES.PENDING
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
      {s.icon} {s.label}
    </span>
  )
}

// ── Agent Detail View ───────────────────────────────────────────────────────────
interface AgentDetailViewProps {
  agent: any
  stats?: any
  packages?: any[]
  revenue?: any
  onBack: () => void
  onApprove: (agent: any) => void
  onReject: (agent: any) => void
  onSuspend: (agent: any) => void
  onUnsuspend: (agent: any) => void
  onDelete: (agent: any) => void
  loading: boolean
  onPackagesClick: (agent: any) => void
}

const AgentDetailView = ({
  agent,
  onBack,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onDelete,
  loading,
  onPackagesClick
}: AgentDetailViewProps) => {
  if (!agent) return null
  const {
    agentName, companyName, ownerName, email, phone, location, memberSince,
    applicationStatus, nicImageUrl, ownerNic, nicVerificationStatus, adminMessage,
    rating, totalTrips, experienceYears, isActive, profileImage, imageUrl, logoUrl
  } = agent

  const isSuspended = nicVerificationStatus === 'SUSPENDED' || (isActive === false && applicationStatus === 'Approved')
  const avatarUrl = profileImage || imageUrl || logoUrl

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &lt; Back to Agents
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center py-10 border-b border-gray-100">
          <div className="mb-4">
            <AgencyAvatar
              src={avatarUrl}
              name={companyName || agentName || 'Agency'}
              gradient="from-emerald-400 to-orange-400"
              size="lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{companyName || agentName}</h2>
          <p className="text-sm text-gray-500 mt-1">Sri Lanka Travel Experts</p>

          <div className="mt-3">
            <NicStatusBadge status={nicVerificationStatus || 'PENDING'} />
          </div>
        </div>

        {/* Admin Message Banner (if REJECTED or SUSPENDED) */}
        {adminMessage && (nicVerificationStatus === 'REJECTED' || nicVerificationStatus === 'SUSPENDED') && (
          <div className={`mx-8 mt-6 px-5 py-4 rounded-xl border text-sm ${nicVerificationStatus === 'SUSPENDED'
              ? 'bg-gray-50 border-gray-200 text-gray-700'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <div className="font-semibold mb-1">
              {nicVerificationStatus === 'SUSPENDED' ? '🚫 Suspension Reason:' : '❌ Rejection Reason:'}
            </div>
            <div>{adminMessage}</div>
          </div>
        )}

        {/* Details Section */}
        <div className="p-8 flex flex-col md:flex-row gap-8">
          {/* Left Panel - Owner Info */}
          <div className="flex-1 bg-[#f0fdf4] rounded-xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Owner Information</h3>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Owner Name</div>
                <div className="text-lg font-bold text-gray-900">{ownerName || agentName || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Phone</div>
                <div className="text-lg font-bold text-gray-900">{phone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Email</div>
                <div className="text-lg font-bold text-gray-900 truncate pr-4">{email || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Location</div>
                <div className="text-lg font-bold text-gray-900">{location || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Member Since</div>
                <div className="text-lg font-bold text-gray-900">{fmtDate(memberSince)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">NIC Number</div>
                <div className="text-lg font-bold text-emerald-600">{ownerNic || '—'}</div>
              </div>
            </div>

            {/* Stats Row */}
            {(rating != null || totalTrips != null || experienceYears != null) && (
              <div className="mt-6 pt-5 border-t border-green-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{rating != null ? Number(rating).toFixed(1) : '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalTrips ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{experienceYears ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Years Exp.</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Application Status & Actions */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-[#fff7ed] rounded-xl p-8 border border-orange-50/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status</h3>

              <div className="space-y-6">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Status</div>
                  {isSuspended && applicationStatus === 'Approved' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Suspended
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${applicationStatus === 'Approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                        applicationStatus === 'Pending' ? 'bg-[#fef0db] text-[#e37400]' :
                          'bg-red-100 text-red-600'
                      }`}>
                      {applicationStatus}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">NIC Verification</div>
                  <NicStatusBadge status={nicVerificationStatus || 'PENDING'} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Submitted Date</div>
                  <div className="text-lg font-bold text-gray-900">{fmtDate(memberSince)}</div>
                </div>
              </div>
            </div>

            {/* NIC Image Button */}
            {nicImageUrl ? (
              <button onClick={() => window.open(nicImageUrl, '_blank')} className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition text-sm">
                🪪 View NIC Document
              </button>
            ) : (
              <button disabled className="w-full py-3 bg-gray-300 text-white font-semibold rounded-lg shadow-sm transition text-sm cursor-not-allowed">
                No NIC Provided
              </button>
            )}

            {/* Packages Button */}
            {applicationStatus === 'Approved' && (
              <button
                onClick={() => onPackagesClick(agent)}
                className="w-full py-3 bg-[#d97706] hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition text-sm"
              >
                View Packages
              </button>
            )}

            {/* Approve / Reject */}
            {applicationStatus === 'Pending' && (
              <>
                <button
                  onClick={() => onApprove(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  ✅ Approve Agency
                </button>
                <button
                  onClick={() => onReject(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  ❌ Reject Agency
                </button>
              </>
            )}

            {/* Suspend / Unsuspend */}
            {applicationStatus === 'Approved' && (
              isSuspended ? (
                <button
                  onClick={() => onUnsuspend(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  ✅ Unsuspend Agency
                </button>
              ) : (
                <button
                  onClick={() => onSuspend(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  🚫 Suspend Agency
                </button>
              )
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(agent)}
              disabled={loading}
              className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-500 font-semibold rounded-lg transition text-sm disabled:opacity-60"
            >
              🗑 Delete Agency
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Agency Card (Compact View matching Uploaded Template) ─────────────────────
interface AgencyCardProps {
  agent: any
  index: number
  onView: (agent: any) => void
  onApprove: (agent: any) => void
  onReject: (agent: any) => void
  onSuspend: (agent: any) => void
  onUnsuspend: (agent: any) => void
  actionLoading: boolean
}

const AgencyCard = ({ agent, index, onView, onApprove, onReject, onSuspend, onUnsuspend, actionLoading }: AgencyCardProps) => {
  const {
    id,
    companyName,
    agentName,
    ownerName,
    email,
    phone,
    location,
    memberSince,
    applicationStatus,
    nicVerificationStatus,
    ownerNic,
    rating,
    totalTrips,
    experienceYears,
    isActive,
    imageUrl,
    logoUrl,
    coverUrl,
    profileImage,
    bio,
    totalPackages,
    packageCount
  } = agent

  const displayName = companyName || agentName || 'Agency'
  const isSuspended = nicVerificationStatus === 'SUSPENDED' || (isActive === false && applicationStatus === 'Approved')
  const displayStatus = isSuspended ? 'Suspended' : (applicationStatus || 'Pending')
  const isApproved = displayStatus === 'Approved'
  const isPending = displayStatus === 'Pending'
  const isRejected = displayStatus === 'Rejected'

  const avatar = profileImage || imageUrl || logoUrl
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const avatarInitials = initials(displayName)
  const nicStatus = NIC_STATUS_STYLES[nicVerificationStatus || 'PENDING'] || NIC_STATUS_STYLES.PENDING
  const pkgs = totalPackages ?? packageCount ?? 0

  return (
    <div
      onClick={() => onView(agent)}
      className="group flex flex-col bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/60 transition-all duration-300 cursor-pointer h-full justify-between"
    >
      <div>
        {/* Top Header: Avatar + Info */}
        <div className="flex gap-3.5 items-start mb-3">
          <div className="relative flex-shrink-0">
            <AgencyAvatar
              src={avatar}
              name={displayName}
              gradient={gradient}
              size="md"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 leading-tight truncate group-hover:text-[#0ea5e9] transition-colors">
              {displayName}
            </h3>

            {(ownerName || agentName) && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {ownerName || agentName}
              </p>
            )}

            {location && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
                <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio / Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">
          {bio || agent.description || "Experienced travel agent ready to plan your perfect trip."}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs text-gray-500 mb-3">
          {rating != null && Number(rating) > 0 ? (
            <div className="flex items-center gap-1 font-semibold text-gray-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(rating).toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-gray-400">No Rating</span>
          )}

          <div className="flex items-center gap-1 text-gray-500">
            <span>🧳</span>
            <span>{totalTrips ?? 0} trips</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md font-semibold text-[11px]">
            <span>📦</span>
            <span>{pkgs} packages</span>
          </div>
        </div>

        {/* Status Pills Row */}
        <div className="flex items-center justify-between gap-2 mb-4 pt-2 border-t border-gray-100">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            isApproved ? 'bg-emerald-50 text-emerald-700' : isPending ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
          }`}>
            {displayStatus === 'Approved' ? 'Active' : displayStatus}
          </span>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${nicStatus.bg}`}>
            <span>{nicStatus.icon}</span>
            <span>{nicStatus.label}</span>
          </span>
        </div>
      </div>

      {/* Action CTA buttons */}
      <div className="space-y-2 pt-1 mt-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onView(agent)}
          className="w-full py-2 px-3 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 transition duration-200 shadow-sm"
        >
          View Profile <ChevronRight className="h-4 w-4" />
        </button>

        {applicationStatus === 'Pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(agent)}
              disabled={actionLoading}
              className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition disabled:opacity-60"
            >
              <Check className="w-3 h-3" /> Approve
            </button>
            <button
              onClick={() => onReject(agent)}
              disabled={actionLoading}
              className="flex-1 py-1.5 px-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition disabled:opacity-60"
            >
              <X className="w-3 h-3" /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentApprovals() {
  const modal = useModal()

  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setAction] = useState(false)
  const [, setError] = useState<string | null>(null)
  const [statusFilter, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [drawerAgent, setDrawerAgent] = useState<any | null>(null)
  const [drawerStats, setDrawerStats] = useState<any | null>(null)
  const [drawerPkgs, setDrawerPkgs] = useState<any[] | null>(null)
  const [drawerRev, setDrawerRev] = useState<any | null>(null)
  const [detailLoading, setDetailLoad] = useState(false)
  const searchTimer = useRef<any>(null)

  // ── Packages Modal State ────────────────────────────────────────────────────
  const [pkgModal, setPkgModal] = useState<{ agentName: string; packages: any[] } | null>(null)
  const [pkgLoading, setPkgLoading] = useState(false)

  // ── Message Modal State ─────────────────────────────────────────────────────
  const [msgModal, setMsgModal] = useState<{ type: 'reject' | 'suspend'; agent: any } | null>(null)

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchAgents = useCallback(async (status = 'All', keyword = '') => {
    try {
      setLoading(true)
      setError(null)
      let res: any
      if (keyword.trim()) {
        res = await adminAgentApi.searchAgents(keyword.trim())
      } else if (status !== 'All') {
        res = await adminAgentApi.getAgentsByStatus(status)
      } else {
        res = await adminAgentApi.getAllAgents()
      }
      setAgents(res?.data ?? res ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load agents.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAgents(statusFilter, search) }, [statusFilter, fetchAgents])

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchAgents(statusFilter, val), 400)
  }

  // ── Open drawer ────────────────────────────────────────────────────────────
  const openDrawer = async (agent: any) => {
    setSelected(agent)
    setDrawerAgent(null)
    setDrawerStats(null)
    setDrawerPkgs(null)
    setDrawerRev(null)
    setDetailLoad(true)
    try {
      const [detRes, statsRes, pkgsRes, revRes] = await Promise.allSettled([
        adminAgentApi.getAgentDetail(agent.id),
        adminAgentApi.getAgentStats(agent.id),
        adminAgentApi.getAgentPackages(agent.id),
        adminAgentApi.getAgentRevenue(agent.id, new Date().getFullYear()),
      ])
      if (detRes.status === 'fulfilled') setDrawerAgent(detRes.value?.data ?? detRes.value)
      if (statsRes.status === 'fulfilled') setDrawerStats(statsRes.value?.data ?? statsRes.value)
      if (pkgsRes.status === 'fulfilled') setDrawerPkgs(pkgsRes.value?.data ?? pkgsRes.value ?? [])
      if (revRes.status === 'fulfilled') setDrawerRev(revRes.value?.data ?? revRes.value)
    } catch {
      setDrawerAgent(agent)
    } finally {
      setDetailLoad(false)
    }
  }

  const closeDrawer = () => { setSelected(null); setDrawerAgent(null) }

  const patchLocal = (id: number | string, changes: any) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a))
    setDrawerAgent((d: any) => d?.id === id ? { ...d, ...changes } : d)
  }

  // ── Open Packages Modal ────────────────────────────────────────────────────
  const handlePackagesClick = async (agent: any) => {
    const agentName = agent.companyName || agent.agentName || 'Agent'
    setPkgModal({ agentName, packages: [] })
    setPkgLoading(true)
    try {
      const res = await adminAgentApi.getAgentPackages(agent.id)
      const pkgs = res?.data ?? res ?? []
      setPkgModal({ agentName, packages: Array.isArray(pkgs) ? pkgs : [] })
    } catch (err: any) {
      setPkgModal({ agentName, packages: [] })
      modal?.addToast(`❌ Failed to load packages: ${err?.response?.data?.message || err.message}`)
    } finally {
      setPkgLoading(false)
    }
  }

  const closePkgModal = () => { setPkgModal(null); setPkgLoading(false) }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = async (agent: any) => {
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal?.addToast('❌ Cannot approve: owner account not linked to this agency')
      return
    }
    const displayName = agent.companyName || agent.agentName || 'this agency'
    if (!await modal?.showConfirm({ title: 'Approve Agency', message: `Approve "${displayName}"? This will verify their NIC and activate their account.` })) return
    try {
      setAction(true)
      await adminAgentApi.approveAgent(ownerId)
      modal?.addToast(`✅ "${displayName}" approved successfully`)
      patchLocal(agent.id, { applicationStatus: 'Approved', nicVerificationStatus: 'APPROVED', adminMessage: null, isActive: true })
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setAction(false)
    }
  }

  const handleReject = (agent: any) => {
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal?.addToast('❌ Cannot reject: owner account not linked to this agency')
      return
    }
    setMsgModal({ type: 'reject', agent })
  }

  const confirmReject = async (message: string) => {
    if (!msgModal) return
    const agent = msgModal.agent
    const ownerId = agent.ownerId
    const displayName = agent.companyName || agent.agentName || 'this agency'
    setMsgModal(null)
    try {
      setAction(true)
      await adminAgentApi.rejectAgent(ownerId, message)
      modal?.addToast(`🚫 "${displayName}" rejected`)
      patchLocal(agent.id, { applicationStatus: 'Rejected', nicVerificationStatus: 'REJECTED', adminMessage: message })
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setAction(false)
    }
  }

  const handleSuspend = (agent: any) => {
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal?.addToast('❌ Cannot suspend: owner account not linked to this agency')
      return
    }
    setMsgModal({ type: 'suspend', agent })
  }

  const confirmSuspend = async (message: string) => {
    if (!msgModal) return
    const agent = msgModal.agent
    const ownerId = agent.ownerId
    const displayName = agent.companyName || agent.agentName || 'this agency'
    setMsgModal(null)
    try {
      setAction(true)
      await adminAgentApi.suspendAgent(ownerId, message)
      modal?.addToast(`🚫 "${displayName}" suspended`)
      patchLocal(agent.id, { applicationStatus: 'Approved', nicVerificationStatus: 'SUSPENDED', adminMessage: message, isActive: false })
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Suspension failed'}`)
    } finally {
      setAction(false)
    }
  }

  const handleUnsuspend = async (agent: any) => {
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal?.addToast('❌ Cannot unsuspend: owner account not linked to this agency')
      return
    }
    const displayName = agent.companyName || agent.agentName || 'this agency'
    if (!await modal?.showConfirm({ title: 'Unsuspend Agency', message: `Unsuspend "${displayName}"? Their account will be restored to Approved status.` })) return
    try {
      setAction(true)
      await adminAgentApi.unsuspendAgent(ownerId)
      modal?.addToast(`✅ "${displayName}" unsuspended successfully`)
      patchLocal(agent.id, { nicVerificationStatus: 'APPROVED', adminMessage: null, isActive: true })
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Unsuspend failed'}`)
    } finally {
      setAction(false)
    }
  }

  const handleDelete = async (agent: any) => {
    if (!await modal?.showConfirm({ title: 'Delete Agency', message: `Permanently delete "${agent.agentName}"?` })) return
    try {
      setAction(true)
      await adminAgentApi.deleteAgent(agent.id)
      modal?.addToast(`🗑 "${agent.agentName}" deleted`)
      setAgents(prev => prev.filter(a => a.id !== agent.id))
      closeDrawer()
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Failed'}`)
    } finally {
      setAction(false)
    }
  }

  const getDisplayStatus = (agent: any) => {
    if (agent.nicVerificationStatus === 'SUSPENDED' || (agent.isActive === false && agent.applicationStatus === 'Approved')) {
      return 'Suspended'
    }
    return agent.applicationStatus || 'Pending'
  }

  const counts = {
    total: agents.length,
    pending: agents.filter(a => getDisplayStatus(a) === 'Pending').length,
    approved: agents.filter(a => getDisplayStatus(a) === 'Approved').length,
    rejected: agents.filter(a => getDisplayStatus(a) === 'Rejected').length,
    suspended: agents.filter(a => getDisplayStatus(a) === 'Suspended').length,
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Packages Modal Overlay */}
      {pkgModal && (
        <AgentPackagesModal
          agentName={pkgModal.agentName}
          packages={pkgModal.packages}
          loading={pkgLoading}
          onClose={closePkgModal}
        />
      )}

      {/* Message Modal (Reject / Suspend) */}
      {msgModal && (
        msgModal.type === 'reject' ? (
          <MessageModal
            title="Reject Agency"
            placeholder="e.g. NIC details do not match the provided information. Please resubmit with a valid document."
            actionLabel="Reject Agency"
            actionClass="bg-red-500 hover:bg-red-600"
            onConfirm={confirmReject}
            onCancel={() => setMsgModal(null)}
            required={true}
          />
        ) : (
          <MessageModal
            title="Suspend Agency"
            placeholder="e.g. Policy violation or suspicious activity detected. Account suspended."
            actionLabel="Suspend Agency"
            actionClass="bg-gray-700 hover:bg-gray-800"
            onConfirm={confirmSuspend}
            onCancel={() => setMsgModal(null)}
            required={true}
          />
        )
      )}

      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-gray-500 text-sm mt-3">Loading agent details…</div>
            </div>
          </div>
        ) : (
          <AgentDetailView
            agent={drawerAgent ?? selected}
            stats={drawerStats}
            packages={drawerPkgs ?? []}
            revenue={drawerRev}
            onBack={closeDrawer}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
            onDelete={handleDelete}
            loading={actionLoading}
            onPackagesClick={handlePackagesClick}
          />
        )
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Agency Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage travel agency accounts, documents, and verification requests.</p>
          </div>

          {/* Toolbar Search & Status Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search by agency name, owner, location, email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] shadow-sm transition"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => { setStatus(e.target.value); setSearch(''); }}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] shadow-sm transition"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Grid of Agency Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : agents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4 text-3xl">🏢</div>
              <h3 className="text-lg font-bold text-gray-800">No agencies found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                No agency requests match the current search or status filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {agents.map((agent, i) => (
                <AgencyCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  onView={openDrawer}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onSuspend={handleSuspend}
                  onUnsuspend={handleUnsuspend}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}

