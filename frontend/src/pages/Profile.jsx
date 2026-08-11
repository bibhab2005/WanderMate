import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Toast, { useToast } from '../components/Toast'
import { apiFetch } from '../api'

const STYLE_TAGS_LIST = [
  { id: 'backpacking', label: '🎒 Backpacking' },
  { id: 'foodie', label: '🍜 Foodie' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'nightlife', label: '🎵 Nightlife' },
  { id: 'culture', label: '🏛 Culture' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'wellness', label: '🧘 Wellness' },
  { id: 'photography', label: '📸 Photography' },
  { id: 'solo', label: '🧳 Solo-traveler' },
  { id: 'beach', label: '🏖 Beach' },
  { id: 'mountains', label: '🏔 Mountains' },
  { id: 'family', label: '👨‍👩‍👧 Family' },
]

export default function Profile() {
  const { toasts, addToast, removeToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connections, setConnections] = useState([])
  const [connectionsLoading, setConnectionsLoading] = useState(true)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [pace, setPace] = useState('moderate')
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState([])
  const [styleTags, setStyleTags] = useState([])
  const [languageInput, setLanguageInput] = useState('')

  async function loadProfile() {
    setLoading(true)
    const { ok, data } = await apiFetch('/api/me/')
    setLoading(false)
    if (ok && data.authenticated && data.profile) {
      const p = data.profile
      setProfile(p)
      setFullName(p.full_name || '')
      setHomeCity(p.home_city || '')
      setAge(p.age || '')
      setGender(p.gender || '')
      setPace(p.pace || 'moderate')
      setBio(p.bio || '')
      setLanguages(p.languages || [])
      setStyleTags(p.style_tags || [])
    } else {
      addToast('Failed to load profile details.', 'error')
    }
  }

  async function loadConnections() {
    setConnectionsLoading(true)
    const { ok, data } = await apiFetch('/api/requests/')
    setConnectionsLoading(false)
    if (ok) {
      const sent = data.sent || []
      const received = data.received || []
      setConnections([...sent, ...received])
    }
  }

  useEffect(() => {
    loadProfile()
    loadConnections()
  }, [])

  function handleAddLanguage(e) {
    if ((e.key === 'Enter' || e.key === ',') && languageInput.trim()) {
      e.preventDefault()
      const val = languageInput.trim()
      if (!languages.includes(val)) {
        setLanguages(p => [...p, val])
      }
      setLanguageInput('')
    }
  }

  function handleRemoveLanguage(lang) {
    setLanguages(p => p.filter(l => l !== lang))
  }

  function toggleStyleTag(tagId) {
    setStyleTags(p => {
      const exists = p.includes(tagId)
      return exists ? p.filter(t => t !== tagId) : [...p, tagId]
    })
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      full_name: fullName.trim(),
      home_city: homeCity.trim(),
      age: age ? parseInt(age, 10) : null,
      gender,
      pace,
      bio: bio.trim(),
      languages,
      style_tags: styleTags,
    }

    const { ok, data } = await apiFetch('/api/profile/update/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    setSaving(false)

    if (ok) {
      addToast('Profile updated successfully!', 'success')
      if (data.profile) {
        setProfile(data.profile)
      }
    } else {
      addToast('Failed to update profile.', 'error')
    }
  }

  const initial = ((fullName || profile?.username || '?')[0] || '?').toUpperCase()

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your traveler identity</p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-250 border-t-[#10b981] rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading profile…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center text-white font-black text-2xl">
                    {initial}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{fullName || profile?.username}</h2>
                    <p className="text-xs text-gray-400 mt-1">{profile?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">Personal Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current City
                      </label>
                      <input
                        type="text"
                        name="homeCity"
                        placeholder="e.g. Mumbai, Delhi"
                        value={homeCity}
                        onChange={(e) => setHomeCity(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#4285F4] focus:border-[#4285F4]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 text-sm transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Age</label>
                        <input
                          type="number"
                          min="18"
                          max="100"
                          value={age}
                          onChange={e => setAge(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 text-sm transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Gender</label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 text-sm"
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="nonbinary">Non-binary</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Bio</label>
                      <textarea
                        rows="4"
                        placeholder="Tell other travelers about yourself…"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 text-sm placeholder-gray-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Languages</label>
                      <div className="bg-[#f0f4f8] rounded-xl p-3 focus-within:ring-2 focus-within:ring-[#10b981]">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {languages.map(lang => (
                            <span key={lang} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-[#10b981]">
                              {lang}
                              <button type="button" onClick={() => handleRemoveLanguage(lang)} className="text-[#10b981] hover:text-gray-700 font-bold ml-1">×</button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a language…"
                          value={languageInput}
                          onChange={e => setLanguageInput(e.target.value)}
                          onKeyDown={handleAddLanguage}
                          className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">Travel Preferences</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 ml-1">Travel Style Tags</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {STYLE_TAGS_LIST.map(tag => {
                          const isSelected = styleTags.includes(tag.id)
                          return (
                            <button
                              type="button"
                              key={tag.id}
                              onClick={() => toggleStyleTag(tag.id)}
                              className={`px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all border flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                                  : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f8f9fa]'
                              }`}
                            >
                              <span>{tag.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-[#10b981] text-white font-semibold text-sm rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-60"
                    >
                      {saving ? 'Saving Changes…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">My Connections</h3>
                {connectionsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
                    <div className="w-4 h-4 border border-gray-200 border-t-[#10b981] rounded-full animate-spin" />
                    <span>Loading connections…</span>
                  </div>
                ) : connections.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No connection requests yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {connections.map(r => {
                      const badgeColor = r.status === 'accepted' 
                        ? 'bg-green-50 text-[#10b981] border-green-100' 
                        : r.status === 'pending' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                        : 'bg-red-50 text-red-500 border-red-100'
                      return (
                        <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {r.other_user.full_name || r.other_user.username}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize shrink-0 ${badgeColor}`}>
                            {r.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
