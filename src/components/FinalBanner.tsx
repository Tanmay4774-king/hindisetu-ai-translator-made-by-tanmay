export function FinalBanner() {
  return (
    <section className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="gradient-border p-8 sm:p-16 scanlines text-center relative overflow-hidden">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,153,51,0.2), transparent 70%)' }}
        />

        <div className="relative">
          <div className="text-4xl sm:text-5xl mb-6">🇮🇳</div>

          <h2 className="font-hindi-serif text-4xl sm:text-6xl text-white glow-text-gold mb-4">
            हिंदी दिवस
          </h2>

          <p className="font-hindi-serif text-lg sm:text-2xl text-gray-300 italic mb-8 max-w-2xl mx-auto">
            "हिंदी से जुड़ें। भारत से जुड़ें। भविष्य से जुड़ें।"
          </p>

          <div className="inline-block">
            <div className="font-display font-bold text-3xl sm:text-4xl tricolor-text mb-2">
              HindiSetu
            </div>
            <p className="font-body text-sm text-gray-400 mb-1">A Digital Bridge Between English & Hindi</p>
            <p className="font-body text-sm text-gray-500">
              Made with <span className="text-red-400">❤</span> by <span className="text-saffron-400 font-semibold">Tanmay</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
