import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export const Logo = ({ size = 'lg', animated = true, className }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <h1
        className={cn(
          'font-display font-black tracking-wider',
          sizeClasses[size],
          animated && 'animate-glow-pulse'
        )}
      >
        <span className="text-foreground">LEXI</span>
        <span className="text-gradient-orange">CLASS</span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <span className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">
          Word Scramble
        </span>
        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    </div>
  );
};
