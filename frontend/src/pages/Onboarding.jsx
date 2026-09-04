import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../App';
import { CITIES } from '../constants';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [pace, setPace] = useState('');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = location.trim()
    ? CITIES.filter(c => c.toLowerCase().includes(location.toLowerCase().trim()))
    : CITIES;

  useEffect(() => {
    apiFetch('/api/me/').then(({ ok, data }) => {
      if (ok && data.authenticated) {
        setFullName(data.profile?.full_name || '');
        setEmail(data.profile?.email || '');
        setLocation(data.profile?.home_city || '');
      }
    });
  }, []);

  const LANGUAGES_LIST = [
    'English',
    'Hindi',
    'Assamese',
    'Bengali',
    'Telugu',
    'Marathi',
    'Tamil',
    'Gujarati',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Maithili'
  ];

  const toggleLanguage = (lang) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    const { ok } = await apiFetch('/api/onboarding/complete/', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        home_city: location.trim(),
        age: age ? parseInt(age, 10) : null,
        gender,
        bio,
        pace,
        languages,
        style_tags: []
      }),
    });
    setLoading(false);
    if (ok) {
      const me = await apiFetch('/api/me/');
      if (me.ok) {
        setUser(me.data);
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 font-sans text-[#202124]">
      <div className="w-full max-w-2xl px-6">
        
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-8 h-8 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2 text-gray-900">WanderMate</h1>
          <p className="text-[#5f6368] text-[15px]">Let's personalize your travel experience</p>
        </div>

        <div className="mb-12">
          <div className="h-1 bg-[#f1f3f4] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#4285F4] transition-all duration-500 ease-in-out" 
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-[13px] font-medium">
            <span className={currentStep >= 1 ? "text-[#4285F4]" : "text-[#5f6368]"}>You</span>
            <span className={currentStep >= 2 ? "text-[#4285F4]" : "text-[#5f6368]"}>Style</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-3xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-medium tracking-tight mb-2">Tell us about yourself</h2>
              <p className="text-[#5f6368] mb-8 text-[15px]">This helps travelers understand who you are before connecting.</p>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]" 
                    placeholder="Your Name" 
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]" 
                    placeholder="name@example.com" 
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 relative" ref={cityDropdownRef}>
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="location">Current City</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      id="location" 
                      autoComplete="off"
                      value={location}
                      onFocus={() => setCityDropdownOpen(true)}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setCityDropdownOpen(true);
                      }}
                      className="w-full px-4 py-3.5 pr-10 bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]" 
                      placeholder="e.g., Hyderabad, Delhi, Bangalore..." 
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setCityDropdownOpen(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] p-1 cursor-pointer"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {cityDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#dadce0] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1">
                      {filteredCities.length > 0 ? (
                        filteredCities.map(city => (
                          <button
                            key={city}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm text-[#202124] hover:bg-[#f0fdf4] hover:text-[#10b981] transition-colors flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              setLocation(city);
                              setCityDropdownOpen(false);
                            }}
                          >
                            <span>{city}</span>
                            {location.toLowerCase() === city.toLowerCase() && (
                              <span className="text-[#10b981] font-bold text-xs">✓</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-gray-500">
                          Custom city "{location}" will be saved
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="age">Age</label>
                    <input 
                      type="number" 
                      id="age" 
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]" 
                      placeholder="e.g., 25" 
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="gender">Gender</label>
                    <select 
                      id="gender" 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1" htmlFor="bio">Bio</label>
                  <textarea 
                    id="bio" 
                    rows="4" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all resize-none text-[15px]" 
                    placeholder="A short bio about your travel style..."
                    required
                  ></textarea>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {LANGUAGES_LIST.map((lang) => {
                      const isSelected = languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 text-[14px] font-medium rounded-full border transition-all ${
                            isSelected
                              ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                              : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    className="px-8 py-2.5 bg-[#0b57d0] text-white text-[15px] font-medium rounded-full hover:bg-[#0842a0] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-medium tracking-tight mb-2">Your travel style</h2>
              <p className="text-[#5f6368] mb-8 text-[15px]">What kind of experiences are you looking for?</p>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); completeOnboarding(); }}>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#5f6368] ml-1">Travel Pace</label>
                  <select 
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all text-[15px]"
                    required
                  >
                    <option value="">Select pace</option>
                    <option value="relaxed">Relaxed (1-2 activities/day)</option>
                    <option value="moderate">Moderate (Balanced schedule)</option>
                    <option value="fast">Fast-paced (See everything)</option>
                  </select>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-6 py-2.5 text-[#5f6368] text-[15px] font-medium rounded-full hover:bg-[#f1f3f4] transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-2.5 bg-[#0b57d0] text-white text-[15px] font-medium rounded-full hover:bg-[#0842a0] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
