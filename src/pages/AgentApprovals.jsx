import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModal } from '../components/ModalContext'
import { mockAgents } from '../lib/mock-data'

export default function AgentApprovals(){
  const modal = useModal()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredAgents = mockAgents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleAction = async (agent, action) => {
    const ok = await modal.showConfirm({
      title: action + ' agent',
      message: 'Are you sure you want to ' + action.toLowerCase() + ' ' + agent.name + '?'
    })
    if(ok) modal.addToast(action + 'd ' + agent.name)
  }

  const renderActions = (agent) => {
    if (agent.status === 'Approved') {
      return (
        <div className="flex gap-2">
          <button onClick={() => navigate('/agents/' + agent.id)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">View</button>
          <button onClick={() => handleAction(agent, 'Suspend')} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">Suspend</button>
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <button onClick={() => navigate('/agents/' + agent.id)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">View</button>
        <button onClick={() => handleAction(agent, 'Approve')} className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">Approve</button>
        <button onClick={() => handleAction(agent, 'Reject')} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">Reject</button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">Agent Approvals</h2>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex gap-4">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl overflow-auto">
        <table className="w-full">
          <thead><tr className="border-b">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Owner</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody>
            {filteredAgents.map(a => (
              <tr key={a.id} className="border-t">
                <td className="px-6 py-3 font-bold text-gray-900">{a.name}</td>
                <td className="px-6 py-3">{a.owner}</td>
                <td className="px-6 py-3"><span className={
                  'px-2 py-1 rounded font-semibold text-sm ' +
                  (a.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  a.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700')
                }>{a.status}</span></td>
                <td className="px-6 py-3">
                  {renderActions(a)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
