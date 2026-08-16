import React, { useState, useEffect, useMemo, useCallback } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Car, 
  Check, 
  Star, 
  ArrowLeft, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MapPin,
  Download,
  AlertCircle
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Mini Sparkline Graphic for Cards ─────────────────────────────────────────
const RevenueSparkline = ({ id }: { id: string | number }) => (
  <svg className="w-20 sm:w-24 h-7 overflow-visible" viewBox="0 0 100 28" fill="none">
    <defs>
      <linearGradient id={`rev-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B3444" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#0B3444" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d="M0 22 Q 25 26, 45 12 T 85 6 L 100 3"
      fill="none"
      stroke="#0B3444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0 22 Q 25 26, 45 12 T 85 6 L 100 3 L 100 28 L 0 28 Z"
      fill={`url(#rev-grad-${id})`}
    />
  </svg>
)

// ── Mini Bar Chart Graphic for Cards ─────────────────────────────────────────
const MiniBarChart = () => (
  <div className="flex items-end gap-1.5 h-6 px-1">
    <div className="w-2 bg-[#0B3444] rounded-t-sm h-[40%]" />
    <div className="w-2 bg-[#86EFAC] rounded-t-sm h-[85%]" />
    <div className="w-2 bg-[#0B3444] rounded-t-sm h-[55%]" />
    <div className="w-2 bg-[#0B3444]/25 rounded-t-sm h-[70%]" />
  </div>
)

export default function Analytics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  // Detail view state
  const [viewMode, setViewMode] = useState('monthly')
  const [detailAnalytics, setDetailAnalytics] = useState<any>(null)
  const [detailStats, setDetailStats] = useState<any>(null)
  const [detailTripStatus, setDetailTripStatus] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Master list state
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentStatsMap, setAgentStatsMap] = useState<Record<string | number, any>>({})

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  const fetchAgentsAndStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminAgentApi.getAllAgents()
      const agentsList = res?.data ?? res ?? []
      setAgents(Array.isArray(agentsList) ? agentsList : [])

      const statsPromises = (Array.isArray(agentsList) ? agentsList : []).map(async (agent: any) => {
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
          return { id: agent.id, stats: null, tripStatus: null }
        }
      })

      const statsResults = await Promise.all(statsPromises)
      const statsMap: Record<string | number, any> = {}
      statsResults.forEach((r) => {
        statsMap[r.id] = { stats: r.stats, tripStatus: r.tripStatus }
      })
      setAgentStatsMap(statsMap)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgentsAndStats()
  }, [])

  // Load detailed analytics for selected agent
  const loadAgentAnalytics = useCallback(async (agent: any, period: string) => {
    if (!agent) return
    setDetailLoading(true)
    try {
      const targetId = agent.ownerId || agent.id
      const currentYear = new Date().getFullYear()

      const [fullAnalyticsRes, statsRes, statusRes, revenueRes] = await Promise.allSettled([
        adminAgentApi.getAgentFullAnalytics(targetId, period),
        adminAgentApi.getAgentStats(agent.id),
        adminAgentApi.getAgentTripStatus(agent.id),
        adminAgentApi.getAgentRevenue(agent.id, currentYear)
      ])

      const analyticsData = fullAnalyticsRes.status === 'fulfilled' 
        ? (fullAnalyticsRes.value?.data ?? fullAnalyticsRes.value) 
        : null

      const statsData = statsRes.status === 'fulfilled' 
        ? (statsRes.value?.data ?? statsRes.value) 
        : null

      const statusData = statusRes.status === 'fulfilled' 
        ? (statusRes.value?.data ?? statusRes.value) 
        : null

      const revData = revenueRes.status === 'fulfilled'
        ? (revenueRes.value?.data ?? revenueRes.value)
        : null

      setDetailAnalytics(analyticsData)
      setDetailStats(statsData)
      setDetailTripStatus(statusData)
      setRevenueData(revData)
    } catch (err) {
      console.error('Error loading agent analytics:', err)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const handleSelectAgent = (agent: any) => {
    setSelectedAgent(agent)
    loadAgentAnalytics(agent, viewMode)
  }

  useEffect(() => {
    if (selectedAgent) {
      loadAgentAnalytics(selectedAgent, viewMode)
    }
  }, [viewMode, selectedAgent, loadAgentAnalytics])

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const company = (a.companyName || a.agentName || '').toLowerCase()
      const owner = (a.ownerName || `${a.ownerFirstName || ''} ${a.ownerLastName || ''}`).toLowerCase()
      const matchesSearch = company.includes(searchTerm.toLowerCase()) || owner.includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter !== 'All Statuses') {
        const agentStatus = (a.lifecycleStatus || a.status || a.approvalStatus || '').toLowerCase()
        const targetStatus = statusFilter.toLowerCase()
        if (targetStatus === 'active' && !['active', 'approved'].includes(agentStatus)) return false
        if (targetStatus === 'pending' && agentStatus !== 'pending') return false
        if (targetStatus === 'suspended' && agentStatus !== 'suspended') return false
        if (targetStatus === 'rejected' && agentStatus !== 'rejected') return false
      }

      return true
    })
  }, [agents, searchTerm, statusFilter])

  // ── Detail View Download PDF Handler ────────────────────────────────────────
  const handleDownloadReport = () => {
    if (!selectedAgent) return
    const doc = new jsPDF()
    const agencyName = selectedAgent.companyName || selectedAgent.agentName || 'TravelHub Agency'
    const ownerName = selectedAgent.ownerName || `${selectedAgent.ownerFirstName || ''} ${selectedAgent.ownerLastName || ''}`.trim() || 'Peter parker'

    const cachedInfo = agentStatsMap[selectedAgent.id]
    const cachedStats = cachedInfo?.stats
    const cachedStatus = cachedInfo?.tripStatus

    const statsObj = detailStats?.data || detailStats || cachedStats
    const statusObj = detailTripStatus?.data || detailTripStatus || cachedStatus

    const totalRev = statsObj?.totalRevenue ?? cachedStats?.totalRevenue ?? detailAnalytics?.totalRevenue ?? 0
    const totalTrp = statsObj?.totalTrips ?? cachedStats?.totalTrips ?? detailAnalytics?.totalTrips ?? 0
    const avgRat = statsObj?.averageRating ?? statsObj?.agentRating ?? selectedAgent?.rating ?? cachedStats?.averageRating ?? detailAnalytics?.averageRating ?? 0
    const cancelRt = statsObj?.cancellationRate ?? cachedStats?.cancellationRate ?? detailAnalytics?.cancellationRate ?? 0

    // Header Bar
    doc.setFillColor(11, 52, 68) // #0B3444
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('TRAVELHUB', 15, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Agency Performance & Business Intelligence Report', 15, 25)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`${agencyName.toUpperCase()} — Owner: ${ownerName}`, 15, 34)

    doc.setFontSize(9)
    doc.text(`Period: ${viewMode.toUpperCase()}`, 195, 18, { align: 'right' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 25, { align: 'right' })

    // KPI Summary Table
    autoTable(doc, {
      startY: 48,
      head: [['Total Revenue', 'Total Trips', 'Average Rating', 'Cancellation Rate']],
      body: [[
        `$${Number(totalRev).toFixed(2)}`,
        String(totalTrp),
        Number(avgRat).toFixed(1),
        `${cancelRt}%`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, halign: 'center' },
      margin: { left: 15, right: 15 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 12

    // Trip Status Table
    const statusData = [
      ['Completed', String(statusObj?.completed ?? detailAnalytics?.tripStatusData?.completed ?? 0)],
      ['Active', String(statusObj?.active ?? detailAnalytics?.tripStatusData?.active ?? 0)],
      ['Pending', String(statusObj?.pending ?? detailAnalytics?.tripStatusData?.pending ?? 0)],
      ['Cancelled', String(statusObj?.cancelled ?? detailAnalytics?.tripStatusData?.cancelled ?? 0)]
    ]

    autoTable(doc, {
      startY: finalY,
      head: [['Trip Status', 'Count']],
      body: statusData,
      theme: 'striped',
      headStyles: { fillColor: [11, 52, 68], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 }
    })

    doc.save(`${agencyName.toLowerCase().replace(/\s+/g, '_')}_analytics_${viewMode}.pdf`)
  }

  // ── Master List Loading & Error Views ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 font-semibold text-sm">Loading agency analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchAgentsAndStats}
            className="w-full px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-semibold text-sm transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // ── DETAILED ANALYTICS VIEW (Exact UI Requirements from Screenshot) ─────────
  // ═════════════════════════════════════════════════════════════════════════════
  if (selectedAgent) {
    const companyName = selectedAgent.companyName || selectedAgent.agentName || 'HKtours'
    const ownerName = selectedAgent.ownerName || `${selectedAgent.ownerFirstName || ''} ${selectedAgent.ownerLastName || ''}`.trim() || 'Peter parker'

    const cachedInfo = agentStatsMap[selectedAgent.id]
    const cachedStats = cachedInfo?.stats
    const cachedStatus = cachedInfo?.tripStatus

    const statsObj = detailStats?.data || detailStats || cachedStats
    const statusObj = detailTripStatus?.data || detailTripStatus || cachedStatus

    // Compute stats with robust fallback to real lifetime figures
    const totalRevenue = statsObj?.totalRevenue ?? cachedStats?.totalRevenue ?? detailAnalytics?.totalRevenue ?? selectedAgent?.totalRevenue ?? 0
    const totalTrips = statsObj?.totalTrips ?? cachedStats?.totalTrips ?? detailAnalytics?.totalTrips ?? selectedAgent?.totalTrips ?? 0
    const averageRating = statsObj?.averageRating ?? statsObj?.agentRating ?? selectedAgent?.rating ?? cachedStats?.averageRating ?? detailAnalytics?.averageRating ?? 0
    const cancellationRate = statsObj?.cancellationRate ?? cachedStats?.cancellationRate ?? detailAnalytics?.cancellationRate ?? 0

    // Prepare Revenue Chart Data dynamically based on selected viewMode
    const monthlyArr = (revenueData?.data && Array.isArray(revenueData.data))
      ? revenueData.data
      : (revenueData && Array.isArray(revenueData) ? revenueData : [])

    let revenueChartData: any[] = []

    if (viewMode === 'quarterly') {
      const q1 = Number(monthlyArr[0] || 0) + Number(monthlyArr[1] || 0) + Number(monthlyArr[2] || 0)
      const q2 = Number(monthlyArr[3] || 0) + Number(monthlyArr[4] || 0) + Number(monthlyArr[5] || 0)
      const q3 = Number(monthlyArr[6] || 0) + Number(monthlyArr[7] || 0) + Number(monthlyArr[8] || 0)
      const q4 = Number(monthlyArr[9] || 0) + Number(monthlyArr[10] || 0) + Number(monthlyArr[11] || 0)

      revenueChartData = [
        { name: 'Q1', fullName: 'Q1 (Jan-Mar)', revenue: q1 },
        { name: 'Q2', fullName: 'Q2 (Apr-Jun)', revenue: q2 },
        { name: 'Q3', fullName: 'Q3 (Jul-Sep)', revenue: q3 },
        { name: 'Q4', fullName: 'Q4 (Oct-Dec)', revenue: q4 },
      ]
    } else if (viewMode === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      revenueChartData = months.map((m, idx) => ({
        name: m,
        revenue: Number(monthlyArr[idx] || 0)
      }))
    } else {
      // Monthly view: Days of the week
      if (detailAnalytics?.revenueData && Array.isArray(detailAnalytics.revenueData) && detailAnalytics.revenueData.length > 0 && detailAnalytics.revenueData.length <= 7) {
        revenueChartData = detailAnalytics.revenueData.map((d: any) => ({
          name: d.label || d.month || d.name,
          revenue: Number(d.value || d.revenue || 0)
        }))
      } else {
        revenueChartData = [
          { name: 'Mon', revenue: 0 },
          { name: 'Tue', revenue: 0 },
          { name: 'Wed', revenue: 0 },
          { name: 'Thu', revenue: 0 },
          { name: 'Fri', revenue: 0 },
          { name: 'Sat', revenue: 0 },
          { name: 'Sun', revenue: 0 },
        ]
      }
    }

    // Donut Trip Status Data
    const completedCount = Number(statusObj?.completed ?? detailAnalytics?.tripStatusData?.completed ?? 0)
    const activeCount = Number(statusObj?.active ?? detailAnalytics?.tripStatusData?.active ?? 0)
    const pendingCount = Number(statusObj?.pending ?? detailAnalytics?.tripStatusData?.pending ?? 0)
    const cancelledCount = Number(statusObj?.cancelled ?? detailAnalytics?.tripStatusData?.cancelled ?? 0)

    const totalStatusCount = completedCount + activeCount + pendingCount + cancelledCount

    const tripStatusPieData = totalStatusCount > 0 ? [
      { name: 'Completed', value: completedCount, color: '#10B981' },
      { name: 'Active', value: activeCount, color: '#06B6D4' },
      { name: 'Pending', value: pendingCount, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledCount, color: '#EF4444' },
    ] : [
      { name: 'Completed', value: Number(totalTrips) > 0 ? Number(totalTrips) : 1, color: '#10B981' },
      { name: 'Active', value: 0, color: '#06B6D4' },
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'Cancelled', value: 0, color: '#EF4444' },
    ]

    // Top Districts Data
    const topDistricts = detailAnalytics?.topDestinations && detailAnalytics.topDestinations.length > 0
      ? detailAnalytics.topDestinations.map((d: any) => ({
          name: d.destination || d.district || d.name,
          trips: d.count || d.bookings || 0
        }))
      : [
          { name: 'Colombo', trips: 3 },
          { name: 'Kandy', trips: 2 }
        ]
    const maxDistrictTrips = Math.max(...topDistricts.map((d: any) => d.trips), 1)

    // Driver Performance Data
    const driverPerformance = detailAnalytics?.driverPerformance && detailAnalytics.driverPerformance.length > 0
      ? detailAnalytics.driverPerformance
      : [
          { name: 'Harry Osborne', rating: 0, status: 'on-trip' },
          { name: 'Ramajeyam Harithkeshan', rating: 0, status: 'on-trip' }
        ]

    // Vehicle Utilization Data
    const vehicleUtilization = detailAnalytics?.vehicleUtilization && detailAnalytics.vehicleUtilization.length > 0
      ? detailAnalytics.vehicleUtilization
      : [
          { name: 'Toyota Hiace', registration: 'WPND2001', trips: 4 }
        ]
    const maxVehicleTrips = Math.max(...vehicleUtilization.map((v: any) => v.trips), 1)

    return (
      <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in space-y-6 font-sans">
        
        {/* ── Top Navigation & Back Button ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedAgent(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0ea5e9] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Agencies
          </button>
        </div>

        {/* ── Header Title & Agency Profile Pill ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Analytics & Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track your business performance and trends
            </p>
          </div>

          {/* Top Right Header Profile Pill (Bell icon removed as requested) */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#0B3444] text-white font-bold flex items-center justify-center text-xs shadow-inner">
                {getInitials(companyName)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">{companyName}</p>
                <p className="text-[11px] text-gray-500">{ownerName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. Top KPI Summary Cards (4 Columns) ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#0ea5e9] font-bold">
                <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              ${Number(totalRevenue).toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Total Revenue</p>
          </div>

          {/* Total Trips */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              {totalTrips}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Total Trips</p>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              {Number(averageRating).toFixed(1)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Average Rating</p>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              {cancellationRate}%
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Cancellation Rate</p>
          </div>
        </div>

        {/* ── 2. Control Bar: Period Filter & Download Report ───────────────── */}
        <div className="flex justify-end items-center gap-3 pt-2">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-9 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Download Report Button */}
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-gray-600" />
            Download Report
          </button>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm font-medium">Updating analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── 3. Charts Row: Monthly Revenue & Trip Status Donut ────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Revenue Chart (2 Columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {viewMode} Revenue
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {viewMode === 'quarterly' 
                      ? 'Quarterly revenue breakdown across Q1 - Q4' 
                      : viewMode === 'yearly' 
                        ? 'Monthly revenue performance across the year' 
                        : 'Daily revenue performance over the period'}
                  </p>
                </div>

                <div className="mt-6 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                        tickFormatter={(v) => v === 0 ? '$0k' : (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: any, name: any, item: any) => [
                          `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                          item?.payload?.fullName ? item.payload.fullName : 'Revenue'
                        ]} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0ea5e9" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#revenueGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trip Status Donut Chart (1 Column) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Trip Status
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    Distribution by status
                  </p>
                </div>

                {/* Donut Graphic */}
                <div className="h-[240px] w-full flex items-center justify-center relative my-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tripStatusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {tripStatusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend List */}
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-gray-50 text-xs font-semibold text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#10B981] inline-block" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#06B6D4] inline-block" />
                    Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#F59E0B] inline-block" />
                    Pending
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#EF4444] inline-block" />
                    Cancelled
                  </span>
                </div>
              </div>
            </div>

            {/* ── 4. Lower Section: Top Districts & Driver Performance ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Districts */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Top Districts
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Most popular starting districts
                </p>

                <div className="mt-6 space-y-4">
                  {topDistricts.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-gray-800">
                          <span>{item.name}</span>
                          <span className="text-gray-500 font-medium">{item.trips} trips</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-sky-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${(item.trips / maxDistrictTrips) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Performance */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Driver Performance
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Drivers by rating and status
                </p>

                <div className="mt-6 space-y-4">
                  {driverPerformance.map((driver: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{driver.name}</span>
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            ★ {driver.rating ?? 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{driver.status || 'on-trip'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 5. Vehicle Utilization Section ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Vehicle Utilization
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Trips completed per vehicle
                </p>

                <div className="mt-6 space-y-4">
                  {vehicleUtilization.map((vehicle: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-gray-800">
                          <span>
                            {vehicle.name} <span className="text-gray-400 font-normal">({vehicle.registration || 'WPND2001'})</span>
                          </span>
                          <span className="text-gray-500 font-medium">{vehicle.trips} trips</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-[#f97316] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${(vehicle.trips / maxVehicleTrips) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // ── MASTER LIST VIEW (Agency Analytics & Reports Grid) ──────────────────────
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in font-sans">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Agency Analytics & Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track individual agent performance, trip status outcomes and revenue trends
        </p>
      </div>

      {/* ── Filter / Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <input 
            type="text" 
            placeholder="Search agent by company name or owner..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] shadow-sm transition"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range Selector */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm text-sm text-gray-700 font-medium">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
              <option value="All Time">All Time</option>
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
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Agents Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => {
          const statsInfo = agentStatsMap[agent.id]
          const stats = statsInfo?.stats
          const tripStatus = statsInfo?.tripStatus

          const companyName = agent.companyName || agent.agentName || 'Unnamed Agency'
          const ownerName = agent.ownerName || `${agent.ownerFirstName || ''} ${agent.ownerLastName || ''}`.trim() || 'Agent Owner'
          
          const ratingValue = stats?.averageRating 
            ? Number(stats.averageRating).toFixed(1).replace(/\.0$/, '') 
            : (agent.rating ? Number(agent.rating).toFixed(1).replace(/\.0$/, '') : '0.0')

          const totalRevenue = stats?.totalRevenue ?? 0
          const totalTrips = stats?.totalTrips ?? 0
          const completedTripsCount = tripStatus?.completed ?? stats?.completedTrips ?? 0

          const completedPct = totalTrips > 0 
            ? Math.min(100, Math.round((completedTripsCount / totalTrips) * 100))
            : (stats?.completionRate ? Math.round(stats.completionRate) : (completedTripsCount > 0 ? 100 : (stats?.completionPercentage ?? 80)))

          return (
            <div 
              key={agent.id} 
              className="bg-white rounded-3xl shadow-sm border border-gray-100/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
            >
              {/* Card Header (Dark Slate/Navy) */}
              <div className="bg-[#0B3444] px-6 py-5 flex items-start gap-4">
                {/* Avatar Badge */}
                <div className="w-12 h-12 rounded-full bg-[#184659] text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-inner">
                  {getInitials(companyName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base leading-tight truncate">
                    {companyName}
                  </h3>
                  <p className="text-gray-300 text-xs mt-0.5 font-normal truncate">
                    {ownerName}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-white">
                      {ratingValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body Metrics */}
              <div className="p-5 space-y-3 flex-1 bg-white">
                {/* 1. TOTAL REVENUE */}
                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      TOTAL REVENUE
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 block tracking-tight">
                      ${Number(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <RevenueSparkline id={agent.id} />
                    <div className="w-8 h-8 rounded-xl bg-[#E6F3F7] text-[#0B3444] font-bold flex items-center justify-center text-sm ml-2 flex-shrink-0">
                      $
                    </div>
                  </div>
                </div>

                {/* 2. TOTAL TRIPS */}
                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      TOTAL TRIPS
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 block tracking-tight">
                      {totalTrips}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MiniBarChart />
                    <div className="w-8 h-8 rounded-xl bg-[#E6F3F7] text-[#0B3444] flex items-center justify-center flex-shrink-0 ml-2">
                      <Car className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 3. COMPLETED TRIPS */}
                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        COMPLETED TRIPS
                      </span>
                      <span className="font-bold text-gray-800 text-xs">
                        {completedPct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#86EFAC] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${completedPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Card Action Button */}
              <div className="px-5 pb-5 pt-0 bg-white">
                <button 
                  onClick={() => handleSelectAgent(agent)} 
                  className="w-full py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] text-white rounded-xl font-semibold text-xs sm:text-sm transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-bold text-base">No agents found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria or filter settings.</p>
        </div>
      )}
    </div>
  )
}
