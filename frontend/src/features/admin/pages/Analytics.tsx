import React, { useState, useEffect } from 'react'
import adminAgentApi from '../services/adminAgentApi'

export default function Analytics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [period, setPeriod] = useState('Monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agentStatsMap, setAgentStatsMap] = useState({})

  // Detail page states
  const [selectedAgentStats, setSelectedAgentStats] = useState(null)
  const [selectedAgentTripStatus, setSelectedAgentTripStatus] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const fetchAgentsAndStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminAgentApi.getAllAgents()
      const agentsList = res?.data ?? res ?? []
      setAgents(agentsList)

      // Fetch stats and trip status for all agents in parallel
      const statsPromises = agentsList.map(async (agent) => {
        try {
          const [statsRes, statusRes] = await Promise.all([
            adminAgentApi.getAgentStats(agent.id),
            adminAgentApi.getAgentTripStatus(agent.id)
          ])
          return {
            id: agent.id,
            stats: statsRes?.data ?? statsRes,
            tripStatus: statusRes?.data ?? statusRes
          }
        } catch (err) {
          console.error(`Failed to fetch stats for agent ${agent.id}`, err)
          return { id: agent.id, stats: null, tripStatus: null }
        }
      })

      const statsResults = await Promise.all(statsPromises)
      const statsMap = {}
      statsResults.forEach((r) => {
        statsMap[r.id] = { stats: r.stats, tripStatus: r.tripStatus }
      })
      setAgentStatsMap(statsMap)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgentsAndStats()
  }, [])

  // Handle detailed view of an agent
  const handleSelectAgent = async (agent) => {
    setSelectedAgent(agent)
    setSelectedAgentStats(null)
    setSelectedAgentTripStatus(null)
    setRevenueData(null)
    setDetailLoading(true)
    
    try {
      // First, check map cache
      const cached = agentStatsMap[agent.id]
      let stats = cached?.stats
      let tripStatus = cached?.tripStatus

      if (!stats || !tripStatus) {
        const [statsRes, statusRes] = await Promise.all([
          adminAgentApi.getAgentStats(agent.id),
          adminAgentApi.getAgentTripStatus(agent.id)
        ])
        stats = statsRes?.data ?? statsRes
        tripStatus = statusRes?.data ?? statusRes
      }
      setSelectedAgentStats(stats)
      setSelectedAgentTripStatus(tripStatus)

      // Fetch monthly revenue chart data
      const revRes = await adminAgentApi.getAgentRevenue(agent.id, selectedYear)
      setRevenueData(revRes?.data ?? revRes)
    } catch (err) {
      console.error('Error fetching detail analytics:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  // Refetch revenue when year changes
  useEffect(() => {
    if (selectedAgent) {
      const fetchRevenueOnly = async () => {
        try {
          const revRes = await adminAgentApi.getAgentRevenue(selectedAgent.id, selectedYear)
          setRevenueData(revRes?.data ?? revRes)
        } catch (err) {
          console.error(err)
        }
      }
      fetchRevenueOnly()
    }
  }, [selectedYear, selectedAgent])

  const filteredAgents = agents.filter(a => {
    const name = a.companyName || a.agentName || ''
    const owner = a.ownerName || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           owner.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const StatCard = ({ title, value, trend, icon, bgColor, trendUp }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bgColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-semibold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-gray-500 text-sm mt-1 font-medium">{title}</p>
    </div>
  )

  const ChartCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-0.5">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
      {children}
    </div>
  )

  const SmallStatCard = ({ title, value, icon, bgColor }) => (
    <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${bgColor}`}>
        {icon}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 font-semibold text-sm">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchAgentsAndStats}
            className="w-full px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (selectedAgent) {
    const stats = selectedAgentStats
    const tripStatus = selectedAgentTripStatus
    
    // Calculate total details trips
    const totalDetailTrips = (tripStatus?.completed || 0) + (tripStatus?.pending || 0) + (tripStatus?.cancelled || 0) || 1
    const completedPct = ((tripStatus?.completed || 0) / totalDetailTrips * 100).toFixed(0)
    const pendingPct = ((tripStatus?.pending || 0) / totalDetailTrips * 100).toFixed(0)
    const cancelledPct = ((tripStatus?.cancelled || 0) / totalDetailTrips * 100).toFixed(0)

    // Calculate max revenue value for scaling the bar chart
    const maxRevenue = Math.max(...(revenueData?.data || []), 1) || 1

    return (
      <div className="p-8 bg-gray-50 min-h-screen animate-fade-in">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedAgent(null)}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold transition text-sm"
        >
          &lt; Back to Agents
        </button>

        {/* Header */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                {getInitials(selectedAgent.companyName || selectedAgent.agentName)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedAgent.companyName || selectedAgent.agentName}</h1>
                <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedAgent.location || 'Authorized Travel Agent'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-bold text-gray-900">{stats?.averageRating || '0.0'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">Year:</span>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer hover:border-teal-500 transition focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm font-medium">Fetching detailed stats...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Revenue" 
                value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} 
                icon="💰" 
                bgColor="bg-emerald-50 text-emerald-600"
              />
              <StatCard 
                title="Total Trips" 
                value={stats?.totalTrips || 0} 
                icon="🚗" 
                bgColor="bg-blue-50 text-blue-600"
              />
              <StatCard 
                title="Average Rating" 
                value={stats?.averageRating || '0.0'} 
                icon="★" 
                bgColor="bg-amber-50 text-amber-600"
              />
              <StatCard 
                title="Cancellation Rate" 
                value={`${stats?.cancellationRate || 0}%`} 
                icon="⚠️" 
                bgColor="bg-rose-50 text-rose-600"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2">
                <ChartCard 
                  title="Monthly Revenue" 
                  subtitle={`Revenue performance over the year ${selectedYear}`}
                >
                  <div className="h-64 flex items-end justify-around bg-gradient-to-b from-teal-50/20 to-white p-4 rounded-xl border border-gray-50">
                    {(revenueData?.data || Array(12).fill(0)).map((val, i) => {
                      const pct = (val / maxRevenue) * 100
                      const barHeight = Math.max(pct, 2) // At least 2% so it shows something
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded absolute -translate-y-12 pointer-events-none font-bold">
                            ${val.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </div>
                          <div 
                            className="w-8 sm:w-10 bg-teal-500 hover:bg-teal-600 rounded-t transition-all duration-500 shadow-sm" 
                            style={{ height: `${barHeight}%` }}
                          />
                          <span className="text-xs font-bold text-gray-400 mt-1">
                            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </ChartCard>
              </div>

              {/* Trip Status Distribution */}
              <div>
                <ChartCard 
                  title="Trip Status" 
                  subtitle="Proportion of trip outcomes"
                >
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          Completed
                        </span>
                        <span>{tripStatus?.completed || 0} ({completedPct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${completedPct}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                          Pending
                        </span>
                        <span>{tripStatus?.pending || 0} ({pendingPct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                          Cancelled
                        </span>
                        <span>{tripStatus?.cancelled || 0} ({cancelledPct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${cancelledPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Agency Analytics & Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Track individual agent performance, trip status outcomes and revenue trends</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search agent by company name or owner..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 bg-white"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => {
          const statsInfo = agentStatsMap[agent.id]
          const stats = statsInfo?.stats
          const tripStatus = statsInfo?.tripStatus

          return (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col justify-between">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-50/20 to-blue-50/20 p-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {getInitials(agent.companyName || agent.agentName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate leading-snug">{agent.companyName || agent.agentName}</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">{agent.ownerName || '—'}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs font-bold text-gray-900">{stats?.averageRating || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="p-6 space-y-4 flex-1">
                <SmallStatCard 
                  title="Total Revenue" 
                  value={`$${(stats?.totalRevenue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                  icon="💰"
                  bgColor="bg-emerald-50 text-emerald-600"
                />
                <SmallStatCard 
                  title="Total Trips" 
                  value={stats?.totalTrips || 0}
                  icon="🚗"
                  bgColor="bg-blue-50 text-blue-600"
                />
                <SmallStatCard 
                  title="Completed Trips" 
                  value={tripStatus?.completed || 0}
                  icon="✓"
                  bgColor="bg-purple-50 text-purple-600"
                />
              </div>

              {/* Action Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleSelectAgent(agent)} 
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition duration-200"
                >
                  View Detailed Analytics
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
          <p className="text-gray-500 text-sm font-semibold">No registered agents found matching your search.</p>
        </div>
      )}
    </div>
  )
}
