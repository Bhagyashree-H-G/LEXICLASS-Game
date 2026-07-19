import { WordData } from '@/types/game';

const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Word lists by difficulty
const EASY_WORDS = [
  'apple', 'bread', 'chair', 'dance', 'eagle', 'flame', 'grape', 'happy', 'image', 'juice',
  'kite', 'lemon', 'music', 'night', 'ocean', 'peace', 'queen', 'river', 'stone', 'train',
  'unity', 'voice', 'water', 'youth', 'zebra', 'beach', 'cloud', 'dream', 'earth', 'frost',
  'ghost', 'heart', 'island', 'jewel', 'knife', 'light', 'money', 'noble', 'paint', 'quiet',
  'radio', 'smile', 'tower', 'urban', 'video', 'world', 'angel', 'blank', 'crown', 'doubt'
];

const MEDIUM_WORDS = [
  'balance', 'captain', 'diamond', 'eclipse', 'fantasy', 'glacier', 'harmony', 'imagine',
  'journey', 'kitchen', 'library', 'mystery', 'network', 'Olympic', 'pattern', 'quality',
  'rainbow', 'silence', 'triumph', 'universe', 'victory', 'whisper', 'ancient', 'breathe',
  'crystal', 'dolphin', 'elegant', 'fortune', 'gravity', 'horizon', 'inspire', 'justice',
  'kingdom', 'lantern', 'miracle', 'natural', 'organic', 'phoenix', 'quantum', 'radical',
  'shelter', 'thunder', 'upgrade', 'venture', 'weather', 'academy', 'billion', 'chamber'
];

const HARD_WORDS = [
  'adventure', 'beautiful', 'celebrate', 'dangerous', 'education', 'frequency', 'geography',
  'happiness', 'important', 'judgement', 'knowledge', 'landscape', 'memorable', 'necessary',
  'operation', 'paragraph', 'questions', 'recognize', 'structure', 'technique', 'universal',
  'volunteer', 'wonderful', 'algorithm', 'benchmark', 'chronicle', 'democracy', 'ecosystem',
  'framework', 'guarantee', 'histogram', 'implement', 'journalism', 'kilometer', 'labyrinth',
  'magnitude', 'narrative', 'orchestra', 'prototype', 'quadratic', 'renewable', 'spectacular'
];

export const getWordsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): string[] => {
  switch (difficulty) {
    case 'easy':
      return EASY_WORDS;
    case 'medium':
      return MEDIUM_WORDS;
    case 'hard':
      return HARD_WORDS;
    default:
      return EASY_WORDS;
  }
};

export const scrambleWord = (word: string): string => {
  const letters = word.split('');
  let scrambled = word;
  
  // Keep scrambling until it's different from the original
  let attempts = 0;
  while (scrambled === word && attempts < 100) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
    attempts++;
  }
  
  return scrambled.toUpperCase();
};

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
    }[];
  }[];
}

const sanitizeDefinition = (definition: string, targetWord: string): string => {
  const normalizedTarget = targetWord.toLowerCase();
  const normalizedDefinition = definition.replace(/\s+/g, ' ').trim();

  const withWordRemoved = normalizedDefinition
    .replace(new RegExp(`\\b${normalizedTarget}\\b`, 'gi'), 'this word')
    .replace(/\bthe word\b/gi, 'this word')
    .replace(/\bword\b/gi, 'term')
    .replace(/\s+/g, ' ')
    .trim();

  if (withWordRemoved.length > 0) {
    return withWordRemoved;
  }

  return 'A common English term';
};

export const fetchWordDefinition = async (word: string): Promise<WordData | null> => {
  try {
    const response = await fetch(`${FREE_DICTIONARY_API}/${word.toLowerCase()}`);
    
    if (!response.ok) {
      console.warn(`No definition found for: ${word}`);
      return {
        word: word.toLowerCase(),
        scrambled: scrambleWord(word),
        definitions: [`A common English word`],
      };
    }
    
    const data: DictionaryResponse[] = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const entry = data[0];
    const definitions: string[] = [];
    let partOfSpeech = '';
    
    for (const meaning of entry.meanings) {
      if (!partOfSpeech) {
        partOfSpeech = meaning.partOfSpeech;
      }
      for (const def of meaning.definitions.slice(0, 2)) {
        if (definitions.length < 1) {
          const sanitized = sanitizeDefinition(def.definition, entry.word);
          definitions.push(sanitized);
        }
      }
    }

    if (definitions.length === 0) {
      definitions.push('A common English term');
    }
    
    return {
      word: entry.word.toLowerCase(),
      scrambled: scrambleWord(entry.word),
      definitions,
      phonetic: entry.phonetic,
      partOfSpeech,
    };
  } catch (error) {
    console.error('Error fetching word definition:', error);
    // Return a basic word data if API fails
    return {
      word: word.toLowerCase(),
      scrambled: scrambleWord(word),
      definitions: [`A common English word`],
    };
  }
};

export const getRandomWord = async (
  difficulty: 'easy' | 'medium' | 'hard',
  usedWords: Set<string>
): Promise<WordData | null> => {
  const words = getWordsByDifficulty(difficulty);
  const availableWords = words.filter(w => !usedWords.has(w.toLowerCase()));
  
  if (availableWords.length === 0) {
    console.warn('All words have been used for this difficulty');
    return null;
  }
  
  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  return fetchWordDefinition(randomWord);
};
