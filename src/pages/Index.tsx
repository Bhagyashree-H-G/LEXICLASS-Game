import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/game/Logo';
import { Button } from '@/components/ui/button';
import { User, Users, Trophy, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Learn Words',
      description: 'Expand your vocabulary with real definitions',
    },
    {
      icon: Zap,
      title: '3 Difficulties',
      description: 'Easy, Medium, and Hard modes',
    },
    {
      icon: Trophy,
      title: 'Score Points',
      description: 'Compete and climb the leaderboard',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Logo size="xl" animated />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground text-center max-w-lg mb-12 font-body"
        >
          Unscramble words against the clock. Challenge yourself or compete with friends!
        </motion.p>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-16"
        >
          {/* Single Player */}
          <button
            onClick={() => navigate('/single-player')}
            className="group relative p-8 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-light flex items-center justify-center mb-4">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Single Player</h3>
              <p className="text-muted-foreground mb-4">Challenge yourself and beat your high score</p>
              <div className="flex items-center text-primary font-display text-sm uppercase tracking-wider">
                Start Playing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Multiplayer */}
          <button
            onClick={() => navigate('/multiplayer')}
            className="group relative p-8 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-light flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Multiplayer</h3>
              <p className="text-muted-foreground mb-4">Create or join a room with friends</p>
              <div className="flex items-center text-primary font-display text-sm uppercase tracking-wider">
                Play Online
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-display text-primary">LexiClass</span> — Sharpen your mind, one word at a time
        </p>
      </footer>
    </div>
  );
};

export default Index;
