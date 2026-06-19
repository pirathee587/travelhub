import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../api/authApi'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      // Backend returns LoginResponse: { token, name, email, role, ... }
      const token = res?.token || res?.data?.token
      const user  = {
        name:  res?.name  || res?.data?.name  || email,
        email: res?.email || res?.data?.email || email,
        role:  res?.role  || res?.data?.role  || 'ADMIN',
      }
      if (!token) throw new Error('No token received from server.')

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-base">
              TH
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">TravelHub</div>
              <div className="text-xs text-gray-500 font-medium">Admin Portal</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">Enter your admin credentials to continue.</p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            Sri Lanka Tourism Administration System
          </p>
        </div>
      </div>
    </div>
  )
}
