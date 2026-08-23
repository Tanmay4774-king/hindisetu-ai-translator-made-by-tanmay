import { useMemo } from 'react';
import { DEVANAGARI_CHARS } from '@/data/hindi';

export function AnimatedBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 20,
        color: ['rgba(255,153,51,0.6)', 'rgba(59,130,246,0.6)', 'rgba(74,222,128,0.6)'][i % 3],
      })),
    []
  );

  const floatingChars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        char: DEVANAGARI_CHARS[Math.floor(Math.random() * DEVANAGARI_CHARS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 18 + Math.random() * 42,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 8,
        opacity: 0.04 + Math.random() * 0.08,
      })),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950" />

      {/* Radial glows */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-drift"
        style={{ background: 'radial-gradient(circle, rgba(255,153,51,0.4), transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15 animate-drift"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', animationDelay: '3s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 animate-drift"
        style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.4), transparent 70%)', animationDelay: '5s' }}
      />

      {/* Digital grid */}
      <div className="absolute inset-0 digital-grid opacity-50" />

      {/* Floating Devanagari characters */}
      {floatingChars.map((c) => (
        <span
          key={c.id}
          className="absolute font-hindi animate-drift select-none"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            fontSize: `${c.size}px`,
            opacity: c.opacity,
            color: 'rgba(99,179,237,0.8)',
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.char}
        </span>
      ))}

      {/* Light particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-[2px] animate-scan"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.7) 100%)' }}
      />
    </div>
  );
}
