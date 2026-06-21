 import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminAgentApi from '../api/admin/adminAgentApi'
import { useModal } from '../components/ModalContext'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLES = {
  Pending:  'bg-orange-100 text-orange-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
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
    {[200,150,120,100,180].map((w,i)=>(
      <td key={i} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" style={{width:w}}/></td>
    ))}
  </tr>
)

// ── Agent Detail View ───────────────────────────────────────────────────────────
const AgentDetailView = ({agent, stats, packages, revenue, onBack, onApprove, onReject, onToggle, onDelete, loading}) => {
  if (!agent) return null
  const {id,agentName,companyName,ownerName,email,phone,location,memberSince,
    applicationStatus,nicImageUrl,rating,totalTrips,experienceYears,isActive,profileImage} = agent

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
            </div>
          </div>

          {/* Right Panel - Application Status */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-[#fff7ed] rounded-xl p-8 border border-orange-50/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    applicationStatus === 'Approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                    applicationStatus === 'Pending' ? 'bg-[#fef0db] text-[#e37400]' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {applicationStatus}
                  </span>
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
            
            <button className="w-full py-3 bg-[#d97706] hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition text-sm">
              Packages
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

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = async (agent) => {
    if (!await modal.showConfirm({title:'Approve Agent',message:`Approve "${agent.agentName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.approveAgent(agent.id)
      modal.addToast(`✅ "${agent.agentName}" approved`)
      patchLocal(agent.id, {applicationStatus:'Approved'})
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message||'Failed'}`) }
    finally { setAction(false) }
  }

  const handleReject = async (agent) => {
    if (!await modal.showConfirm({title:'Reject Agent',message:`Reject "${agent.agentName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.rejectAgent(agent.id, 'Rejected by admin')
      modal.addToast(`🚫 "${agent.agentName}" rejected`)
      patchLocal(agent.id, {applicationStatus:'Rejected'})
    } catch (err) { modal.addToast(`❌ ${err?.response?.data?.message||'Failed'}`) }
    finally { setAction(false) }
  }

  const handleToggle = async (agent) => {
    const action = agent.isActive ? 'deactivate' : 'activate'
    if (!await modal.showConfirm({title:'Toggle Agent',message:`${action.charAt(0).toUpperCase()+action.slice(1)} "${agent.agentName}"?`})) return
    try {
      setAction(true)
      await adminAgentApi.toggleAgentActive(agent.id)
      modal.addToast(`✅ "${agent.agentName}" ${action}d`)
      patchLocal(agent.id, {isActive:!agent.isActive})
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
      {selected ? (
        detailLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
              <div className="text-gray-500 text-sm mt-3">Loading agent details…</div>
            </div>
          </div>
        ) : (
          <AgentDetailView agent={drawerAgent??selected} stats={drawerStats} packages={drawerPkgs} revenue={drawerRev} onBack={closeDrawer} onApprove={handleApprove} onReject={handleReject} onToggle={handleToggle} onDelete={handleDelete} loading={actionLoading}/>
        )
      ) : (
        <>
          {/* Header */}
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Agent Approvals</h1>

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
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Vehicle</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Status</th>
                    <th className="py-4 px-4 font-bold text-sm text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length:5}).map((_,i)=><Skeleton key={i}/>)
                  ) : agents.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No agents found</td></tr>
                  ) : (
                    agents.map(agent => (
                      <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-4 px-4 text-sm font-bold text-gray-900">
                          {agent.companyName || agent.agentName}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {agent.ownerName || agent.agentName || '—'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {/* Vehicle column is empty in screenshot */}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            agent.applicationStatus === 'Approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
                            agent.applicationStatus === 'Pending' ? 'bg-[#fef0db] text-[#e37400]' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {agent.applicationStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button onClick={(e)=>{e.stopPropagation(); openDrawer(agent)}} className="px-4 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-sm font-medium transition">View</button>
                            {agent.applicationStatus === 'Pending' && (
                              <>
                                <button onClick={(e)=>{e.stopPropagation(); handleApprove(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#22c55e] hover:bg-green-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Approve</button>
                                <button onClick={(e)=>{e.stopPropagation(); handleReject(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Reject</button>
                              </>
                            )}
                            {agent.applicationStatus === 'Approved' && (
                              <button onClick={(e)=>{e.stopPropagation(); handleToggle(agent)}} disabled={actionLoading} className="px-4 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded text-sm font-medium transition disabled:opacity-60">Suspend</button>
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
