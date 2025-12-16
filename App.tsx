
import React, { useState } from 'react';
import { GameState } from './types';
import { LobbyScreen } from './components/LobbyScreen';
import { AcademyScreen } from './components/AcademyScreen';
import { SimulationLab } from './components/SimulationLab';
import { QuizScreen } from './components/QuizScreen';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SPLASH');

  const handleGoToAcademy = () => {
    setGameState('ACADEMY');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-800 select-none overflow-x-hidden selection:bg-yellow-200">
      {gameState === 'SPLASH' && <SplashScreen onStart={() => setGameState('LOBBY')} />}
      {gameState === 'LOBBY' && <LobbyScreen onNavigate={setGameState} />}
      {gameState === 'ACADEMY' && <AcademyScreen onBack={() => setGameState('LOBBY')} />}
      {(gameState === 'LAB' || gameState === 'MISSION') && (
        <SimulationLab 
          onBack={() => setGameState('LOBBY')} 
          mode={gameState === 'LAB' ? 'sandbox' : 'mission'} 
        />
      )}
      {gameState === 'QUIZ' && (
        <QuizScreen 
          onBack={() => setGameState('LOBBY')}
          onGoToAcademy={handleGoToAcademy} 
        />
      )}
    </div>
  );
}
