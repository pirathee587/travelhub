import React from 'react'
import PackageDetailsView from './PackageDetailsView'

export default function PackageDetailsModal({ open, pkg, onClose }) {
  if (!open || !pkg) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <PackageDetailsView pkg={pkg} onClose={onClose} />
      </div>
    </div>
  )
}
