import type { TranslationStage } from '@/types';

interface AICoreProps {
  isTranslating: boolean;
  stages: TranslationStage[];
}

export function AICore({ isTranslating, stages }: AICoreProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {/* Orb */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            isTranslating ? 'border-saffron-500/60 animate-spin-slow' : 'border-electric-500/40'
          }`}
          style={{ animationDuration: '3s' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-saffron-500" style={{ boxShadow: '0 0 12px #ff9933' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-electric-500" style={{ boxShadow: '0 0 10px #3b82f6' }} />
        </div>

        {/* Middle ring */}
        <div
          className={`absolute inset-3 rounded-full border ${
            isTranslating ? 'border-electric-500/50 animate-spin-reverse-slow' : 'border-electric-500/30'
          }`}
          style={{ animationDuration: '4s' }}
        >
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indiagreen-500" style={{ boxShadow: '0 0 10px #4ade80' }} />
        </div>

        {/* Inner glow orb */}
        <div
          className={`absolute inset-6 rounded-full ${
            isTranslating ? 'animate-pulse-glow-saffron' : 'animate-pulse-glow'
          }`}
          style={{
            background: isTranslating
              ? 'radial-gradient(circle, rgba(255,153,51,0.3), rgba(59,130,246,0.15), transparent)'
              : 'radial-gradient(circle, rgba(59,130,246,0.25), rgba(59,130,246,0.1), transparent)',
          }}
        />

        {/* Center text */}
        <div className="relative z-10 text-center">
          <div className="font-display font-black text-2xl text-white glow-text-blue">AI</div>
        </div>

        {/* Flowing particles when translating */}
        {isTranslating && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-saffron-400"
                style={{
                  left: '50%',
                  boxShadow: '0 0 8px #ff9933',
                  animation: `float-up 2s linear infinite`,
                  animationDelay: `${i * 0.3}s`,
                  transform: 'translateY(-50%)',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="font-display text-[10px] sm:text-xs tracking-[0.2em] text-gray-400 uppercase">
          Neural Translation Core
        </p>
      </div>

      {/* Stages */}
      <div className="w-full max-w-[200px] space-y-1.5 min-h-[80px]">
        {stages.map((stage, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-xs font-body transition-all duration-300 ${
              stage.done ? 'opacity-100' : isTranslating ? 'opacity-60 animate-blink' : 'opacity-30'
            }`}
          >
            <span className={stage.done ? 'text-indiagreen-500' : 'text-saffron-400'}>
              {stage.done ? '✓' : '◉'}
            </span>
            <span className={stage.done ? 'text-indiagreen-400' : 'text-gray-400'}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
