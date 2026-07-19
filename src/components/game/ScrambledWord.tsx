import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ScrambledWordProps {
  word: string;
  className?: string;
}

export const ScrambledWord = ({ word, className }: ScrambledWordProps) => {
  const letters = word.split('');

  return (
    <div className={cn('flex flex-wrap justify-center gap-2 md:gap-3', className)}>
      {letters.map((letter, index) => (
        <motion.div
          key={`${letter}-${index}`}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: index * 0.05,
          }}
          whileHover={{ scale: 1.1, y: -5 }}
          className="scrambled-letter cursor-default select-none"
        >
          {letter}
        </motion.div>
      ))}
    </div>
  );
};
