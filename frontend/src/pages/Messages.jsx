import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function cleanAvatarUrl(url) {
  if (url && url.includes('api.dicebear.com')) {
    const startIdx = url.indexOf('api.dicebear.com');
    return 'https://' + decodeURIComponent(url.substring(startIdx));
  }
  return url;
}

const Messages = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await apiFetch('/api/matches/accepted/');
        if (response.ok) {
          setMatches(response.data);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Messages</h2>
            <p className="text-gray-500">Continue the conversation with your travel companions.</p>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#10b981] rounded-full animate-spin" />
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-700 font-semibold text-lg">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">Connect with companions on the Discover page to start chatting!</p>
              </div>
            ) : (
              matches.map((match) => {
                const displayName = match.full_name || match.username;
                const initial = displayName[0].toUpperCase();
                return (
                  <Link
                    key={match.id}
                    to={`/chat/${match.id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group"
                  >
                    {match.avatar ? (
                      <img 
                        src={cleanAvatarUrl(match.avatar)} 
                        alt={displayName} 
                        className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-green-50 text-[#10b981] rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[16px] text-gray-900 truncate">{displayName}</h3>
                      <p className="text-[14px] text-gray-400 truncate mt-0.5">Click to view your conversation</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#10b981] group-hover:text-white group-hover:border-[#10b981] transition-all">
                      <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
