import React from 'react'

export default function ToastContainer({toasts}){
  if(!toasts || toasts.length===0) return null
  return (
    <div className="fixed right-5 bottom-5 flex flex-col gap-2 z-70">
      {toasts.map(t=> (
        <div key={t.id} className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-base">{t.text}</div>
      ))}
    </div>
  )
}
