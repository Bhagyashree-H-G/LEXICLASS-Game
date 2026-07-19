import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Send, SkipForward, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameInputProps {
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  disabled?: boolean;
  wordLength: number;
  className?: string;
}

export const GameInput = ({ onSubmit, onSkip, disabled, wordLength, className }: GameInputProps) => {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset input when word changes (wordLength changes)
  useEffect(() => {
    setInput('');
    inputRef.current?.focus();
  }, [wordLength]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length === 0) return;
    
    onSubmit(input);
    setInput('');
  };

  const handleWrongAnswer = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-lg', className)}>
      <div className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            disabled={disabled}
            placeholder="TYPE YOUR ANSWER"
            maxLength={wordLength + 5}
            className={cn(
              'input-gaming w-full pr-14',
              shake && 'animate-shake border-destructive'
            )}
            autoComplete="off"
            autoCapitalize="characters"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-display">
            {input.length}/{wordLength}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="gaming"
            size="lg"
            disabled={disabled || input.trim().length === 0}
            className="flex-1"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit
          </Button>
          
          <Button
            type="button"
            variant="gaming-outline"
            size="lg"
            onClick={onSkip}
            disabled={disabled}
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        <AnimatePresence>
          {input.length > 0 && input.length !== wordLength && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <Lightbulb className="w-4 h-4 text-warning" />
              <span>Hint: The word has {wordLength} letters</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};
