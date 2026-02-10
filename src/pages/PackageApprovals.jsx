import React, { useState } from 'react'
import PackageActions from './_PackageActions'
import { mockPackages } from '../lib/mock-data'

export default function PackageApprovals(){
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredPackages = mockPackages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">Package Approvals</h2>

      <div className="bg-white rounded-xl p-4 mb-6 flex gap-4">
        <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map(p => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-md">
            <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Provider: <span className="font-semibold text-gray-900">{p.provider}</span></p>
              <p className="text-gray-600 mt-1">{p.dest} • {p.duration}</p>
              <p className="text-xl font-bold text-teal-600 mt-2">${p.price}</p>
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  p.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>{p.status}</span>
              </div>
              <div className="mt-4">
                <PackageActions pkg={p} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
