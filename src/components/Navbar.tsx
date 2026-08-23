import { useState, useEffect } from 'react';
import { Menu, X, Cpu } from 'lucide-react';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { label: 'Translator', id: 'translator' },
  { label: 'Voice AI', id: 'voice' },
  { label: 'Hindi Diwas', id: 'diwas' },
  { label: 'History', id: 'history' },
];

export function Navbar({ onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-2.5' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('hero')}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center neon-border-blue bg-ink-800/60">
            <Cpu className="w-5 h-5 text-electric-400" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white group-hover:glow-text-blue transition-all">
            Hindi<span className="text-saffron-500 glow-text-saffron">Setu</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="px-4 py-2 text-sm font-body font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all btn-glow"
            >
              {item.label}
            </button>
          ))}
          <div className="ml-3 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <span className="w-2 h-2 rounded-full bg-indiagreen-500 animate-blink" style={{ boxShadow: '0 0 8px #4ade80' }} />
            <span className="text-xs font-body font-semibold text-indiagreen-400">AI Online</span>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-4 glass-strong rounded-2xl p-3 animate-slide-down">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full text-left px-4 py-3 text-sm font-body font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-indiagreen-500 animate-blink" style={{ boxShadow: '0 0 8px #4ade80' }} />
            <span className="text-xs font-body font-semibold text-indiagreen-400">AI Online</span>
          </div>
        </div>
      )}
    </nav>
  );
}
