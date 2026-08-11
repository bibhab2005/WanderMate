import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../api';
import { CITIES } from '../constants';

const Itineraries = () => {
  const [viewState, setViewState] = useState('list'); // 'list', 'detail', 'generate'
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  
  // Generation state
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [groupSize, setGroupSize] = useState('Solo');
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (viewState === 'list') {
      fetchSavedItineraries();
    }
  }, [viewState]);

  const fetchSavedItineraries = async () => {
    try {
      const response = await apiFetch('/api/itineraries/ai/');
      if (response.ok && response.data.itineraries) {
        setSavedItineraries(response.data.itineraries);
      }
    } catch (e) {
      console.error('Failed to fetch itineraries');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await apiFetch('/api/itineraries/generate/', {
        method: 'POST',
        body: JSON.stringify({ destination, days, minBudget, maxBudget, group_size: groupSize, is_public: isPublic }),
      });
      if (response.ok && response.data.success) {
        setSelectedItinerary(response.data.itinerary);
        setViewState('detail');
      } else {
        alert(response.data.error || 'Failed to generate itinerary');
      }
    } catch (e) {
      alert('Error connecting to backend');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([
      ...chatHistory, 
      { sender: 'user', text: chatMessage }, 
      { sender: 'ai', text: 'Gemini API integration pending. Your request to modify the itinerary has been queued.' }
    ]);
    setChatMessage('');
  };

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">AI Itineraries</h1>
          <p className="text-[#5f6368]">Your personalized travel plans</p>
        </div>
        <button 
          onClick={() => setViewState('generate')}
          className="px-5 py-2.5 bg-[#10b981] text-white font-semibold rounded-full hover:bg-[#059669] flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedItineraries.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You haven't generated any itineraries yet.</p>
            <button 
              onClick={() => setViewState('generate')}
              className="px-4 py-2 border border-[#10b981] text-[#10b981] font-medium rounded-lg hover:bg-green-50"
            >
              Create your first plan
            </button>
          </div>
        ) : (
          savedItineraries.map((itin) => {
            return (
              <div 
                key={itin.id}
                onClick={() => {
                  setSelectedItinerary(itin);
                  setViewState('detail');
                }}
                className="relative h-56 rounded-[1.5rem] p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-slate-800"
                style={{
                  backgroundImage: `url('https://image.pollinations.ai/prompt/Beautiful%20landscape%20photo%20of%20${encodeURIComponent(itin.destination)}%20city?width=800&height=600&nologo=true')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors"></div>
                
                <div className="relative h-full flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    {itin.is_public ? (
                      <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full shadow-sm text-white" title="Public (Matchmaking Enabled)">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                    ) : (
                      <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full shadow-sm text-gray-300" title="Private">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                    )}
                    {itin.itinerary_data?.trip_summary?.estimated_total_cost && (
                      <span className="bg-red-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm tracking-wide">
                        Est {itin.itinerary_data.trip_summary.estimated_total_cost}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold mb-2 shadow-sm capitalize tracking-tight">{itin.destination}</h2>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-200">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        {itin.group_size}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {itin.days} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderGenerate = () => (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-black transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 className="text-2xl font-bold text-[#202124]">Create New Plan</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm mb-8">
        <div className="mb-4">
          <span className="text-sm text-gray-500">Personalizing based on your profile styles...</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-[#f8f9fa] border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#4285F4] transition-colors appearance-none"
          >
            <option value="" disabled>Select Destination</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="bg-[#f8f9fa] border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#4285F4] transition-colors"
          />
          <input 
            type="number" 
            placeholder="Min Budget (₹)"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="bg-[#f8f9fa] border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#4285F4] transition-colors"
          />
          <input 
            type="number" 
            placeholder="Max Budget (₹)"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="bg-[#f8f9fa] border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#4285F4] transition-colors"
          />
          <select 
            value={groupSize} 
            onChange={(e) => setGroupSize(e.target.value)}
            className="bg-[#f8f9fa] border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#4285F4] transition-colors"
          >
            <option value="Solo">Solo</option>
            <option value="Couple">Couple</option>
            <option value="Small Group">Small Group</option>
            <option value="Event Squad">Event Squad</option>
          </select>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer transition-all"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-[#10b981] transition-colors">Make this trip public</p>
              <p className="text-xs text-gray-500">Allow others to find and match with you for this destination.</p>
            </div>
          </label>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !destination || !days}
            className="px-6 py-2.5 bg-[#10b981] text-white font-semibold rounded-lg hover:bg-[#059669] disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isGenerating && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedItinerary) return null;
    const { itinerary_data } = selectedItinerary;
    const data = itinerary_data.days ? itinerary_data : selectedItinerary;
    
    const handleDownloadPDF = () => {
      window.print();
    };

    const handleTogglePrivacy = async () => {
      try {
        const response = await apiFetch(`/api/itineraries/ai/${selectedItinerary.id}/toggle_privacy/`, {
          method: 'PATCH'
        });
        if (response.ok && response.data.success) {
          const updatedItin = { ...selectedItinerary, is_public: response.data.is_public };
          setSelectedItinerary(updatedItin);
          setSavedItineraries(savedItineraries.map(i => i.id === updatedItin.id ? updatedItin : i));
        }
      } catch (e) {
        console.error('Failed to toggle privacy', e);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-black transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h1 className="text-2xl font-bold text-[#202124] capitalize">{selectedItinerary.destination} Itinerary</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-sm font-medium text-gray-700">Public:</span>
              <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  checked={selectedItinerary.is_public || false}
                  onChange={handleTogglePrivacy}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                  style={{ transform: selectedItinerary.is_public ? 'translateX(100%)' : 'translateX(0)', borderColor: selectedItinerary.is_public ? '#10b981' : '#d1d5db' }}
                />
                <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${selectedItinerary.is_public ? 'bg-[#10b981]' : 'bg-gray-300'}`}></div>
              </div>
            </label>
            <button onClick={handleDownloadPDF} className="text-sm font-medium text-white bg-[#10b981] px-5 py-2.5 rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PDF
            </button>
          </div>
        </div>

        <div id="printable-itinerary" className="space-y-6 bg-[#f9fafb] pb-4">
          <div className="hidden print:block mb-6 text-center">
             <h2 className="text-3xl font-extrabold text-[#202124] capitalize">{selectedItinerary.destination} Travel Plan</h2>
             <p className="text-gray-500">{selectedItinerary.days} Days • {selectedItinerary.group_size}</p>
          </div>


        {data.days?.map((dayData, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-5 text-[#202124]">Day {dayData.day}: {dayData.title}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shrink-0">🌅</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{dayData.morning?.place}</h4>
                  <p className="text-gray-600 mb-2 leading-relaxed">{dayData.morning?.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">Cost: {dayData.morning?.estimated_cost}</span>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl shrink-0">☀️</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{dayData.afternoon?.place}</h4>
                  <p className="text-gray-600 mb-2 leading-relaxed">{dayData.afternoon?.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">Cost: {dayData.afternoon?.estimated_cost}</span>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0">🌙</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{dayData.evening?.place}</h4>
                  <p className="text-gray-600 mb-2 leading-relaxed">{dayData.evening?.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">Cost: {dayData.evening?.estimated_cost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm mt-8 print:hidden">
          <h3 className="text-lg font-bold mb-4">Refine Itinerary with Gemini AI</h3>
          <div className="h-64 overflow-y-auto border border-gray-200 rounded-xl p-4 mb-4 bg-[#f8f9fa] space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <svg className="w-12 h-12 text-[#4285F4] mb-3 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p className="text-sm text-gray-500 font-medium">Want to tweak the plan?<br/>Ask Gemini to modify activities, adjust budgets, or swap places.</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-[#4285F4] text-white rounded-br-sm shadow-sm' : 'bg-white border border-gray-200 text-[#202124] rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text"
              placeholder="Type your changes here..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-xl px-5 py-3 outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all shadow-sm"
            />
            <button 
              type="submit"
              className="px-8 py-3 bg-[#4285F4] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col font-sans print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        <div className="print:hidden shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto w-full print:max-w-none">
            {viewState === 'list' && renderList()}
            {viewState === 'generate' && renderGenerate()}
            {viewState === 'detail' && renderDetail()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Itineraries;
