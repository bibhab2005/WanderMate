import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../App';
import { CITIES } from '../constants';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState(() => ({
    name: user?.profile?.full_name || '',
    email: user?.profile?.email || '',
    location: user?.profile?.home_city || '',
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    bio: user?.profile?.bio || '',
    languages: user?.profile?.languages || [],
    travelStyles: user?.profile?.style_tags || []
  }));

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = formData.location.trim()
    ? CITIES.filter(c => c.toLowerCase().includes(formData.location.toLowerCase().trim()))
    : CITIES;

  const availableLanguages = [
    'English', 'Hindi', 'Assamese', 'Bengali', 'Telugu', 
    'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Odia', 
    'Malayalam', 'Punjabi', 'Maithili'
  ];

  const travelStylesList = [
    { id: 'backpacking', icon: '🎒', label: 'Backpacking' },
    { id: 'foodie', icon: '🍜', label: 'Foodie' },
    { id: 'nature', icon: '🌿', label: 'Nature' },
    { id: 'culture', icon: '🏛️', label: 'Culture' },
    { id: 'adventure', icon: '🧗', label: 'Adventure' },
    { id: 'photography', icon: '📷', label: 'Photography' },
    { id: 'beach', icon: '🏖️', label: 'Beach' },
    { id: 'mountains', icon: '⛰️', label: 'Mountains' }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiFetch('/api/me/');
        if (response.ok && response.data.authenticated) {
          const profile = response.data.profile || {};
          setFormData(prevState => ({
            ...prevState,
            name: profile.full_name || prevState.name || '',
            email: profile.email || prevState.email || '',
            location: profile.home_city || prevState.location || '',
            age: profile.age || prevState.age || '',
            gender: profile.gender || prevState.gender || '',
            bio: profile.bio || prevState.bio || '',
            languages: (profile.languages && profile.languages.length > 0) ? profile.languages : prevState.languages,
            travelStyles: (profile.style_tags && profile.style_tags.length > 0) ? profile.style_tags : prevState.travelStyles
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleLanguage = (lang) => {
    setFormData(prevState => ({
      ...prevState,
      languages: prevState.languages.includes(lang)
        ? prevState.languages.filter(l => l !== lang)
        : [...prevState.languages, lang]
    }));
  };

  const toggleTravelStyle = (styleId) => {
    setFormData(prevState => ({
      ...prevState,
      travelStyles: prevState.travelStyles.includes(styleId)
        ? prevState.travelStyles.filter(s => s !== styleId)
        : [...prevState.travelStyles, styleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.age !== '' && formData.age !== null && formData.age !== undefined) {
      const parsedAge = parseInt(formData.age, 10);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        alert("Please enter a valid age between 1 and 120.");
        return;
      }
    }
    try {
      const response = await apiFetch('/api/onboarding/complete/', {
        method: 'POST',
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          home_city: formData.location.trim(),
          age: formData.age ? parseInt(formData.age, 10) : null,
          gender: formData.gender,
          bio: formData.bio,
          languages: formData.languages,
          style_tags: formData.travelStyles,
          pace: 'moderate'
        })
      });
      if (response.ok && response.data?.success) {
        const me = await apiFetch('/api/me/');
        if (me.ok) {
          setUser(me.data);
        }
        navigate('/dashboard');
      } else {
        const errorMsg = response.data?.error || response.data?.detail || 'Server rejected request details';
        console.error("Profile save error:", response.data);
        alert(`Error saving profile: ${errorMsg}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving profile. Please check the console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 pb-20 font-sans text-[#202124] relative">
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-8 text-[14px] font-medium text-[#5f6368] hover:text-[#202124] transition-colors"
      >
        Logout
      </button>

      <div className="w-full max-w-2xl px-6">
        <div className="flex flex-col items-center mb-10">
          <svg className="w-8 h-8 text-[#0d9488] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h1 className="text-xl font-black tracking-tight text-gray-900">WanderMate</h1>
          <p className="text-sm text-[#5f6368] mt-2">Let's personalize your travel experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-[#dadce0] rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-medium tracking-tight mb-2">Tell us about yourself</h2>
          <p className="text-[14px] text-[#5f6368] mb-6">This helps travelers understand who you are before connecting.</p>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]" 
            />
          </div>

          <div className="flex flex-col gap-2 relative" ref={cityDropdownRef}>
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Current City</label>
            <div className="relative">
              <input 
                type="text" 
                name="location"
                autoComplete="off"
                placeholder="e.g. Hyderabad, Delhi, Bangalore..."
                value={formData.location}
                onFocus={() => setCityDropdownOpen(true)}
                onChange={(e) => {
                  handleChange(e);
                  setCityDropdownOpen(true);
                }}
                className="w-full px-4 py-3.5 pr-10 bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]" 
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
                        setFormData(prev => ({ ...prev, location: city }));
                        setCityDropdownOpen(false);
                      }}
                    >
                      <span>{city}</span>
                      {formData.location.toLowerCase() === city.toLowerCase() && (
                        <span className="text-[#10b981] font-bold text-xs">✓</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    Custom city "{formData.location}" will be saved
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#5f6368] ml-1">Age</label>
              <input 
                type="number" 
                name="age"
                min="1"
                max="120"
                placeholder="e.g. 24"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#5f6368] ml-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Bio</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3.5 bg-transparent border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Travel Style Tags</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {travelStylesList.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleTravelStyle(style.id)}
                  className={`px-3 py-3 rounded-xl text-[14px] font-medium transition-all border flex items-center justify-center gap-2 ${
                    formData.travelStyles.includes(style.id)
                      ? 'bg-[#e8f0fe] text-[#1967d2] border-[#1967d2]'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="text-[13px] font-medium text-[#5f6368] ml-1">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors border ${
                    formData.languages.includes(lang)
                      ? 'bg-[#e8f0fe] text-[#1967d2] border-[#e8f0fe]'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f8f9fa]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-[#0b57d0] text-white text-[15px] font-medium rounded-full hover:bg-[#0842a0] transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
