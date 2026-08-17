import { useState, useEffect, useCallback, useRef } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import adminPackageApi from '../services/adminPackageApi'
import PackageDetailsView from '../components/PackageDetailsView'
import { useModal } from '../components/ModalContext'
import { useAdminCurrency } from '../hooks/AdminCurrencyContext'
import {
  Search,
  MapPin,
  Clock,
  Star,
  Eye,
  Check,
  CheckCircle2,
  X,
  Building2,
  User,
  Calendar,
  ChevronRight,
  Package,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Languages,
  Sun,
  Moon,
  ShieldCheck,
  FileText,
  ExternalLink,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles,
  Download,
  CheckCircle,
  AlertCircle
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
  PROVIDED: { bg: 'bg-sky-50 text-sky-700 border border-sky-200', icon: '🪪', label: 'NIC Provided' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: '✅', label: 'NIC Verified' },
  REJECTED: { bg: 'bg-red-50 text-red-700 border border-red-200', icon: '❌', label: 'NIC Rejected' },
  SUSPENDED: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', icon: '🚫', label: 'Suspended' },
}

export const getNicStatusKey = (agent: any): 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PROVIDED' | 'PENDING' => {
  if (!agent) return 'PENDING'
  const rawNicStatus = agent.nicVerificationStatus?.toUpperCase()
  const appStatus = String(agent.applicationStatus || agent.status || '').toLowerCase()
  const isApproved = appStatus === 'approved' || agent.agentApproved === true
  const isRejected = appStatus === 'rejected'
  const isSuspended = rawNicStatus === 'SUSPENDED' || (agent.isActive === false && isApproved)

  // Strict document check: an actual NIC document image must be uploaded
  const hasNicDoc = Boolean(
    agent.nicImageUrl ||
    agent.nicImage ||
    agent.nicRearImageUrl ||
    agent.nicPhotocopy ||
    agent.nicFrontImageUrl ||
    agent.nicRearImage
  )
  const hasNicNumber = Boolean(
    (agent.ownerNic && String(agent.ownerNic).trim() !== '' && agent.ownerNic !== '—') ||
    (agent.nic && String(agent.nic).trim() !== '' && agent.nic !== '—') ||
    (agent.nicNumber && String(agent.nicNumber).trim() !== '' && agent.nicNumber !== '—')
  )

  if (isSuspended) return 'SUSPENDED'
  if (rawNicStatus === 'REJECTED' || isRejected) return 'REJECTED'

  // ONLY verified if an actual NIC document file is uploaded AND approved
  if (hasNicDoc && (rawNicStatus === 'APPROVED' || isApproved)) return 'APPROVED'
  if (hasNicDoc || hasNicNumber) return 'PROVIDED'
  return 'PENDING'
}

const fmtDate = (s?: string | null) => {
  try {
    return s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
  } catch {
    return s || '—'
  }
}

const getInitials = (name = '') => {
  if (!name) return 'AT'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'AT'
}

const parseDuration = (dur?: string | number) => {
  if (!dur) return { days: 2, nights: 1 }
  if (typeof dur === 'number') {
    const days = dur
    const nights = Math.max(0, days - 1)
    return { days, nights }
  }
  const str = String(dur).toLowerCase()
  const daysMatch = str.match(/(\d+)\s*(?:day|d)/)
  const nightsMatch = str.match(/(\d+)\s*(?:night|n)/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10)
    const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : Math.max(0, days - 1)
    return { days, nights }
  }
  const numMatch = str.match(/(\d+)/)
  if (numMatch) {
    const days = parseInt(numMatch[1], 10)
    return { days, nights: Math.max(0, days - 1) }
  }
  return { days: 2, nights: 1 }
}

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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'fadeInScale .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition text-sm">✕</button>
        </div>
        <div className="p-6">
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
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">Cancel</button>
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

// ── Document Viewer Modal ─────────────────────────────────────────────────────
interface DocumentViewerModalProps {
  ownerName?: string
  nicNumber?: string
  nicImageUrl?: string | null
  nicRearImageUrl?: string | null
  businessRegistrationImageUrl?: string | null
  onClose: () => void
}

