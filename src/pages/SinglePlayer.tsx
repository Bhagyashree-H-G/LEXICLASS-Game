import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/game/Logo';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { ScrambledWord } from '@/components/game/ScrambledWord';
import { DefinitionCard } from '@/components/game/DefinitionCard';
import { GameInput } from '@/components/game/GameInput';
import { Timer } from '@/components/game/Timer';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Button } from '@/components/ui/button';
import { useGameState } from '@/hooks/useGameState';
import { Difficulty, DIFFICULTY_CONFIG } from '@/types/game';
import { ArrowLeft, Pause, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type GamePhase = 'select' | 'playing' | 'gameover';

const SinglePlayer = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('select');
  const {
    gameState,
    isLoading,
    startGame,
    checkAnswer,
    skipWord,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
  } = useGameState();

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    await startGame(difficulty);
    setPhase('playing');
  };

  const handleSubmit = async (answer: string) => {
    await checkAnswer(answer);
  };

  const handleSkip = async () => {
    await skipWord();
  };

  const handlePlayAgain = () => {
    resetGame();
    setPhase('select');
  };

  const handleHome = () => {
    resetGame();
    navigate('/');
  };

  const handleQuit = () => {
    endGame();
    setPhase('gameover');
  };

  // Check for game over
  if (!gameState.isPlaying && phase === 'playing') {
    setPhase('gameover');
  }

  // Game Over Screen
  if (phase === 'gameover') {
    return (
      <GameOverScreen
        gameState={gameState}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    );
  }

  // Difficulty Selection
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Logo size="sm" animated={false} />
          <div className="w-24" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Select Difficulty
            </h1>
            <p className="text-muted-foreground">
              Choose your challenge level to begin
            </p>
          </motion.div>

          <DifficultySelector onSelect={handleDifficultySelect} />
        </main>
      </div>
    );
  }

  // Game Screen
  const config = DIFFICULTY_CONFIG[gameState.difficulty];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Timer
          timeRemaining={gameState.timeRemaining}
          totalTime={config.time}
        />
        
        <ScoreDisplay
          score={gameState.score}
          level={gameState.level}
          streak={gameState.streak}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => gameState.isPaused ? resumeGame() : pauseGame()}
          >
            {gameState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleQuit}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground font-display">Loading word...</p>
            </motion.div>
          ) : gameState.currentWord && !gameState.isPaused ? (
            <motion.div
              key={gameState.currentWord.scrambled}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              {/* Difficulty badge */}
              <div className={cn(
                'px-4 py-1 rounded-full text-sm font-display uppercase tracking-wider',
                'bg-primary/10 text-primary border border-primary/30'
              )}>
                {config.label} Mode
              </div>

              {/* Scrambled Word */}
              <ScrambledWord word={gameState.currentWord.scrambled} />

              {/* Definition */}
              <DefinitionCard
                definitions={gameState.currentWord.definitions}
                partOfSpeech={gameState.currentWord.partOfSpeech}
              />

              {/* Input */}
              <GameInput
                onSubmit={handleSubmit}
                onSkip={handleSkip}
                disabled={isLoading}
                wordLength={gameState.currentWord.word.length}
              />
            </motion.div>
          ) : gameState.isPaused ? (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-6xl">⏸️</div>
              <h2 className="text-3xl font-display font-bold text-foreground">Game Paused</h2>
              <Button variant="gaming" size="lg" onClick={resumeGame}>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SinglePlayer;
