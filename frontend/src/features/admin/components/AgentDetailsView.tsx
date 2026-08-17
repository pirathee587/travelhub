import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminPackageApi from '../services/adminPackageApi'
import PackageDetailsView from './PackageDetailsView'
import { useAdminCurrency } from '../hooks/AdminCurrencyContext'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Briefcase,
  Globe,
  MessageSquare,
  Package,
  CheckCircle2,
  Languages,
  Calendar,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  FileText,
  ExternalLink,
  AlertCircle,
  Clock,
  X
} from 'lucide-react'

const getInitials = (name = '') => {
  if (!name) return 'AT'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
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

// NIC verification status badge styles
const NIC_STATUS_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  PENDING: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '🕐', label: 'NIC Pending' },
  PROVIDED: { bg: 'bg-sky-50 text-sky-700 border border-sky-200', icon: '🪪', label: 'NIC Provided' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: '✅', label: 'NIC Verified' },
  REJECTED: { bg: 'bg-red-50 text-red-700 border border-red-200', icon: '❌', label: 'NIC Rejected' },
  SUSPENDED: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', icon: '🚫', label: 'Suspended' },
}

const getNicStatusKey = (agent: any): 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PROVIDED' | 'PENDING' => {
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

const fmtDate = (s?: string | null) => {
  try {
    return s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
  } catch {
    return s || '—'
  }
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

interface AgentDetailsViewProps {
  agent: any
  packages?: any[]
  stats?: any
  onClose?: () => void
  showClose?: boolean
}

export default function AgentDetailsView({ agent, packages: rawPackages = [], stats, onClose }: AgentDetailsViewProps) {
  const navigate = useNavigate()
  const { formatPrice } = useAdminCurrency()
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [viewingPackage, setViewingPackage] = useState<any | null>(null)
  const [pkgDetailLoading, setPkgDetailLoading] = useState(false)

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

  // If viewing a package inside this agent, render the full PackageDetailsView
  if (viewingPackage) {
    return (
      <PackageDetailsView
        pkg={viewingPackage}
        onBack={() => setViewingPackage(null)}
      />
    )
  }

  const {
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

  const displayName = companyName || agentName || agent.name || 'Travel Agency'
  const ownerDisplayName = ownerName || agentName || agent.owner || 'Agent'
  const rawNicStatus = agent.nicVerificationStatus?.toUpperCase()
  const isSuspended = rawNicStatus === 'SUSPENDED' || (isActive === false && (String(applicationStatus || agent.status || '').toLowerCase() === 'approved' || agent.agentApproved === true)) || agent.isSuspended === true
  const isApproved = !isSuspended && (String(applicationStatus || agent.status || '').toLowerCase() === 'approved' || agent.agentApproved === true)
  const isPending = !isSuspended && !isApproved && String(applicationStatus || agent.status || '').toLowerCase() === 'pending'

  const avatarUrl = profileImage || imageUrl || logoUrl
  const avatarInitials = getInitials(displayName)
  const packagesList = Array.isArray(rawPackages) && rawPackages.length > 0
    ? rawPackages
    : (Array.isArray(agent.packages) ? agent.packages : [])

  const activePackageCount = packagesList.length || totalPackages || 0
  const agentRating = rating != null ? Number(rating) : 0
  const totalTripCount = totalTrips ?? stats?.totalTrips ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Loading Package Details Overlay */}
      {pkgDetailLoading && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-gray-800">Loading package details…</span>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onClose || (() => navigate('/admin/agents'))}
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
              Status: {isSuspended ? 'Suspended' : (applicationStatus || agent.status || 'Pending')}
            </span>
          </div>
        </div>

        {/* Owner Details & Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Owner Full Name</span>
            <span className="text-sm font-bold text-gray-900">{ownerDisplayName}</span>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">NIC Number</span>
            <span className="text-sm font-bold text-emerald-600">{ownerNic || agent.nic || '—'}</span>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Registration Date</span>
            <span className="text-sm font-bold text-gray-900">{fmtDate(memberSince || agent.submitted)}</span>
          </div>
        </div>

        {/* Documents Inspection Button Bar */}
        {(nicImageUrl || nicRearImageUrl || businessRegistrationImageUrl || agent.nicPhotocopy) && (
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => {
                if (nicImageUrl || agent.nicPhotocopy) {
                  window.open(nicImageUrl || agent.nicPhotocopy, '_blank')
                }
              }}
              className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              🪪 View NIC Document
            </button>

            {businessRegistrationImageUrl && (
              <button
                onClick={() => window.open(businessRegistrationImageUrl, '_blank')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
              >
                📄 View Business Registration
              </button>
            )}
          </div>
        )}
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
            {packagesList.map((pkg: any) => {
              const { days, nights } = parseDuration(pkg.duration)
              const price = pkg.basePriceAdult || pkg.price || pkg.priceFrom || 0
              const title = pkg.packageName || pkg.name || 'Package'
              const locationText = pkg.destination || pkg.district || pkg.location || 'Sri Lanka'
              const pkgRating = pkg.rating != null ? Number(pkg.rating) : 0

              return (
                <div
                  key={pkg.id || pkg.packageId || Math.random()}
                  onClick={() => handleViewPackage(pkg)}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/60 transition-all duration-300 justify-between cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {pkg.imageUrl || pkg.coverImage ? (
                      <img
                        src={pkg.imageUrl || pkg.coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-4xl">
                        🗺️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{pkgRating > 0 ? pkgRating.toFixed(1) : '0'}</span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#0ea5e9] transition-colors line-clamp-1 text-base">
                        {title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{locationText}</span>
                      </div>
                    </div>

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
                          handleViewPackage(pkg)
                        }}
                        className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition flex-shrink-0"
                      >
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
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
