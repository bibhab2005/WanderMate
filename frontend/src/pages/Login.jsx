import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../App'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { ok, data } = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    setLoading(false)
    if (ok && data.success) {
      const me = await apiFetch('/api/me/')
      if (me.ok) {
        setUser(me.data)
        navigate(me.data.onboarding_complete ? '/dashboard' : '/onboarding')
      }
    } else {
      setError(data.error || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-6 font-sans text-gray-900">

      <div className="w-full max-w-7xl px-8 flex justify-between items-center mb-12">
        <Link to="/" className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="text-black font-black text-2xl tracking-tight">WanderMate</span>
        </Link>
        <Link to="/signup" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
          Sign up
        </Link>
      </div>

      <div className="w-full max-w-[28rem] px-4">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to manage your shared travel plans.</p>
          </div>

          <a
            href="http://localhost:8000/accounts/google/login/"
            className="w-full py-3 px-4 border border-gray-200 rounded-full flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-6 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center my-6 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex-1 border-t border-gray-100"></div>
            <span className="px-4">OR</span>
            <div className="flex-1 border-t border-gray-100"></div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 placeholder-gray-400 transition-shadow"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                <a href="#" className="text-xs text-[#10b981] font-semibold hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 transition-shadow"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 text-base font-semibold text-white bg-[#10b981] rounded-xl hover:bg-[#059669] transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#10b981] font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
