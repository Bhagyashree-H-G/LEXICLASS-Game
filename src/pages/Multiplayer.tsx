import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/game/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomCodeInput } from '@/components/multiplayer/RoomCodeInput';
import { PlayerCard } from '@/components/multiplayer/PlayerCard';
import { Leaderboard } from '@/components/multiplayer/Leaderboard';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { ScrambledWord } from '@/components/game/ScrambledWord';
import { DefinitionCard } from '@/components/game/DefinitionCard';
import { GameInput } from '@/components/game/GameInput';
import { Timer } from '@/components/game/Timer';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { getWordsByDifficulty, scrambleWord } from '@/services/dictionaryApi';
import { Player, Room, Difficulty, DIFFICULTY_CONFIG } from '@/types/game';
import { ArrowLeft, Plus, Users, Copy, Check, Share2, Play, Settings, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type MultiplayerPhase = 'menu' | 'create' | 'join' | 'lobby';

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const STORAGE_KEY = 'lexiclass-mock-rooms';

const buildLocalWordData = (difficulty: Difficulty, usedWords: Set<string>) => {
  const availableWords = getWordsByDifficulty(difficulty)
    .filter((word) => !usedWords.has(word.toLowerCase()));

  if (availableWords.length === 0) {
    return null;
  }

  const nextWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  return {
    word: nextWord.toLowerCase(),
    scrambled: scrambleWord(nextWord),
    definitions: ['A common English term'],
  };
};

const loadMockRoomStore = (): Map<string, Room> => {
  if (typeof window === 'undefined') {
    return new Map();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const rooms = JSON.parse(raw) as Room[];
    return new Map(rooms.map((room) => [room.code, room]));
  } catch {
    return new Map();
  }
};

const saveMockRoomStore = (store: Map<string, Room>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(store.values())));
  } catch {
    // ignore storage failures
  }
};

