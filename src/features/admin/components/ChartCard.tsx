import React from 'react'

export default function ChartCard({title}){
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 m-0">{title}</h3>
        <div className="text-sm text-gray-400">Last 6 months</div>
      </div>
      <div className="h-56 flex items-center justify-center text-gray-400 text-base mt-4 rounded bg-gray-50">Chart placeholder (Chart.js)</div>
    </div>
  )
}
