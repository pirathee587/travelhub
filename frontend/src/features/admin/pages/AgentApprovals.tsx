 import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import { useModal } from '../components/ModalContext'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES = {
  Pending:   'bg-orange-100 text-orange-700',
  Approved:  'bg-emerald-100 text-emerald-700',
  Rejected:  'bg-red-100 text-red-700',
  Suspended: 'bg-gray-100 text-gray-600',
}

const fmtDate = (s) => { try { return s ? new Date(s).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—' } catch { return s || '—' } }
const fmtCurrency = (v) => v != null ? `$${Number(v).toLocaleString('en-US',{maximumFractionDigits:0})}` : '—'
const initials = (name='') => name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?'

const AVATAR_COLORS = ['bg-teal-500','bg-blue-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-emerald-500']
const Avatar = ({name,img,size='md'}) => {
  const sz = size==='lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'
  const color = AVATAR_COLORS[(name?.charCodeAt(0)??0)%AVATAR_COLORS.length]
  if (img) return <img src={img} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />
  return <div className={`${sz} rounded-full ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials(name)}</div>
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {[200,150,100,180].map((w,i)=>(
      <td key={i} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" style={{width:w}}/></td>
    ))}
  </tr>
)

// ── Agent Packages Modal ──────────────────────────────────────────────────────
const PKG_STATUS_STYLES = {
  Approved: { badge: 'bg-green-100 text-green-700',  label: 'Approved'  },
  Pending:  { badge: 'bg-orange-100 text-orange-700', label: 'Pending'   },
  Rejected: { badge: 'bg-red-100 text-red-700',       label: 'Rejected'  },
}

const AgentPackagesModal = ({ agentName, packages = [], loading, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
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
        {/* ── Header ───────────────────────────────────── */}
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

        {/* ── Body ─────────────────────────────────────── */}
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
            /* ── Card Grid ── */
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {packages.map(pkg => {
                const status = PKG_STATUS_STYLES[pkg.applicationStatus] || PKG_STATUS_STYLES.Pending
                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    {/* Cover Image */}
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

                    {/* Card Body */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate">{pkg.packageName || '—'}</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {pkg.destination || '—'}
                        {pkg.duration ? ` • ${pkg.duration}` : ''}
                      </p>

                      {/* Status Badges */}
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

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}

// ── Agent Detail View ───────────────────────────────────────────────────────────
const AgentDetailView = ({agent, stats, packages, revenue, onBack, onApprove, onReject, onToggle, onDelete, loading, onPackagesClick}) => {
  if (!agent) return null
  const {id,agentName,companyName,ownerName,email,phone,location,memberSince,
    applicationStatus,nicImageUrl,ownerNic,rating,totalTrips,experienceYears,isActive,profileImage} = agent

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
        </div>

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
          </div>

          {/* Right Panel - Application Status */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-[#fff7ed] rounded-xl p-8 border border-orange-50/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Status</div>
                  {isActive === false && applicationStatus === 'Approved' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Suspended
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      applicationStatus === 'Approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                      applicationStatus === 'Pending'  ? 'bg-[#fef0db] text-[#e37400]' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {applicationStatus}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Submitted Date</div>
                  <div className="text-lg font-bold text-gray-900">{fmtDate(memberSince)}</div>
                </div>
              </div>
            </div>

            {nicImageUrl ? (
              <button onClick={()=>window.open(nicImageUrl,'_blank')} className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition text-sm">
                View NIC
              </button>
            ) : (
               <button disabled className="w-full py-3 bg-gray-300 text-white font-semibold rounded-lg shadow-sm transition text-sm cursor-not-allowed">
                No NIC Provided
              </button>
            )}
            
            {applicationStatus === 'Approved' && (
              <button
                onClick={() => onPackagesClick(agent)}
                className="w-full py-3 bg-[#d97706] hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition text-sm"
              >
                View Packages
              </button>
            )}

            {applicationStatus === 'Approved' && (
              isActive === false ? (
                <button
                  onClick={() => onToggle(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  Activate Agent
                </button>
              ) : (
                <button
                  onClick={() => onToggle(agent)}
                  disabled={loading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition text-sm disabled:opacity-60"
                >
                  Suspend Agent
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentApprovals() {
  const modal = useModal()

  const [agents, setAgents]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setAction]      = useState(false)
  const [error, setError]               = useState(null)
  const [statusFilter, setStatus]       = useState('All')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [drawerAgent, setDrawerAgent]   = useState(null)
  const [drawerStats, setDrawerStats]   = useState(null)
  const [drawerPkgs, setDrawerPkgs]     = useState(null)
  const [drawerRev, setDrawerRev]       = useState(null)
  const [detailLoading, setDetailLoad]  = useState(false)
  const searchTimer = useRef(null)

  // ── Packages Modal State ────────────────────────────────────────────────────
  const [pkgModal, setPkgModal]         = useState(null)   // { agentName, packages }
  const [pkgLoading, setPkgLoading]     = useState(false)

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchAgents = useCallback(async (status='All', keyword='') => {
    try {
      setLoading(true); setError(null)
      let res
      if (keyword.trim()) {
        res = await adminAgentApi.searchAgents(keyword.trim())
      } else if (status !== 'All') {
        res = await adminAgentApi.getAgentsByStatus(status)
      } else {
        res = await adminAgentApi.getAllAgents()
      }
      setAgents(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load agents.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAgents(statusFilter, search) }, [statusFilter, fetchAgents])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchAgents(statusFilter, val), 400)
  }

  // ── Open drawer (load all 4 sub-endpoints in parallel) ────────────────────
  const openDrawer = async (agent) => {
    setSelected(agent); setDrawerAgent(null); setDrawerStats(null); setDrawerPkgs(null); setDrawerRev(null); setDetailLoad(true)
    try {
      const [detRes, statsRes, pkgsRes, revRes] = await Promise.allSettled([
        adminAgentApi.getAgentDetail(agent.id),
        adminAgentApi.getAgentStats(agent.id),
        adminAgentApi.getAgentPackages(agent.id),
        adminAgentApi.getAgentRevenue(agent.id, new Date().getFullYear()),
      ])
      if (detRes.status==='fulfilled')   setDrawerAgent(detRes.value?.data ?? detRes.value)
      if (statsRes.status==='fulfilled') setDrawerStats(statsRes.value?.data ?? statsRes.value)
      if (pkgsRes.status==='fulfilled')  setDrawerPkgs(pkgsRes.value?.data ?? pkgsRes.value ?? [])
      if (revRes.status==='fulfilled')   setDrawerRev(revRes.value?.data ?? revRes.value)
    } catch { setDrawerAgent(agent) }
    finally { setDetailLoad(false) }
  }

  const closeDrawer = () => { setSelected(null); setDrawerAgent(null) }

  const patchLocal = (id, changes) => {
    setAgents(prev => prev.map(a => a.id===id ? {...a,...changes} : a))
    setDrawerAgent(d => d?.id===id ? {...d,...changes} : d)
  }

  // ── Open Packages Modal ────────────────────────────────────────────────────
  const handlePackagesClick = async (agent) => {
    const agentName = agent.companyName || agent.agentName || 'Agent'
    setPkgModal({ agentName, packages: [] })
    setPkgLoading(true)
    try {
      const res = await adminAgentApi.getAgentPackages(agent.id)
      const pkgs = res?.data ?? res ?? []
      setPkgModal({ agentName, packages: Array.isArray(pkgs) ? pkgs : [] })
    } catch (err) {
      setPkgModal({ agentName, packages: [] })
      modal.addToast(`❌ Failed to load packages: ${err?.response?.data?.message || err.message}`)
    } finally {
      setPkgLoading(false)
    }
  }

  const closePkgModal = () => { setPkgModal(null); setPkgLoading(false) }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = async (agent) => {
    // Per architecture schema: approval uses User/Owner ID (not Agent ID)
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal.addToast('❌ Cannot approve: owner account not linked to this agency')
      return
    }
    const displayName = agent.companyName || agent.agentName || 'this agency'
    if (!await modal.showConfirm({title:'Approve Agent',message:`Approve "${displayName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.approveAgent(ownerId)
      modal.addToast(`✅ "${displayName}" approved`)
      patchLocal(agent.id, {applicationStatus:'Approved'})
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`) }
    finally { setAction(false) }
  }

  const handleReject = async (agent) => {
    // Per architecture schema: rejection uses User/Owner ID (not Agent ID)
    const ownerId = agent.ownerId
    if (!ownerId) {
      modal.addToast('❌ Cannot reject: owner account not linked to this agency')
      return
    }
    const displayName = agent.companyName || agent.agentName || 'this agency'
    if (!await modal.showConfirm({title:'Reject Agent',message:`Reject "${displayName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.rejectAgent(ownerId, 'Rejected by admin')
      modal.addToast(`🚫 "${displayName}" rejected`)
      patchLocal(agent.id, {applicationStatus:'Rejected'})
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`) }
    finally { setAction(false) }
  }

  const handleToggle = async (agent) => {
    const isSuspending = agent.isActive
    const action = isSuspending ? 'Suspend' : 'Activate'
    if (!await modal.showConfirm({title:`${action} Agent`,message:`${action} "${agent.agentName}"?`})) return
    try {
      setAction(true)
      const res = await adminAgentApi.toggleAgentActive(agent.id)
      // Read new isActive from the API response (data.data.isActive)
      const updatedIsActive = res?.data?.isActive ?? res?.isActive ?? !agent.isActive
      modal.addToast(`✅ "${agent.agentName}" ${isSuspending ? 'suspended' : 'activated'}`)
      patchLocal(agent.id, {isActive: updatedIsActive})
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message||'Failed'}`) }
    finally { setAction(false) }
  }

  const handleDelete = async (agent) => {
    if (!await modal.showConfirm({title:'Delete Agent',message:`Permanently delete "${agent.agentName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.deleteAgent(agent.id)
      modal.addToast(`🗑 "${agent.agentName}" deleted`)
      setAgents(prev => prev.filter(a=>a.id!==agent.id))
      closeDrawer()
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message||'Failed'}`) }
    finally { setAction(false) }
  }

  const counts = {
    total:    agents.length,
    pending:  agents.filter(a=>a.applicationStatus==='Pending').length,
    approved: agents.filter(a=>a.applicationStatus==='Approved').length,
    rejected: agents.filter(a=>a.applicationStatus==='Rejected').length,
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ── Packages Modal Overlay ─────────────────────────────────────────── */}
      {pkgModal && (
        <AgentPackagesModal
          agentName={pkgModal.agentName}
          packages={pkgModal.packages}
          loading={pkgLoading}
          onClose={closePkgModal}
        />
      )}

      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
              <div className="text-gray-500 text-sm mt-3">Loading agent details…</div>
            </div>
          </div>
        ) : (
          <AgentDetailView agent={drawerAgent??selected} stats={drawerStats} packages={drawerPkgs} revenue={drawerRev} onBack={closeDrawer} onApprove={handleApprove} onReject={handleReject} onToggle={handleToggle} onDelete={handleDelete} loading={actionLoading} onPackagesClick={handlePackagesClick}/>
        )
      ) : (
        <>
          {/* Header */}
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Agency Approvals</h1>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={search} 
                  onChange={e=>handleSearch(e.target.value)} 
                  className="w-full pl-4 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              <div className="w-32">
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
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Name</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Owner</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Status</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length:5}).map((_,i)=><Skeleton key={i}/>)
                  ) : agents.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">No agents found</td></tr>
                  ) : (
                    agents.map(agent => (
                      <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-4 px-4 text-sm font-bold text-gray-900">
                          {agent.companyName || agent.agentName}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {agent.ownerName || agent.agentName || '—'}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {agent.isActive === false && agent.applicationStatus === 'Approved' ? (
                            <span className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              Suspended
                            </span>
                          ) : (
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              agent.applicationStatus === 'Approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                              agent.applicationStatus === 'Pending' ? 'bg-[#fef0db] text-[#e37400]' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {agent.applicationStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={(e)=>{e.stopPropagation(); openDrawer(agent)}} className="px-4 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-sm font-medium transition">View</button>
                            {agent.applicationStatus === 'Pending' && (
                              <>
                                <button onClick={(e)=>{e.stopPropagation(); handleApprove(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#22c55e] hover:bg-green-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Approve</button>
                                <button onClick={(e)=>{e.stopPropagation(); handleReject(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Reject</button>
                              </>
                            )}
                            {agent.applicationStatus === 'Approved' && (
                              agent.isActive === false ? (
                                <button onClick={(e)=>{e.stopPropagation(); handleToggle(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Activate</button>
                              ) : (
                                <button onClick={(e)=>{e.stopPropagation(); handleToggle(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Suspend</button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
