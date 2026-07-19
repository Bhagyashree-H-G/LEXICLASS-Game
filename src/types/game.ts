export type Difficulty = 'easy' | 'medium' | 'hard';

export interface WordData {
  word: string;
  scrambled: string;
  definitions: string[];
  phonetic?: string;
  partOfSpeech?: string;
}

export interface GameState {
  currentWord: WordData | null;
  score: number;
  level: number;
  timeRemaining: number;
  isPlaying: boolean;
  isPaused: boolean;
  difficulty: Difficulty;
  usedWords: Set<string>;
  streak: number;
  totalCorrect: number;
  totalAttempts: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isHost: boolean;
  avatar?: string;
}

export interface Room {
  id: string;
  code: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: WordData;
  difficulty: Difficulty;
  round: number;
  maxRounds: number;
  usedWords?: string[];
  roundStartedAt?: number;
  roundStatus?: 'active' | 'revealing';
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  correctAnswers: number;
  avgTime: number;
}

export const DIFFICULTY_CONFIG = {
  easy: {
    time: 60,
    points: 10,
    wordLength: { min: 3, max: 5 },
    label: 'Easy',
    color: 'text-success',
  },
  medium: {
    time: 45,
    points: 20,
    wordLength: { min: 5, max: 7 },
    label: 'Medium',
    color: 'text-warning',
  },
  hard: {
    time: 30,
    points: 30,
    wordLength: { min: 7, max: 10 },
    label: 'Hard',
    color: 'text-destructive',
  },
} as const;
