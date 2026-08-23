import { Copy, Volume2, Trash2, ArrowUpRight, History, X } from 'lucide-react';
import type { TranslationRecord } from '@/types';
import { speak } from '@/lib/speech';

interface TranslationMemoryProps {
  history: TranslationRecord[];
  onReuse: (text: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const MODE_LABELS: Record<string, string> = {
  standard: 'Standard',
  improved: 'Improved',
  simple: 'Simple',
  formal: 'Formal',
  conversational: 'Conversational',
  shorten: 'Shortened',
  rephrase: 'Rephrased',
};

export function TranslationMemory({ history, onReuse, onDelete, onClearAll }: TranslationMemoryProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleListen = (text: string) => {
    speak(text, 'hi', { onError: () => {} });
  };

  return (
    <section id="history" className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-electric-400" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wider">
            TRANSLATION <span className="text-electric-500 glow-text-blue">MEMORY</span>
          </h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass neon-border-saffron btn-glow text-xs font-body font-semibold text-saffron-400 hover:text-white transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="font-body text-gray-500 text-base">No translations yet. Start translating to build your history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-5 group hover:bg-white/5 transition-all animate-fade-in-up"
            >
              {/* Mode badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-[10px] tracking-widest text-gray-500 uppercase">
                  {MODE_LABELS[item.mode] || 'Standard'}
                </span>
                <span className="font-body text-[10px] text-gray-600">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* English */}
              <div className="mb-2">
                <span className="font-display text-[9px] tracking-widest text-electric-400 uppercase">English</span>
                <p className="font-body text-sm text-gray-300 mt-0.5 line-clamp-2">{item.english}</p>
              </div>

              {/* Arrow */}
              <div className="text-saffron-500/60 text-xs mb-2">↓</div>

              {/* Hindi */}
              <div className="mb-4">
                <span className="font-display text-[9px] tracking-widest text-indiagreen-400 uppercase">हिन्दी</span>
                <p className="font-hindi text-base text-white mt-0.5 line-clamp-2">{item.hindi}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(item.hindi)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-body text-gray-300 hover:text-white transition-all btn-glow"
                  aria-label="Copy translation"
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={() => handleListen(item.hindi)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-body text-gray-300 hover:text-white transition-all btn-glow"
                  aria-label="Listen to translation"
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Listen</span>
                </button>
                <button
                  onClick={() => onReuse(item.english)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-body text-gray-300 hover:text-white transition-all btn-glow"
                  aria-label="Reuse this translation"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="hidden sm:inline">Reuse</span>
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs font-body text-gray-300 hover:text-red-400 transition-all btn-glow ml-auto"
                  aria-label="Delete this translation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
