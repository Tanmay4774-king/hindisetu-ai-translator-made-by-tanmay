import { useState, useCallback } from 'react';
import { Sparkles, Quote } from 'lucide-react';
import { HINDI_QUOTES } from '@/data/hindi';

export function QuoteGenerator() {
  const [quote, setQuote] = useState(() => {
    const idx = new Date().getDate() % HINDI_QUOTES.length;
    return HINDI_QUOTES[idx];
  });
  const [animating, setAnimating] = useState(false);

  const generate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * HINDI_QUOTES.length);
      setQuote(HINDI_QUOTES[idx]);
      setAnimating(false);
    }, 300);
  }, []);

  return (
    <section className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-3">
          <Quote className="w-3.5 h-3.5 text-saffron-400" />
          <span className="font-body font-semibold text-xs tracking-widest text-saffron-400 uppercase">Inspiration</span>
        </div>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wider">
          HINDI THOUGHT OF THE DAY
        </h2>
      </div>

      <div className={`gradient-border p-8 sm:p-10 scanlines ${animating ? 'opacity-30 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
        <div className="text-center">
          <Quote className="w-8 h-8 text-saffron-500/40 mx-auto mb-4" />
          <p className="font-hindi-serif text-xl sm:text-2xl text-white leading-relaxed italic mb-4">
            {quote.text}
          </p>
          <p className="font-body text-sm text-gray-500">— {quote.author}</p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={generate}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl glass neon-border-saffron btn-glow text-sm font-body font-semibold text-saffron-400 hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Generate Another
          </button>
        </div>
      </div>
    </section>
  );
}
