import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899']
const avatarColor = id => AVATAR_COLORS[id % AVATAR_COLORS.length]

function cleanAvatarUrl(url) {
  if (url && url.includes('api.dicebear.com')) {
    const startIdx = url.indexOf('api.dicebear.com');
    return 'https://' + decodeURIComponent(url.substring(startIdx));
  }
  return url;
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MatchModal({ userId, onClose, addToast }) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reqStatus, setReqStatus] = useState(null)
  const [reqDirection, setReqDirection] = useState(null)
  const [reqId, setReqId] = useState(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [animateFill, setAnimateFill] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([apiFetch(`/api/matches/${userId}/`), apiFetch(`/api/requests/status/${userId}/`)]).then(([matchRes, reqRes]) => {
      if (!active) return
      setLoading(false)
      if (matchRes.ok) { setMatch(matchRes.data); setTimeout(() => setAnimateFill(true), 100) }
      if (reqRes.ok && reqRes.data.status) {
        setReqStatus(reqRes.data.status)
        setReqDirection(reqRes.data.direction)
        if (reqRes.data.req_id) setReqId(reqRes.data.req_id)
      }
    })
    return () => { active = false }
  }, [userId])

  async function handleSendRequest() {
    setSending(true)
    const { ok, data } = await apiFetch('/api/requests/send/', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: userId, message }),
    })
    setSending(false)
    if (ok) { setReqStatus('pending'); setReqDirection('sent'); addToast('Travel request sent!', 'success') }
    else if (data.status) { setReqStatus(data.status); setReqDirection('sent') }
    else addToast(data.error || 'Could not send request.', 'error')
  }

  async function handleRespondRequest(action) {
    setSending(true)
    const { ok, data } = await apiFetch(`/api/requests/${reqId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    })
    setSending(false)
    if (ok) { setReqStatus(data.status); addToast(`Request ${action}ed!`, 'success') }
    else addToast(data.error || `Could not ${action} request.`, 'error')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-w-sm w-full flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#10b981] rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-500">Calculating compatibility…</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-w-sm w-full text-center">
          <p className="text-sm font-semibold text-gray-700">Could not load companion profile.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-[#10b981] text-white rounded-xl text-xs font-bold hover:bg-[#059669]">Close</button>
        </div>
      </div>
    )
  }

  const initial = (match.full_name || match.username || '?')[0].toUpperCase()
  const bd = match.breakdown || {}

  let btnLabel = 'Send Travel Request'
  let btnClass = 'bg-[#10b981] text-white hover:bg-[#059669]'
  let btnDisabled = false
  if (sending) { btnLabel = 'Sending…'; btnDisabled = true }
  else if (reqStatus === 'pending') { btnLabel = '⏳ Request Pending'; btnClass = 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed'; btnDisabled = true }
  else if (reqStatus === 'accepted') { btnLabel = '✓ Already Connected'; btnClass = 'bg-green-50 text-[#10b981] border border-green-200 cursor-not-allowed'; btnDisabled = true }
  else if (reqStatus === 'declined') { btnLabel = '✕ Request Declined'; btnClass = 'bg-red-50 text-red-500 border border-red-200 cursor-not-allowed'; btnDisabled = true }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-w-xl w-full relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl font-semibold leading-none z-10">×</button>

        <div className="overflow-y-auto p-7 space-y-6">
          <div className="flex gap-4">
            {match.avatar ? (
              <img
                src={cleanAvatarUrl(match.avatar)}
                alt={match.full_name || match.username}
                className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shrink-0" style={{ backgroundColor: avatarColor(match.id) }}>
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight truncate">{match.full_name || match.username}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-28 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#10b981] h-full transition-all duration-700 ease-out rounded-full"
                    style={{ width: animateFill ? `${match.match_score}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-black text-[#10b981]">{match.match_score}% Match</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex flex-wrap gap-1.5">
                {match.age && <span>Age {match.age}</span>}
              </p>
            </div>
          </div>

          {match.bio && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl">{match.bio}</p>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">Match Breakdown</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400 font-semibold">Preferences</p>
                <p className="text-2xl font-black text-[#10b981] mt-1">{bd.preference_score || 0}%</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400 font-semibold">Itinerary Overlap</p>
                <p className="text-2xl font-black text-[#10b981] mt-1">{bd.itinerary_score || 0}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">Shared Style Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {(bd.shared_styles || []).map(s => (
                    <span key={s} className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-[#10b981] capitalize">{s}</span>
                  ))}
                  {(!bd.shared_styles || bd.shared_styles.length === 0) && <span className="text-xs text-gray-400">No overlapping styles.</span>}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">Overlapping Destinations</p>
                <div className="flex flex-wrap gap-1.5">
                  {(bd.shared_destinations || []).map(d => (
                    <span key={d} className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-500">📍 {d}</span>
                  ))}
                  {(!bd.shared_destinations || bd.shared_destinations.length === 0) && <span className="text-xs text-gray-400">No overlapping destinations.</span>}
                </div>
              </div>

              {bd.overlapping_days > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-700">
                    ✨ You have <strong className="text-xl font-black text-[#10b981]">{bd.overlapping_days}</strong> overlapping travel days!
                  </p>
                </div>
              )}
            </div>
          </div>

          {match.sample_itineraries && match.sample_itineraries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">Upcoming Trips</h3>
              <div className="divide-y divide-gray-100">
                {match.sample_itineraries.map(itin => (
                  <div key={itin.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">📍 {itin.destination_city ? `${itin.destination_city}, ${itin.destination_country}` : itin.destination}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {itin.start_date && itin.end_date ? `${formatDate(itin.start_date)} → ${formatDate(itin.end_date)}` : 'AI Generated Plan'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold shrink-0">{itin.duration_days || itin.days}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!btnDisabled || (reqStatus === 'pending' && reqDirection === 'received')) && (
            <div className="border-t border-gray-100 pt-5">
              <textarea
                rows="2"
                placeholder="Add a message to your invitation (optional)…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#f0f4f8] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-900 placeholder-gray-400"
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-5 bg-gray-50 rounded-b-[2rem] flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-100 transition-colors">Close</button>
          {reqStatus === 'accepted' && (
            <Link to={`/chat/${match.id}`} className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
              Chat 💬
            </Link>
          )}
          {reqStatus === 'pending' && reqDirection === 'received' ? (
            <div className="flex gap-2">
              <button onClick={() => handleRespondRequest('decline')} disabled={sending} className="px-5 py-2 rounded-xl text-xs font-bold transition-all bg-red-50 text-red-500 border border-red-200 hover:bg-red-100">Decline</button>
              <button onClick={() => handleRespondRequest('accept')} disabled={sending} className="px-5 py-2 rounded-xl text-xs font-bold transition-all bg-[#10b981] text-white hover:bg-[#059669]">Accept Invitation</button>
            </div>
          ) : (
            <button onClick={handleSendRequest} disabled={btnDisabled} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${btnClass}`}>{btnLabel}</button>
          )}
        </div>
      </div>
    </div>
  )
}
