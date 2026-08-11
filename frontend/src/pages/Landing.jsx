import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 500 : 300;
      carouselRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#202124] overflow-x-hidden selection:bg-[#c2e7ff] selection:text-[#202124]">
      
      <div className="relative min-h-[90vh] flex flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(66,133,244,0.08)_0%,transparent_70%)]"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM0Mjg1RjQiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjRUE0MzM1Ii8+PGNpcmNsZSBjeD0iMzgiIGN5PSIzOCIgcj0iMSIgZmlsbD0iI0ZCQkMwNSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
          />
        </div>

        <nav className="relative z-50 w-full px-6 py-6 h-20 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <svg className="w-9 h-9 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" />
              </svg>
              <span className="text-2xl font-medium tracking-tight">WanderMate</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-lg text-[#5f6368] font-medium">
              <a href="#features" className="hover:text-[#202124] cursor-pointer py-4 transition-colors">Features</a>
              <a href="#tech-stack" className="hover:text-[#202124] cursor-pointer py-4 transition-colors">Tech Stack</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden md:block text-lg font-medium text-[#5f6368] hover:text-[#202124]">Log in</Link>
            <Link to="/signup" className="px-8 py-3 bg-[#202124] text-white text-lg font-medium rounded-full hover:bg-black transition-colors flex items-center gap-2">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 mt-[-5vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z" /></svg>
              <span className="text-sm md:text-base font-medium tracking-tight text-[#5f6368]">
                Experience the world with the next-gen companion platform
              </span>
            </div>
            
            <h1 className="text-7xl md:text-[8rem] leading-[1] font-medium tracking-tighter text-[#202124] max-w-5xl mx-auto mb-8">
              WanderMate
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="px-8 py-3.5 bg-[#202124] text-white text-[15px] font-medium rounded-full hover:bg-black transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                Open Web App
              </Link>
              <a href="#tech-stack" className="px-8 py-3.5 bg-[#f8f9fa] border border-[#dadce0] text-[#202124] text-[15px] font-medium rounded-full hover:bg-[#f1f3f4] transition-colors">
                View Tech Stack
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <section id="features" className="py-32 px-6 max-w-[1400px] mx-auto border-t border-[#f1f3f4]">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          <h2 className="text-[3.5rem] leading-[1.1] font-medium tracking-tighter text-[#202124] max-w-xl">
            Built for diverse travel experiences
          </h2>
          <p className="text-lg text-[#5f6368] max-w-md lg:mt-4 leading-relaxed">
            Whether you are hitting the trails alone or organizing a massive group for a live event, WanderMate adapts to your specific coordination needs.
          </p>
        </div>

        <div className="relative mb-28 group">
          <button 
            onClick={() => scrollCarousel('left')} 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/95 backdrop-blur-sm border border-[#dadce0] rounded-full flex items-center justify-center text-[#202124] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex hover:bg-gray-50 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar scroll-smooth">
            
            <div className="relative h-[600px] min-w-[85vw] sm:min-w-[500px] lg:min-w-[calc(50%-12px)] bg-[#f8f9fa] rounded-[2rem] overflow-hidden group/card snap-start shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop" 
                alt="Solo Backpacker Hiking" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-5xl font-medium tracking-tighter text-white">Solo<br/>backpacker</h3>
              </div>
            </div>

            <div className="relative h-[600px] min-w-[85vw] sm:min-w-[500px] lg:min-w-[calc(50%-12px)] bg-[#f8f9fa] rounded-[2rem] overflow-hidden group/card snap-start shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop" 
                alt="Concert Crowd" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-5xl font-medium tracking-tighter text-white">Event<br/>squad</h3>
              </div>
            </div>

            <div className="relative h-[600px] min-w-[85vw] sm:min-w-[500px] lg:min-w-[calc(50%-12px)] bg-[#f8f9fa] rounded-[2rem] overflow-hidden group/card snap-start shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop" 
                alt="Trip Planning" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-5xl font-medium tracking-tighter text-white">AI itinerary<br/>planner</h3>
              </div>
            </div>

            <div className="relative h-[600px] min-w-[85vw] sm:min-w-[500px] lg:min-w-[calc(50%-12px)] bg-[#f8f9fa] rounded-[2rem] overflow-hidden group/card snap-start shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop" 
                alt="Friends Chatting" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-5xl font-medium tracking-tighter text-white">Chat &<br/>go</h3>
              </div>
            </div>

            <div className="relative h-[600px] min-w-[85vw] sm:min-w-[500px] lg:min-w-[calc(50%-12px)] bg-[#f8f9fa] rounded-[2rem] overflow-hidden group/card snap-start shrink-0 flex items-center justify-center border border-[#dadce0]">
              
              {/* Subtle blue background glow that appears on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,133,244,0.15)_0%,transparent_60%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>

              {/* Huge Verified Tick Icon */}
              <div className="relative z-10 transform group-hover/card:scale-110 transition-transform duration-700 mb-20">
                <div className="absolute inset-2 bg-[#4285F4] blur-2xl opacity-30 rounded-full animate-pulse"></div>
                <svg className="w-40 h-40 text-[#4285F4] relative z-10 drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              {/* Text gradient overlay so the white text still pops */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <div className="absolute bottom-10 left-10 z-20">
                <h3 className="text-5xl font-medium tracking-tighter text-white drop-shadow-lg">Verified<br/>profiles</h3>
              </div>
            </div>

          </div>

          <button 
            onClick={() => scrollCarousel('right')} 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/95 backdrop-blur-sm border border-[#dadce0] rounded-full flex items-center justify-center text-[#202124] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex hover:bg-gray-50 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16 mb-40">
          <div className="lg:w-1/3">
            <h2 className="text-5xl font-medium tracking-tighter text-[#202124] mb-6">Jaccard Matching Engine</h2>
            <p className="text-lg text-[#5f6368] leading-relaxed">
              Find custom companions leveraging our proprietary Python-based algorithm. It mathematically cross-references your profile tags, overlapping dates, and constraints to surface perfectly aligned travel partners.
            </p>
          </div>
          <div className="lg:w-2/3 w-full h-[500px] bg-[#0a0f1c] rounded-[2rem] relative overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="absolute w-[400px] h-[400px] border-[40px] border-[#4285F4]/30 rounded-full blur-xl animate-pulse"></div>
            
            <div className="relative z-10 w-full max-w-lg p-8 bg-[#1a1b1e]/80 backdrop-blur-md rounded-2xl border border-gray-700">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <span className="text-white font-medium">Similarity Score Calculation</span>
                <span className="text-[#4285F4] font-mono text-sm">J(A,B) = |A ∩ B| / |A ∪ B|</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Target User Vectors</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-800 rounded-md text-xs text-white">Adventure</span>
                    <span className="px-3 py-1 bg-gray-800 rounded-md text-xs text-white">Culture</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Match Output</span>
                  <span className="text-[#34A853] font-mono font-bold text-xl">94.2%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/3">
            <h2 className="text-5xl font-medium tracking-tighter text-[#202124] mb-6">Smart Trip Planner</h2>
            <p className="text-lg text-[#5f6368] leading-relaxed">
              The lightweight, fast, destination-first surface to work with your travel plans. Powered by Natural Language Understanding (NLU) and generative AI to instantly draft cohesive, day-by-day itineraries.
            </p>
          </div>
          
          <div className="lg:w-2/3 w-full h-[500px] bg-[#f8f9fa] rounded-[2rem] border border-[#dadce0] p-6 relative overflow-hidden shadow-2xl flex flex-col">
            <div className="w-full bg-white rounded-xl border border-[#dadce0] px-4 py-3 flex items-center gap-3 mb-6 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EA4335]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FBBC05]"></div>
                <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
              </div>
              <div className="flex-1 bg-[#f1f3f4] rounded-lg py-1 px-3 text-xs text-[#5f6368] font-mono text-center">
                localhost:5174/planner
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-[#dadce0] p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-[#f8f9fa] border border-[#dadce0] rounded-full px-4 py-2.5 text-sm text-[#202124] flex items-center justify-between">
                  <span>Udaipur, India</span>
                  <span className="text-xs text-[#5f6368]">4 Days</span>
                </div>
                <button className="px-6 py-2.5 bg-[#202124] text-white text-sm font-medium rounded-full shadow-sm">
                  Generate
                </button>
              </div>

              <div className="flex-1 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-5 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#4285F4]">AI Itinerary Generated</span>
                    <span className="text-xs text-[#34A853] font-medium bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">3 Matches Found</span>
                  </div>
                  <div className="space-y-2 text-sm text-[#202124]">
                    <div className="font-medium"><span className="text-[#FBBC05]">Day 1:</span> City Palace Tour & Lake Pichola Boat Ride</div>
                    <div className="font-medium"><span className="text-[#FBBC05]">Day 2:</span> Sajjangarh Monsoon Palace & Sunset Points</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#dadce0]">
                  <span className="text-xs text-[#5f6368]">Compatible Travelers:</span>
                  <span className="text-xs bg-white border border-[#dadce0] px-2.5 py-1 rounded-full text-[#202124] font-medium">Sneha S. (95%)</span>
                  <span className="text-xs bg-white border border-[#dadce0] px-2.5 py-1 rounded-full text-[#202124] font-medium">Aravind K. (90%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tech-stack" className="py-32 px-6 max-w-[1400px] mx-auto border-t border-[#f1f3f4]">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-medium tracking-tighter text-[#202124] mb-6">System Architecture</h2>
          <p className="text-xl text-[#5f6368] max-w-2xl mx-auto">
            WanderMate is engineered as a full-stack web application utilizing modern frameworks, advanced natural language processing, and robust data models.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-3xl p-10 hover:shadow-lg transition-shadow duration-300">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-[#202124] mb-4">Frontend Environment</h3>
            <ul className="space-y-3 text-[#5f6368] font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span> React.js (Vite)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span> Tailwind CSS v4</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span> Native PDF Print Engine</li>
            </ul>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-3xl p-10 hover:shadow-lg transition-shadow duration-300">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-[#202124] mb-4">Backend Infrastructure</h3>
            <ul className="space-y-3 text-[#5f6368] font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span> Python 3</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span> Django REST Framework</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span> SQLite / Token Auth</li>
            </ul>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-3xl p-10 hover:shadow-lg transition-shadow duration-300">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-[#202124] mb-4">AI & Machine Learning</h3>
            <ul className="space-y-3 text-[#5f6368] font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]"></span> Google Gemini 2.5 API</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]"></span> Pollinations AI Images</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]"></span> Hugging Face API</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black pt-40 pb-20 px-6 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
           <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="w-[1200px] h-[1200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEiIGZpbGw9IiM0Mjg1RjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjE1MCIgcj0iMSIgZmlsbD0iIzQyODVGNCIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjUwIiByPSIxLjUiIGZpbGw9IiM0Mjg1RjQiLz48L3N2Zz4=')] [mask-image:radial-gradient(circle,black_20%,transparent_70%)]"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-6xl md:text-8xl font-medium tracking-tighter text-white mb-12 leading-[1.05]">
            Join <br/> WanderMate <span className="text-[#4285F4]">|</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-32">
            <Link to="/signup" className="w-full sm:w-auto px-10 py-4 bg-white text-[#202124] text-[15px] font-medium rounded-full hover:bg-gray-100 transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 px-4 overflow-hidden border-t border-[#dadce0]">
        <div className="w-full text-center flex items-center justify-center">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-[11vw] font-black tracking-tighter text-[#202124] leading-none select-none w-full block whitespace-nowrap"
          >
            wAnDeRmAtE
          </motion.h1>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default Landing;
