import React from 'react'
import AgentDetailsView from './AgentDetailsView'

export default function AgentDetailsModal({ open, agent, onClose }) {
  if (!open || !agent) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <AgentDetailsView agent={agent} onClose={onClose} />
      </div>
    </div>
  )
}
