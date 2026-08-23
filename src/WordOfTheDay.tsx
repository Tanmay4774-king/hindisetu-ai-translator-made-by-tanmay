import { useState, useCallback } from 'react';
import { Volume2, RefreshCw, BookOpen } from 'lucide-react';
import { HINDI_WORDS } from '@/data/hindi';
import { speak, isSpeechSynthesisSupported } from '@/lib/speech';
import type { HindiWord } from '@/types';

export function WordOfTheDay() {
  const [word, setWord] = useState<HindiWord>(() => {
    const idx = new Date().getDate() % HINDI_WORDS.length;
    return HINDI_WORDS[idx];
  });
  const [animating, setAnimating] = useState(false);

  const newWord = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * HINDI_WORDS.length);
      setWord(HINDI_WORDS[idx]);
      setAnimating(false);
    }, 300);
  }, []);

  const handleListen = () => {
    speak(word.hindi, 'hi', {
      onError: () => {},
    });
  };

  return (
    <section className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-3">
          <BookOpen className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-body font-semibold text-xs tracking-widest text-gold-400 uppercase">AI Feature</span>
        </div>
        <h2 className="font-hindi text-2xl sm:text-3xl text-white">आज का हिंदी शब्द</h2>
      </div>

      <div className={`gradient-border p-8 scanlines text-center ${animating ? 'opacity-30 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
        {/* Hindi word */}
        <div className="mb-6">
          <h3 className="font-hindi-serif text-5xl sm:text-6xl text-gold-400 glow-text-gold mb-3">
            {word.hindi}
          </h3>
          <p className="font-body text-lg text-gray-300">{word.english}</p>
        </div>

        {/* Meaning */}
        <div className="glass rounded-xl p-4 mb-4 text-left">
          <div className="flex items-start gap-2">
            <span className="font-body text-xs font-semibold text-saffron-400 uppercase tracking-wider mt-0.5">Meaning</span>
            <p className="font-hindi text-base text-gray-300 flex-1">{word.meaning}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleListen}
            disabled={!isSpeechSynthesisSupported()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass neon-border-green btn-glow text-sm font-body font-semibold text-indiagreen-400 hover:text-white transition-all disabled:opacity-40"
          >
            <Volume2 className="w-4 h-4" />
            सुनें
          </button>
          <button
            onClick={newWord}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass neon-border-saffron btn-glow text-sm font-body font-semibold text-saffron-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            नया शब्द
          </button>
        </div>
      </div>
    </section>
  );
}
