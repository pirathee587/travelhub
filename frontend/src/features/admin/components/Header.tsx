import React, { useState, useEffect } from 'react'
import { useModal } from './ModalContext'
import { Settings, LogOut, Bell, Check, CheckCheck } from 'lucide-react'
import { useAdminNotifications } from '../hooks/useAdminNotifications'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu]           = useState(false)
  const { showAdminProfile, showConfirm } = useModal()
  const { logout } = useAuth()

  // ── Real notification data from backend ─────────────
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications()

  // Read real user info from localStorage (set on login)
  const [storedUser, setStoredUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('travelhub_user') || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setStoredUser(JSON.parse(localStorage.getItem('travelhub_user') || '{}'))
      } catch (e) {
        console.error('Error updating header user state:', e)
      }
    }
    window.addEventListener('user-profile-updated', handleUpdate)
    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate)
    }
  }, [])

  const displayName = storedUser?.name || 'Admin User'
  const displayRole = storedUser?.role ? storedUser.role.replace('ROLE_', '') : 'Super Admin'

  const handleLogout = async () => {
    setShowUserMenu(false)
    const ok = await showConfirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out?'
    })
    if (ok) {
      logout()
      window.location.href = '/'
    }
  }

  // Notification type → colour mapping
  const typeColor = {
    booking:              'bg-blue-100 text-blue-700',
    payment:              'bg-green-100 text-green-700',
    agent_registration:   'bg-purple-100 text-purple-700',
    hotel_registration:   'bg-orange-100 text-orange-700',
    package_registration: 'bg-teal-100 text-teal-700',
    review:               'bg-yellow-100 text-yellow-700',
    cancellation:         'bg-red-100 text-red-700',
    system:               'bg-gray-100 text-gray-700',
  }

  const handleMarkAsRead = async (id, isRead) => {
    if (!isRead) await markAsRead(id)
  }

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-200 gap-6">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-900 rounded-lg flex items-center justify-center text-white font-bold text-base">AP</div>
        <div className="text-2xl font-bold text-gray-900">Admin Portal</div>
      </div>

      <div className="flex items-center gap-5">
        {/* ── Notifications Bell ── */}
        <div className="relative">
          <button
            className="text-gray-500 hover:text-gray-700 transition relative p-2 rounded-lg hover:bg-gray-100"
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[26rem] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">
                  Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifLoading ? (
                  <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.read)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-blue-50/40' : ''}`}
                    >
                      <span className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${typeColor[n.type] || 'bg-gray-100 text-gray-600'}`}>
                        {n.type?.replace('_', ' ')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 truncate ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unread" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 mx-auto"
                  >
                    <Check size={12} /> Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Profile ── */}
        <div className="relative">
          <button
            className="flex items-center gap-3 pl-4 border-l border-gray-200"
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
          >
            {storedUser?.profileImage ? (
              <img 
                src={storedUser.profileImage} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="text-sm font-bold text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{displayRole}</div>
            </div>
            <span className="text-gray-400 text-lg">▼</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col p-1 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => { setShowUserMenu(false); showAdminProfile() }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left rounded-t-md"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-b-md"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
