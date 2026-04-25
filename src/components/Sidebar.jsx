import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
  Plane,
  LayoutDashboard,
  Users,
  Hotel,
  Package,
  CreditCard,
  BarChart3
} from "lucide-react";

const MenuItem = ({icon, label, to}) => {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link to={to} className={`flex items-center justify-between menu-item px-4 py-0 rounded-xl cursor-pointer transition ${
      isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 bg-opacity-50' : 'hover:bg-teal-800 hover:bg-opacity-30'
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className={`text-lg font-medium ${isActive ? 'text-amber-400' : 'text-teal-50'}`}>{label}</div>
      </div>
      {isActive && (
        <svg width="20" height="8" viewBox="0 0 5 2" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        </svg>
      )}
    </Link>
  )
}

export default function Sidebar(){
  return (
    <aside className="sidebar w-72 bg-teal-950 from-teal-900 to-teal-950 
text-teal-50 px-5 py-8 flex flex-col gap-8 min-h-screen">

      
      {/* Logo Section */}
<div className="flex items-center gap-4">
  
  {/* Icon Box */}
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
    <Plane className="text-white w-10 h-10" strokeWidth={2.5} />
  </div>

  {/* Text */}
  <div>
    <div className="font-bold text-3xl text-white leading-tight">
      TravelHub
    </div>
    <div className="text-lg text-teal-200">
      Dashboard
    </div>
  </div>

</div>


      {/* Navigation */}
      <nav className="flex flex-col gap-8 flex-1">
        <MenuItem icon={<LayoutDashboard size={26} />} label={'Dashboard'} to={'/'} />
        <MenuItem icon={<Users size={26} />} label={'Agent '} to={'/agents'} />
        <MenuItem icon={<Hotel size={26} />} label={'Hotel '} to={'/hotels'} />
        <MenuItem icon={<Package size={26} />} label={'Package '} to={'/packages'} />
        <MenuItem icon={<CreditCard size={26} />} label={'Payments'} to={'/payments'} />
        <MenuItem icon={<BarChart3 size={26} />} label={'Analytics'} to={'/analytics'} />
      </nav>

      {/* Footer */}
      <div className="text-xs text-teal-300 text-center">
        © {new Date().getFullYear()} Admin Portal
      </div>
    </aside>
  )
}
