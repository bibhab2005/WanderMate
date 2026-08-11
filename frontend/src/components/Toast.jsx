import { useState } from 'react'

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-sm px-4 py-3 bg-white border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-sm font-medium text-gray-800 transition-all ${
            t.type === 'success' ? 'border-l-4 border-l-[#10b981] border-gray-100'
            : t.type === 'error' ? 'border-l-4 border-l-red-400 border-gray-100'
            : 'border-l-4 border-l-blue-400 border-gray-100'
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }
  const removeToast = id => setToasts(p => p.filter(t => t.id !== id))
  return { toasts, addToast, removeToast }
}
