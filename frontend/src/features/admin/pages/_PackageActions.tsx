import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useModal } from '../components/ModalContext'

export default function PackageActions({pkg}){
  const modal = useModal()
  const navigate = useNavigate()

  const handle = async (action)=>{
    const ok = await modal.showConfirm({title:`${action} package`,message:`${action} ${pkg.title}?`})
    if(ok) modal.addToast(`${action}d ${pkg.title}`)
  }

  const handleView = () => {
    navigate(`/packages/${pkg.id}`)
  }

  // If package is approved, show View Details and Suspend buttons
  if (pkg.status === 'Approved') {
    return (
      <div className="flex items-center gap-3 w-full">
        <button onClick={handleView} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition">View Details</button>
        <button onClick={()=>handle('Suspend')} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-sm hover:shadow-md transition">🛑 Suspend</button>
      </div>
    )
  }

  // If package is pending, show View Details, Approve, and Reject buttons
  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={handleView} className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-gray-700 font-semibold text-base hover:bg-gray-50 transition flex items-center justify-center gap-3">👁️ Details</button>

      <div className="flex items-center gap-2">
        <button onClick={()=>handle('Approve')} className="w-11 h-11 rounded-full bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition flex items-center justify-center shadow-md">✓</button>
        <button onClick={()=>handle('Reject')} className="w-11 h-11 rounded-full bg-red-500 text-white font-bold text-lg hover:bg-red-600 transition flex items-center justify-center shadow-md">✕</button>
      </div>
    </div>
  )
}
