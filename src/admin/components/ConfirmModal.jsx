import React from 'react'

export default function ConfirmModal({open,title,message,onConfirm,onCancel}){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-60" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 m-0">{title}</h3>
        <p className="text-gray-600 text-base mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-base hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
