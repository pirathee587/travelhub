import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AgentDetailsView({ agent, onClose, showClose = true }) {
  const navigate = useNavigate()
  const [showNIC, setShowNIC] = useState(false)
  const [showLicense, setShowLicense] = useState(false)

  if (!agent) return null

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const statusClass =
    agent.status === 'Approved'
      ? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
      : 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700'

  return (
    <>
      {!showClose ? (
        <>
          <div className="bg-gradient-to-b from-emerald-50 to-white px-8 py-10 border-b border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white text-3xl font-bold mb-5 shadow-lg">
                {getInitials(agent.name)}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{agent.name}</h3>
              <p className="text-base text-gray-600 mt-2">{agent.agencyTagline}</p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-emerald-50 rounded-xl border border-emerald-100 p-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Owner Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Owner Name</label>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{agent.owner}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Phone</label>
                    <div className="text-xl md:text-2xl font-bold text-gray-900">{agent.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Email</label>
                    <div className="text-xl md:text-2xl font-bold text-gray-900 break-all">{agent.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Location</label>
                    <div className="text-xl md:text-2xl font-bold text-gray-900">{agent.location}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-semibold">Member Since</label>
                    <div className="text-xl md:text-2xl font-bold text-gray-900">{agent.memberSince}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Application Status</h4>
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">Status</label>
                      <div className="mt-2">
                        <span className={statusClass}>{agent.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-semibold">Submitted Date</label>
                      <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{agent.submitted}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <button
                    onClick={() => setShowNIC(true)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base transition"
                  >
                    View NIC
                  </button>
                  <button
                    onClick={() => navigate('/packages')}
                    className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-base transition"
                  >
                    Packages
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gradient-to-b from-teal-50 to-white p-6 border-b border-gray-200 relative">
            {onClose && (
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl">
                x
              </button>
            )}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                {getInitials(agent.name)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{agent.agencyTagline}</p>
            </div>
          </div>

          <div className="space-y-6 text-xl p-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">Owner Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Owner Name</label>
                  <div className="text-sm font-semibold text-gray-900">{agent.owner}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Email</label>
                  <div className="text-sm font-semibold text-gray-900">{agent.email}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Phone</label>
                  <div className="text-sm font-semibold text-gray-900">{agent.phone}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Location</label>
                  <div className="text-sm font-semibold text-gray-900">{agent.location}</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-3">Application Status</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Status</label>
                  <div className="text-sm mt-1">
                    <span className={statusClass}>{agent.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Submitted Date</label>
                  <div className="text-sm font-semibold text-gray-900">{agent.submitted}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNIC(true)}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
              >
                View NIC
              </button>
              <button
                onClick={() => setShowLicense(true)}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition"
              >
                View License
              </button>
            </div>

            {onClose && (
              <button onClick={onClose} className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                Close
              </button>
            )}
          </div>
        </>
      )}

      {showNIC && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-lg font-bold">NIC Photocopy - {agent.owner}</h4>
              <button onClick={() => setShowNIC(false)} className="text-2xl hover:opacity-80">
                x
              </button>
            </div>
            <div className="p-6 bg-gray-50 flex justify-center">
              <img src={agent.nicPhotocopy} alt="NIC" className="max-w-full h-auto rounded shadow-lg" />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button onClick={() => setShowNIC(false)} className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400">
                Close
              </button>
              <a href={agent.nicPhotocopy} download className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {showClose && showLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-lg font-bold">License Photocopy</h4>
              <button onClick={() => setShowLicense(false)} className="text-2xl hover:opacity-80">
                x
              </button>
            </div>
            <div className="p-6 bg-gray-50 flex justify-center">
              <img src={agent.licensePhotocopy} alt="License" className="max-w-full h-auto rounded shadow-lg" />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button onClick={() => setShowLicense(false)} className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400">
                Close
              </button>
              <a href={agent.licensePhotocopy} download className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
