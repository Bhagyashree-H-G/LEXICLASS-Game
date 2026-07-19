import { Difficulty, DIFFICULTY_CONFIG } from '@/types/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  className?: string;
}

const difficultyIcons = {
  easy: Zap,
  medium: Target,
  hard: Flame,
};

const difficultyColors = {
  easy: 'from-green-500 to-emerald-600',
  medium: 'from-yellow-500 to-orange-500',
  hard: 'from-red-500 to-rose-600',
};

export const DifficultySelector = ({ onSelect, className }: DifficultySelectorProps) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl', className)}>
      {difficulties.map((difficulty, index) => {
        const config = DIFFICULTY_CONFIG[difficulty];
        const Icon = difficultyIcons[difficulty];
        const gradient = difficultyColors[difficulty];

        return (
          <motion.div
            key={difficulty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => onSelect(difficulty)}
              className={cn(
                'group relative w-full p-6 rounded-xl border-2 border-border bg-card',
                'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
                'transition-all duration-300 text-left'
              )}
            >
              {/* Gradient overlay on hover */}
              <div
                className={cn(
                  'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity',
                  `bg-gradient-to-br ${gradient}`
                )}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      `bg-gradient-to-br ${gradient}`
                    )}
                  >
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-display">{config.time}s</span>
                  </div>
                </div>

                <h3 className="text-xl font-display font-bold text-foreground mb-2 uppercase tracking-wider">
                  {config.label}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-primary font-display">+{config.points}</span> points per word
                  </p>
                  <p>
                    {config.wordLength.min}-{config.wordLength.max} letter words
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};
