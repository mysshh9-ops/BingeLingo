import { useRouter } from '@/lib/router';
import { useSessions } from '@/lib/hooks';
import type { Session } from '@/types';
import { Film, BookOpen, Calendar, ChevronRight, Inbox, AlertCircle, Sparkles } from 'lucide-react';

export function LibraryPage() {
  const { navigate } = useRouter();
  const { sessions, loading, error } = useSessions();
  const readySessions = sessions.filter(s => s.status === 'ready');

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-cream mb-1">Episode Library</h1>
        <p className="text-cream-muted text-sm">All your completed learning sessions</p>
      </div>

      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 animate-pulse">
                <div className="h-4 bg-charcoal-700 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-charcoal-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-charcoal-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose/10 rounded-xl border border-rose/20 p-5">
            <div className="flex items-center gap-2 text-rose">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : readySessions.length === 0 ? (
          <div className="bg-charcoal-800/50 rounded-xl border border-dashed border-charcoal-700 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-charcoal-700/50 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-cream-muted" />
            </div>
            <h3 className="text-cream font-medium mb-1">Your library is empty</h3>
            <p className="text-sm text-cream-muted mb-5">
              Import or capture an episode to build your collection
            </p>
            <button
              onClick={() => navigate('capture')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-lavender/15 text-lavender border border-lavender/20 text-sm font-medium hover:bg-lavender/25 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Import an episode
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {readySessions.map((s, idx) => (
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

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 card-glow card-glow-hover transition-all duration-200 group animate-fade-in-up flex items-center gap-4"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-700 to-charcoal-800 border border-charcoal-600/50 flex items-center justify-center flex-shrink-0 group-hover:border-lavender/30 transition-colors">
        <Film className="w-5 h-5 text-cream-muted group-hover:text-lavender transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-xs text-cream-muted">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>
          {session.is_demo ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender/15 text-lavender border border-lavender/20 font-medium">
              DEMO
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose/15 text-rose border border-rose/20 font-medium">
              CAPTURED
            </span>
          )}
        </div>
        <h3 className="font-semibold text-cream text-sm leading-snug group-hover:text-lavender transition-colors line-clamp-1">
          {session.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-cream-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {session.lesson_count} lessons
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-cream-muted group-hover:text-lavender group-hover:translate-x-1 transition-all flex-shrink-0" />
    </button>
  );
}
