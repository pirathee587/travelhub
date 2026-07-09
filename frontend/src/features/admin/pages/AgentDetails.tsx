import React from 'react'
import AgentDetailsView from '../components/AgentDetailsView'
import { useNavigate, useParams } from 'react-router-dom'
import { mockAgents } from '../services/mock-data'

export default function AgentDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const agentId = Number(id)
  const agent = mockAgents.find(a => a.id === agentId)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/agents')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-lg font-medium"
          >
            {'< '}Back to Agencies
          </button>
        </div>

        {agent ? (
          <div className="bg-white rounded-xl shadow-lg">
            <AgentDetailsView agent={agent} showClose={false} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Agency not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
