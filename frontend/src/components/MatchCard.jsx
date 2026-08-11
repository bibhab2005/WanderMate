import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899']
const avatarColor = id => AVATAR_COLORS[id % AVATAR_COLORS.length]

export default function MatchCard({ match, onOpenModal, addToast }) {
  const [reqStatus, setReqStatus] = useState(null)
  const [reqDirection, setReqDirection] = useState(null)
  const [sending, setSending] = useState(false)

  const initial = (match.full_name || match.username || '?')[0].toUpperCase()
  const destText = (match.sample_itineraries || []).slice(0, 2).map(i => i.destination_city).join(' · ') || 'No trips planned'

  useEffect(() => {
    let active = true
    apiFetch(`/api/requests/status/${match.id}/`).then(({ ok, data }) => {
      if (ok && data.status && active) {
        setReqStatus(data.status)
        setReqDirection(data.direction)
      }
    })
    return () => { active = false }
  }, [match.id])

  async function handleConnect(e) {
    e.stopPropagation()
    setSending(true)
    const { ok, data } = await apiFetch('/api/requests/send/', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: match.id, message: '' }),
    })
    setSending(false)
    if (ok) { setReqStatus('pending'); addToast('Travel request sent!', 'success') }
    else if (data.status) { setReqStatus(data.status) }
    else addToast(data.error || 'Could not send request.', 'error')
  }

  let btnLabel = 'Connect'
  let btnClass = 'bg-[#10b981] text-white hover:bg-[#059669]'
  let btnDisabled = false
  let handleBtnClick = handleConnect

  if (sending) { btnLabel = 'Sending…'; btnDisabled = true }
  else if (reqStatus === 'pending') {
    if (reqDirection === 'received') {
      btnLabel = 'Respond'
      btnClass = 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
      handleBtnClick = (e) => { e.stopPropagation(); onOpenModal(match.id); }
    } else {
      btnLabel = 'Pending'
      btnClass = 'bg-amber-50 text-amber-600 border border-amber-200'
      btnDisabled = true
    }
  }
  else if (reqStatus === 'accepted') { btnLabel = '✓ Connected'; btnClass = 'bg-green-50 text-[#10b981] border border-green-200'; btnDisabled = true }
  else if (reqStatus === 'declined') { btnLabel = 'Declined'; btnClass = 'bg-red-50 text-red-500 border border-red-200'; btnDisabled = true }

  const scoreColor = match.match_score >= 70 ? 'text-[#10b981]' : match.match_score >= 40 ? 'text-amber-500' : 'text-gray-400'

  return (
    <div
      onClick={() => onOpenModal(match.id)}
      className="bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all p-5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {match.avatar ? (
              <img
                src={match.avatar}
                alt={match.full_name || match.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: avatarColor(match.id) }}
              >
                {initial}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{match.full_name || match.username}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{match.age || ''}</p>
            </div>
          </div>
          <span className={`text-lg font-black ${scoreColor}`}>{match.match_score}%</span>
        </div>

        {match.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{match.bio}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(match.style_tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-[#10b981] capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{destText}</span>
        </div>
        <button
          onClick={handleBtnClick}
          disabled={btnDisabled}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${btnClass}`}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}
