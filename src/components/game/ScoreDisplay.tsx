import { cn } from '@/lib/utils';
import { Trophy, Zap, Target } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  level: number;
  streak: number;
  className?: string;
}

export const ScoreDisplay = ({ score, level, streak, className }: ScoreDisplayProps) => {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Score */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
        <Trophy className="w-5 h-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
          <span className="text-xl font-display font-bold text-foreground tabular-nums">{score}</span>
        </div>
      </div>

      {/* Level */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
        <Target className="w-5 h-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
          <span className="text-xl font-display font-bold text-foreground tabular-nums">{level}</span>
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 animate-glow-pulse">
          <Zap className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-primary uppercase tracking-wider">Streak</span>
            <span className="text-xl font-display font-bold text-primary tabular-nums">{streak}🔥</span>
          </div>
        </div>
      )}
    </div>
  );
};
