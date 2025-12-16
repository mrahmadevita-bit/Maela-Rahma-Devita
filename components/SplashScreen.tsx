
import React, { useState } from 'react';
import { Play, Sparkles, Star, Zap } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const SplashScreen = ({ onStart }: { onStart: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    soundManager.playClick();
    setIsExiting(true);
    // Wait for animation to finish before switching state
    setTimeout(() => {
      onStart();
    }, 800); // Duration matches the fade-out CSS
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden font-sans transition-opacity duration-1000 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* INTERNAL STYLES FOR ANIMATION */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-10deg); }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradientMove 10s ease infinite;
        }
        .animate-float-up { animation: floatUp 6s ease-in-out infinite; }
        .animate-float-down { animation: floatDown 7s ease-in-out infinite; }
      `}</style>

      {/* 1. ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300 animate-gradient"></div>
      
      {/* 2. DECORATIVE FLOATING SHAPES */}
      <div className="absolute top-10 left-10 text-white/40 animate-float-down">
          <Star size={80} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-white/30 animate-float-up">
          <Zap size={120} fill="currentColor" />
      </div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-700"></div>

      {/* 3. MAIN GLASSMORPHISM CARD */}
      <div className="relative z-10 mx-4 max-w-lg w-full bg-white/20 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 md:p-12 flex flex-col items-center text-center animate-bounce-in">
          
          {/* Header Title */}
          <div className="mb-6">
              <h2 className="text-sm md:text-base font-black text-white tracking-[0.2em] uppercase drop-shadow-sm mb-2 opacity-90">
                  Media Pembelajaran Interaktif
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-md tracking-wide font-fredoka leading-tight">
                  PERUBAHAN<br/>
                  <span className="text-yellow-300 text-shadow-soft">ENERGI</span>
              </h1>
          </div>

          {/* Divider */}
          <div className="w-24 h-2 bg-white/50 rounded-full mb-8"></div>

          {/* Student Identity */}
          <div className="bg-white/40 rounded-3xl p-6 w-full mb-8 border border-white/50 shadow-inner">
              <div className="flex flex-col gap-2">
                  <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Nama Mahasiswa</span>
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-wide">MAELA RAHMA DEVITA</h3>
                  </div>
                  
                  <div className="w-full h-[1px] bg-slate-400/20 my-2"></div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">NPM</span>
                          <p className="text-lg font-black text-purple-700">2386206014</p>
                      </div>
                      <div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Kelas</span>
                          <p className="text-lg font-black text-pink-600">5A (PGSD)</p>
                      </div>
                  </div>
                  
                  <div className="mt-2">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full">
                           PENGEMBANGAN PEMBELAJARAN IPA SD
                       </span>
                  </div>
              </div>
          </div>

          {/* Start Button */}
          <button 
              onClick={handleStart}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-xl md:text-2xl font-black py-4 px-12 rounded-full shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-1 active:shadow-sm transition-all duration-300 w-full md:w-auto animate-pulse hover:animate-none flex items-center justify-center gap-3"
          >
              <span className="drop-shadow-md">MULAI BELAJAR</span>
              <div className="bg-white/20 p-1 rounded-full">
                 <Play fill="white" size={20} className="ml-1"/>
              </div>
              
              {/* Sparkles Decoration on Button */}
              <Sparkles className="absolute -top-2 -right-2 text-yellow-300 w-8 h-8 animate-spin-slow" />
          </button>

          {/* Footer Text */}
          <p className="absolute bottom-4 text-white/60 text-[10px] font-bold tracking-widest uppercase">
              Universitas Muhammadiyah Kotabumi
          </p>
      </div>
    </div>
  );
};
