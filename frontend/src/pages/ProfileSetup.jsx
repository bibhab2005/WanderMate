import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../App';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bio: '',
    languages: [],
    travelStyles: []
  });

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
          const { full_name, email, languages, style_tags } = response.data.profile || {};
          setFormData(prevState => ({
            ...prevState,
            name: full_name || '',
            email: email || '',
            languages: languages || [],
            travelStyles: style_tags || []
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

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
    try {
      const response = await apiFetch('/onboarding/complete/', {
        method: 'POST',
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          age: formData.age ? parseInt(formData.age, 10) : null,
          gender: formData.gender,
          bio: formData.bio,
          languages: formData.languages,
          style_tags: formData.travelStyles,
          pace: 'moderate'
        })
      });
      if (response.ok) {
        const me = await apiFetch('/api/me/');
        if (me.ok) {
          setUser(me.data);
        }
        navigate('/dashboard');
      } else {
        console.error(response.data || response.error);
        alert(`Error saving profile: ${response.error || 'Server rejected request details'}`);
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
          <svg className="w-8 h-8 text-[#4285F4] mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" />
          </svg>
          <h1 className="text-xl font-medium tracking-tight">WanderMate</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#5f6368] ml-1">Age</label>
              <input 
                type="number" 
                name="age"
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
