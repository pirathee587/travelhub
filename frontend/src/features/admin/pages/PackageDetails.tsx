import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminPackageApi from '../services/adminPackageApi'
import { mockPackages } from '../services/mock-data'
import PackageDetailsView from '../components/PackageDetailsView'

export default function PackageDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const packageId = Number(id) || id

  const [pkg, setPkg] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true)
      try {
        const res = await adminPackageApi.getPackageDetail(packageId!)
        const detailed = res?.data ?? res
        if (detailed) {
          setPkg(detailed)
        } else {
          const fallback = mockPackages.find((p: any) => p.id === Number(packageId))
          setPkg(fallback || null)
        }
      } catch (err) {
        const fallback = mockPackages.find((p: any) => p.id === Number(packageId))
        setPkg(fallback || null)
      } finally {
        setLoading(false)
      }
    }

    if (packageId) {
      fetchPackage()
    }
  }, [packageId])

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium text-sm">Loading package details…</p>
        </div>
      ) : pkg ? (
        <PackageDetailsView
          pkg={pkg}
          onBack={() => navigate('/admin/packages')}
          onClose={() => navigate('/admin/packages')}
          showClose={false}
        />
      ) : (
        <div className="p-12 max-w-lg mx-auto text-center mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Package not found</h3>
          <p className="text-gray-500 text-sm mb-6">
            The requested package could not be found or may have been deleted.
          </p>
          <button
            onClick={() => navigate('/admin/packages')}
            className="px-6 py-2.5 bg-[#0ea5e9] text-white font-bold rounded-xl text-sm hover:bg-[#0284c7] transition"
          >
            Back to Packages
          </button>
        </div>
      )}
    </div>
  )
}
