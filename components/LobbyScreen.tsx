
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Trophy, Sun, Cloud, Zap, Star, User, X, Bot, Cat, Rocket, Ghost, Crown, Smile,
  Microscope, Gamepad2, Sparkles, MessageCircle, Hexagon
} from 'lucide-react';
import { GameState } from '../types';
import { soundManager } from '../utils/soundManager';

// --- DATA AVATAR ---
const AVATAR_OPTIONS = [
  { id: 'scientist', icon: User, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-100', label: 'Ilmuwan' },
  { id: 'robot', icon: Bot, color: 'from-gray-400 to-slate-600', bg: 'bg-slate-200', label: 'Cyborg' },
  { id: 'cat', icon: Cat, color: 'from-orange-400 to-red-500', bg: 'bg-orange-100', label: 'Meow' },
  { id: 'energy', icon: Zap, color: 'from-yellow-400 to-amber-600', bg: 'bg-yellow-100', label: 'Spark' },
  { id: 'space', icon: Rocket, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-100', label: 'Astro' },
  { id: 'ghost', icon: Ghost, color: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-100', label: 'Spooky' },
  { id: 'king', icon: Crown, color: 'from-yellow-300 to-yellow-600', bg: 'bg-yellow-50', label: 'Sultan' },
  { id: 'smile', icon: Smile, color: 'from-pink-400 to-rose-500', bg: 'bg-pink-100', label: 'Happy' },
];

export const LobbyScreen = ({ onNavigate }: { onNavigate: (state: GameState) => void }) => {
  // State Robot & Guide
  // Updated Initial Message to Robo-Sains
  const [robotMessage, setRobotMessage] = useState<string>("Halo, teman-teman hebat! 👋 Aku adalah Robo-Sains.");
  const [isRobotAnimating, setIsRobotAnimating] = useState(false);
  
  // State Profil Pengguna
  const [profileName, setProfileName] = useState("ILMUWAN MUDA");
  const [selectedAvatarId, setSelectedAvatarId] = useState('scientist');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(""); 
  
  // State Environment (Rainbow)
  const [showRainbow, setShowRainbow] = useState(false);

  // Efek Rainbow Randomizer
  useEffect(() => {
    const rainbowInterval = setInterval(() => {
        setShowRainbow(true);
        setTimeout(() => setShowRainbow(false), 8000);
    }, 20000);
    return () => clearInterval(rainbowInterval);
  }, []);

  // Efek mengetik untuk dialog robot (FIXED BUG: First letter missing)
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText(""); // Clear text initially
    
    const timer = setInterval(() => {
      // Use slice logic (0 to currentIndex) to ensure index 0 is always included
      if (currentIndex <= robotMessage.length) {
        setDisplayedText(robotMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    
    return () => clearInterval(timer);
  }, [robotMessage]);

  const handleRobotClick = () => {
    soundManager.playRobot();
    setIsRobotAnimating(true);
    setTimeout(() => setIsRobotAnimating(false), 500);
    
    // Updated Messages: Typo-free, PUEBI compliant, Motivating
    const messages = [
      "Apakah kalian siap berpetualang?",
      "Ayo pilih levelmu dan uji pengetahuan tentang Perubahan Energi!",
      "Jangan lupa, hati-hati dengan nyawamu saat Kuis ya!",
      "Klik profilmu di atas untuk mengganti gaya penampilan!",
      "Energi tidak bisa diciptakan, tapi bisa diubah bentuknya.",
      "Cobalah eksperimen seru di menu Simulasi!"
    ];
    
    let randomMsg;
    do {
       randomMsg = messages[Math.floor(Math.random() * messages.length)];
    } while (randomMsg === robotMessage);
    
    setRobotMessage(randomMsg);
  };

  const openProfileModal = () => {
      soundManager.playClick();
      setTempName(profileName);
      setShowProfileModal(true);
  };

  const saveProfile = () => {
      soundManager.playClick();
      if (tempName.trim().length > 0) {
          setProfileName(tempName.substring(0, 12).toUpperCase());
      }
      setShowProfileModal(false);
  };

  const handleNavigate = (dest: GameState) => {
      soundManager.playClick();
      onNavigate(dest);
  };

  const handleAvatarSelect = (id: string) => {
      soundManager.playSelect();
      setSelectedAvatarId(id);
  };

  const activeAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];
  const ActiveIcon = activeAvatar.icon;

  return (
    <div className="relative w-full min-h-screen bg-sky-300 overflow-hidden font-sans select-none">
      
      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(110vw); }
        }
        @keyframes sunRayRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes robotHover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 96% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
          100% { transform: scaleY(1); }
        }
        
        .cloud-slow { animation: floatCloud 60s linear infinite; }
        .cloud-medium { animation: floatCloud 40s linear infinite; }
        .cloud-fast { animation: floatCloud 25s linear infinite; }
        .robot-hover { animation: robotHover 3s ease-in-out infinite; }
        .animate-blink { animation: blink 4s infinite; }
        
        /* Modern Glossy Button Styles */
        .glossy-overlay {
            background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0.1) 100%);
        }
        .text-shadow-soft {
            text-shadow: 0px 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* --- BACKGROUND DYNAMIC SCENERY --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
          {/* Langit */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200"></div>

          {/* Matahari */}
          <div className="absolute -top-[100px] -right-[100px] md:-top-[150px] md:-right-[150px] w-[600px] h-[600px] pointer-events-none">
             <div className="absolute inset-0 animate-[sunRayRotate_120s_linear_infinite] opacity-30">
                 <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,#fde047_10deg,transparent_20deg,#fde047_40deg,transparent_50deg,#fde047_80deg,transparent_90deg,#fde047_130deg,transparent_140deg)] blur-3xl"></div>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-400 shadow-[0_0_60px_rgba(253,224,71,0.8)] z-10"></div>
          </div>

          {/* Pelangi */}
          <div className={`absolute top-[10%] left-[20%] w-[80vw] h-[40vw] opacity-0 transition-opacity duration-[3000ms] ease-in-out ${showRainbow ? 'opacity-40' : 'opacity-0'}`}>
              <div className="w-full h-full rounded-full border-[30px] border-t-red-400 border-r-transparent border-b-transparent border-l-transparent absolute top-0 blur-xl"></div>
              <div className="w-full h-full rounded-full border-[30px] border-t-orange-400 border-r-transparent border-b-transparent border-l-transparent absolute top-[20px] scale-95 blur-xl"></div>
              <div className="w-full h-full rounded-full border-[30px] border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent absolute top-[40px] scale-90 blur-xl"></div>
              <div className="w-full h-full rounded-full border-[30px] border-t-green-400 border-r-transparent border-b-transparent border-l-transparent absolute top-[60px] scale-85 blur-xl"></div>
              <div className="w-full h-full rounded-full border-[30px] border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent absolute top-[80px] scale-80 blur-xl"></div>
          </div>

          {/* Awan */}
          <div className="cloud-slow absolute top-[10%] -left-[200px] opacity-60"><Cloud size={200} fill="white" className="text-white blur-md" /></div>
          <div className="cloud-medium absolute top-[15%] -left-[150px] opacity-80 delay-[5s]"><Cloud size={140} fill="white" className="text-white blur-sm" /></div>
          <div className="cloud-fast absolute top-[5%] -left-[100px] opacity-90 delay-[10s]"><Cloud size={100} fill="white" className="text-white" /></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* --- MAIN UI LAYER --- */}
      <div className="relative z-10 w-full h-screen flex flex-col md:flex-row p-4 md:p-6 overflow-hidden">
        
        {/* 1. LEFT COLUMN: PROFILE & ROBOT */}
        <div className="flex flex-row md:flex-col justify-between md:w-1/3 md:max-w-[280px] h-full relative pointer-events-none md:pointer-events-auto z-50">
            
            {/* A. Profile (Top Left) */}
            <div 
                onClick={openProfileModal}
                className="flex items-center gap-3 group cursor-pointer pointer-events-auto transform hover:scale-105 transition-transform"
            >
                <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-white border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.1)] overflow-hidden relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeAvatar.color} opacity-20`}></div>
                        <div className="w-full h-full flex items-center justify-center">
                            <ActiveIcon size={40} className="text-slate-700" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-lg border-2 border-white shadow-sm">
                        LV.5
                    </div>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-white font-black text-lg md:text-xl tracking-wide drop-shadow-md">
                        {profileName}
                    </h2>
                    <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 w-fit">
                        <Star size={12} className="text-yellow-300 fill-yellow-300" />
                        <span className="text-white text-xs font-bold">750 XP</span>
                    </div>
                </div>
            </div>

            {/* B. Robot (Bottom Left) */}
            <div className="absolute bottom-20 md:bottom-0 left-0 md:relative w-full flex flex-col items-center md:items-start pointer-events-auto">
                {/* Speech Bubble */}
                <div className={`mb-2 md:ml-4 relative max-w-[200px] transition-all duration-300 ${isRobotAnimating ? 'scale-105' : 'scale-100'}`}>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-[0_8px_0_rgba(0,0,0,0.1)] border-2 border-white relative z-10">
                        <p className="font-bold text-slate-600 text-sm leading-snug font-sans">
                            {displayedText}
                        </p>
                    </div>
                </div>

                {/* NEW CUTE CHIBI GLOSSY ROBOT DESIGN */}
                <button 
                    onClick={handleRobotClick}
                    className={`relative w-40 h-48 md:w-48 md:h-64 transition-transform duration-200 hover:scale-105 active:scale-95 robot-hover flex flex-col items-center justify-end pb-4`}
                >
                     {/* ANTENNA */}
                     <div className="relative z-0 flex flex-col items-center animate-bounce">
                         <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-500 shadow-[0_0_10px_#fde047] border-2 border-white"></div>
                         <div className="w-1 h-4 bg-slate-300"></div>
                     </div>

                     {/* HEAD (Glossy Gradient Blue->Pink) */}
                     <div className="relative z-20 w-32 h-28 md:w-36 md:h-32 bg-gradient-to-b from-sky-300 via-pink-300 to-purple-300 rounded-[2.5rem] border-4 border-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden">
                         
                         {/* Glossy Reflection (Top) */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-b-full blur-[2px]"></div>
                         
                         {/* Earmuffs */}
                         <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-10 bg-white rounded-full shadow-sm border border-slate-100"></div>
                         <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 bg-white rounded-full shadow-sm border border-slate-100"></div>

                         {/* Screen Face */}
                         <div className="w-[80%] h-[60%] bg-slate-800 rounded-[1.8rem] relative flex flex-col items-center justify-center border-2 border-slate-700/50 shadow-inner overflow-hidden">
                             {/* Screen Glare */}
                             <div className="absolute top-2 right-2 w-4 h-4 bg-white/10 rounded-full blur-[1px]"></div>
                             
                             {/* Eyes Container */}
                             <div className="flex gap-5 animate-blink items-center mt-2">
                                 <div className="w-5 h-7 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]">
                                    <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1 opacity-80"></div>
                                 </div>
                                 <div className="w-5 h-7 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]">
                                    <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1 opacity-80"></div>
                                 </div>
                             </div>
                             
                             {/* Cheeks */}
                             <div className="absolute bottom-3 w-full flex justify-between px-4 opacity-60">
                                 <div className="w-3 h-1.5 bg-pink-400 rounded-full blur-[1px]"></div>
                                 <div className="w-3 h-1.5 bg-pink-400 rounded-full blur-[1px]"></div>
                             </div>
                             
                             {/* Smile */}
                             <div className="w-3 h-1.5 border-b-2 border-cyan-400/80 rounded-full mt-1"></div>
                         </div>
                     </div>

                     {/* BODY (Small & Cute, Gradient Pink->Lilac) */}
                     <div className="relative z-10 w-20 h-16 md:w-24 md:h-18 -mt-3 bg-gradient-to-b from-purple-300 to-violet-400 rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center">
                          {/* Glossy Body Highlight */}
                          <div className="absolute top-2 left-2 w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-[2rem] pointer-events-none"></div>

                          {/* Belly Badge */}
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner border border-slate-100">
                               <Zap size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                          </div>
                     </div>

                     {/* LIMBS (Stubby) */}
                     {/* Arms */}
                     <div className="absolute top-[8rem] left-2 w-6 h-10 bg-pink-300 rounded-full border-2 border-white -rotate-12 shadow-sm origin-top"></div>
                     <div className="absolute top-[8rem] right-2 w-6 h-10 bg-pink-300 rounded-full border-2 border-white rotate-12 shadow-sm origin-top"></div>

                     {/* Legs */}
                     <div className="flex gap-4 -mt-2 z-0">
                         <div className="w-7 h-8 bg-violet-400 rounded-b-[1rem] border-2 border-white"></div>
                         <div className="w-7 h-8 bg-violet-400 rounded-b-[1rem] border-2 border-white"></div>
                     </div>

                     {/* Shadow */}
                     <div className="absolute bottom-0 w-28 h-4 bg-black/10 rounded-full blur-md"></div>
                </button>
            </div>
        </div>

        {/* 2. RIGHT COLUMN: 2x2 MAIN MENU GRID (GLOSSY 3D STYLE) */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-8 z-40 mt-16 md:mt-0">
            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl h-auto">
                
                {/* CARD 1: BELAJAR (Cyan to Blue Sea) */}
                <button 
                    onClick={() => handleNavigate('ACADEMY')}
                    className="group relative rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_10px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_30px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 aspect-square overflow-hidden"
                >
                    {/* Glossy Overlay */}
                    <div className="glossy-overlay absolute inset-0 opacity-80 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 md:gap-3 p-2">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <BookOpen size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white text-shadow-soft tracking-wider">BELAJAR</h2>
                            <span className="text-cyan-100 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full mt-1 inline-block border border-white/10">
                                Materi Bab 1
                            </span>
                        </div>
                    </div>
                    <Sparkles className="absolute top-4 right-4 text-white/40 w-6 h-6 animate-pulse" />
                </button>

                {/* CARD 2: SIMULASI (Yellow Gold to Orange) */}
                <button 
                    onClick={() => handleNavigate('LAB')}
                    className="group relative rounded-[2rem] bg-gradient-to-br from-yellow-400 to-orange-600 shadow-[0_10px_20px_rgba(234,88,12,0.4)] hover:shadow-[0_20px_30px_rgba(234,88,12,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 aspect-square overflow-hidden"
                >
                     <div className="glossy-overlay absolute inset-0 opacity-80 pointer-events-none"></div>
                     <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 md:gap-3 p-2">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                            <Microscope size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white text-shadow-soft tracking-wider">SIMULASI</h2>
                            <span className="text-orange-100 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full mt-1 inline-block border border-white/10">
                                Lab Eksperimen
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-20">
                        <Sun size={60} className="text-white" />
                    </div>
                </button>

                {/* CARD 3: MISI (Purple to Pink) - NOW USES GAMEPAD */}
                <button 
                    onClick={() => handleNavigate('MISSION')}
                    className="group relative rounded-[2rem] bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_10px_20px_rgba(147,51,234,0.4)] hover:shadow-[0_20px_30px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 aspect-square overflow-hidden"
                >
                    <div className="glossy-overlay absolute inset-0 opacity-80 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 md:gap-3 p-2">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Gamepad2 size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white text-shadow-soft tracking-wider">MISI</h2>
                            <span className="text-purple-100 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full mt-1 inline-block border border-white/10">
                                Tantangan Seru
                            </span>
                        </div>
                    </div>
                    <Hexagon className="absolute bottom-3 left-3 text-white/30 w-8 h-8 animate-spin-slow" />
                </button>

                {/* CARD 4: KUIS (Green to Tosca) - NOW USES TROPHY */}
                <button 
                    onClick={() => handleNavigate('QUIZ')}
                    className="group relative rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_10px_20px_rgba(13,148,136,0.4)] hover:shadow-[0_20px_30px_rgba(13,148,136,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 aspect-square overflow-hidden"
                >
                    <div className="glossy-overlay absolute inset-0 opacity-80 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 md:gap-3 p-2">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40 shadow-inner group-hover:-rotate-12 transition-transform duration-300">
                            <Trophy size={40} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white text-shadow-soft tracking-wider">KUIS</h2>
                            <span className="text-teal-100 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full mt-1 inline-block border border-white/10">
                                Asah Otak
                            </span>
                        </div>
                    </div>
                    <MessageCircle className="absolute top-3 left-3 text-white/30 w-6 h-6" />
                </button>

            </div>
        </div>

      </div>

      {/* --- PROFILE EDIT MODAL --- */}
      {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-sky-400 relative overflow-hidden">
                  <button 
                      onClick={() => setShowProfileModal(false)}
                      className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors"
                  >
                      <X size={24} />
                  </button>

                  <h2 className="text-3xl font-black text-slate-800 text-center mb-6 uppercase tracking-wide font-sans">Edit Profil</h2>

                  <div className="mb-6">
                      <label className="block text-sm font-black text-slate-500 mb-2 uppercase tracking-wide">Nama Panggilan</label>
                      <input 
                          type="text" 
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-full bg-slate-100 border-4 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-700 text-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-center"
                          placeholder="Namamu..."
                          maxLength={12}
                      />
                  </div>

                  <div className="mb-8">
                      <label className="block text-sm font-black text-slate-500 mb-3 uppercase tracking-wide text-center">Pilih Avatar</label>
                      <div className="grid grid-cols-4 gap-3">
                          {AVATAR_OPTIONS.map((avatar) => {
                              const isSelected = selectedAvatarId === avatar.id;
                              const AvatarIcon = avatar.icon;
                              return (
                                  <button 
                                      key={avatar.id}
                                      onClick={() => handleAvatarSelect(avatar.id)}
                                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border-4 ${isSelected ? 'border-sky-500 bg-sky-50 scale-105 shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                                  >
                                      <div className={`p-2 rounded-full ${avatar.bg}`}>
                                          <AvatarIcon size={20} className={`bg-gradient-to-br ${avatar.color} bg-clip-text text-transparent`} />
                                      </div>
                                  </button>
                              )
                          })}
                      </div>
                  </div>

                  <button 
                      onClick={saveProfile}
                      className="w-full bg-sky-500 text-white font-black text-xl py-4 rounded-2xl shadow-[0_6px_0_#0369a1] hover:bg-sky-400 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide"
                  >
                      SIMPAN
                  </button>
              </div>
          </div>
      )}

      {/* Footer Version */}
      <div className="absolute bottom-4 right-4 text-white/40 text-[10px] font-black z-0 pointer-events-none">
          v3.6 CHIBI ROBOT
      </div>
    </div>
  );
};
