import React, { useState } from 'react'

export default function PackageDetailsView({ pkg, onClose, showClose = true }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!pkg) return null

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % pkg.photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + pkg.photos.length) % pkg.photos.length)
  }

  return (
    <>
      <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Package Details</h2>
        {showClose && onClose && (
          <button
            onClick={onClose}
            className="text-white text-2xl font-bold hover:bg-teal-800 rounded-full p-2 transition w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-4xl font-bold text-gray-900">{pkg.title}</h3>
              <p className="text-gray-600 text-lg mt-2">📍 {pkg.dest}</p>
            </div>
            <div className="text-right">
              {pkg.basePriceAdult != null ? (
                <>
                  <div className="text-4xl font-bold text-teal-600">${pkg.basePriceAdult}</div>
                  <p className="text-gray-600 text-sm mt-1">per adult</p>
                  {pkg.basePriceChild != null && (
                    <p className="text-gray-500 text-sm mt-1">${pkg.basePriceChild} per child</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-teal-600">${pkg.priceFrom || pkg.price || '—'}</div>
                  <p className="text-gray-600 text-sm mt-1">per person</p>
                </>
              )}
            </div>
          </div>
        </div>

        {pkg.photos && pkg.photos.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Gallery</h4>
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={pkg.photos[currentPhotoIndex]}
                alt={`Package ${currentPhotoIndex + 1}`}
                className="w-full h-80 object-cover"
              />
              {pkg.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition"
                  >
                    ❮
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition"
                  >
                    ❯
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {currentPhotoIndex + 1} / {pkg.photos.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Duration</label>
            <p className="text-2xl font-bold text-gray-900 mt-2">📅 {pkg.duration}</p>
          </div>

          <div className="bg-green-50 p-5 rounded-xl border-2 border-green-200">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Provider</label>
            <p className="text-lg font-bold text-gray-900 mt-2">{pkg.provider}</p>
          </div>

          <div className="bg-orange-50 p-5 rounded-xl border-2 border-orange-200">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</label>
            <p
              className={`text-lg font-bold mt-2 ${
                pkg.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {pkg.status}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Description</h4>
          <p className="text-gray-700 text-base leading-relaxed bg-gray-50 p-5 rounded-xl">
            {pkg.description}
          </p>
        </div>

        {pkg.includes && pkg.includes.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">What's Included</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pkg.includes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pkg.activities && pkg.activities.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 mb-6">Itinerary - Day by Day</h4>
            <div className="space-y-4">
              {pkg.activities.map((activity, idx) => (
                <div key={idx} className="border-l-4 border-teal-500 bg-teal-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {activity.day}
                    </span>
                    <h5 className="text-xl font-bold text-gray-900">{activity.title}</h5>
                  </div>
                  <p className="text-gray-700 ml-13 leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showClose && onClose && (
          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  )
}