const DocumentViewerModal = ({
  ownerName,
  nicNumber,
  nicImageUrl,
  nicRearImageUrl,
  businessRegistrationImageUrl,
  onClose
}: DocumentViewerModalProps) => {
  const initialTab = nicImageUrl ? 'front' : (nicRearImageUrl ? 'rear' : (businessRegistrationImageUrl ? 'br' : 'front'))
  const [activeTab, setActiveTab] = useState<'front' | 'rear' | 'br'>(initialTab)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const currentDocUrl = activeTab === 'front' 
    ? nicImageUrl 
    : activeTab === 'rear' 
      ? nicRearImageUrl 
      : businessRegistrationImageUrl

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: 'fadeInScale .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">
              🪪
            </div>
            <div>
              <h3 className="text-base font-bold">Verification Documents</h3>
              <p className="text-xs text-slate-300">
                {ownerName ? `${ownerName} • ` : ''}{nicNumber ? `NIC: ${nicNumber}` : 'Document Inspection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
          {nicImageUrl && (
            <button
              onClick={() => setActiveTab('front')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'front' ? 'bg-[#0ea5e9] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              NIC Front
            </button>
          )}
          {nicRearImageUrl && (
            <button
              onClick={() => setActiveTab('rear')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'rear' ? 'bg-[#0ea5e9] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              NIC Back
            </button>
          )}
          {businessRegistrationImageUrl && (
            <button
              onClick={() => setActiveTab('br')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'br' ? 'bg-[#0ea5e9] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Business Registration
            </button>
          )}
        </div>

        {/* Image Preview Container */}
        <div className="p-6 bg-slate-50 overflow-y-auto flex items-center justify-center min-h-[360px] max-h-[60vh]">
          {currentDocUrl ? (
            <img
              src={currentDocUrl}
              alt="Verification Document"
              className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-md border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Document image not available</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab === 'front' && 'Showing National Identity Card (Front)'}
            {activeTab === 'rear' && 'Showing National Identity Card (Back)'}
            {activeTab === 'br' && 'Showing Business Registration Certificate'}
          </div>
          <div className="flex items-center gap-3">
            {currentDocUrl && (
              <button
                onClick={() => window.open(currentDocUrl, '_blank')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Package Quick Modal ───────────────────────────────────────────────────────
interface PackageQuickModalProps {
  pkg: any
  onClose: () => void
}

const PackageQuickModal = ({ pkg, onClose }: PackageQuickModalProps) => {
  const { formatPrice } = useAdminCurrency()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!pkg) return null

  const { days, nights } = parseDuration(pkg.duration)
  const price = pkg.basePriceAdult || pkg.price || pkg.priceFrom || 0
  const title = pkg.packageName || pkg.name || 'Travel Package'
  const location = pkg.destination || pkg.district || pkg.location || 'Sri Lanka'
  const rating = pkg.rating != null ? Number(pkg.rating) : 0

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: 'fadeInScale .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Image */}
        <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
          {pkg.imageUrl || pkg.coverImage ? (
            <img
              src={pkg.imageUrl || pkg.coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-5xl">
              🗺️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition text-base"
          >
            ✕
          </button>

          {/* Rating Pill */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-gray-900 flex items-center gap-1 shadow">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{rating > 0 ? rating.toFixed(1) : '0'}</span>
          </div>

          {/* Title & Location inside Hero */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium mb-1">
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              <span>{location}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick info badges */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                <Moon className="h-4 w-4 text-sky-500" />
                <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Starts From</div>
              <div className="text-2xl font-extrabold text-[#0ea5e9]">{formatPrice(price)}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Package Overview</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {pkg.description || pkg.overview || 'Explore breathtaking destinations with tailored itineraries, expert local guiding, and curated experiences designed for unforgettable memories.'}
            </p>
          </div>

          {/* Highlights / Features if any */}
          {pkg.highlights && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Highlights</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{pkg.highlights}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reusable Info Row ─────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-sky-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  )
}

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, colorClass }: { label: string; value: any; icon: any; colorClass: string }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value ?? '—'}</p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  </div>
)

// ── Package Card Component (Matches Reference Template) ───────────────────────
interface PackageCardItemProps {
  pkg: any
  onViewDetails: (pkg: any) => void
}

const PackageCardItem = ({ pkg, onViewDetails }: PackageCardItemProps) => {
  const { formatPrice } = useAdminCurrency()
  const { days, nights } = parseDuration(pkg.duration)
  const price = pkg.basePriceAdult || pkg.price || pkg.priceFrom || 0
  const title = pkg.packageName || pkg.name || 'Package'
  const location = pkg.destination || pkg.district || pkg.location || 'Sri Lanka'
  const rating = pkg.rating != null ? Number(pkg.rating) : 0
  const imageUrl = pkg.imageUrl || pkg.coverImage

  return (
    <div
      onClick={() => onViewDetails(pkg)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/60 transition-all duration-300 cursor-pointer h-full justify-between"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-4xl">
            🗺️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rating badge on top right: only show if package has rating */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="mb-3">
          <h4 className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors line-clamp-1 text-base">
            {title}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-3 border-t border-gray-100 flex items-end justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">STARTS FROM</span>
            <div className="text-base font-extrabold text-gray-900">
              {formatPrice(price)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-400" /> {days} {days === 1 ? 'day' : 'days'}
              </span>
              <span className="flex items-center gap-1">
                <Moon className="h-3.5 w-3.5 text-sky-500" /> {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(pkg)
            }}
            className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition flex-shrink-0"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Agent Detail View (Full Template Matching Provided Mockup) ────────────────
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
}

const AgentDetailView = ({
  agent,
  stats,
  packages: rawPackages = [],
  revenue,
  onBack,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onDelete,
  loading,
}: AgentDetailViewProps) => {
  const modal = useModal()
  const [viewingPackage, setViewingPackage] = useState<any | null>(null)
  const [pkgDetailLoading, setPkgDetailLoading] = useState(false)
  const [docModalOpen, setDocModalOpen] = useState(false)

  if (!agent) return null

  const handleViewPackage = async (pkg: any) => {
    const pkgId = pkg.id || pkg.packageId
    setPkgDetailLoading(true)
    try {
      const res = await adminPackageApi.getPackageDetail(pkgId)
      const detailed = res?.data ?? res ?? pkg
      setViewingPackage(detailed)
    } catch {
      setViewingPackage(pkg)
    } finally {
      setPkgDetailLoading(false)
    }
  }

  const handleApprovePackage = async (pkg: any) => {
    try {
      await adminPackageApi.approvePackage(pkg.id || pkg.packageId)
      modal?.addToast(`✅ Package "${pkg.packageName || pkg.name}" approved`)
      setViewingPackage((p: any) => p ? { ...p, applicationStatus: 'Approved', status: 'Approved' } : null)
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    }
  }

  const handleRejectPackage = async (pkg: any) => {
    try {
      await adminPackageApi.rejectPackage(pkg.id || pkg.packageId, 'Rejected by admin')
      modal?.addToast(`🚫 Package "${pkg.packageName || pkg.name}" rejected`)
      setViewingPackage((p: any) => p ? { ...p, applicationStatus: 'Rejected', status: 'Rejected' } : null)
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    }
  }

  const handleTogglePackage = async (pkg: any) => {
    try {
      await adminPackageApi.togglePackageActive(pkg.id || pkg.packageId)
      const newActive = pkg.isActive === false ? true : false
      modal?.addToast(`✅ Package ${newActive ? 'activated' : 'deactivated'}`)
      setViewingPackage((p: any) => p ? { ...p, isActive: newActive } : null)
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Toggle failed'}`)
    }
  }

  const handleDeletePackage = async (pkg: any) => {
    if (!await modal?.showConfirm({ title: 'Delete Package', message: `Permanently delete "${pkg.packageName || pkg.name}"?` })) return
    try {
      await adminPackageApi.deletePackage(pkg.id || pkg.packageId)
      modal?.addToast(`🗑 Package deleted`)
      setViewingPackage(null)
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    }
  }

  // If viewing a package inside this agent, render the full PackageDetailsView
  if (viewingPackage) {
    return (
      <PackageDetailsView
        pkg={viewingPackage}
        onBack={() => setViewingPackage(null)}
        onApprove={handleApprovePackage}
        onReject={handleRejectPackage}
        onToggle={handleTogglePackage}
        onDelete={handleDeletePackage}
      />
    )
  }

  const {
    id,
    agentName,
    companyName,
    ownerName,
    email,
    phone,
    whatsappNumber,
    websiteUrl,
    location,
    operatingDistricts,
    languages,
    bio,
    description,
    memberSince,
    applicationStatus,
    nicImageUrl,
    nicRearImageUrl,
    ownerNic,
    businessRegistrationNumber,
    businessRegistrationImageUrl,
    nicVerificationStatus,
    adminMessage,
    rating,
    totalTrips,
    isActive,
    profileImage,
    imageUrl,
    logoUrl,
    totalPackages
  } = agent

  const displayName = companyName || agentName || 'Travel Agency'
  const ownerDisplayName = ownerName || agentName || 'Agent'
  const rawNicStatus = agent.nicVerificationStatus?.toUpperCase()
  const isSuspended = rawNicStatus === 'SUSPENDED' || (isActive === false && (String(applicationStatus || '').toLowerCase() === 'approved' || agent.agentApproved === true)) || agent.isSuspended === true
  const isApproved = !isSuspended && (String(applicationStatus || '').toLowerCase() === 'approved' || agent.agentApproved === true)
  const isPending = !isSuspended && !isApproved && String(applicationStatus || '').toLowerCase() === 'pending'
  const isRejected = !isSuspended && !isApproved && String(applicationStatus || '').toLowerCase() === 'rejected'

  const avatarUrl = profileImage || imageUrl || logoUrl
  const avatarInitials = getInitials(displayName)
  const packagesList = Array.isArray(rawPackages) && rawPackages.length > 0
    ? rawPackages
    : (Array.isArray(agent.packages) ? agent.packages : [])

  const activePackageCount = packagesList.length || totalPackages || 0
  const agentRating = rating != null ? Number(rating) : 0
  const totalTripCount = totalTrips ?? stats?.totalTrips ?? 0

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Loading Package Details Overlay */}
      {pkgDetailLoading && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-gray-800">Loading package details…</span>
          </div>
        </div>
      )}

      {docModalOpen && (
        <DocumentViewerModal
          ownerName={ownerDisplayName}
          nicNumber={ownerNic || agent.nicNumber}
          nicImageUrl={nicImageUrl || agent.nicImage || agent.nicPhotocopy}
          nicRearImageUrl={nicRearImageUrl}
          businessRegistrationImageUrl={businessRegistrationImageUrl}
          onClose={() => setDocModalOpen(false)}
        />
      )}

      {/* ── Back button ────────────────────────────────────────────── */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-[#0ea5e9] transition font-semibold text-sm py-1 px-1 -ml-1 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Agents
      </button>

      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 shadow-md">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative px-8 py-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg flex-shrink-0 bg-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30 shadow-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-black text-white tracking-wider">{avatarInitials}</span>
              </div>
            )}

            <div className="text-white flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-white/20 text-white border border-white/30 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 shadow-sm">
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      Verified Agent
                    </>
                  ) : isPending ? (
                    <>
                      <Clock className="h-3.5 w-3.5 text-amber-200" />
                      Pending Approval
                    </>
                  ) : isSuspended ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-orange-200" />
                      Account Suspended
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 text-rose-200" />
                      Application Rejected
                    </>
                  )}
                </span>

                {memberSince && (
                  <span className="bg-white/20 text-white border border-white/30 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Since {String(memberSince).split('-')[0]}
                  </span>
                )}
              </div>

              {/* Title & Owner Subtitle */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white truncate">
                {displayName}
              </h1>
              <p className="text-white/80 text-base font-medium mt-0.5">
                by {ownerDisplayName}
              </p>

              {/* Location */}
              {(location || operatingDistricts) && (
                <div className="flex items-center gap-1.5 text-white/75 text-sm mt-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{location || operatingDistricts}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Box in Hero */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 text-center flex-shrink-0 border border-white/20 min-w-[140px] shadow-sm">
            {agentRating > 0 ? (
              <div className="flex items-center gap-1.5 justify-center mb-0.5">
                <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                <span className="text-2xl font-extrabold text-white">{agentRating.toFixed(1)}</span>
              </div>
            ) : (
              <p className="text-white text-base font-bold mb-0.5">No Rating Yet</p>
            )}
            <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">Rating</p>
          </div>
        </div>
      </section>

      {/* ── Quick Stats Grid (3 Columns) ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={Briefcase}
          label="Total Trips"
          value={totalTripCount}
          colorClass="bg-[#0ea5e9]"
        />
        <StatCard
          icon={Star}
          label="Agent Rating"
          value={agentRating > 0 ? agentRating.toFixed(1) : 'No Rating Available'}
          colorClass="bg-amber-500"
        />
        <StatCard
          icon={Package}
          label="Active Packages"
          value={activePackageCount}
          colorClass="bg-emerald-500"
        />
      </div>

      {/* ── Information Cards Row (About, Contact, Expertise) ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-base text-gray-900 mb-3">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {bio || description || 'Leading travel agency.'}
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-base text-gray-900 mb-1">Contact</h3>
          <InfoRow icon={Phone} label="Phone" value={phone || '0771111111'} />
          <InfoRow icon={MessageSquare} label="WhatsApp" value={whatsappNumber} />
          <InfoRow icon={Mail} label="Email" value={email} />
          <InfoRow icon={Globe} label="Website" value={websiteUrl} />
        </div>

        {/* Expertise Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-base text-gray-900 mb-1">Expertise</h3>
          <InfoRow icon={Languages} label="Languages" value={languages || 'English'} />
          <InfoRow
            icon={MapPin}
            label="Operating Districts"
            value={operatingDistricts || location || 'Western province'}
          />
        </div>
      </div>

      {/* ── Admin Verification & Account Management Card ────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Verification & Account Status</h3>
              <p className="text-xs text-gray-500">Inspect identity documents and manage agency approval state.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <NicStatusBadge agent={agent} />
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isApproved ? 'bg-emerald-100 text-emerald-800' :
              isPending ? 'bg-amber-100 text-amber-800' :
              isSuspended ? 'bg-gray-100 text-gray-700' :
              'bg-red-100 text-red-800'
            }`}>
              Status: {isSuspended ? 'Suspended' : (applicationStatus || 'Pending')}
            </span>
          </div>
        </div>

        {/* Rejection / Suspension Alert Banner */}
        {adminMessage && (isRejected || isSuspended || nicVerificationStatus === 'REJECTED' || nicVerificationStatus === 'SUSPENDED') && (
          <div className={`mt-5 p-4 rounded-xl border text-sm flex items-start gap-3 ${
            isSuspended ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {isSuspended ? 'Suspension Reason:' : 'Rejection Reason:'}
              </span>
              <span>{adminMessage}</span>
            </div>
          </div>
        )}

        {/* Owner Details & Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Owner Full Name</span>
            <span className="text-sm font-bold text-gray-900">{ownerDisplayName}</span>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">NIC Number</span>
            <span className="text-sm font-bold text-emerald-600">{ownerNic || '—'}</span>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Registration Date</span>
            <span className="text-sm font-bold text-gray-900">{fmtDate(memberSince)}</span>
          </div>
        </div>

        {/* Documents Inspection Button Bar */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          {nicImageUrl || agent.nicImage || agent.nicPhotocopy || nicRearImageUrl || businessRegistrationImageUrl ? (
            <button
              onClick={() => setDocModalOpen(true)}
              className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              🪪 View NIC Document
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 bg-gray-200 text-gray-400 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed"
            >
              No Documents Uploaded
            </button>
          )}

          {businessRegistrationImageUrl && (
            <button
              onClick={() => setDocModalOpen(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              📄 View Business Registration
            </button>
          )}
        </div>

        {/* Admin Action Buttons */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* If Suspended: ONLY show Unsuspend Agency in sky blue */}
            {isSuspended && (
              <button
                onClick={() => onUnsuspend(agent)}
                disabled={loading}
                className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> Unsuspend Agency
              </button>
            )}

            {/* If Pending (and NOT suspended): Show Approve & Reject */}
            {isPending && (
              <>
                <button
                  onClick={() => onApprove(agent)}
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> Approve Agency
                </button>
                <button
                  onClick={() => onReject(agent)}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
                >
                  <X className="h-4 w-4" /> Reject Agency
                </button>
              </>
            )}

            {/* If Approved (and NOT suspended): Show Suspend Agency */}
            {isApproved && (
              <button
                onClick={() => onSuspend(agent)}
                disabled={loading}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
              >
                <AlertTriangle className="h-4 w-4" /> Suspend Agency
              </button>
            )}
          </div>

          <button
            onClick={() => onDelete(agent)}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-60 ml-auto"
          >
            <Trash2 className="h-4 w-4" /> Delete Agency
          </button>
        </div>
      </div>

      {/* ── Packages by this Agent Section ─────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-[#0ea5e9]" />
          <h3 className="text-xl font-bold text-gray-900">Packages by this Agent</h3>
          <span className="bg-sky-100 text-[#0ea5e9] font-bold text-xs px-2.5 py-0.5 rounded-full">
            {packagesList.length}
          </span>
        </div>

        {packagesList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesList.map((pkg: any) => (
              <PackageCardItem
                key={pkg.id || pkg.packageId || Math.random()}
                pkg={pkg}
                onViewDetails={handleViewPackage}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <Package className="h-10 w-10 text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700 text-base">No packages available</p>
            <p className="text-sm text-gray-400 mt-1">This agent has no active packages yet.</p>
          </div>
        )}
      </div>
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
  const avatarInitials = getInitials(name)
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-lg'

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-2xl object-cover shadow-sm border border-gray-100 flex-shrink-0 bg-white`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradient}`}
    >
      {avatarInitials}
    </div>
  )
}

// ── NIC Status Badge ──────────────────────────────────────────────────────────
const NicStatusBadge = ({ status, agent }: { status?: string; agent?: any }) => {
  const key = agent ? getNicStatusKey(agent) : (status ? (NIC_STATUS_STYLES[status.toUpperCase()] ? status.toUpperCase() : 'PENDING') : 'PENDING')
  const s = NIC_STATUS_STYLES[key] || NIC_STATUS_STYLES.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
      <span>{s.icon}</span>
      <span>{s.label}</span>
    </span>
  )
}

// ── Agency Card (List View) ───────────────────────────────────────────────────
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
    isActive,
    imageUrl,
    logoUrl,
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

  const avatar = profileImage || imageUrl || logoUrl
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const nicKey = getNicStatusKey(agent)
  const nicStatus = NIC_STATUS_STYLES[nicKey] || NIC_STATUS_STYLES.PENDING
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
          {bio || agent.description || 'Experienced travel agent ready to plan your perfect trip.'}
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

      {/* Action CTA button */}
      <div className="pt-1 mt-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onView(agent)}
          className="w-full py-2.5 px-3 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition duration-200 shadow-sm"
        >
          View Details <ChevronRight className="h-4 w-4" />
        </button>
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

  // ── Message Modal State ─────────────────────────────────────────────────────
  const [msgModal, setMsgModal] = useState<{ type: 'reject' | 'suspend' | 'delete'; agent: any } | null>(null)

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

  // ── Open details ───────────────────────────────────────────────────────────
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

  const handleDelete = (agent: any) => {
    setMsgModal({ type: 'delete', agent })
  }

  const confirmDelete = async (message: string) => {
    if (!msgModal || !msgModal.agent) return
    const agent = msgModal.agent
    const displayName = agent.companyName || agent.agentName || 'this agency'
    setMsgModal(null)
    try {
      setAction(true)
      await adminAgentApi.deleteAgent(agent.id, message)
      modal?.addToast(`🗑 "${displayName}" deleted successfully`)
      setAgents(prev => prev.filter(a => a.id !== agent.id))
      closeDrawer()
    } catch (err: any) {
      modal?.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    } finally {
      setAction(false)
    }
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Message Modal (Reject / Suspend / Delete) */}
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
        ) : msgModal.type === 'suspend' ? (
          <MessageModal
            title="Suspend Agency"
            placeholder="e.g. Policy violation or suspicious activity detected. Account suspended."
            actionLabel="Suspend Agency"
            actionClass="bg-gray-700 hover:bg-gray-800"
            onConfirm={confirmSuspend}
            onCancel={() => setMsgModal(null)}
            required={true}
          />
        ) : (
          <MessageModal
            title="Delete Agency"
            placeholder="Please enter the reason for deleting this agency account and all its packages..."
            actionLabel="Delete Agency Permanently"
            actionClass="bg-red-600 hover:bg-red-700"
            onConfirm={confirmDelete}
            onCancel={() => setMsgModal(null)}
            required={true}
          />
        )
      )}

      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-gray-600 font-medium text-sm">Loading agency details…</div>
            </div>
          </div>
        ) : (
          <AgentDetailView
            agent={drawerAgent ?? selected}
            stats={drawerStats}
            packages={drawerPkgs ?? (drawerAgent?.packages || selected?.packages || [])}
            revenue={drawerRev}
            onBack={closeDrawer}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
            onDelete={handleDelete}
            loading={actionLoading}
          />
        )
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Agency Approvals</h1>
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
