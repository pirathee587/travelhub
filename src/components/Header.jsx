import React, { useState } from 'react'
import { Note } from './ui/note'
import { Button } from './ui/button-1'
import AdminProfileDialog from './AdminProfileDialog'

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu]           = useState(false)

  // Default mock user
  const displayName = 'Admin User'

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-200 gap-6">

      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-900 rounded-lg flex items-center justify-center text-white font-bold text-base">AP</div>
        <div className="text-2xl font-bold text-gray-900">Admin Portal</div>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <div className="relative">
          <button
            className="text-gray-500 text-2xl hover:text-gray-700 transition relative"
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
          >
            🔔
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">5</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[26rem] bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col p-4 gap-3">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-1">Notifications (5)</h3>
              <Note type="cyan"    size="small" action={<Button size="tiny" type="primary">View</Button>}>New booking from John Doe.</Note>
              <Note type="success" size="small" action={<Button size="tiny" type="secondary">Accept</Button>}>Payment received for order <strong>#1234</strong>.</Note>
              <Note type="warning" size="small" action={<Button size="tiny" type="secondary">Retry</Button>}>API connection unstable. Attempting to reconnect...</Note>
              <Note type="error"   size="small" action={<Button size="tiny" type="error">Dismiss</Button>}>Failed to process payment for User #882.</Note>
              <button className="text-sm text-blue-600 hover:text-blue-800 text-center font-semibold mt-2 pt-2 border-t">Mark all as read</button>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            className="flex items-center gap-3 pl-4 border-l border-gray-200"
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
          >
            <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
            <span className="text-gray-400 text-lg">▼</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col p-1 animate-in fade-in zoom-in duration-200">
              <AdminProfileDialog />
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
