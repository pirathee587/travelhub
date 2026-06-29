import React from 'react'
import HotelDetailsView from './HotelDetailsView'

export default function HotelDetailsModal({ open, hotel, onClose }) {
  if (!open || !hotel) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <HotelDetailsView hotel={hotel} onClose={onClose} />
      </div>
    </div>
  )
}
