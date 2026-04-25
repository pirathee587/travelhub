import React, { useState } from 'react'
import { mockTransactions } from '../lib/mock-data'

export default function Payments(){
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedStatus, setSelectedStatus] = useState('All Status')

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.booking.toLowerCase().includes(searchTerm.toLowerCase()) || t.tourist.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'All Types' || t.type === selectedType
    const matchesStatus = selectedStatus === 'All Status' || t.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate stats
  const totalRevenue = mockTransactions.reduce((sum, t) => t.type === 'Payment' ? sum + t.amount : sum, 0)
  const commissionEarned = mockTransactions.reduce((sum, t) => sum + t.commission, 0)
  const pendingPayments = mockTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0)
  const totalRefunds = mockTransactions.reduce((sum, t) => t.type === 'Refund' ? sum + t.amount : sum, 0)

  const StatCard = ({ title, value, trend, icon, bgColor }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${value.toLocaleString()}</p>
          <p className={`text-sm mt-2 font-medium ${trend.includes('-') ? 'text-red-500' : 'text-teal-500'}`}>{trend}</p>
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">Payments</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Revenue" value={totalRevenue} trend="+18% from last month" icon="💰" bgColor="bg-teal-100" />
        <StatCard title="Pending Payments" value={pendingPayments} trend={`${mockTransactions.filter(t => t.status === 'Pending').length} transactions`} icon="📦" bgColor="bg-orange-100" />
        <StatCard title="Total Refunds" value={totalRefunds} trend="-5% from last month" icon="📉" bgColor="bg-red-100" />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-64">
          <input type="text" placeholder="Search by transaction ID, booking, or tourist..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white cursor-pointer">
          <option value="All Types">All Types</option>
          <option value="Payment">Payment</option>
          <option value="Refund">Refund</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white cursor-pointer">
          <option value="All Status">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Booking</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tourist / Agent</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.booking}</p>
                    <p className="text-xs text-gray-600">{t.date}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.tourist}</p>
                    <p className="text-xs text-gray-600">{t.provider}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${t.type === 'Payment' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                    {t.type === 'Payment' ? '↓ Payment' : '↑ Refund'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${t.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${t.status === 'Completed' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
