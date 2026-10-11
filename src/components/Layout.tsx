import { useRouter, type Page } from '@/lib/router';
import { Home, Library, Camera, Layers, BarChart3, Sparkles } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

interface NavItem {
  page: Page;
  label: string;
  icon: typeof Home;
  emoji: string;
  color: string;
}

const navItems: NavItem[] = [
  { page: 'home', label: 'Home', icon: Home, emoji: '🏠', color: 'bubble' },
  { page: 'library', label: 'Library', icon: Library, emoji: '📚', color: 'lav' },
  { page: 'capture', label: 'Capture', icon: Camera, emoji: '🎬', color: 'peach' },
  { page: 'flashcards', label: 'Cards', icon: Layers, emoji: '🃏', color: 'sky' },
  { page: 'progress', label: 'Progress', icon: BarChart3, emoji: '🏆', color: 'butter' },
];

const colorMap: Record<string, { bg: string; text: string; activeBg: string }> = {
  bubble: { bg: 'bg-bubble-100', text: 'text-bubble-600', activeBg: 'bg-bubble-400' },
  lav: { bg: 'bg-lav-100', text: 'text-lav-600', activeBg: 'bg-lav-400' },
  peach: { bg: 'bg-peach-100', text: 'text-peach-600', activeBg: 'bg-peach-400' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-600', activeBg: 'bg-sky-400' },
  butter: { bg: 'bg-butter-100', text: 'text-butter-600', activeBg: 'bg-butter-400' },
};

export function Sidebar() {
  const { page, navigate } = useRouter();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-lav-50 via-cream to-bubble-50 border-r-2 border-lav-100 h-screen sticky top-0">
      <div className="px-5 py-5 border-b-2 border-lav-100">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-3 group"
        >
          <div className="group-hover:scale-105 transition-transform duration-200">
            <Mascot size={44} expression="excited" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold font-display text-grape-700 leading-none">BingeLingo</h1>
            <p className="text-[10px] text-grape-400 mt-1 tracking-wider uppercase font-semibold">Learn Korean!</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.page;
          const c = colorMap[item.color];
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? `${c.activeBg} text-white shadow-md scale-[1.02]`
                  : 'text-ink-soft hover:text-ink hover:bg-white/60'
              }`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isActive ? 'bg-white/25' : c.bg}`}>
                {isActive ? <Icon className="w-5 h-5" strokeWidth={2.5} /> : item.emoji}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t-2 border-lav-100">
        <div className="bg-gradient-to-br from-bubble-100 to-lav-100 rounded-2xl p-3.5 -rotate-2">
          <p className="text-xs text-grape-700 font-semibold leading-relaxed font-display">
            Binge your show.<br />
            <span className="text-bubble-600">Keep the language! </span>
            <span className="inline-block animate-wiggle">✨</span>
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { page, navigate } = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-lav-100 z-50 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.page;
          const c = colorMap[item.color];
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? `${c.activeBg} text-white` : 'text-ink-soft'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
