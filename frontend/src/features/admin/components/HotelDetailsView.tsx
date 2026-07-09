import React, { useState } from 'react'
import { mockPackages } from '../services/mock-data'

export default function HotelDetailsView({ hotel, onClose, showClose = true }) {
  const [showNIC, setShowNIC] = useState(false)

  if (!hotel) return null

  // Get packages for this hotel
  const hotelPackages = mockPackages.filter(pkg =>
    pkg.dest.toLowerCase().includes(hotel.district.toLowerCase())
  )

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
          <p className="text-sm text-gray-600 mt-1">⭐ {hotel.rating} / 5.0</p>
        </div>
        {showClose && onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">✕</button>
        )}
      </div>

      <div className="space-y-6">
        {/* Hotel Image */}
        {hotel.image && (
          <div className="rounded-lg overflow-hidden">
            <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Location Info */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <h4 className="font-bold text-gray-900 mb-3">Location Details</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 font-semibold">Place / District</label>
              <div className="text-sm font-semibold text-gray-900">📍 {hotel.district}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-semibold">Number of Rooms</label>
              <div className="text-sm font-semibold text-gray-900">🛏️ {hotel.rooms} rooms</div>
            </div>
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <div>
                <label className="text-xs text-gray-600 font-semibold">Room Types</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hotel.roomTypes.map((rt, i) => (
                    <div key={i} className="p-2 bg-white rounded border border-gray-100">
                      <div className="font-semibold text-gray-900">{rt.name}</div>
                      <div className="text-xs text-gray-600">{rt.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-3">Owner Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 font-semibold">Owner Name</label>
              <div className="text-sm font-semibold text-gray-900">{hotel.ownerName}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-semibold">Email</label>
              <div className="text-sm font-semibold text-gray-900 break-all">{hotel.email}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-semibold">NIC Number</label>
              <div className="text-sm font-semibold text-gray-900">{hotel.nicNumber}</div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 font-semibold">Phone Number</label>
              <div className="text-sm font-semibold text-gray-900">
                <a href={`tel:${hotel.phone}`} className="text-teal-600 hover:underline">{hotel.phone}</a>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-semibold">Hotline Number</label>
              <div className="text-sm font-semibold text-gray-900">
                <a href={`tel:${hotel.hotline}`} className="text-teal-600 hover:underline">{hotel.hotline}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-bold text-gray-900 mb-3">Amenities & Facilities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, idx) => (
                <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-bold text-gray-900 mb-3">Application Status</h4>
          <div className="text-sm">
            {hotel.isActive === false && hotel.status === 'Approved' ? (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                Suspended
              </span>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                hotel.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>{hotel.status}</span>
            )}
          </div>
        </div>

        {/* Hotel Packages - Only show if Approved */}
        {hotel.status === 'Approved' && hotelPackages.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-bold text-gray-900 mb-3">📦 Associated Packages</h4>
            <div className="space-y-3">
              {hotelPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-3 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{pkg.title}</p>
                      <p className="text-xs text-gray-600 mt-1">📍 {pkg.dest}</p>
                      <p className="text-xs text-gray-600">⏱️ {pkg.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">${pkg.price}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-1 ${
                        pkg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>{pkg.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Packages Message */}
        {hotel.status === 'Approved' && hotelPackages.length === 0 && (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">No packages associated with this hotel yet</p>
          </div>
        )}

        {/* NIC Document Viewer */}
        <button
          onClick={() => setShowNIC(true)}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
        >
          📄 View NIC Photocopy
        </button>

        {/* Suspend Button - Only show if Approved */}
        {hotel.status === 'Approved' && (
          <button className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition">
            🛑 Suspend Hotel
          </button>
        )}

        {showClose && onClose && (
          <button onClick={onClose} className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Close</button>
        )}
      </div>

      {/* NIC Photocopy Viewer Modal */}
      {showNIC && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-lg font-bold">NIC Photocopy - {hotel.ownerName}</h4>
              <button onClick={() => setShowNIC(false)} className="text-2xl hover:opacity-80">✕</button>
            </div>
            <div className="p-6 bg-gray-50 flex justify-center">
              <img src={hotel.nicPhotocopy} alt="NIC" className="max-w-full h-auto rounded shadow-lg" />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button onClick={() => setShowNIC(false)} className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400">Close</button>
              <a href={hotel.nicPhotocopy} download className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">⬇️ Download</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
