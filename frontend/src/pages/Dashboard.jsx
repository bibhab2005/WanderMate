import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import MatchCard from '../components/MatchCard'
import MatchModal from '../components/MatchModal'
import Toast, { useToast } from '../components/Toast'
import { apiFetch } from '../api'

export default function Dashboard() {
  const { toasts, addToast, removeToast } = useToast()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState(null)

  // Filters
  const [minScore, setMinScore] = useState(0)
  const [destination, setDestination] = useState('')
  const [appliedMinScore, setAppliedMinScore] = useState(0)
  const [appliedDestination, setAppliedDestination] = useState('')

  async function fetchMatches(score = 0, dest = '') {
    setLoading(true)
    let url = `/api/matches/?min_score=${score}`
    if (dest) {
      url += `&destination=${encodeURIComponent(dest)}`
    }
    const { ok, data } = await apiFetch(url)
    setLoading(false)
    if (ok && data.matches) {
      setMatches(data.matches)
    } else {
      addToast('Failed to load companion matches.', 'error')
    }
  }

  useEffect(() => {
    fetchMatches(appliedMinScore, appliedDestination)
  }, [appliedMinScore, appliedDestination])

  function handleApplyFilters() {
    setAppliedMinScore(minScore)
    setAppliedDestination(destination)
  }

  function handleResetFilters() {
    setMinScore(0)
    setDestination('')
    setAppliedMinScore(0)
    setAppliedDestination('')
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discover Companions</h1>
              <p className="text-sm text-gray-500 mt-0.5">Sorted by match compatibility</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs font-semibold text-gray-700">
              <strong className="text-sm font-black text-[#10b981]">{matches.length}</strong> matches found
            </div>
          </header>

          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
            <div className="flex flex-wrap items-end gap-5">
              <div className="flex-grow min-w-[200px] space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex justify-between px-1">
                  <span>Min Match compatibility</span>
                  <span className="text-[#10b981] font-extrabold">{minScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minScore}
                  onChange={e => setMinScore(parseInt(e.target.value, 10))}
                  className="w-full accent-[#10b981] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex-grow min-w-[200px] space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 ml-1">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Goa, Manali, Jaipur..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-transparent focus:border-[#34A853] focus:ring-1 focus:ring-[#34A853] rounded-xl px-4 py-2.5 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-3 bg-[#10b981] text-white font-semibold text-sm rounded-xl hover:bg-[#059669] transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#10b981] rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-500">Finding matches…</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center max-w-md mx-auto">
              <span className="text-4xl">🌍</span>
              <h3 className="text-base font-bold text-gray-900 mt-3">No matches found</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Try lowering your match compatibility filter or adding more itineraries to help the algorithm match you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onOpenModal={setSelectedMatchId}
                  addToast={addToast}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedMatchId && (
        <MatchModal
          userId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
          addToast={addToast}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
