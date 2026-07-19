import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  className?: string;
}

const rankIcons = {
  1: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  2: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  3: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10' },
};

export const Leaderboard = ({ players, currentPlayerId, className }: LeaderboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={cn('card-gaming p-6', className)}>
      <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        Leaderboard
      </h3>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const rankConfig = rankIcons[rank as keyof typeof rankIcons];
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'transition-all duration-200',
                isCurrentPlayer ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
              )}
            >
              {/* Rank */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold',
                rankConfig ? rankConfig.bg : 'bg-secondary',
                rankConfig ? rankConfig.color : 'text-muted-foreground'
              )}>
                {rankConfig ? (
                  <rankConfig.icon className="w-4 h-4" />
                ) : (
                  rank
                )}
              </div>

              {/* Name */}
              <span className={cn(
                'flex-1 font-body font-medium truncate',
                isCurrentPlayer ? 'text-primary' : 'text-foreground'
              )}>
                {player.name}
                {isCurrentPlayer && <span className="text-xs ml-2">(You)</span>}
              </span>

              {/* Score */}
              <span className="font-display font-bold text-primary">
                {player.score}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
