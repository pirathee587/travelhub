import React from 'react'

export default function StatsCard({title,value,change}){
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
      <div className="text-emerald-600 text-base mt-2 font-medium">{change}</div>
    </div>
  )
}
