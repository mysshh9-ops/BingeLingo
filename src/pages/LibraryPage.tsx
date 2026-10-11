import { useState, useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { useSessions } from '@/lib/hooks';
import type { Session } from '@/types';
import { Film, BookOpen, Calendar, ChevronRight, Inbox, AlertCircle, Sparkles, Search, Filter } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

type StatusFilter = 'all' | 'ready' | 'demo' | 'captured';

export function LibraryPage() {
  const { navigate } = useRouter();
  const { sessions, loading, error } = useSessions();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filteredSessions = useMemo(() => {
    let result = sessions;
    if (filter === 'ready') result = result.filter(s => s.status === 'ready');
    else if (filter === 'demo') result = result.filter(s => s.is_demo);
    else if (filter === 'captured') result = result.filter(s => !s.is_demo);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q));
    }
    return result;
  }, [sessions, filter, search]);

  const readyCount = sessions.filter(s => s.status === 'ready').length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-grape-800">My Drama Library</h1>
          <span className="text-2xl">📺</span>
        </div>
        <p className="text-ink-soft text-sm font-medium">Your collection of K-drama learning adventures</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search episodes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border-2 border-lav-100 text-ink text-sm font-medium placeholder:text-ink-light focus:outline-none focus:border-lav-300 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'All' },
            { key: 'ready', label: 'Ready' },
            { key: 'demo', label: 'Demo' },
            { key: 'captured', label: 'Captured' },
          ] as { key: StatusFilter; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-grape-700 text-white shadow-md'
                  : 'bg-white/60 text-ink-soft border-2 border-lav-100 hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/60 rounded-2xl border-2 border-lav-100 p-5 animate-pulse">
                <div className="h-4 bg-lav-100 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-lav-100 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-lav-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-bubble-50 rounded-2xl border-2 border-bubble-200 p-5">
            <div className="flex items-center gap-2 text-bubble-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState hasEpisodes={readyCount > 0} onAction={() => navigate('capture')} />
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((s, idx) => (
              <LibraryRow
                key={s.id}
                session={s}
                index={idx}
                onClick={() => navigate('lesson', s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryRow({ session, index, onClick }: {
  session: Session;
  index: number;
  onClick: () => void;
}) {
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const cardColors = [
    'from-bubble-50 to-bubble-100',
    'from-lav-50 to-lav-100',
    'from-sky-50 to-sky-100',
    'from-peach-50 to-peach-100',
    'from-butter-50 to-butter-100',
  ];
  const colorClass = cardColors[index % cardColors.length];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gradient-to-r ${colorClass} rounded-2xl border-2 border-white p-5 card-shadow card-shadow-hover transition-all duration-200 group animate-pop flex items-center gap-4`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-grape-600 to-grape-800 border-2 border-white flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform duration-200 sticker-shadow">
        <Film className="w-6 h-6 text-butter-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-xs text-ink-soft font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>
          <StatusSticker isDemo={session.is_demo} />
        </div>
        <h3 className="font-bold font-display text-grape-800 text-sm leading-snug group-hover:text-bubble-600 transition-colors line-clamp-1">
          {session.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-soft font-semibold">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {session.lesson_count} lessons
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-grape-400 group-hover:text-bubble-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </button>
  );
}

function StatusSticker({ isDemo }: { isDemo: boolean }) {
  return isDemo ? (
    <span className="text-[10px] px-2.5 py-1 rounded-chip bg-lav-200 text-lav-700 font-bold border border-lav-300 -rotate-3 sticker-shadow">
      DEMO
    </span>
  ) : (
    <span className="text-[10px] px-2.5 py-1 rounded-chip bg-bubble-200 text-bubble-700 font-bold border border-bubble-300 rotate-3 sticker-shadow">
      CAPTURED
    </span>
  );
}

function EmptyState({ hasEpisodes, onAction }: { hasEpisodes: boolean; onAction: () => void }) {
  return (
    <div className="bg-white/50 rounded-3xl border-2 border-dashed border-lav-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <Mascot size={80} expression="thinking" className="animate-float" />
      </div>
      <h3 className="text-grape-800 font-bold font-display text-lg mb-1">
        {hasEpisodes ? 'Nothing matches your search' : 'Your library is empty!'}
      </h3>
      <p className="text-sm text-ink-soft mb-5 font-medium">
        {hasEpisodes ? 'Try a different search or filter' : 'Import or capture an episode to build your collection'}
      </p>
      {!hasEpisodes && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-bubble-400 to-peach-400 text-white font-bold text-sm hover:from-bubble-500 hover:to-peach-500 transition-all sticker-shadow hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Import an episode
        </button>
      )}
    </div>
  );
}
