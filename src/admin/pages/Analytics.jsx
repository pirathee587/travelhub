import React, { useState } from 'react'
import { mockAgents, mockTransactions } from '../lib/mock-data'

export default function Analytics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [period, setPeriod] = useState('Monthly')

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAgentStats = (agent) => {
    const agentTransactions = mockTransactions.filter(t => t.provider === agent.name || t.provider.includes(agent.agencyTagline))
    const revenue = agentTransactions.reduce((sum, t) => t.type === 'Payment' ? sum + t.amount : sum, 0)
    const commission = agentTransactions.reduce((sum, t) => sum + t.commission, 0)
    const trips = agentTransactions.length
    const completedTrips = agentTransactions.filter(t => t.status === 'Completed').length
    const cancellationRate = trips > 0 ? ((trips - completedTrips) / trips * 100).toFixed(1) : 0

    return { revenue, commission, trips, completedTrips, cancellationRate }
  }

  const filteredAgents = mockAgents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.owner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const StatCard = ({ title, value, trend, icon, bgColor, trendUp }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${bgColor}`}>
          {icon}
        </div>
        <span className={`text-lg font-bold ${trendUp ? 'text-teal-600' : 'text-red-600'}`}>
          {trendUp ? '📈' : '📉'} {trend}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  )

  const ChartCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-6">{subtitle}</p>
      {children}
    </div>
  )

  const SmallStatCard = ({ title, value, icon, bgColor }) => (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-gray-600 font-medium">{title}</p>
        <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${bgColor}`}>
        {icon}
      </div>
    </div>
  )

  if (selectedAgent) {
    const stats = getAgentStats(selectedAgent)
    
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedAgent(null)}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          ← Back to Agents
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white font-bold text-2xl">
              {getInitials(selectedAgent.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedAgent.name}</h1>
              <p className="text-gray-600 mt-1">{selectedAgent.agencyTagline}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold text-gray-900">{selectedAgent.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.revenue.toLocaleString()}`} 
            trend="+18%" 
            icon="💰" 
            bgColor="bg-teal-100"
            trendUp={true}
          />
          <StatCard 
            title="Total Trips" 
            value={stats.trips} 
            trend="+12%" 
            icon="👥" 
            bgColor="bg-green-100"
            trendUp={true}
          />
          <StatCard 
            title="Average Rating" 
            value={selectedAgent.rating} 
            trend="+0.3" 
            icon="⭐" 
            bgColor="bg-orange-100"
            trendUp={true}
          />
          <StatCard 
            title="Cancellation Rate" 
            value={`${stats.cancellationRate}%`} 
            trend="-2%" 
            icon="📍" 
            bgColor="bg-red-100"
            trendUp={false}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-900 cursor-pointer hover:border-teal-500 transition"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Monthly Revenue" 
            subtitle="Revenue performance over the year"
          >
            <div className="h-64 flex items-end justify-around bg-gradient-to-b from-teal-50 to-white p-4 rounded-lg">
              {[45, 65, 55, 75, 85, 70, 60, 80, 75, 70, 85, 90].map((height, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-8 bg-teal-500 rounded-t-lg" style={{height: `${height * 2}px`}}></div>
                  <span className="text-xs text-gray-600">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">$10k</p>
          </ChartCard>

          <ChartCard 
            title="Trip Status" 
            subtitle="Distribution by status"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Completed</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-teal-500 h-2 rounded-full" style={{width: `${(stats.completedTrips / stats.trips * 100) || 0}%`}}></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Pending</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">1</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Cancelled</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: `${stats.cancellationRate}%`}}></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{stats.trips - stats.completedTrips}</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Agent Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Track individual agent performance and trends</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search agent by name or owner..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => {
          const stats = getAgentStats(agent)
          return (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(agent.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{agent.owner}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-xs font-semibold text-gray-900">{agent.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-5">
                <SmallStatCard 
                  title="Total Revenue" 
                  value={`$${stats.revenue}`}
                  icon="💰"
                  bgColor="bg-teal-100"
                />
                <SmallStatCard 
                  title="Total Trips" 
                  value={stats.trips}
                  icon="🚗"
                  bgColor="bg-orange-100"
                />
    
                <SmallStatCard 
                  title="Completed" 
                  value={stats.completedTrips}
                  icon="✓"
                  bgColor="bg-blue-100"
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button onClick={() => setSelectedAgent(agent)} className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition">
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No agents found matching your search.</p>
        </div>
      )}
    </div>
  )
}
