import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockHotels } from '../services/mock-data'
import HotelDetailsView from '../components/HotelDetailsView'

export default function HotelDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const hotelId = Number(id)
  const hotel = mockHotels.find(h => h.id === hotelId)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/hotels')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Back to Hotels
          </button>
        </div>

        {hotel ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <HotelDetailsView hotel={hotel} showClose={false} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Hotel not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
