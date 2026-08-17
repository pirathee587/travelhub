import React, { useEffect, useState } from 'react'
import AgentDetailsView from '../components/AgentDetailsView'
import { useNavigate, useParams } from 'react-router-dom'
import adminAgentApi from '../services/adminAgentApi'
import { mockAgents } from '../services/mock-data'

export default function AgentDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const agentId = Number(id) || id

  const [agent, setAgent] = useState<any | null>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const [detRes, pkgsRes, statsRes] = await Promise.allSettled([
          adminAgentApi.getAgentDetail(agentId!),
          adminAgentApi.getAgentPackages(agentId!),
          adminAgentApi.getAgentStats(agentId!),
        ])

        let loadedAgent = null
        if (detRes.status === 'fulfilled') {
          loadedAgent = detRes.value?.data ?? detRes.value
        }
        if (pkgsRes.status === 'fulfilled') {
          const pkgs = pkgsRes.value?.data ?? pkgsRes.value ?? []
          setPackages(Array.isArray(pkgs) ? pkgs : [])
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value?.data ?? statsRes.value)
        }

        if (loadedAgent) {
          setAgent(loadedAgent)
        } else {
          // Fallback to mock if API returns empty
          const fallback = mockAgents.find((a: any) => a.id === Number(agentId))
          setAgent(fallback || null)
        }
      } catch (err) {
        const fallback = mockAgents.find((a: any) => a.id === Number(agentId))
        setAgent(fallback || null)
      } finally {
        setLoading(false)
      }
    }

    if (agentId) {
      fetchDetails()
    }
  }, [agentId])

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium text-sm">Loading agency profile…</p>
          </div>
        ) : agent ? (
          <AgentDetailsView
            agent={agent}
            packages={packages}
            stats={stats}
            onClose={() => navigate('/admin/agents')}
          />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100 max-w-lg mx-auto mt-12">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Agency not found</h3>
            <p className="text-gray-500 text-sm mb-6">
              The requested agency could not be found or may have been deleted.
            </p>
            <button
              onClick={() => navigate('/admin/agents')}
              className="px-6 py-2.5 bg-[#0ea5e9] text-white font-bold rounded-xl text-sm hover:bg-[#0284c7] transition"
            >
              Back to Agencies
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
