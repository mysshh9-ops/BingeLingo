import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useSessions } from '@/lib/hooks';
import type { Session } from '@/types';
import { Sparkles, Clock, BookOpen, TrendingUp, Camera, ChevronRight, Film, Eye, EyeOff } from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { sessions, loading, error } = useSessions();
  const [lessonCount, setLessonCount] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: lessons }, { count: vocab }] = await Promise.all([
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('vocabulary').select('*', { count: 'exact', head: true }),
      ]);
      setLessonCount(lessons || 0);
      setVocabCount(vocab || 0);
      setStatsLoading(false);
    })();
  }, [sessions]);

  const readySessions = sessions.filter(s => s.status === 'ready');
  const recentSessions = readySessions.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatLevel = () => {
    if (lessonCount === 0) return 'Beginner';
    if (lessonCount < 10) return 'Beginner';
    if (lessonCount < 30) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="animate-fade-in-up">
        <p className="text-cream-muted text-sm mb-1">{getGreeting()}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-cream mb-1">
          Welcome back to <span className="text-gradient-lavender">BingeLingo</span>
        </h1>
        <p className="text-cream-muted text-sm">Binge your show. Keep the language.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          icon={Sparkles}
          label="Your Level"
          value={statsLoading ? '...' : formatLevel()}
          accent="lavender"
        />
        <StatCard
          icon={Clock}
          label="Sessions"
          value={statsLoading ? '...' : String(readySessions.length)}
          accent="rose"
        />
        <StatCard
          icon={BookOpen}
          label="Lessons"
          value={statsLoading ? '...' : String(lessonCount)}
          accent="lavender"
        />
        <StatCard
          icon={TrendingUp}
          label="Saved Words"
          value={statsLoading ? '...' : String(vocabCount)}
          accent="rose"
        />
      </div>

      <div
        className="mt-6 bg-gradient-to-br from-charcoal-800 to-charcoal-850 rounded-2xl border border-charcoal-700/50 p-6 card-glow animate-fade-in-up cursor-pointer group transition-all duration-300 hover:border-lavender/30"
        style={{ animationDelay: '0.2s' }}
        onClick={() => navigate('capture')}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender/20 to-rose/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Camera className="w-7 h-7 text-lavender" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-cream">Import or capture an episode</h2>
            <p className="text-sm text-cream-muted mt-0.5">
              Load Korean subtitles to generate your next lesson
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-cream-muted group-hover:text-lavender group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-cream">Recent Episodes</h2>
          {readySessions.length > 0 && (
            <button
              onClick={() => navigate('library')}
              className="text-sm text-lavender hover:text-lavender-bright transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 animate-pulse">
                <div className="h-4 bg-charcoal-700 rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-charcoal-700 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-charcoal-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : recentSessions.length === 0 ? (
          <EmptyState onAction={() => navigate('capture')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSessions.map(s => (
              <SessionCard key={s.id} session={s} onClick={() => navigate('lesson', s.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  accent: 'lavender' | 'rose';
}) {
  const accentColor = accent === 'lavender' ? 'text-lavender' : 'text-rose';
  const bgColor = accent === 'lavender' ? 'bg-lavender/10' : 'bg-rose/10';

  return (
    <div className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-4 card-glow">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-[18px] h-[18px] ${accentColor}`} strokeWidth={2} />
      </div>
      <p className="text-2xl font-bold text-cream leading-none">{value}</p>
      <p className="text-xs text-cream-muted mt-1.5">{label}</p>
    </div>
  );
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className="text-left bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 card-glow card-glow-hover transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cream-muted" />
          <span className="text-xs text-cream-muted">{date}</span>
        </div>
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
      <h3 className="font-semibold text-cream text-sm leading-snug mb-2 line-clamp-2 group-hover:text-lavender transition-colors">
        {session.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-cream-muted">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {session.lesson_count} lessons
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          Quiz
        </span>
        <span className="flex items-center gap-1">
          <EyeOff className="w-3.5 h-3.5" />
          Flashcards
        </span>
      </div>
    </button>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="bg-charcoal-800/50 rounded-xl border border-dashed border-charcoal-700 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-charcoal-700/50 flex items-center justify-center mx-auto mb-4">
        <Film className="w-7 h-7 text-cream-muted" />
      </div>
      <h3 className="text-cream font-medium mb-1">No episodes yet</h3>
      <p className="text-sm text-cream-muted mb-4">
        Import your first K-drama episode to start learning Korean
      </p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-lavender/15 text-lavender border border-lavender/20 text-sm font-medium hover:bg-lavender/25 transition-colors"
      >
        <Camera className="w-4 h-4" />
        Import an episode
      </button>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-rose/10 rounded-xl border border-rose/20 p-5 text-center">
      <p className="text-sm text-rose">{message}</p>
    </div>
  );
}
