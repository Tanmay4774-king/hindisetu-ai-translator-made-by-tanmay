import { Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center neon-border-blue bg-ink-800/60">
              <Cpu className="w-4 h-4 text-electric-400" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              Hindi<span className="text-saffron-500">Setu</span>
            </span>
          </div>

          <p className="font-hindi-serif text-lg text-gray-400">
            भाषाओं के बीच एक डिजिटल सेतु
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {['AI', 'Language', 'Culture', 'Future'].map((tag, i) => (
              <span key={tag} className="font-body text-xs text-gray-500 tracking-wider uppercase">
                {tag}
                {i < 3 && <span className="text-saffron-500/40 ml-3">•</span>}
              </span>
            ))}
          </div>

          <p className="font-body text-sm text-gray-500">
            Made with <span className="text-red-400">❤</span> by{' '}
            <span className="text-saffron-400 font-semibold">Tanmay</span>
          </p>

          <p className="font-body text-sm text-gray-600">
            🇮🇳 Happy Hindi Diwas 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
