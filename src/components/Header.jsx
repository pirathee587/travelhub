import React from 'react'

export default function Header(){
  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-200 gap-6">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-900 rounded-lg flex items-center justify-center text-white font-bold text-base">AP</div>
        <div className="text-2xl font-bold text-gray-900">Admin Portal</div>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center gap-5">
        {/* Dark Mode Toggle */}
        {/* Notifications */}
        <div className="relative">
          <button className="text-gray-500 text-2xl hover:text-gray-700 transition">🔔</button>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">5</span>
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='25' fill='%234F46E5'/%3E%3Cellipse cx='50' cy='85' rx='35' ry='20' fill='%234F46E5'/%3E%3C/svg%3E" alt="User" className="w-10 h-10 rounded-full" />
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">Super Admin</div>
          </div>
          <span className="text-gray-400 text-lg">▼</span>
        </button>
      </div>
    </header>
  )
}
