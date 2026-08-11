import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { getMe } from './api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import Itineraries from './pages/Itineraries'
import Profile from './pages/Profile'
import ChatRoom from './pages/ChatRoom'
import Messages from './pages/Messages'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#e5e7eb] border-t-[#0d9488] rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboarding_complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user && user.onboarding_complete) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#e5e7eb] border-t-[#0d9488] rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.onboarding_complete) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe().then(({ ok, data }) => {
      if (ok && data.authenticated) setUser(data)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><ProfileSetup /></OnboardingRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/itineraries" element={<PrivateRoute><Itineraries /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/chat/:matchId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
