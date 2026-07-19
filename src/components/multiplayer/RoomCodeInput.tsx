import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCodeInputProps {
  onJoin: (code: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const RoomCodeInput = ({ onJoin, isLoading, className }: RoomCodeInputProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      onJoin(code.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-display uppercase tracking-wider text-muted-foreground">
          Enter Room Code
        </label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXXXX"
          maxLength={6}
          className="text-center text-2xl tracking-[0.5em] font-display uppercase"
        />
      </div>
      
      <Button
        type="submit"
        variant="gaming"
        size="lg"
        disabled={code.length !== 6 || isLoading}
        className="w-full"
      >
        <LogIn className="w-5 h-5 mr-2" />
        Join Room
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </form>
  );
};
