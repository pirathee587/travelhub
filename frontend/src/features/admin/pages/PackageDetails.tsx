import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockPackages } from '../services/mock-data'
import PackageDetailsView from '../components/PackageDetailsView'

export default function PackageDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const packageId = Number(id)
  const pkg = mockPackages.find(p => p.id === packageId)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Back to Packages
          </button>
        </div>

        {pkg ? (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <PackageDetailsView pkg={pkg} showClose={false} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Package not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
