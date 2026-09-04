import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function cleanAvatarUrl(url) {
  if (url && url.includes('api.dicebear.com')) {
    const startIdx = url.indexOf('api.dicebear.com');
    return 'https://' + decodeURIComponent(url.substring(startIdx));
  }
  return url;
}

const ChatRoom = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.profile?.id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchUser, setMatchUser] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await apiFetch(`/api/chat/${matchId}/`);
      if (response.ok) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMatchUser = async () => {
    try {
      const response = await apiFetch(`/api/matches/${matchId}/`);
      if (response.ok) {
        setMatchUser(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchMatchUser();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await apiFetch(`/api/chat/${matchId}/`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage })
      });
      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initial = (matchUser?.full_name || matchUser?.username || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] font-sans text-[#202124]">
            <div className="bg-[#f8f9fa] border-b border-[#dadce0] px-6 py-4 flex items-center gap-4">
              {matchUser?.avatar ? (
                <img
                  src={cleanAvatarUrl(matchUser.avatar)}
                  alt={matchUser.full_name || matchUser.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {initial}
                </div>
              )}
              <div>
                <h3 className="font-medium text-[15px]">{matchUser?.full_name || matchUser?.username || `Match #${matchId}`}</h3>
                <p className="text-xs text-[#34A853]">Connected Companion</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-[#f8f9fa] flex flex-col gap-4">
              {messages.map((msg) => {
                const isMine = msg.sender === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-400 mb-1 px-1">{msg.sender_name}</span>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] ${isMine ? 'bg-[#10b981] text-white rounded-br-sm' : 'bg-white border border-gray-150 text-[#202124] rounded-bl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
                  <span className="text-4xl mb-2">💬</span>
                  <p className="text-sm">No messages yet. Send a greeting to start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="bg-white border-t border-[#dadce0] p-4 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#f1f3f4] border border-transparent focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-full px-5 py-3 text-[15px] outline-none transition-all"
              />
              <button
                type="submit"
                className="w-12 h-12 bg-[#10b981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatRoom;
