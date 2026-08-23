import { useMemo } from 'react';

export function HindiDiwas() {
  const mandalaLines = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  return (
    <section id="diwas" className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Background mandala */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="relative w-[400px] h-[400px] sm:w-[600px] sm:h-[600px]">
          <div className="absolute inset-0 rounded-full border border-gold-500/30 animate-spin-slow" style={{ animationDuration: '60s' }}>
            {mandalaLines.map((i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-px h-1/2 origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 15}deg)`,
                  background: 'linear-gradient(to top, transparent, rgba(251,191,36,0.2))',
                }}
              />
            ))}
          </div>
          <div className="absolute inset-12 rounded-full border border-saffron-500/20 animate-spin-reverse-slow" style={{ animationDuration: '50s' }} />
          <div className="absolute inset-24 rounded-full border border-indiagreen-500/20 animate-spin-slow" style={{ animationDuration: '40s' }} />
        </div>
      </div>

      <div className="relative text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border-saffron mb-6">
          <span className="text-base">🇮🇳</span>
          <span className="font-body font-semibold text-xs tracking-widest text-saffron-400 uppercase">Hindi Diwas</span>
        </div>

        <h2 className="font-hindi-serif text-5xl sm:text-7xl text-white glow-text-gold mb-4">
          हिंदी दिवस
        </h2>

        <p className="font-hindi text-lg sm:text-2xl text-gray-300 mb-8">
          हिंदी हमारी भाषा • हमारी पहचान • हमारा भविष्य
        </p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto text-left">
          <p className="font-body text-base text-gray-300 leading-relaxed">
            <span className="text-saffron-400 font-semibold">हिंदी दिवस</span> हर वर्ष 14 सितंबर को मनाया जाता है,
            जब 1949 में हिंदी को भारत की राजभाषा के रूप में आधिकारिक रूप से अपनाया गया था। यह दिन हिंदी भाषा
            की समृद्धि, साहित्य और सांस्कृतिक विरासत का उत्सव है।
          </p>
          <p className="font-body text-base text-gray-400 leading-relaxed mt-4">
            हिंदी दुनिया की सबसे बोली जाने वाली भाषाओं में से एक है, जो लाखों लोगों को जोड़ती है। यह दिन
            हमें अपनी भाषा को अपनाने, उसे आगे बढ़ाने और आने वाली पीढ़ियों तक पहुँचाने की प्रेरणा देता है।
          </p>
        </div>

        {/* Animated quote */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-saffron">
            <p className="font-hindi-serif text-xl sm:text-2xl text-gold-400 glow-text-gold text-center italic">
              "हिंदी को अपनाएँ, हिंदी को आगे बढ़ाएँ।"
            </p>
          </div>
        </div>

        {/* Tricolor energy waves */}
        <div className="mt-10 flex flex-col gap-1.5 max-w-md mx-auto">
          {['from-saffron-500', 'from-white', 'from-indiagreen-500'].map((color, i) => (
            <div
              key={i}
              className={`h-1 rounded-full bg-gradient-to-r ${color} to-transparent opacity-60`}
              style={{ animation: `drift ${3 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
