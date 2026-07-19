import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Crown, CheckCircle, Circle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  className?: string;
}

export const PlayerCard = ({ player, isCurrentPlayer, className }: PlayerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border-2',
        'bg-card transition-all duration-300',
        isCurrentPlayer ? 'border-primary' : 'border-border',
        player.isReady && 'bg-success/5 border-success/50',
        className
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'relative w-12 h-12 rounded-full flex items-center justify-center',
        'bg-gradient-to-br from-primary to-orange-light'
      )}>
        <User className="w-6 h-6 text-primary-foreground" />
        {player.isHost && (
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-warning">
            <Crown className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-foreground truncate">
            {player.name}
          </span>
          {isCurrentPlayer && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-display">
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-display">{player.score} pts</span>
        </div>
      </div>

      {/* Ready status */}
      <div className="flex items-center gap-1">
        {player.isReady ? (
          <CheckCircle className="w-5 h-5 text-success" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
        <span className={cn(
          'text-xs font-display uppercase tracking-wider',
          player.isReady ? 'text-success' : 'text-muted-foreground'
        )}>
          {player.isReady ? 'Ready' : 'Waiting'}
        </span>
      </div>
    </motion.div>
  );
};
