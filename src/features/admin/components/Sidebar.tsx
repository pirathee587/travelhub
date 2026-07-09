import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Plane,
  LayoutDashboard,
  Users,
  Hotel,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { useModal } from './ModalContext'

const MenuItem = ({ icon, label, to, onClick }) => {
  const location = useLocation()
  const isActive = to ? location.pathname === to : false
  
  const content = (
    <div className="flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div className={`text-lg font-medium ${isActive ? 'text-amber-400' : 'text-teal-50'}`}>
        {label}
      </div>
    </div>
  )

  const activeClasses = "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
  const hoverClasses = "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:shadow-md transition-all duration-300"

  if (to) {
    return (
      <Link
        to={to}
        className={`flex items-center justify-between menu-item px-4 py-3 rounded-xl cursor-pointer ${
          isActive ? activeClasses : hoverClasses
        }`}
      >
        {content}
        {isActive && (
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
        )}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer w-full text-left ${hoverClasses}`}
    >
      {content}
    </button>
  )
}

export default function Sidebar() {
  const { showAdminProfile, showConfirm } = useModal()
  const { logout } = useAuth()

  const handleLogout = async () => {
    const ok = await showConfirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out of the admin portal?'
    })
    
    if (ok) {
      logout()
      window.location.href = '/'
    }
  }

  return (
    <aside className="sidebar w-72 bg-teal-950 text-teal-50 px-5 py-8 flex flex-col gap-8 h-screen sticky top-0 overflow-y-auto shadow-2xl">
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Plane className="text-white w-10 h-10" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-bold text-3xl text-white leading-tight">TravelHub</div>
          <div className="text-lg text-teal-200">Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 flex-1">
        <MenuItem icon={<LayoutDashboard size={24} />} label="Dashboard"  to="/admin"         />
        <MenuItem icon={<Users size={24} />}           label="Agency"     to="/admin/agents"   />
        <MenuItem icon={<Hotel size={24} />}           label="Hotels"     to="/admin/hotels"   />
        <MenuItem icon={<Package size={24} />}         label="Packages"   to="/admin/packages" />
        <MenuItem icon={<CreditCard size={24} />}      label="Payments"   to="/admin/payments" />
        <MenuItem icon={<BarChart3 size={24} />}       label="Analytics"  to="/admin/analytics"/>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3 border-t border-teal-900/50 pt-6 mt-auto">
        <MenuItem 
          icon={<Settings size={24} />} 
          label="Settings" 
          onClick={showAdminProfile} 
        />
        <MenuItem 
          icon={<LogOut size={24} />} 
          label="Log Out" 
          onClick={handleLogout}
        />
        
        <div className="text-xs text-teal-400 text-center mt-4 opacity-50">
          © {new Date().getFullYear()} Admin Portal
        </div>
      </div>
    </aside>
  )
}
