import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminUserApi from '../services/adminUserApi'
import { useModal } from '../components/ModalContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES = ['ALL', 'TOURIST', 'AGENT', 'HOTEL_OWNER', 'ADMIN']
const TABS  = ['All Users', 'Pending Agents']

const ROLE_STYLES = {
  TOURIST:     'bg-teal-100 text-teal-700',
  AGENT:       'bg-blue-100 text-blue-700',
  HOTEL_OWNER: 'bg-purple-100 text-purple-700',
  ADMIN:       'bg-red-100 text-red-700',
}
const ROLE_LABELS = {
  TOURIST:     'Tourist',
  AGENT:       'Agent',
  HOTEL_OWNER: 'Hotel Owner',
  ADMIN:       'Admin',
}

// ── Helper ────────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

const fmtDate = (str) => {
  if (!str) return '—'
  try { return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return str }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Skeleton = () => (
  <tr className="border-b border-gray-100">
    {[140, 200, 100, 90, 80, 160].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
)

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
    active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
)

const AgentBadge = ({ approved }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
    approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
  }`}>
    {approved ? '✓ Approved' : '⏳ Pending'}
  </span>
)

const Avatar = ({ name }) => {
  const colors = [
    'bg-teal-500','bg-blue-500','bg-purple-500',
    'bg-orange-500','bg-pink-500','bg-emerald-500',
  ]
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  )
}

// ── User Detail Drawer ────────────────────────────────────────────────────────
const UserDrawer = ({ user, onClose, onApprove, onReject, onToggle, onDelete, loading }) => {
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">✕</button>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {initials(user.name)}
            </div>
            <div>
              <div className="text-xl font-bold">{user.name}</div>
              <div className="text-teal-100 text-sm mt-0.5">{user.email}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
                <StatusBadge active={user.isActive} />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex-1 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">User ID</div>
              <div className="text-gray-900 font-semibold mt-1">#{user.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</div>
              <div className="text-gray-900 font-semibold mt-1">{user.telephone || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Joined</div>
              <div className="text-gray-900 font-semibold mt-1">{fmtDate(user.createdAt)}</div>
            </div>
            {user.role === 'AGENT' && (
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Agent Status</div>
                <div className="mt-1"><AgentBadge approved={user.agentApproved} /></div>
              </div>
            )}
          </div>

          {/* Actions */}
          {user.role !== 'ADMIN' && (
            <div className="space-y-3 pt-2">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Actions</div>

              <button
                onClick={() => onToggle(user)}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                  user.isActive
                    ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                } disabled:opacity-60`}
              >
                {user.isActive ? '🔒 Deactivate Account' : '🔓 Activate Account'}
              </button>

              {user.role === 'AGENT' && !user.agentApproved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(user)}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-60"
                  >
                    ✓ Approve Agent
                  </button>
                  <button
                    onClick={() => onReject(user)}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60"
                  >
                    ✕ Reject Agent
                  </button>
                </div>
              )}

              {user.role === 'AGENT' && user.agentApproved && (
                <button
                  onClick={() => onReject(user)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-60"
                >
                  ✕ Revoke Agent Approval
                </button>
              )}

              <button
                onClick={() => onDelete(user)}
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition disabled:opacity-60"
              >
                🗑 Delete User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Users() {
  const modal = useModal()

  const [tab, setTab]                   = useState(0)          // 0=All, 1=Pending
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('ALL')
  const [selectedUser, setSelectedUser] = useState(null)
  const searchTimer                     = useRef(null)

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (keyword = '', role = 'ALL', pendingOnly = false) => {
    try {
      setLoading(true)
      setError(null)
      let res

      if (pendingOnly) {
        res = await adminUserApi.getPendingAgents()
      } else if (keyword.trim()) {
        res = await adminUserApi.searchUsers(keyword.trim())
      } else if (role !== 'ALL') {
        res = await adminUserApi.getUsersByRole(role)
      } else {
        res = await adminUserApi.getAllUsers()
      }

      setUsers(res?.data ?? res ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial + tab change
  useEffect(() => {
    setSearch('')
    setRoleFilter('ALL')
    fetchUsers('', 'ALL', tab === 1)
  }, [tab, fetchUsers])

  // Debounced search
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      fetchUsers(val, roleFilter, tab === 1)
    }, 400)
  }

  // Role filter
  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    fetchUsers(search, role, false)
    setTab(0)
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  const refreshUser = async (id) => {
    try {
      const res = await adminUserApi.getUserById(id)
      const updated = res?.data ?? res
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
      setSelectedUser(updated)
    } catch { /* ignore */ }
  }

  const handleToggle = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate'
    const ok = await modal.showConfirm({
      title:   `${user.isActive ? 'Deactivate' : 'Activate'} Account`,
      message: `Are you sure you want to ${action} ${user.name}?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminUserApi.toggleUserActive(user.id)
      modal.addToast(`✅ ${user.name} has been ${action}d`)
      await refreshUser(user.id)
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Action failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (user) => {
    const ok = await modal.showConfirm({
      title:   'Approve Agent',
      message: `Approve ${user.name} as a verified agent?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminUserApi.approveAgent(user.id)
      modal.addToast(`✅ ${user.name} approved as agent`)
      await refreshUser(user.id)
      if (tab === 1) fetchUsers('', 'ALL', true)
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Approval failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (user) => {
    const ok = await modal.showConfirm({
      title:   'Reject Agent',
      message: `Reject agent approval for ${user.name}?`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminUserApi.rejectAgent(user.id, 'Rejected by admin')
      modal.addToast(`🚫 ${user.name} rejected`)
      await refreshUser(user.id)
      if (tab === 1) fetchUsers('', 'ALL', true)
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Rejection failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (user) => {
    const ok = await modal.showConfirm({
      title:   'Delete User',
      message: `This will permanently delete ${user.name}. This cannot be undone.`,
    })
    if (!ok) return
    try {
      setActionLoading(true)
      await adminUserApi.deleteUser(user.id)
      modal.addToast(`🗑 ${user.name} deleted`)
      setSelectedUser(null)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err) {
      modal.addToast(`❌ ${err?.response?.data?.message || 'Delete failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Filtered list (client-side badge filter when already fetched ALL) ────────
  const displayed = users

  // ── Counts ───────────────────────────────────────────────────────────────────
  const counts = {
    total:   users.length,
    agents:  users.filter(u => u.role === 'AGENT').length,
    pending: users.filter(u => u.role === 'AGENT' && !u.agentApproved).length,
    active:  users.filter(u => u.isActive).length,
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered users, agents, and hotel owners</p>
        </div>
        <button
          onClick={() => fetchUsers(search, roleFilter, tab === 1)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition self-start sm:self-auto"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',    value: counts.total,   icon: '👥', color: 'text-teal-600'   },
            { label: 'Active',         value: counts.active,  icon: '✅', color: 'text-emerald-600' },
            { label: 'Agents',         value: counts.agents,  icon: '🧭', color: 'text-blue-600'   },
            { label: 'Pending Agents', value: counts.pending, icon: '⏳', color: 'text-orange-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm w-fit">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
              tab === i
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t}
            {i === 1 && counts.pending > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{counts.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
        </div>

        {/* Role filter — only on All Users tab */}
        {tab === 0 && (
          <div className="flex gap-1 flex-wrap">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => handleRoleFilter(r)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  roleFilter === r
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : ROLE_LABELS[r] ?? r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-semibold text-red-700">Failed to load users</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchUsers(search, roleFilter, tab === 1)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                : displayed.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <div className="text-4xl mb-3">👤</div>
                        <div className="font-medium">No users found</div>
                        <div className="text-xs mt-1">Try a different search or filter</div>
                      </td>
                    </tr>
                  )
                  : displayed.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-400">#{user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-gray-600">{user.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          {user.role === 'AGENT' ? (
                            <AgentBadge approved={user.agentApproved} />
                          ) : (
                            <StatusBadge active={user.isActive} />
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {fmtDate(user.createdAt)}
                      </td>

                      {/* Quick Actions */}
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-100 transition"
                          >
                            View
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleToggle(user)}
                              disabled={actionLoading}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60 ${
                                user.isActive
                                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {user.isActive ? 'Block' : 'Unblock'}
                            </button>
                          )}
                          {user.role === 'AGENT' && !user.agentApproved && (
                            <button
                              onClick={() => handleApprove(user)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition disabled:opacity-60"
                            >
                              Approve
                            </button>
                          )}
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-60"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && displayed.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{displayed.length}</span> user{displayed.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── User Detail Drawer ───────────────────────────────────────────────── */}
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggle={handleToggle}
        onDelete={handleDelete}
        loading={actionLoading}
      />
    </div>
  )
}
