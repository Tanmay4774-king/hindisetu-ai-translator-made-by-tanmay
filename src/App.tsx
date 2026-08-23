import { useState, useCallback, useEffect } from 'react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Translator } from '@/components/Translator';
import { VoiceAI } from '@/components/VoiceAI';
import { HindiDiwas } from '@/components/HindiDiwas';
import { WordOfTheDay } from '@/components/WordOfTheDay';
import { QuoteGenerator } from '@/components/QuoteGenerator';
import { DigitalUniverse } from '@/components/DigitalUniverse';
import { TranslationMemory } from '@/components/TranslationMemory';
import { FinalBanner } from '@/components/FinalBanner';
import { Footer } from '@/components/Footer';
import { loadHistory, addToHistory, removeFromHistory, clearHistory } from '@/lib/history';
import type { TranslationRecord } from '@/types';

function App() {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<TranslationRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleHistoryAdd = useCallback((record: TranslationRecord) => {
    setHistory(addToHistory(record));
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    setHistory(removeFromHistory(id));
  }, []);

  const handleHistoryClear = useCallback(() => {
    setHistory(clearHistory());
  }, []);

  const handleReuse = useCallback((text: string) => {
    setInputText(text);
    document.getElementById('translator')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleVoiceCapture = useCallback((text: string) => {
    setInputText((prev) => (prev ? prev + ' ' : '') + text);
    setTimeout(() => {
      document.getElementById('translator')?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    if (section === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleEnter = useCallback(() => {
    document.getElementById('translator')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar onNavigate={handleNavigate} />

      <main>
        <Hero onEnter={handleEnter} />
        <Translator
          onHistoryAdd={handleHistoryAdd}
          setInputText={setInputText}
          inputText={inputText}
        />
        <VoiceAI onCapture={handleVoiceCapture} />
        <HindiDiwas />
        <WordOfTheDay />
        <QuoteGenerator />
        <DigitalUniverse />
        <TranslationMemory
          history={history}
          onReuse={handleReuse}
          onDelete={handleHistoryDelete}
          onClearAll={handleHistoryClear}
        />
        <FinalBanner />
      </main>

      <Footer />
    </div>
  );
}

export default App;
