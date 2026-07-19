import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { Trophy, Target, Zap, RotateCcw, Home, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GameOverScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverScreen = ({ gameState, onPlayAgain, onHome }: GameOverScreenProps) => {
  const accuracy = gameState.totalAttempts > 0
    ? Math.round((gameState.totalCorrect / gameState.totalAttempts) * 100)
    : 0;

  const stats = [
    { icon: Trophy, label: 'Final Score', value: gameState.score, color: 'text-primary' },
    { icon: Target, label: 'Words Solved', value: gameState.totalCorrect, color: 'text-success' },
    { icon: Zap, label: 'Accuracy', value: `${accuracy}%`, color: 'text-warning' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
            <Trophy className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Game Over!</h1>
          <p className="text-muted-foreground">Great effort! Here's how you did:</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-gaming p-6 space-y-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={cn('w-6 h-6', stat.color)} />
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
              <span className={cn('text-2xl font-display font-bold', stat.color)}>
                {stat.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <Button variant="gaming" size="xl" onClick={onPlayAgain} className="w-full">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          
          <Button variant="gaming-outline" size="lg" onClick={onHome} className="w-full">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center"
        >
          <Logo size="sm" animated={false} />
        </motion.div>
      </div>
    </motion.div>
  );
};
