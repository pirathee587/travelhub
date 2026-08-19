import React, { useState, useEffect, useMemo, useCallback } from 'react'
import adminAgentApi from '../services/adminAgentApi'
import { useAdminCurrency } from '../hooks/AdminCurrencyContext'
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
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  X,
  ChevronRight
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
  Cell
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

const getInitials = (name = '') => {
  if (!name) return 'AA'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'AA'
}

// ── Mini Sparkline Graphic for Total Revenue ──────────────────────────────────
const RevenueSparkline = ({ id }: { id: string | number }) => (
  <svg className="w-16 sm:w-20 h-6 overflow-visible" viewBox="0 0 100 28" fill="none">
    <defs>
      <linearGradient id={`rev-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d="M0 22 Q 25 26, 45 12 T 85 6 L 100 3"
      fill="none"
      stroke="#0ea5e9"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0 22 Q 25 26, 45 12 T 85 6 L 100 3 L 100 28 L 0 28 Z"
      fill={`url(#rev-grad-${id})`}
    />
  </svg>
)

// ── Mini Bar Chart Graphic for Total Trips ────────────────────────────────────
const MiniBarChart = () => (
  <div className="flex items-end gap-1 h-5 px-1">
    <div className="w-1.5 bg-[#0ea5e9] rounded-t-sm h-[40%]" />
    <div className="w-1.5 bg-[#86EFAC] rounded-t-sm h-[85%]" />
    <div className="w-1.5 bg-[#0ea5e9] rounded-t-sm h-[55%]" />
    <div className="w-1.5 bg-[#0ea5e9]/30 rounded-t-sm h-[70%]" />
  </div>
)

// ── Agency Analytics Card (Matches Exact Requested Template & Data) ───────────
interface AgencyAnalyticsCardProps {
  agent: any
  index: number
  statsInfo: any
  onView: (agent: any) => void
}

const AgencyAnalyticsCard = ({ agent, index, statsInfo, onView }: AgencyAnalyticsCardProps) => {
  const { formatPrice, currencySymbol } = useAdminCurrency()
  const {
    id,
    companyName,
    agentName,
    ownerName,
    imageUrl,
    logoUrl,
    profileImage,
    rating,
    totalTrips: agentTotalTrips,
    totalRevenue: agentTotalRevenue,
    completedTrips: agentCompletedTrips
  } = agent

  const displayName = companyName || agentName || 'Travel Agency'
  const ownerDisplayName = ownerName || (agent.ownerFirstName ? `${agent.ownerFirstName} ${agent.ownerLastName || ''}`.trim() : agentName) || 'Agency Owner'

  const avatar = profileImage || imageUrl || logoUrl
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const avatarInitials = getInitials(displayName)

  const stats = statsInfo?.stats
  const tripStatus = statsInfo?.tripStatus

  const totalRevenue = stats?.totalRevenue ?? agentTotalRevenue ?? 0
  const totalTrips = stats?.totalTrips ?? agentTotalTrips ?? 0
  const completedTripsCount = tripStatus?.completed ?? stats?.completedTrips ?? agentCompletedTrips ?? 0

  const ratingValue = stats?.averageRating
    ? Number(stats.averageRating).toFixed(1)
    : (rating ? Number(rating).toFixed(1) : (agent.rating ? Number(agent.rating).toFixed(1) : '0.0'))

  const completedPct = totalTrips > 0
    ? Math.min(100, Math.round((completedTripsCount / totalTrips) * 100))
    : (stats?.completionRate ? Math.round(stats.completionRate) : 0)

  return (
    <div
      onClick={() => onView(agent)}
      className="group flex flex-col bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/60 transition-all duration-300 cursor-pointer h-full justify-between"
    >
      <div>
        {/* Top Header: Avatar + Info + Rating */}
        <div className="flex gap-3.5 items-start mb-4">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="h-14 w-14 rounded-2xl object-cover shadow-sm border border-gray-100 flex-shrink-0 bg-white"
              />
            ) : (
              <div
                className={`h-14 w-14 rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center font-black text-white text-lg bg-gradient-to-br ${gradient}`}
              >
                {avatarInitials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 leading-tight truncate group-hover:text-[#0ea5e9] transition-colors">
              {displayName}
            </h3>

            {ownerDisplayName && (
              <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                {ownerDisplayName}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-gray-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingValue}</span>
            </div>
          </div>
        </div>

        {/* ── 3 Exact Metric Blocks from User Request ─────────────────── */}
        <div className="space-y-2.5 mb-4">
          {/* 1. TOTAL REVENUE */}
          <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                TOTAL REVENUE
              </span>
              <span className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5 block tracking-tight">
                {formatPrice(totalRevenue, { showCents: false })}
              </span>
            </div>
            <div className="flex items-center">
              <RevenueSparkline id={id} />
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-[#0ea5e9] font-black flex items-center justify-center text-xs ml-2 flex-shrink-0">
                {currencySymbol}
              </div>
            </div>
          </div>

          {/* 2. TOTAL TRIPS */}
          <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                TOTAL TRIPS
              </span>
              <span className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5 block tracking-tight">
                {totalTrips}
              </span>
            </div>
            <div className="flex items-center">
              <MiniBarChart />
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-[#0ea5e9] flex items-center justify-center flex-shrink-0 ml-2">
                <Car className="w-3.5 h-3.5 text-[#0ea5e9]" />
              </div>
            </div>
          </div>

          {/* 3. COMPLETED TRIPS */}
          <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  COMPLETED TRIPS
                </span>
                <span className="font-extrabold text-gray-800 text-xs">
                  {completedPct}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#86EFAC] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completedPct}%` }}
                />
              </div>
            </div>
            <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
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
export default function Analytics() {
  const { formatPrice, convertPrice, currencySymbol, currency } = useAdminCurrency()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  // Detail view analytics state
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

  const fetchAgentsAndStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminAgentApi.getAllAgents()
      const agentsList = res?.data ?? res ?? []
      const list = Array.isArray(agentsList) ? agentsList : []
      setAgents(list)

      // Fetch live stats for all agents in parallel to populate agentStatsMap
      if (list.length > 0) {
        Promise.allSettled(
          list.map(async (a: any) => {
            const [statsRes, tripStatusRes] = await Promise.allSettled([
              adminAgentApi.getAgentStats(a.id),
              adminAgentApi.getAgentTripStatus(a.id)
            ])
            const stats = statsRes.status === 'fulfilled' ? (statsRes.value?.data ?? statsRes.value) : null
            const tripStatus = tripStatusRes.status === 'fulfilled' ? (tripStatusRes.value?.data ?? tripStatusRes.value) : null
            return { id: a.id, stats, tripStatus }
          })
        ).then(results => {
          const newMap: Record<string | number, any> = {}
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.id) {
              newMap[r.value.id] = { stats: r.value.stats, tripStatus: r.value.tripStatus }
            }
          })
          setAgentStatsMap(prev => ({ ...prev, ...newMap }))
        })
      }
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

      const [fullAnalyticsRes, statsRes, statusRes, revenueRes, detailRes] = await Promise.allSettled([
        adminAgentApi.getAgentFullAnalytics(targetId, period),
        adminAgentApi.getAgentStats(agent.id),
        adminAgentApi.getAgentTripStatus(agent.id),
        adminAgentApi.getAgentRevenue(agent.id, currentYear),
        adminAgentApi.getAgentDetail(agent.id)
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

      const fullAgentData = detailRes.status === 'fulfilled'
        ? (detailRes.value?.data ?? detailRes.value)
        : null

      if (fullAgentData) {
        setSelectedAgent((prev: any) => ({ ...prev, ...fullAgentData }))
      }

      setDetailAnalytics(analyticsData)
      setDetailStats(statsData)
      setDetailTripStatus(statusData)
      setRevenueData(revData)

      if (statsData || statusData) {
        setAgentStatsMap(prev => ({
          ...prev,
          [agent.id]: {
            stats: statsData || prev[agent.id]?.stats,
            tripStatus: statusData || prev[agent.id]?.tripStatus
          }
        }))
      }
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
  }, [viewMode, selectedAgent?.id, loadAgentAnalytics])

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const company = (a.companyName || a.agentName || '').toLowerCase()
      const owner = (a.ownerName || `${a.ownerFirstName || ''} ${a.ownerLastName || ''}`).toLowerCase()
      const matchesSearch = company.includes(searchTerm.toLowerCase()) || owner.includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter !== 'All Statuses') {
        const agentStatus = (a.lifecycleStatus || a.applicationStatus || a.status || '').toLowerCase()
        const targetStatus = statusFilter.toLowerCase()
        if (targetStatus === 'active' && !['active', 'approved'].includes(agentStatus)) return false
        if (targetStatus === 'pending' && agentStatus !== 'pending') return false
        if (targetStatus === 'suspended' && agentStatus !== 'suspended') return false
        if (targetStatus === 'rejected' && agentStatus !== 'rejected') return false
      }

      return true
    })
  }, [agents, searchTerm, statusFilter])

  // ── Download PDF Report ──────────────────────────────────────────────────────
  const handleDownloadReport = () => {
    if (!selectedAgent) return
    const doc = new jsPDF()
    const agencyName = selectedAgent.companyName || selectedAgent.agentName || 'TravelHub Agency'
    const ownerName = selectedAgent.ownerName || `${selectedAgent.ownerFirstName || ''} ${selectedAgent.ownerLastName || ''}`.trim() || 'Agent Owner'

    const cachedInfo = agentStatsMap[selectedAgent.id]
    const cachedStats = cachedInfo?.stats
    const cachedStatus = cachedInfo?.tripStatus

    const statsObj = detailStats?.data || detailStats || cachedStats
    const statusObj = detailTripStatus?.data || detailTripStatus || cachedStatus

    const totalRev = statsObj?.totalRevenue ?? selectedAgent?.totalRevenue ?? cachedStats?.totalRevenue ?? detailAnalytics?.totalRevenue ?? 0
    const totalTrp = statsObj?.totalTrips ?? selectedAgent?.totalTrips ?? cachedStats?.totalTrips ?? detailAnalytics?.totalTrips ?? 0
    const avgRat = statsObj?.averageRating ?? statsObj?.agentRating ?? selectedAgent?.rating ?? cachedStats?.averageRating ?? detailAnalytics?.averageRating ?? 0
    const cancelRt = statsObj?.cancellationRate ?? cachedStats?.cancellationRate ?? detailAnalytics?.cancellationRate ?? 0

    // Header Bar
    doc.setFillColor(14, 165, 233) // #0ea5e9 Light Blue
    doc.roundedRect(10, 8, 190, 36, 4, 4, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('TRAVELHUB', 18, 22)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text('Agency Performance & Business Intelligence Report', 18, 28)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text(`${agencyName.toUpperCase()} — Owner: ${ownerName}`, 18, 36)

    doc.setFontSize(8.5)
    doc.text(`Period: ${viewMode.toUpperCase()}`, 192, 21, { align: 'right' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 192, 27, { align: 'right' })

    // KPI Summary Table
    autoTable(doc, {
      startY: 48,
      head: [['Total Revenue', 'Total Trips', 'Average Rating', 'Cancellation Rate']],
      body: [[
        formatPrice(totalRev),
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
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 }
    })

    // Revenue Breakdown Table if available
    const monthlyArr = (revenueData?.data && Array.isArray(revenueData.data))
      ? revenueData.data
      : (revenueData && Array.isArray(revenueData) ? revenueData : [])

    if (monthlyArr.length > 0) {
      const revFinalY = (doc as any).lastAutoTable.finalY + 12
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const revRows = months.map((m, idx) => [m, formatPrice(Number(monthlyArr[idx] || 0))])

      autoTable(doc, {
        startY: revFinalY,
        head: [['Month', 'Revenue Generated']],
        body: revRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
        styles: { fontSize: 8.5 },
        margin: { left: 15, right: 15 }
      })
    }

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
  // ── DETAILED AGENCY ANALYTICS VIEW (Using Uploaded Template Layout) ─────────
  // ═════════════════════════════════════════════════════════════════════════════
  if (selectedAgent) {
    const companyName = selectedAgent.companyName || selectedAgent.agentName || 'Travel Agency'
    const ownerName = selectedAgent.ownerName || (selectedAgent.ownerFirstName ? `${selectedAgent.ownerFirstName} ${selectedAgent.ownerLastName || ''}`.trim() : selectedAgent.agentName) || 'Agent Owner'
    const avatarUrl = selectedAgent.profileImage || selectedAgent.imageUrl || selectedAgent.logoUrl
    const avatarInitials = getInitials(companyName)

    const isActive = selectedAgent.isActive === true
    const isApproved = String(selectedAgent.applicationStatus || selectedAgent.status || '').toLowerCase() === 'approved' || isActive
    const isPending = String(selectedAgent.applicationStatus || selectedAgent.status || '').toLowerCase() === 'pending'
    const isSuspended = selectedAgent.nicVerificationStatus === 'SUSPENDED' || (isActive === false && isApproved)

    const cachedInfo = agentStatsMap[selectedAgent.id]
    const cachedStats = cachedInfo?.stats
    const cachedStatus = cachedInfo?.tripStatus

    const statsObj = detailStats?.data || detailStats || cachedStats
    const statusObj = detailTripStatus?.data || detailTripStatus || cachedStatus

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
      const q1 = convertPrice(Number(monthlyArr[0] || 0) + Number(monthlyArr[1] || 0) + Number(monthlyArr[2] || 0))
      const q2 = convertPrice(Number(monthlyArr[3] || 0) + Number(monthlyArr[4] || 0) + Number(monthlyArr[5] || 0))
      const q3 = convertPrice(Number(monthlyArr[6] || 0) + Number(monthlyArr[7] || 0) + Number(monthlyArr[8] || 0))
      const q4 = convertPrice(Number(monthlyArr[9] || 0) + Number(monthlyArr[10] || 0) + Number(monthlyArr[11] || 0))

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
        revenue: convertPrice(Number(monthlyArr[idx] || 0))
      }))
    } else {
      if (detailAnalytics?.revenueData && Array.isArray(detailAnalytics.revenueData) && detailAnalytics.revenueData.length > 0 && detailAnalytics.revenueData.length <= 7) {
        revenueChartData = detailAnalytics.revenueData.map((d: any) => ({
          name: d.label || d.month || d.name,
          revenue: convertPrice(Number(d.value || d.revenue || 0))
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

    const tripStatusPieData = [
      { name: 'Completed', value: completedCount, color: '#10B981' },
      { name: 'Active', value: activeCount, color: '#06B6D4' },
      { name: 'Pending', value: pendingCount, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledCount, color: '#EF4444' },
    ]

    const pieDataToRender = totalStatusCount > 0
      ? tripStatusPieData.filter(d => d.value > 0)
      : [{ name: 'No Bookings', value: 1, color: '#E2E8F0' }]

    const vehicleUtilization = detailAnalytics?.vehicleUtilization && Array.isArray(detailAnalytics.vehicleUtilization) && detailAnalytics.vehicleUtilization.length > 0
      ? detailAnalytics.vehicleUtilization
      : []
    const maxVehicleTrips = vehicleUtilization.length > 0 ? Math.max(...vehicleUtilization.map((v: any) => v.trips || 0), 1) : 1

    return (
      <div className="max-w-[1600px] mx-auto p-6 sm:p-8 bg-gray-50 min-h-screen space-y-6 animate-fade-in pb-16 font-sans">
        {/* ── Top Bar Navigation & Download Report Button ─────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedAgent(null)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0ea5e9] transition font-semibold text-sm py-1 px-1 -ml-1 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Analytics & Reports
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            Download PDF Report
          </button>
        </div>

        {/* ── Hero Banner (Matching Exact Reference Template Layout) ─────── */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 shadow-md">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative px-8 py-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            {/* Avatar & Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={companyName}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg flex-shrink-0 bg-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-white text-[#0ea5e9] font-extrabold text-3xl shadow-lg flex items-center justify-center flex-shrink-0">
                  {avatarInitials}
                </div>
              )}

              <div className="min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white border border-white/30 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 shadow-sm">
                    {isActive ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        Active Partner
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

                  {selectedAgent.memberSince && (
                    <span className="bg-white/20 text-white border border-white/30 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Since {String(selectedAgent.memberSince).split('-')[0]}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white truncate">
                  {companyName}
                </h1>
                <p className="text-white/80 text-base font-medium mt-0.5">
                  by {ownerName}
                </p>

                {/* Location */}
                {(selectedAgent.location || selectedAgent.operatingDistricts) && (
                  <div className="flex items-center gap-1.5 text-white/75 text-sm mt-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{selectedAgent.location || selectedAgent.operatingDistricts}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Box in Hero */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 text-center flex-shrink-0 border border-white/20 min-w-[140px] shadow-sm">
              {Number(averageRating) > 0 ? (
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                  <span className="text-2xl font-extrabold text-white">{Number(averageRating).toFixed(1)}</span>
                </div>
              ) : (
                <p className="text-white text-base font-bold mb-0.5">No Rating Yet</p>
              )}
              <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">Rating</p>
            </div>
          </div>
        </section>

        {/* ── 1. Top KPI Summary Cards (4 Columns) ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-[#0ea5e9] font-bold">
                <DollarSign className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Total Revenue</p>
          </div>

          {/* Total Trips */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
              {totalTrips}
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Total Trips</p>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
              {Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : 'No Rating'}
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Average Rating</p>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <MapPin className="w-6 h-6 text-rose-500" />
              </div>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
              {cancellationRate}%
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Cancellation Rate</p>
          </div>
        </div>

        {/* ── 2. Control Bar: Period Filter ─────────────────────────────────── */}
        <div className="flex justify-between items-center pt-2 border-b border-gray-200 pb-3">
          <h3 className="text-lg font-bold text-gray-900">Analytics & Performance Breakdown</h3>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Period:</span>
            <div className="relative">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-1.5 pr-8 text-xs font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-xs font-medium">Updating analytics data…</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── 3. Charts Row: Revenue Trend & Trip Status Donut ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Area Chart (2 Columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-900 capitalize">
                    {viewMode} Revenue Trend
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {viewMode === 'quarterly'
                      ? 'Quarterly revenue breakdown across Q1 - Q4'
                      : viewMode === 'yearly'
                        ? 'Monthly revenue performance across the year'
                        : 'Daily revenue performance over the period'}
                  </p>
                </div>

                <div className="mt-6 h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
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
                        tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip
                        formatter={(val: any) => [
                          `${currencySymbol} ${Number(val).toLocaleString(undefined, {
                            minimumFractionDigits: currency === 'USD' ? 2 : 0,
                            maximumFractionDigits: currency === 'USD' ? 2 : 0,
                          })}`,
                          'Revenue',
                        ]}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trip Status Donut (1 Column) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    Trip Status Breakdown
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    All-time booking status distribution
                  </p>
                </div>

                <div className="h-[200px] w-full flex items-center justify-center my-3 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataToRender}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={totalStatusCount > 0 ? 4 : 0}
                        dataKey="value"
                      >
                        {pieDataToRender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      {totalStatusCount > 0 && <Tooltip />}
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900 leading-none">{totalStatusCount || totalTrips || 0}</span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">Total</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
                  {tripStatusPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-500 font-medium">{item.name}:</span>
                      <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 4. Vehicle Utilization Card ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
              <h4 className="text-base font-bold text-gray-900">
                Vehicle Utilization
              </h4>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                Trips completed per registered fleet vehicle
              </p>

              {vehicleUtilization.length === 0 ? (
                <div className="mt-4 p-6 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">No vehicle fleet utilization data recorded for this agency.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {vehicleUtilization.map((vehicle: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-sky-50 text-[#0ea5e9] font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-gray-800">
                          <span>
                            {vehicle.name} <span className="text-gray-400 font-normal">({vehicle.registration || 'Fleet'})</span>
                          </span>
                          <span className="text-gray-500 font-medium">{vehicle.trips} trips</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#0ea5e9] h-full rounded-full transition-all duration-500"
                            style={{ width: `${(vehicle.trips / maxVehicleTrips) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen animate-fade-in font-sans">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Agency Analytics & Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track individual agent performance, trip status outcomes, and revenue trends.
        </p>
      </div>

      {/* ── Filter / Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 mb-8">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by agency name, owner..."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAgents.map((agent, index) => {
          const statsInfo = agentStatsMap[agent.id]
          return (
            <AgencyAnalyticsCard
              key={agent.id}
              agent={agent}
              index={index}
              statsInfo={statsInfo}
              onView={handleSelectAgent}
            />
          )
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-bold text-base">No agencies found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria or filter settings.</p>
        </div>
      )}
    </div>
  )
}
