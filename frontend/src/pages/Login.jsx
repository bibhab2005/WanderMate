import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../App'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'oauth_failed') {
      setError('Google sign-in session expired or was interrupted. Please select your account and try again.')
    }
  }, [])

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
    <div className="h-screen flex flex-col lg:flex-row bg-white font-sans text-gray-900 overflow-hidden">
      {/* Left Hero Image Section (Split Screen) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-gray-900 select-none">
        <img
          src="/login-bg.jpg"
          alt="Travel Landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-[12000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-black/20"></div>

        <div className="absolute bottom-0 left-0 right-0 p-16 text-white animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Find your next<br />adventure companion.
          </h2>
          <p className="text-gray-300 text-lg max-w-lg leading-relaxed">
            Connect with thousands of travelers sharing your itinerary, budget, and travel style.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-gray-300">
            <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-gray-950 flex items-center justify-center text-white text-xs font-bold shadow-md">
                S
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-gray-950 flex items-center justify-center text-white text-xs font-bold shadow-md">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 border-2 border-gray-950 flex items-center justify-center text-white text-xs font-bold shadow-md">
                K
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                +1k
              </div>
            </div>
            <span className="font-medium text-gray-200">Over 1,000+ matched trips this month</span>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:px-12 sm:py-8 relative z-10 bg-white overflow-y-auto">
        {/* Subtle background dot grid for texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Top Brand Nav */}
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <svg className="w-8 h-8 text-[#0d9488] transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-black font-black text-2xl tracking-tight">WanderMate</span>
          </Link>
          <Link to="/signup" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Need an account? <span className="text-[#10b981] hover:underline">Sign up</span>
          </Link>
        </div>

        {/* Main Auth Form */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto animate-fadeInUp py-2 sm:py-4">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Sign in to manage your shared travel plans and discover new companions.
            </p>
          </div>

          <a
            href="http://localhost:8000/accounts/google/login/"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 mb-6 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Email address</label>
              <input
                type="email"
                placeholder="xyz@gmail.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-slate-50 border border-transparent focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-0.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-semibold text-[#10b981] hover:text-[#059669] transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-slate-50 border border-transparent focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-200 mt-3 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#10b981] font-semibold hover:text-[#059669] transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 text-xs text-gray-400 text-center lg:text-left">
          © {new Date().getFullYear()} WanderMate. All rights reserved.
        </div>
      </div>
    </div>
  )
}
