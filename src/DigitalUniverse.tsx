import { useMemo } from 'react';
import { UNIVERSE_WORDS } from '@/data/hindi';

const FLOW = [
  { label: 'English', sub: 'Input', color: 'text-electric-400' },
  { label: 'AI', sub: 'Neural Core', color: 'text-saffron-400' },
  { label: 'हिन्दी', sub: 'Translation', color: 'text-indiagreen-400' },
  { label: 'संस्कृति', sub: 'Culture', color: 'text-gold-400' },
  { label: 'विश्व', sub: 'World', color: 'text-saffron-400' },
];

export function DigitalUniverse() {
  const floatingWords = useMemo(
    () =>
      UNIVERSE_WORDS.map((word, i) => ({
        word,
        left: 5 + Math.random() * 90,
        top: 5 + Math.random() * 90,
        size: 14 + Math.random() * 24,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
        opacity: 0.08 + Math.random() * 0.12,
        id: i,
      })),
    []
  );

  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-10">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wider mb-2">
          DIGITAL HINDI <span className="text-saffron-500 glow-text-saffron">UNIVERSE</span>
        </h2>
        <p className="font-body text-sm text-gray-400">A network of language, culture, and knowledge</p>
      </div>

      {/* Flow diagram */}
      <div className="gradient-border p-6 sm:p-10 scanlines relative overflow-hidden">
        {/* Floating words background */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingWords.map((w) => (
            <span
              key={w.id}
              className="absolute font-hindi animate-drift select-none"
              style={{
                left: `${w.left}%`,
                top: `${w.top}%`,
                fontSize: `${w.size}px`,
                opacity: w.opacity,
                color: 'rgba(99,179,237,0.8)',
                animationDuration: `${w.duration}s`,
                animationDelay: `${w.delay}s`,
              }}
            >
              {w.word}
            </span>
          ))}
        </div>

        {/* Flow nodes */}
        <div className="relative flex flex-col items-center gap-2">
          {FLOW.map((node, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="glass rounded-2xl px-8 py-4 text-center min-w-[140px]">
                <div className={`font-hindi-serif text-2xl ${node.color}`}>{node.label}</div>
                <div className="font-body text-[10px] tracking-widest text-gray-500 uppercase mt-0.5">{node.sub}</div>
              </div>
              {i < FLOW.length - 1 && (
                <div className="w-px h-6 bg-gradient-to-b from-saffron-500/50 to-electric-500/50" />
              )}
            </div>
          ))}
        </div>

        {/* Connection lines / network */}
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {UNIVERSE_WORDS.slice(0, 6).map((word, i) => (
            <span key={i} className="font-hindi text-sm text-gray-500">
              {word}
              {i < 5 && <span className="text-saffron-500/40 ml-6">•</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
