import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../App';

const TopNav = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        <svg 
          className="w-8 h-8 text-[#0d9488]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="text-2xl font-black tracking-tight text-gray-900">WanderMate</span>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNav;
