
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Lock, Unlock, Timer, Check, X, BookOpen, RotateCcw, Play, HelpCircle, Trophy, Star } from 'lucide-react';
import { QUIZ_LEVELS } from '../constants';
import { QuizQuestion } from '../types';
import { soundManager } from '../utils/soundManager';

interface QuizScreenProps {
  onBack: () => void;
  onGoToAcademy: () => void;
}

type QuizState = 'MENU' | 'PLAYING' | 'RESULT' | 'GAMEOVER';

export const QuizScreen = ({ onBack, onGoToAcademy }: QuizScreenProps) => {
  // Global State
  const [lives, setLives] = useState(3);
  const [unlockedLevel, setUnlockedLevel] = useState(1); // 1, 2, or 3
  const [screenState, setScreenState] = useState<QuizState>('MENU');
  
  // Gameplay State
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]); // Store selected indices
  const [timeLeft, setTimeLeft] = useState(25);
  
  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // --- LOGIC FUNCTIONS ---

  // Shuffle array using Fisher-Yates
  const shuffleArray = (array: QuizQuestion[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startLevel = (levelId: number) => {
    if (lives <= 0) return;
    soundManager.playClick();
    
    // Find level data
    const levelData = QUIZ_LEVELS.find(l => l.level === levelId);
    if (!levelData) return;

    // Shuffle questions
    const shuffled = shuffleArray(levelData.questions);
    
    setQuestions(shuffled);
    setCurrentLevelId(levelId);
    setCurrentQIndex(0);
    setUserAnswers(new Array(shuffled.length).fill(null));
    setTimeLeft(25);
    setScreenState('PLAYING');
  };

  const handleAnswer = (optionIndex: number) => {
    // Save answer locally but don't show result yet
    const newAnswers = [...userAnswers];
    newAnswers[currentQIndex] = optionIndex;
    setUserAnswers(newAnswers);
    soundManager.playSelect();
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTimeLeft(25);
    } else {
      finishLevel();
    }
  };

  // Timer Effect
  useEffect(() => {
    if (screenState === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time out - auto next
            // If no answer selected, it remains null (wrong)
            if (currentQIndex < questions.length - 1) {
              setCurrentQIndex(i => i + 1);
              return 25;
            } else {
              finishLevel();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screenState, currentQIndex, questions.length]);

  const finishLevel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreenState('RESULT');
  };

  const handleRetry = () => {
      if (lives > 0) {
          startLevel(currentLevelId); // Will re-shuffle
      }
  };

  // --- RENDER HELPERS ---

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) correctCount++;
    });
    return correctCount;
  };

  // Handle Score processing exactly once when entering Result screen
  useEffect(() => {
      if (screenState === 'RESULT') {
          const score = calculateScore();
          if (score === 10) {
              soundManager.playSuccess();
              if (currentLevelId === unlockedLevel && unlockedLevel < 3) {
                  setUnlockedLevel(prev => prev + 1);
              }
          } else {
              soundManager.playError();
              const newLives = lives - 1;
              setLives(newLives);
              if (newLives === 0) {
                  setTimeout(() => setScreenState('GAMEOVER'), 2000);
              }
          }
      }
  }, [screenState]);


  // --- VIEWS ---

  // 1. MENU VIEW
  if (screenState === 'MENU') {
    return (
      <div className="min-h-screen bg-[#E0F7FA] flex flex-col relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b-4 border-cyan-200 p-4 flex justify-between items-center shadow-sm z-20">
             <button onClick={onBack} className="bg-white px-4 py-2 rounded-2xl border-b-4 border-slate-200 font-black text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2"><ArrowLeft size={20}/> KELUAR</button>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-b-4 border-red-200 shadow-sm">
                 <Heart className="fill-red-500 text-red-500 animate-pulse" size={24} />
                 <span className="text-red-500 font-black text-xl">{lives}</span>
             </div>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-black text-cyan-600 mb-2 uppercase tracking-wide text-center drop-shadow-sm font-fredoka">Kuis Energi</h1>
            <p className="text-cyan-700 font-bold mb-10 text-center max-w-lg">Jawab 10 soal dengan benar untuk membuka level berikutnya!</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {QUIZ_LEVELS.map((level) => {
                    const isLocked = level.level > unlockedLevel;
                    const isCompleted = level.level < unlockedLevel;
                    
                    return (
                        <button 
                            key={level.level}
                            onClick={() => !isLocked && startLevel(level.level)}
                            disabled={isLocked || lives === 0}
                            className={`relative h-72 rounded-[2.5rem] border-4 flex flex-col items-center justify-center p-6 transition-all duration-300 group
                                ${isLocked 
                                    ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-70' 
                                    : 'bg-white border-b-8 border-cyan-200 shadow-xl hover:-translate-y-2 hover:border-cyan-300 active:translate-y-0 active:border-b-4'
                                }
                            `}
                        >
                            {isLocked ? (
                                <Lock size={48} className="text-slate-300 mb-4" />
                            ) : (
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] border-4 border-white
                                    ${level.level === 1 ? 'bg-green-400' : level.level === 2 ? 'bg-orange-400' : 'bg-purple-400'}
                                `}>
                                    {isCompleted ? <Check size={40} strokeWidth={4}/> : <Play size={40} fill="white" />}
                                </div>
                            )}
                            
                            <h2 className={`text-2xl font-black uppercase mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>{level.title}</h2>
                            <p className={`text-center text-sm font-bold leading-tight px-4 ${isLocked ? 'text-slate-400' : 'text-slate-400'}`}>{level.desc}</p>
                            
                            {!isLocked && (
                                <div className="mt-4 text-xs font-black text-white bg-cyan-400 px-4 py-1.5 rounded-full shadow-sm">
                                    10 SOAL
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
      </div>
    );
  }

  // 2. PLAYING VIEW (GAME DUNIA WARNA CERIA)
  if (screenState === 'PLAYING') {
      const q = questions[currentQIndex];
      const selectedOption = userAnswers[currentQIndex];

      // Warna-warni opsi jawaban
      const optionColors = [
          { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-500', badge: 'bg-red-400' },
          { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-500', badge: 'bg-blue-400' },
          { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600', badge: 'bg-yellow-400' },
          { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-500', badge: 'bg-green-400' },
      ];

      return (
        <div className="min-h-screen bg-[#E0F7FA] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
             
             {/* Background Decoration (Clouds) */}
             <style>{`
                @keyframes floatSlow { 0% { transform: translateX(0px); } 50% { transform: translateX(20px); } 100% { transform: translateX(0px); } }
                .bg-pattern { background-image: radial-gradient(#B2EBF2 20%, transparent 20%); background-position: 0 0; background-size: 30px 30px; }
             `}</style>
             <div className="absolute inset-0 bg-pattern opacity-30 pointer-events-none"></div>
             <div className="absolute top-10 left-10 opacity-40 animate-[floatSlow_5s_ease-in-out_infinite]"><div className="w-24 h-8 bg-white rounded-full"></div></div>
             <div className="absolute bottom-20 right-10 opacity-40 animate-[floatSlow_7s_ease-in-out_infinite] delay-1000"><div className="w-32 h-10 bg-white rounded-full"></div></div>

             <div className="max-w-3xl w-full relative z-10">
                 
                 {/* Top HUD */}
                 <div className="flex justify-between items-center mb-6">
                     <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full border-2 border-cyan-200 font-black text-cyan-600 shadow-sm">
                        LEVEL {currentLevelId}
                     </div>
                     
                     {/* Timer Capsule */}
                     <div className={`flex items-center gap-2 px-6 py-2 rounded-full border-4 shadow-lg transition-colors duration-500
                        ${timeLeft > 10 ? 'bg-green-400 border-green-500' : timeLeft > 5 ? 'bg-yellow-400 border-yellow-500' : 'bg-red-500 border-red-700 animate-pulse'}
                     `}>
                         <Timer size={24} className="text-white drop-shadow-md"/>
                         <span className="text-2xl font-black text-white drop-shadow-md font-mono min-w-[40px] text-center">{timeLeft}</span>
                     </div>

                     <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full border-2 border-cyan-200 font-black text-cyan-600 shadow-sm">
                        {currentQIndex + 1} / 10
                     </div>
                 </div>

                 {/* Question Card (3D Effect) */}
                 <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border-4 border-violet-400 shadow-[0_12px_0_#a78bfa] relative">
                     {/* Decorative Stars */}
                     <Star className="absolute -top-6 -left-4 text-yellow-400 fill-yellow-400 w-12 h-12 animate-bounce" />
                     <Star className="absolute -bottom-4 -right-4 text-orange-400 fill-orange-400 w-8 h-8 animate-pulse delay-700" />

                     <h2 className="text-2xl md:text-3xl font-black text-slate-700 mb-8 text-center leading-snug drop-shadow-sm">
                         {q.question}
                     </h2>

                     <div className="grid grid-cols-1 gap-4">
                         {q.options.map((opt, idx) => {
                             const isSelected = selectedOption === idx;
                             const theme = optionColors[idx % 4];

                             return (
                                 <button 
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`relative w-full p-4 rounded-2xl border-b-[6px] transition-all duration-200 flex items-center gap-4 group
                                        ${isSelected 
                                            ? 'bg-orange-500 border-orange-700 translate-y-2 border-b-0 shadow-inner' 
                                            : `bg-white ${theme.border} hover:-translate-y-1 hover:brightness-105 active:translate-y-2 active:border-b-0`
                                        }
                                    `}
                                 >
                                     {/* Option Badge (A/B/C/D) */}
                                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-xl shadow-sm border-2 border-black/10 transition-colors
                                        ${isSelected 
                                            ? 'bg-white text-orange-500' 
                                            : `${theme.badge} text-white group-hover:scale-110`
                                        }
                                     `}>
                                         {String.fromCharCode(65 + idx)}
                                     </div>

                                     {/* Text */}
                                     <span className={`text-lg md:text-xl font-bold text-left flex-1 leading-tight
                                        ${isSelected ? 'text-white' : 'text-slate-600'}
                                     `}>
                                         {opt}
                                     </span>
                                 </button>
                             )
                         })}
                     </div>
                 </div>

                 {/* Next Button */}
                 <div className="mt-8 flex justify-center">
                     <button 
                        onClick={nextQuestion}
                        className="bg-green-500 text-white text-xl px-12 py-4 rounded-full font-black border-b-[6px] border-green-700 shadow-xl hover:-translate-y-1 hover:shadow-2xl active:translate-y-2 active:border-b-0 active:shadow-none transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                     >
                        {currentQIndex === 9 ? "SELESAI" : "LANJUT"} <Play size={24} fill="white"/>
                     </button>
                 </div>

             </div>
        </div>
      )
  }

  // 3. RESULT VIEW
  if (screenState === 'RESULT') {
      const score = calculateScore();
      const isPerfect = score === 10;
      
      return (
          <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4 font-sans">
              <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-yellow-200 relative overflow-hidden animate-bounce-in max-h-[90vh] flex flex-col">
                  
                  {/* Score Header */}
                  <div className="shrink-0 mb-6 relative z-10">
                      {isPerfect ? (
                          <>
                            <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-8 border-white animate-bounce">
                                <Trophy size={48} className="text-white fill-white" />
                            </div>
                            <h2 className="text-3xl font-black text-yellow-600 mb-1 uppercase tracking-wider">Luar Biasa!</h2>
                            <div className="inline-block bg-yellow-100 px-6 py-2 rounded-full border-2 border-yellow-300 mt-2">
                                <p className="text-yellow-700 font-bold text-sm">SKOR KAMU</p>
                                <p className="text-5xl font-black text-slate-800">100</p>
                            </div>
                          </>
                      ) : (
                          <>
                             <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-8 border-white">
                                <X size={48} className="text-red-500" strokeWidth={4} />
                             </div>
                             <h2 className="text-3xl font-black text-slate-700 mb-1 uppercase tracking-wider">Coba Lagi Ya!</h2>
                             <div className="inline-block bg-slate-100 px-6 py-2 rounded-full border-2 border-slate-200 mt-2">
                                <p className="text-slate-500 font-bold text-sm">SKOR KAMU</p>
                                <p className="text-5xl font-black text-slate-800">{score * 10}</p>
                            </div>
                          </>
                      )}
                  </div>

                  {/* SCROLLABLE REVIEW SECTION */}
                  <div className="flex-1 overflow-y-auto pr-2 mb-6 text-left border-t-2 border-b-2 border-slate-100 py-4 custom-scrollbar bg-slate-50 rounded-xl px-2">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-slate-50 z-10 py-2 text-center">Pembahasan</h3>
                      <div className="space-y-4">
                          {questions.map((q, idx) => {
                              const userAns = userAnswers[idx];
                              const correctAns = q.correctAnswer;
                              const isCorrect = userAns === correctAns;

                              return (
                                  <div key={idx} className={`p-4 rounded-2xl border-l-8 ${isCorrect ? 'bg-white border-green-400 shadow-sm' : 'bg-white border-red-400 shadow-sm'}`}>
                                      <p className="font-bold text-slate-800 mb-2 text-sm md:text-base leading-snug">
                                          <span className="mr-2 opacity-50 font-black">{idx + 1}.</span>{q.question}
                                      </p>
                                      <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                              <Check size={14} className="shrink-0"/> Jawab: {q.options[correctAns]}
                                          </div>
                                          {!isCorrect && (
                                              <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                                                  <X size={14} className="shrink-0"/> Kamu: {userAns !== null ? q.options[userAns] : 'Tidak dijawab'}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="shrink-0 flex gap-3 pt-2">
                      <button onClick={() => setScreenState('MENU')} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-2xl font-black hover:bg-slate-300 transition-colors border-b-4 border-slate-300 active:border-b-0 active:translate-y-1">
                          MENU
                      </button>
                      
                      {isPerfect ? (
                          <button onClick={() => setScreenState('MENU')} className="flex-[2] bg-purple-500 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-purple-600 transition-all border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
                              LANJUT LEVEL
                          </button>
                      ) : (
                          lives > 0 ? (
                            <button onClick={handleRetry} className="flex-[2] bg-blue-500 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
                                <RotateCcw size={18}/> COBA LAGI
                            </button>
                          ) : (
                            <div className="flex-[2] flex items-center justify-center text-red-500 font-bold bg-red-50 rounded-2xl border border-red-200">
                                Nyawa Habis
                            </div>
                          )
                      )}
                  </div>

              </div>
          </div>
      )
  }

  // 4. GAME OVER VIEW
  if (screenState === 'GAMEOVER') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
             <div className="bg-white rounded-[3rem] p-8 max-w-md w-full text-center shadow-2xl border-b-8 border-red-500 animate-bounce-in">
                 <div className="mb-6 relative">
                     <Heart size={80} className="text-slate-200 fill-slate-200 mx-auto" />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-24 h-4 bg-slate-300 rotate-45 rounded-full absolute border-2 border-white"></div>
                         <div className="w-24 h-4 bg-slate-300 -rotate-45 rounded-full absolute border-2 border-white"></div>
                     </div>
                 </div>
                 
                 <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-wide">Yah, Kalah...</h2>
                 <p className="text-slate-500 font-bold mb-8 leading-relaxed px-4">
                     Jangan sedih! Istirahat sebentar, pelajari materinya lagi, lalu kita main lagi!
                 </p>

                 <button 
                    onClick={() => {
                        onBack();
                        onGoToAcademy();
                    }} 
                    className="w-full bg-yellow-400 text-yellow-900 py-4 rounded-2xl font-black shadow-[0_4px_0_#ca8a04] hover:translate-y-1 hover:shadow-none active:bg-yellow-500 transition-all flex items-center justify-center gap-3 text-lg border-2 border-yellow-400"
                 >
                     <BookOpen size={24}/> KEMBALI BELAJAR
                 </button>
             </div>
        </div>
      )
  }

  return null;
};
