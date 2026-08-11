import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { apiFetch } from '../api'

export default function Navbar() {
  const { user, setUser } = useAuth()
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await apiFetch('/auth/logout/', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg className="w-7 h-7 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#202124]">
            WanderMate
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors ${loc.pathname === '/dashboard' ? 'text-[#10b981] font-semibold' : 'text-gray-600 hover:text-black'}`}>Discover</Link>
              <Link to="/itineraries" className={`text-sm font-medium transition-colors ${loc.pathname === '/itineraries' ? 'text-[#10b981] font-semibold' : 'text-gray-600 hover:text-black'}`}>Itineraries</Link>
              <Link to="/profile" className={`text-sm font-medium transition-colors ${loc.pathname === '/profile' ? 'text-[#10b981] font-semibold' : 'text-gray-600 hover:text-black'}`}>Profile</Link>
              <button onClick={handleLogout} disabled={loading} className="text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black transition-all">
                {loading ? '…' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Login</Link>
              <Link to="/signup" className="text-sm font-semibold px-5 py-2 rounded-full bg-[#10b981] text-white hover:bg-[#059669] transition-colors">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <div className="w-5 h-0.5 bg-gray-600 mb-1.5" /><div className="w-5 h-0.5 bg-gray-600 mb-1.5" /><div className="w-5 h-0.5 bg-gray-600" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Discover</Link>
              <Link to="/itineraries" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Itineraries</Link>
              <Link to="/profile" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="text-sm font-medium text-left text-gray-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-sm font-semibold text-[#10b981]" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
