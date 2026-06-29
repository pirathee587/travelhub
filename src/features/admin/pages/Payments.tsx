import React, { useState, useEffect, useCallback } from 'react'
import adminPaymentApi from '../services/adminPaymentApi'
import { useModal } from '../components/ModalContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPES    = ['All', 'Payment', 'Refund']
const STATUSES = ['All', 'Completed', 'Pending']

const TYPE_STYLES = {
  Payment: 'bg-teal-100 text-teal-700',
  Refund:  'bg-orange-100 text-orange-700',
}
const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending:   'bg-orange-100 text-orange-700',
}

const fmtCurrency = (v) =>
  v != null ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'

const fmtDate = (s) => {
  try { return s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }
  catch { return '—' }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {[90, 100, 160, 140, 90, 110, 110].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-gray-100 rounded" style={{ width: w }} />
      </td>
    ))}
  </tr>
)

// ── Payment Drawer ────────────────────────────────────────────────────────────
const PaymentDrawer = ({ payment, onClose, onUpdateStatus, loading }) => {
  if (!payment) return null
  const { id, transactionId, bookingRef, bookingDate, touristName,
    agentName, type, amount, status } = payment

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-white relative ${type === 'Refund' ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 'bg-gradient-to-r from-teal-700 to-teal-500'}`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
          <div className="text-xs text-white/70 mt-1">Transaction</div>
          <div className="text-2xl font-bold mt-1">{transactionId}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20">
              {type === 'Payment' ? '↓ Payment' : '↑ Refund'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status === 'Completed' ? 'bg-emerald-400/30 text-emerald-100' : 'bg-orange-400/30 text-orange-100'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5 flex-1">
          {/* Amount */}
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <div className="text-xs text-gray-400 mb-1">Amount</div>
            <div className={`text-4xl font-bold ${type === 'Refund' ? 'text-orange-600' : 'text-teal-700'}`}>
              {type === 'Refund' ? '-' : '+'}{fmtCurrency(amount)}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Transaction ID', transactionId],
              ['Booking Ref',    bookingRef],
              ['Date',          fmtDate(bookingDate)],
              ['Tourist',       touristName],
              ['Agent',         agentName],
              ['Type',          type],
            ].map(([label, val], i) => val ? (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{val}</div>
              </div>
            ) : null)}
          </div>

          {/* Status Update */}
          <div className="space-y-2 pt-2">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Update Status</div>
            {status !== 'Completed' && (
              <button
                onClick={() => onUpdateStatus(payment, 'Completed')}
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-60"
              >
                ✓ Mark as Completed
              </button>
            )}
            {status !== 'Pending' && (
              <button
                onClick={() => onUpdateStatus(payment, 'Pending')}
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition disabled:opacity-60"
              >
                ⏳ Mark as Pending
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Payments() {
  const modal = useModal()

  const [payments, setPayments]           = useState([])
  const [stats, setStats]                 = useState(null)
  const [loading, setLoading]             = useState(true)
  const [statsLoading, setStatsLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState(null)
  const [typeFilter, setTypeFilter]       = useState('All')
  const [statusFilter, setStatusFilter]   = useState('All')
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState(null)

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await adminPaymentApi.getPaymentStats()
      setStats(res?.data ?? res)
    } catch { /* stats non-critical */ }
    finally { setStatsLoading(false) }
  }, [])

  // ── Fetch payments ────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async (type = 'All', status = 'All') => {
    try {
      setLoading(true); setError(null)
      const res = await adminPaymentApi.filterPayments({
        type:   type   !== 'All' ? type   : undefined,
        status: status !== 'All' ? status : undefined,
      })
      setPayments(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchPayments(typeFilter, statusFilter)
  }, [typeFilter, statusFilter, fetchStats, fetchPayments])

  // ── Update status ─────────────────────────────────────────────────────────
  const handleUpdateStatus = async (payment, newStatus) => {
    const ok = await modal.showConfirm({
      title:   'Update Payment Status',
      message: `Mark ${payment.transactionId} as "${newStatus}"?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      const res = await adminPaymentApi.updatePaymentStatus(payment.id, newStatus)
      const updated = res?.data ?? res
      modal.addToast(`✅ ${payment.transactionId} marked as ${newStatus}`)
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: newStatus } : p))
      setSelected(updated)
      fetchStats()
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Update failed'}`)
    } finally { setActionLoading(false) }
  }

  // ── Client-side search ────────────────────────────────────────────────────
  const displayed = payments.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.transactionId?.toLowerCase().includes(q) ||
      p.bookingRef?.toLowerCase().includes(q) ||
      p.touristName?.toLowerCase().includes(q) ||
      p.agentName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Payments</h1>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Revenue',
            value: fmtCurrency(stats?.totalRevenue),
            subtext: '+18% from last month',
            subColor: 'text-emerald-500',
            icon: '💰',
            iconBg: 'bg-[#ccfbf1]'
          },
          {
            title: 'Pending Payments',
            value: fmtCurrency(stats?.pendingAmount),
            subtext: `${stats?.pendingCount ?? 0} transactions`,
            subColor: 'text-teal-500',
            icon: '📦',
            iconBg: 'bg-[#ffedd5]'
          },
          {
            title: 'Total Refunds',
            value: fmtCurrency(stats?.totalRefunds),
            subtext: '-5% from last month',
            subColor: 'text-red-500',
            icon: '📉',
            iconBg: 'bg-[#fce7f3]'
          },
          {
            title: 'All Payments',
            value: payments.length,
            subtext: 'total records',
            subColor: 'text-blue-500',
            icon: '📋',
            iconBg: 'bg-[#e0f2fe]'
          },
        ].map((c, i) => (
          <div key={i} className={`bg-white rounded-xl p-6 shadow-sm flex justify-between items-start border border-gray-100 ${statsLoading ? 'animate-pulse' : ''}`}>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">{c.title}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{statsLoading ? '...' : c.value}</div>
              <div className={`text-xs font-medium ${c.subColor}`}>{c.subtext}</div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.iconBg}`}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by transaction ID, booking, or tourist..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-32 px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 bg-white focus:outline-none"
            >
              {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-32 px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 bg-white focus:outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div><div className="font-semibold text-red-700">Failed to load payments</div><div className="text-sm text-red-600">{error}</div></div>
          </div>
          <button
            onClick={() => fetchPayments(typeFilter, statusFilter)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >Retry</button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Transaction ID', 'Booking', 'Tourist / Agency', 'Type', 'Amount', 'Status'].map(h => (
                  <th key={h} className="py-4 px-6 font-bold text-sm text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                : displayed.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <div className="text-4xl mb-3">💳</div>
                        <div className="font-medium">No payments found</div>
                        <div className="text-xs mt-1">Try a different filter or search</div>
                      </td>
                    </tr>
                  )
                  : displayed.map(p => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{p.transactionId}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{p.bookingRef || '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{fmtDate(p.bookingDate)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{p.touristName || '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.agentName || '—'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.type === 'Payment' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#ffedd5] text-[#ea580c]'}`}>
                          {p.type === 'Payment' ? '↓ Payment' : '↑ Refund'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{fmtCurrency(p.amount)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'Completed' ? 'bg-[#ccfbf1] text-[#0f766e]' : 'bg-[#fef0db] text-[#e37400]'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payment Drawer ───────────────────────────────────────────────────── */}
      {selected && (
        <PaymentDrawer
          payment={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
