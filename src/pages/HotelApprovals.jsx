import React, { useState } from 'react'
import HotelActions from './_HotelActions'
import { mockHotels } from '../lib/mock-data'

export default function HotelApprovals(){
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredHotels = mockHotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || h.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">Hotel Approvals</h2>

      <div className="bg-white rounded-xl p-4 mb-6 flex gap-4">
        <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map(h => (
          <div key={h.id} className="bg-white rounded-xl overflow-hidden shadow-md">
            <img src={h.image} alt={h.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{h.name}</h3>
              <p className="text-gray-600 mt-1">{h.district} • {h.rooms} rooms</p>
              {h.status !== 'Pending' && (
                <p className="text-sm text-gray-600 mt-2">Rating: ⭐ {h.rating}</p>
              )}
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  h.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>{h.status}</span>
              </div>
              <div className="mt-4">
                <HotelActions hotel={h} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
