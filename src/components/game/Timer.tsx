import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

export const Timer = ({ timeRemaining, totalTime, className }: TimerProps) => {
  const percentage = (timeRemaining / totalTime) * 100;
  const isLow = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        {/* Background circle */}
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300',
              isCritical ? 'text-destructive' : isLow ? 'text-warning' : 'text-primary'
            )}
          />
        </svg>
        {/* Timer icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock
            className={cn(
              'w-6 h-6 transition-colors',
              isCritical ? 'text-destructive animate-pulse' : isLow ? 'text-warning' : 'text-primary'
            )}
          />
        </div>
      </div>
      
      {/* Time display */}
      <div className="flex flex-col">
        <span
          className={cn(
            'text-3xl font-display font-bold tabular-nums',
            isCritical ? 'text-destructive animate-pulse' : isLow ? 'text-warning' : 'text-foreground'
          )}
        >
          {timeRemaining}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">seconds</span>
      </div>
    </div>
  );
};
