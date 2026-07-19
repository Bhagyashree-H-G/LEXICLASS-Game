import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Difficulty, DIFFICULTY_CONFIG } from '@/types/game';
import { getRandomWord } from '@/services/dictionaryApi';
import { toast } from '@/hooks/use-toast';

const initialGameState: GameState = {
  currentWord: null,
  score: 0,
  level: 1,
  timeRemaining: 60,
  isPlaying: false,
  isPaused: false,
  difficulty: 'easy',
  usedWords: new Set(),
  streak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearTimer();
          return { ...prev, timeRemaining: 0, isPlaying: false };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [clearTimer]);

  const loadNextWord = useCallback(async (difficulty: Difficulty, usedWords: Set<string>) => {
    setIsLoading(true);
    const wordData = await getRandomWord(difficulty, usedWords);
    setIsLoading(false);
    
    if (!wordData) {
      toast({
        title: "No more words!",
        description: "You've completed all words for this difficulty!",
        variant: "default",
      });
      return null;
    }
    
    return wordData;
  }, []);

  const startGame = useCallback(async (difficulty: Difficulty) => {
    setIsLoading(true);
    const wordData = await loadNextWord(difficulty, new Set());
    
    if (!wordData) {
      setIsLoading(false);
      return;
    }

    const config = DIFFICULTY_CONFIG[difficulty];
    const newUsedWords = new Set<string>();
    newUsedWords.add(wordData.word);

    setGameState({
      ...initialGameState,
      currentWord: wordData,
      difficulty,
      timeRemaining: config.time,
      isPlaying: true,
      usedWords: newUsedWords,
    });
    
    startTimer();
  }, [loadNextWord, startTimer]);

  const checkAnswer = useCallback(async (answer: string): Promise<boolean> => {
    if (!gameState.currentWord || !gameState.isPlaying) return false;

    const isCorrect = answer.toLowerCase().trim() === gameState.currentWord.word.toLowerCase();
    
    if (isCorrect) {
      const config = DIFFICULTY_CONFIG[gameState.difficulty];
      const timeBonus = Math.floor(gameState.timeRemaining / 10);
      const streakBonus = gameState.streak * 5;
      const pointsEarned = config.points + timeBonus + streakBonus;

      // Load next word
      const nextWord = await loadNextWord(gameState.difficulty, gameState.usedWords);
      
      if (nextWord) {
        const newUsedWords = new Set(gameState.usedWords);
        newUsedWords.add(nextWord.word);

        setGameState(prev => ({
          ...prev,
          currentWord: nextWord,
          score: prev.score + pointsEarned,
          level: prev.level + 1,
          timeRemaining: config.time,
          streak: prev.streak + 1,
          totalCorrect: prev.totalCorrect + 1,
          totalAttempts: prev.totalAttempts + 1,
          usedWords: newUsedWords,
        }));
      } else {
        // No more words available - game complete!
        clearTimer();
        setGameState(prev => ({
          ...prev,
          score: prev.score + pointsEarned,
          isPlaying: false,
          totalCorrect: prev.totalCorrect + 1,
          totalAttempts: prev.totalAttempts + 1,
        }));
      }

      toast({
        title: "Correct! 🎉",
        description: `+${pointsEarned} points (Time bonus: +${timeBonus}, Streak: +${streakBonus})`,
      });

      return true;
    } else {
      setGameState(prev => ({
        ...prev,
        streak: 0,
        totalAttempts: prev.totalAttempts + 1,
      }));
      return false;
    }
  }, [gameState, loadNextWord, clearTimer]);

  const skipWord = useCallback(async () => {
    if (!gameState.isPlaying) return;

    const nextWord = await loadNextWord(gameState.difficulty, gameState.usedWords);
    
    if (nextWord) {
      const newUsedWords = new Set(gameState.usedWords);
      newUsedWords.add(nextWord.word);
      const config = DIFFICULTY_CONFIG[gameState.difficulty];

      setGameState(prev => ({
        ...prev,
        currentWord: nextWord,
        timeRemaining: config.time,
        streak: 0,
        totalAttempts: prev.totalAttempts + 1,
        usedWords: newUsedWords,
      }));
    } else {
      clearTimer();
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    }
  }, [gameState, loadNextWord, clearTimer]);

  const pauseGame = useCallback(() => {
    clearTimer();
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, [clearTimer]);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    startTimer();
  }, [startTimer]);

  const endGame = useCallback(() => {
    clearTimer();
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [clearTimer]);

  const resetGame = useCallback(() => {
    clearTimer();
    setGameState(initialGameState);
  }, [clearTimer]);

  // Handle game over when time runs out
  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.isPlaying) {
      clearTimer();
      setGameState(prev => ({ ...prev, isPlaying: false }));
      toast({
        title: "Time's up! ⏰",
        description: `Final score: ${gameState.score} points`,
        variant: "destructive",
      });
    }
  }, [gameState.timeRemaining, gameState.isPlaying, gameState.score, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    gameState,
    isLoading,
    startGame,
    checkAnswer,
    skipWord,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
  };
};
