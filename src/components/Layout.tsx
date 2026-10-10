import { useRouter, type Page } from '@/lib/router';
import { Home, Library, Camera, Layers, BarChart3, Sparkles } from 'lucide-react';

interface NavItem {
  page: Page;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'library', label: 'Library', icon: Library },
  { page: 'capture', label: 'Capture', icon: Camera },
  { page: 'flashcards', label: 'Flashcards', icon: Layers },
  { page: 'progress', label: 'Progress', icon: BarChart3 },
];

export function Sidebar() {
  const { page, navigate } = useRouter();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-charcoal-850 border-r border-charcoal-700/50 h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-charcoal-700/50">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender to-rose flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-charcoal-900" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold text-cream leading-none">BingeLingo</h1>
            <p className="text-[10px] text-cream-muted mt-0.5 tracking-wider uppercase">Korean</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-charcoal-700 text-cream'
                  : 'text-cream-muted hover:text-cream hover:bg-charcoal-800'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-lavender' : ''}`}
                strokeWidth={2}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-charcoal-700/50">
        <p className="text-[11px] text-cream-muted leading-relaxed">
          Binge your show.<br />
          <span className="text-lavender">Keep the language.</span>
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { page, navigate } = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal-850/95 backdrop-blur-lg border-t border-charcoal-700/50 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-lavender' : 'text-cream-muted'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
