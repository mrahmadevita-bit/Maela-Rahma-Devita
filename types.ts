
export type GameState = 'SPLASH' | 'LOBBY' | 'ACADEMY' | 'LAB' | 'MISSION' | 'QUIZ';
export type SourceType = 'BIKE' | 'SUN' | 'WATER' | 'KETTLE';
export type ConverterType = 'GENERATOR' | 'SOLAR_PANEL';
export type OutputType = 'BULB' | 'FAN' | 'HEATER';

export interface Mission {
  id: number;
  title: string;
  desc: string;
  reqSource: SourceType;
  reqConverter: ConverterType;
  reqOutput: OutputType;
  difficulty: string;
}

export interface Particle {
  stage: number;
  progress: number;
  type: string;
  yOffset: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
}

export interface QuizLevel {
  level: number;
  title: string;
  desc: string;
  questions: QuizQuestion[];
}