const Multiplayer = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<MultiplayerPhase>('menu');
  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => `player-${Math.floor(Math.random() * 1000000)}`);
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    if (!room || room.status !== 'playing') return;

    const timer = window.setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [room?.status, room?.code]);

  const getRoundTimeLeft = (currentRoom: Room | null, now = Date.now()) => {
    if (!currentRoom || currentRoom.status !== 'playing' || !currentRoom.roundStartedAt) {
      return DIFFICULTY_CONFIG[currentRoom?.difficulty ?? 'medium'].time;
    }

    const totalTime = DIFFICULTY_CONFIG[currentRoom.difficulty].time;
    return Math.max(0, Math.ceil((currentRoom.roundStartedAt + totalTime * 1000 - now) / 1000));
  };

  const timeLeft = getRoundTimeLeft(room, tick);

  // Effect A: when the timer hits 0, flip the round into "revealing" state.
  // This ONLY sets roundStatus — it does not schedule the advance itself,
  // so it can safely depend on the full room object without cancelling
  // a timer it just started.
  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.currentWord) return;
    if (timeLeft > 0) return;
    if (room.roundStatus === 'revealing') return;

    persistRoom({ ...room, roundStatus: 'revealing' });
  }, [room, timeLeft]);

  // Effect B: once roundStatus becomes 'revealing', wait 1.8s (the "Time's Up"
  // screen with the answer stays visible during this window), then fetch the
  // next word and restart the countdown by resetting roundStartedAt.
  //
  // IMPORTANT: this effect depends only on room?.roundStatus and room?.code —
  // NOT on the whole `room` object. persistRoom() inside this effect changes
  // `room`, but roundStatus itself only flips again once the next word loads,
  // so this effect isn't torn down (and its setTimeout isn't cleared) by its
  // own state update.
  useEffect(() => {
    if (!room || room.roundStatus !== 'revealing' || !room.currentWord) return;

    const currentRoom = room;
    const nextRound = currentRoom.round + 1;
    const usedWords = [...(currentRoom.usedWords ?? []), currentRoom.currentWord.word];

    const revealTimer = window.setTimeout(() => {
      if (nextRound > currentRoom.maxRounds) {
        const finishedRoom: Room = {
          ...currentRoom,
          roundStatus: 'active',
          status: 'finished',
          currentWord: undefined,
          round: currentRoom.maxRounds,
          usedWords,
        };
        persistRoom(finishedRoom);
        return;
      }

      setIsLoadingWord(true);
      const nextWord = buildLocalWordData(currentRoom.difficulty, new Set(usedWords));

      if (!nextWord) {
        const finishedRoom: Room = {
          ...currentRoom,
          roundStatus: 'active',
          status: 'finished',
          currentWord: undefined,
          round: currentRoom.maxRounds,
          usedWords,
        };
        persistRoom(finishedRoom);
        setIsLoadingWord(false);
        return;
      }

      const newRoom: Room = {
        ...currentRoom,
        status: 'playing',
        round: nextRound,
        currentWord: nextWord,
        usedWords,
        roundStartedAt: Date.now(),
        roundStatus: 'active',
      };

      persistRoom(newRoom);
      setIsLoadingWord(false);
    }, 1800);

    return () => window.clearTimeout(revealTimer);
  }, [room?.roundStatus, room?.code]);

  useEffect(() => {
    if (!room) return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const rooms = JSON.parse(event.newValue) as Room[];
        const updatedRoom = rooms.find((existing) => existing.code === room.code);
        if (updatedRoom) {
          setRoom(updatedRoom);
        }
      } catch {
        // ignore invalid storage data
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [room]);

  // Mock current player
  const currentPlayer: Player = {
    id: playerId,
    name: playerName || 'Player 1',
    score: 0,
    isReady: false,
    isHost: room?.host === playerId,
  };

  const persistRoom = (updatedRoom: Room) => {
    const store = loadMockRoomStore();
    store.set(updatedRoom.code, updatedRoom);
    saveMockRoomStore(store);
    // Debug: log room persistence to help trace multiplayer sync issues
    try {
      // eslint-disable-next-line no-console
      console.debug('[persistRoom]', updatedRoom.code, 'round', updatedRoom.round, 'startedAt', updatedRoom.roundStartedAt, 'status', updatedRoom.roundStatus, 'word', updatedRoom.currentWord?.word);
    } catch (e) {
      // ignore logging issues
    }
    setRoom(updatedRoom);
  };

  const getChampions = (players: Player[]) => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const highest = sorted[0]?.score ?? 0;
    return sorted.filter((player) => player.score === highest);
  };

  const handleCreateRoom = (difficulty: Difficulty) => {
    if (!playerName.trim()) {
      toast({
        title: "Enter your name",
        description: "Please enter a display name to continue",
        variant: "destructive",
      });
      return;
    }

    const newRoom: Room = {
      id: 'room-' + Date.now(),
      code: generateRoomCode(),
      host: playerId,
      players: [{
        ...currentPlayer,
        name: playerName,
        isHost: true,
      }],
      maxPlayers: 4,
      status: 'waiting',
      difficulty,
      round: 0,
      maxRounds: 10,
      usedWords: [],
    };

    persistRoom(newRoom);
    setPhase('lobby');

    toast({
      title: "Room Created!",
      description: `Room code: ${newRoom.code}`,
    });
  };

  const handleJoinRoom = (code: string) => {
    if (!playerName.trim()) {
      toast({
        title: "Enter your name",
        description: "Please enter a display name to continue",
        variant: "destructive",
      });
      return;
    }

    const store = loadMockRoomStore();
    const existingRoom = store.get(code);

    if (!existingRoom) {
      toast({
        title: "Room not found",
        description: `No multiplayer room exists for code ${code}.`,
        variant: "destructive",
      });
      return;
    }

    const playerAlreadyInRoom = existingRoom.players.some((player) => player.id === currentPlayer.id);
    const updatedPlayers = playerAlreadyInRoom
      ? existingRoom.players
      : [...existingRoom.players, { ...currentPlayer, name: playerName, isHost: false }];

    const updatedRoom: Room = {
      ...existingRoom,
      players: updatedPlayers,
      status: 'waiting',
      usedWords: existingRoom.usedWords ?? [],
      round: existingRoom.round ?? 0,
      currentWord: existingRoom.currentWord,
    };

    persistRoom(updatedRoom);
    setPhase('lobby');

    toast({
      title: "Joined Room!",
      description: `Connected to room ${code}`,
    });
  };

  const handleCopyCode = async () => {
    if (room) {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    }
  };

  const handleStartGame = async () => {
    if (!room || room.players.length < 2) {
      toast({
        title: "Need more players",
        description: "At least 2 players are required to start.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingWord(true);
    const firstWord = buildLocalWordData(room.difficulty, new Set());

    if (!firstWord) {
      setIsLoadingWord(false);
      toast({
        title: "No words available",
        description: "Try a different difficulty.",
        variant: "destructive",
      });
      return;
    }

    const startedRoom: Room = {
      ...room,
      status: 'playing',
      round: 1,
      currentWord: firstWord,
      usedWords: [firstWord.word],
      roundStartedAt: Date.now(),
      roundStatus: 'active',
    };

    persistRoom(startedRoom);
    setIsLoadingWord(false);

    toast({
      title: "Game Started",
      description: "Everyone now sees the same challenge.",
    });
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!room || !room.currentWord || isSubmitting) return;

    if (answer.toLowerCase().trim() === room.currentWord.word.toLowerCase()) {
      setIsSubmitting(true);
      const pointsEarned = DIFFICULTY_CONFIG[room.difficulty].points;
      const updatedPlayers = room.players.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, score: player.score + pointsEarned }
          : player
      );

      const nextRound = room.round + 1;
      const usedWords = [...(room.usedWords ?? []), room.currentWord.word];

      if (nextRound > room.maxRounds) {
        const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
        const completedRoom: Room = {
          ...room,
          players: updatedPlayers,
          status: 'finished',
          currentWord: undefined,
          round: room.maxRounds,
          usedWords,
        };
        persistRoom(completedRoom);
        setIsSubmitting(false);
        toast({
          title: "Game finished",
          description: `${sortedPlayers[0]?.name ?? 'No one'} wins!`,
        });
        return;
      }

      const nextWord = buildLocalWordData(room.difficulty, new Set(usedWords));

      if (!nextWord) {
        const completedRoom: Room = {
          ...room,
          players: updatedPlayers,
          status: 'finished',
          currentWord: undefined,
          round: room.maxRounds,
          usedWords,
        };
        persistRoom(completedRoom);
        setIsSubmitting(false);
        toast({
          title: "Game finished",
          description: "No more words left.",
        });
        return;
      }

      const nextRoom: Room = {
        ...room,
        players: updatedPlayers,
        status: 'playing',
        round: nextRound,
        currentWord: nextWord,
        usedWords,
        roundStartedAt: Date.now(),
        roundStatus: 'active',
      };

      persistRoom(nextRoom);
      setIsSubmitting(false);
      toast({
        title: "Correct!",
        description: `+${pointsEarned} points for ${currentPlayer.name}`,
      });
      return;
    }

    toast({
      title: "Not quite right",
      description: "Try again on the current word.",
      variant: "destructive",
    });
  };

  // Menu Phase
  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Logo size="sm" animated={false} />
          <div className="w-24" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-light flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Multiplayer
            </h1>
            <p className="text-muted-foreground max-w-md">
              Challenge friends to a word scramble battle! Create a room or join with a code.
            </p>
          </motion.div>

          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-sm mb-8"
          >
            <label className="block text-sm font-display uppercase tracking-wider text-muted-foreground mb-2">
              Your Display Name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="text-center text-lg"
            />
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg"
          >
            <button
              onClick={() => setPhase('create')}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 text-left"
            >
              <Plus className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-display font-bold text-foreground mb-1">Create Room</h3>
              <p className="text-sm text-muted-foreground">Start a new game and invite friends</p>
            </button>

            <button
              onClick={() => setPhase('join')}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 text-left"
            >
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-display font-bold text-foreground mb-1">Join Room</h3>
              <p className="text-sm text-muted-foreground">Enter a room code to join</p>
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Create Phase
  if (phase === 'create') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <Button variant="ghost" onClick={() => setPhase('menu')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Logo size="sm" animated={false} />
          <div className="w-24" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Create Room
            </h1>
            <p className="text-muted-foreground">
              Choose difficulty for your multiplayer game
            </p>
          </motion.div>

          <DifficultySelector onSelect={(d) => handleCreateRoom(d)} />
        </main>
      </div>
    );
  }

  // Join Phase
  if (phase === 'join') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <Button variant="ghost" onClick={() => setPhase('menu')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Logo size="sm" animated={false} />
          <div className="w-24" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Join Room
            </h1>
            <p className="text-muted-foreground">
              Enter the 6-character room code
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-sm"
          >
            <RoomCodeInput onJoin={handleJoinRoom} />
          </motion.div>
        </main>
      </div>
    );
  }

  // Lobby Phase
  if (phase === 'lobby' && room) {
    const isHost = room.host === currentPlayer.id;

    if (room.status === 'playing') {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <header className="p-4 flex items-center justify-between border-b border-border">
            <Button variant="ghost" onClick={() => { setRoom(null); setPhase('menu'); }}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave
            </Button>
            <Logo size="sm" animated={false} />
            <div className="w-24" />
          </header>

          <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
              <div className="card-gaming p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Room code</p>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {room.code}
                    </h2>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-display uppercase tracking-wider',
                    'bg-success/10 text-success'
                  )}>
                    Round {room.round}/{room.maxRounds}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Players</p>
                      <p className="text-lg font-display font-bold text-foreground">{room.players.length}/{room.maxPlayers}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer
                        timeRemaining={timeLeft}
                        totalTime={DIFFICULTY_CONFIG[room.difficulty].time}
                      />
                      <ScoreDisplay
                        score={room.players.find((player) => player.id === currentPlayer.id)?.score ?? 0}
                        level={room.round}
                        streak={0}
                      />
                    </div>
                  </div>

                  {/*
                    Three mutually-exclusive states while playing:
                    1. roundStatus === 'revealing'  -> Time's Up screen with the answer
                    2. isLoadingWord || isSubmitting -> spinner while fetching next word
                    3. otherwise                     -> the live scrambled word + input
                  */}
                  <AnimatePresence mode="wait">
                    {room.roundStatus === 'revealing' && room.currentWord ? (
                      <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-3 py-16 text-center"
                      >
                        <span className="px-3 py-1 rounded-full text-xs font-display uppercase tracking-wider bg-destructive/10 text-destructive">
                          Time's Up!
                        </span>
                        <p className="text-muted-foreground">The word was</p>
                        <p className="text-4xl font-display font-bold text-primary tracking-wide">
                          {room.currentWord.word}
                        </p>
                        {room.currentWord.definitions?.[0] && (
                          <p className="text-sm text-muted-foreground max-w-sm">
                            {room.currentWord.definitions[0]}
                          </p>
                        )}
                      </motion.div>
                    ) : isLoadingWord || isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-4 py-16"
                      >
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-muted-foreground">Loading next challenge...</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={room.currentWord?.scrambled || 'ready'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {room.currentWord ? (
                          <>
                            <ScrambledWord word={room.currentWord.scrambled} />
                            <DefinitionCard
                              definitions={room.currentWord.definitions}
                              partOfSpeech={room.currentWord.partOfSpeech}
                            />
                            <GameInput
                              onSubmit={handleSubmitAnswer}
                              onSkip={() => toast({ title: 'Skipped', description: 'No points awarded for this round.' })}
                              disabled={isSubmitting}
                              wordLength={room.currentWord.word.length}
                            />
                          </>
                        ) : (
                          <div className="text-center py-16">
                            <p className="text-lg text-muted-foreground">Waiting for the next word...</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6">
                <Leaderboard players={room.players} currentPlayerId={currentPlayer.id} />
                {isHost && (
                  <Button
                    variant="gaming"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      const finishedRoom: Room = { ...room, status: 'finished', currentWord: undefined, round: room.maxRounds };
                      persistRoom(finishedRoom);
                    }}
                  >
                    End Game
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      );
    }

    if (room.status === 'finished') {
      const champions = getChampions(room.players);
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <header className="p-4 flex items-center justify-between border-b border-border">
            <Button variant="ghost" onClick={() => { setRoom(null); setPhase('menu'); }}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave
            </Button>
            <Logo size="sm" animated={false} />
            <div className="w-24" />
          </header>

          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-gaming p-8 w-full max-w-2xl text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-warning/10 p-4 text-warning">
                  <Trophy className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">Champions</h2>
              <p className="text-muted-foreground mb-6">The 10-word challenge is complete.</p>
              <div className="space-y-3">
                {champions.map((player) => (
                  <div key={player.id} className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <p className="text-lg font-display font-bold text-foreground">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.score} points</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {room.players.slice().sort((a, b) => b.score - a.score).map((player) => (
                  <div key={player.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                    <span className="font-display text-foreground">{player.name}</span>
                    <span className="text-sm text-muted-foreground">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <Button variant="ghost" onClick={() => { setRoom(null); setPhase('menu'); }}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave
          </Button>
          <Logo size="sm" animated={false} />
          <div className="w-24" />
        </header>

        <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gaming p-6 mb-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected as</p>
                <h2 className="text-xl font-display font-bold text-foreground">{currentPlayer.name}</h2>
              </div>
              <div className={cn(
                'inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-display uppercase tracking-wider',
                isHost ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
              )}
              >
                {isHost ? 'Host' : 'Waiting for host'}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Code Card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gaming p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-bold text-foreground">Room Code</h2>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-display uppercase tracking-wider',
                    room.status === 'waiting' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  )}>
                    {room.status === 'waiting' ? 'Waiting' : 'In Game'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center py-4 rounded-xl bg-secondary border-2 border-dashed border-primary/30">
                    <span className="text-4xl font-display font-bold tracking-[0.3em] text-primary">
                      {room.code}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="gaming-outline" size="icon" onClick={handleCopyCode}>
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                    <Button variant="gaming-outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Players */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-gaming p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Players ({room.players.length}/{room.maxPlayers})
                  </h2>
                </div>

                <div className="space-y-3">
                  {room.players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      isCurrentPlayer={player.id === currentPlayer.id}
                    />
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-border text-muted-foreground"
                    >
                      Waiting for player...
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Start Button */}
              {isHost && room.status === 'waiting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="gaming"
                    size="xl"
                    onClick={handleStartGame}
                    disabled={room.players.length < 2}
                    className="w-full"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Game
                  </Button>
                  {room.players.length < 2 && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Need at least 2 players to start
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Game Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card-gaming p-6"
              >
                <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Game Settings
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-display text-primary capitalize">{room.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rounds</span>
                    <span className="font-display text-foreground">{room.maxRounds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Players</span>
                    <span className="font-display text-foreground">{room.maxPlayers}</span>
                  </div>
                </div>
              </motion.div>

              {/* Mini Leaderboard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Leaderboard players={room.players} currentPlayerId={currentPlayer.id} />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default Multiplayer;
