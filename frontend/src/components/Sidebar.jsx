import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { apiFetch } from '../api'

const navItems = [
  {
    to: '/dashboard', label: 'Discover',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path d="m21 21-4.35-4.35" strokeWidth="2"/></svg>
  },
  {
    to: '/itineraries', label: 'Itineraries',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/></svg>
  },
  {
    to: '/messages', label: 'Messages',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/><circle cx="12" cy="7" r="4" strokeWidth="2"/></svg>
  },
]

export default function Sidebar() {
  const { user, setUser } = useAuth()
  const loc = useLocation()
  const initial = ((user?.profile?.full_name || user?.profile?.username || '?')[0] || '?').toUpperCase()

  async function handleLogout() {
    await apiFetch('/auth/logout/', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              loc.pathname === item.to
                ? 'bg-green-50 text-[#10b981] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          {user?.profile?.avatar ? (
            <img
              src={user.profile.avatar}
              alt={user.profile.username}
              className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initial}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.profile?.full_name || user?.profile?.username || 'User'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
