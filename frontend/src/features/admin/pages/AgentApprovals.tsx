import { useState, useEffect, useCallback, useRef } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import { useModal } from '../components/ModalContext'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended']

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Suspended: 'bg-gray-100 text-gray-600',
}

// NIC verification status badge styles
const NIC_STATUS_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  PENDING: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '🕐', label: 'NIC Pending Review' },
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
const Skeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {[200, 150, 100, 100, 180].map((w, i) => (
      <td key={i} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" style={{ width: w }} /></td>
    ))}
  </tr>
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
    rating, totalTrips, experienceYears, isActive
  } = agent

  const isSuspended = nicVerificationStatus === 'SUSPENDED' || (isActive === false && applicationStatus === 'Approved')

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-6 border border-gray-100 flex items-center gap-2">
        &lt; Back to Agents
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center py-10 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center text-2xl text-white font-bold mb-4 shadow-md">
            {initials(companyName || agentName)}
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
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Agency Approvals</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', count: counts.total, color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'Pending', count: counts.pending, color: 'bg-amber-50 border-amber-100 text-amber-700' },
              { label: 'Approved', count: counts.approved, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
              { label: 'Rejected', count: counts.rejected, color: 'bg-red-50 border-red-100 text-red-600' },
              { label: 'Suspended', count: counts.suspended, color: 'bg-gray-100 border-gray-200 text-gray-600' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-semibold mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search agencies..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              <div className="w-36">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatus(e.target.value); setSearch(''); }}
                  className="w-full px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 bg-white focus:outline-none"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Agency</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Owner</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Status</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">NIC Verification</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                  ) : agents.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No agencies found</td></tr>
                  ) : (
                    agents.map(agent => {
                      const displayStatus = getDisplayStatus(agent)
                      const nicStatus = NIC_STATUS_STYLES[agent.nicVerificationStatus || 'PENDING'] || NIC_STATUS_STYLES.PENDING
                      return (
                        <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="py-4 px-4 text-sm font-bold text-gray-900">
                            {agent.companyName || agent.agentName}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">
                            {agent.ownerName || agent.agentName || '—'}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${STATUS_STYLES[displayStatus] || STATUS_STYLES.Pending}`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${nicStatus.bg}`}>
                              {nicStatus.icon} {nicStatus.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 flex-wrap">
                              <button onClick={(e) => { e.stopPropagation(); openDrawer(agent) }} className="px-4 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-sm font-medium transition">View</button>
                              {agent.applicationStatus === 'Pending' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleApprove(agent) }} disabled={actionLoading} className="px-4 py-1.5 bg-[#22c55e] hover:bg-green-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Approve</button>
                                  <button onClick={(e) => { e.stopPropagation(); handleReject(agent) }} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Reject</button>
                                </>
                              )}
                              {agent.applicationStatus === 'Approved' && (
                                displayStatus === 'Suspended' ? (
                                  <button onClick={(e) => { e.stopPropagation(); handleUnsuspend(agent) }} disabled={actionLoading} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Unsuspend</button>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); handleSuspend(agent) }} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Suspend</button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
