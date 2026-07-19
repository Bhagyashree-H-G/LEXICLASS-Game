import { cn } from '@/lib/utils';
import { BookOpen, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DefinitionCardProps {
  definitions: string[];
  partOfSpeech?: string;
  className?: string;
}

export const DefinitionCard = ({ definitions, partOfSpeech, className }: DefinitionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        'card-gaming p-6 max-w-2xl w-full',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-display uppercase tracking-wider text-primary">Definition</h3>
          {partOfSpeech && (
            <span className="text-xs text-muted-foreground italic">{partOfSpeech}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {definitions.map((definition, index) => (
          <div key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-display text-muted-foreground">
              {index + 1}
            </span>
            <p className="text-foreground/90 font-body leading-relaxed">{definition}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
