import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useModal } from '../components/ModalContext'

export default function HotelActions({hotel}){
  const modal = useModal()
  const navigate = useNavigate()

  const handle = async (action)=>{
    const ok = await modal.showConfirm({title:`${action} hotel`,message:`${action} ${hotel.name}?`})
    if(ok) modal.addToast(`${action}ed ${hotel.name}`)
  }

  const handleView = () => {
    navigate(`/hotels/${hotel.id}`)
  }

  // If hotel is approved, show View and Suspend buttons
  if (hotel.status === 'Approved') {
    return (
      <div className="flex items-center gap-3 justify-between">
        <button onClick={handleView} className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition">👁️ View</button>
        <button onClick={()=>handle('Suspend')} className="flex-1 px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-sm hover:shadow-md transition">🛑 Suspend</button>
      </div>
    )
  }

  // If hotel is pending, show View, Approve, and Reject buttons
  return (
    <div className="flex items-center gap-3 justify-between">
      <button onClick={handleView} className="flex-1 px-3 py-2.5 border-2 border-gray-300 text-gray-700 font-medium text-base rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">👁️ View</button>
      <button onClick={()=>handle('Approve')} className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xl hover:bg-emerald-100 transition flex items-center justify-center border-2 border-emerald-200">✓</button>
      <button onClick={()=>handle('Reject')} className="w-12 h-12 rounded-lg bg-red-50 text-red-600 font-bold text-xl hover:bg-red-100 transition flex items-center justify-center border-2 border-red-200">✕</button>
    </div>
  )
}
