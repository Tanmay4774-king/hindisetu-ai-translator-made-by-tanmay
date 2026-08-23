import { Zap, ChevronDown } from 'lucide-react';

interface HeroProps {
  onEnter: () => void;
}

export function Hero({ onEnter }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden"
    >
      {/* Rotating mandala / globe ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] opacity-30">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border border-saffron-500/30 animate-spin-slow"
            style={{ borderTopColor: 'rgba(255,153,51,0.6)', borderRightColor: 'rgba(255,153,51,0.2)' }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-8 rounded-full border border-electric-500/30 animate-spin-reverse-slow"
            style={{ borderBottomColor: 'rgba(59,130,246,0.6)', borderLeftColor: 'rgba(59,130,246,0.2)' }}
          />
          {/* Inner ring */}
          <div
            className="absolute inset-16 rounded-full border border-indiagreen-500/30 animate-spin-slow"
            style={{ borderTopColor: 'rgba(74,222,128,0.5)' }}
          />
          {/* Mandala lines */}
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '40s' }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-px h-1/2 origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                  background: 'linear-gradient(to top, transparent, rgba(255,153,51,0.15))',
                }}
              />
            ))}
          </div>
          {/* Center glow */}
          <div
            className="absolute inset-1/3 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)' }}
          />
        </div>
      </div>

      {/* Badge */}
      <div className="relative mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border-saffron">
          <span className="text-base">🇮🇳</span>
          <span className="font-body font-semibold text-xs sm:text-sm tracking-widest text-saffron-400 uppercase">
            Hindi Diwas • AI Edition
          </span>
        </div>
      </div>

      {/* Title */}
      <h1
        className="relative font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight animate-fade-in-up"
        style={{ animationDelay: '0.4s' }}
      >
        <span className="tricolor-text">HindiSetu</span>
      </h1>

      {/* Hindi subtitle */}
      <p
        className="relative font-hindi-serif text-xl sm:text-3xl text-gray-300 mt-4 animate-fade-in-up"
        style={{ animationDelay: '0.6s' }}
      >
        भाषाओं के बीच एक डिजिटल सेतु
      </p>

      {/* English subtitle */}
      <p
        className="relative font-body font-medium text-base sm:text-lg text-gray-400 mt-3 animate-fade-in"
        style={{ animationDelay: '0.8s' }}
      >
        AI-Powered English → Hindi Translation
      </p>

      {/* Created by */}
      <p
        className="relative font-body text-sm text-gray-500 mt-2 animate-fade-in"
        style={{ animationDelay: '1s' }}
      >
        Created by <span className="text-saffron-400 font-semibold">Tanmay</span>
      </p>

      {/* CTA */}
      <button
        onClick={onEnter}
        className="relative mt-10 group animate-fade-in-up btn-glow"
        style={{ animationDelay: '1.2s' }}
      >
        <div className="relative px-8 py-4 rounded-2xl glass-strong neon-border-saffron overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/20 via-electric-500/20 to-indiagreen-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-saffron-400 group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white">
              ENTER HINDISETU
            </span>
          </div>
        </div>
      </button>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-gray-500" />
      </div>
    </section>
  );
}
