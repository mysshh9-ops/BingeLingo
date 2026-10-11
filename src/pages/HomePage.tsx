import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useSessions } from '@/lib/hooks';
import type { Session } from '@/types';
import { Sparkles, Clock, BookOpen, TrendingUp, Camera, ChevronRight, Film, Flame, Star, Play, Heart } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

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
  const featuredSession = readySessions[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getKoreanGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '좋은 오후예요!';
    return '좋은 저녁이에요!';
  };

  const formatLevel = () => {
    if (lessonCount === 0) return 'Newbie';
    if (lessonCount < 10) return 'Beginner';
    if (lessonCount < 30) return 'Intermediate';
    return 'Advanced';
  };

  const xpTotal = lessonCount * 10 + vocabCount * 5;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Hero greeting */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
        <div className="hidden sm:block animate-float">
          <Mascot size={80} expression="happy" />
        </div>
        <div className="flex-1">
          <p className="text-ink-light text-sm mb-1 font-semibold">{getGreeting()}!</p>
          <h1 className="text-2xl md:text-4xl font-bold font-display text-grape-800 leading-tight">
            {getKoreanGreeting()}
          </h1>
          <p className="text-ink-soft text-sm mt-1 font-medium">Ready to binge-learn some Korean? <span className="inline-block animate-wiggle">🎬</span></p>
        </div>
      </div>

      {/* Quest stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Your Level"
          value={statsLoading ? '...' : formatLevel()}
          gradient="from-bubble-300 to-bubble-400"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Total XP"
          value={statsLoading ? '...' : String(xpTotal)}
          gradient="from-peach-300 to-peach-400"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Lessons"
          value={statsLoading ? '...' : String(lessonCount)}
          gradient="from-lav-300 to-lav-400"
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Saved Words"
          value={statsLoading ? '...' : String(vocabCount)}
          gradient="from-sky-300 to-sky-400"
        />
      </div>

      {/* Daily Quest card */}
      <div
        className="mt-4 bg-gradient-to-r from-bubble-100 via-lav-50 to-sky-50 rounded-3xl border-2 border-bubble-200 p-5 card-shadow animate-fade-in-up cursor-pointer group card-shadow-hover"
        style={{ animationDelay: '0.15s' }}
        onClick={() => navigate('capture')}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-blob bg-gradient-to-br from-bubble-300 to-peach-300 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 sticker-shadow">
            <Camera className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Star className="w-4 h-4 text-butter-400 fill-butter-400" />
              <h2 className="text-base font-bold font-display text-grape-800">Daily Quest</h2>
            </div>
            <p className="text-sm text-ink-soft font-medium">
              Capture a new K-drama episode to earn <span className="text-bubble-600 font-bold">+50 XP</span>
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-bubble-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Featured drama + continue learning */}
      {featuredSession && (
        <div
          className="mt-4 bg-gradient-to-br from-grape-700 to-grape-800 rounded-3xl p-6 card-shadow animate-fade-in-up cursor-pointer group card-shadow-hover relative overflow-hidden"
          style={{ animationDelay: '0.2s' }}
          onClick={() => navigate('lesson', featuredSession.id)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-bubble-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-lav-300/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bubble-300 to-peach-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 sticker-shadow">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
            <div className="flex-1">
              <p className="text-butter-300 text-xs font-bold uppercase tracking-wider mb-1">Continue Learning</p>
              <h2 className="text-lg font-bold font-display text-white leading-snug">{featuredSession.title}</h2>
              <p className="text-lav-200 text-sm mt-1">{featuredSession.lesson_count} lessons ready</p>
            </div>
            <ChevronRight className="w-6 h-6 text-lav-200 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Recent episodes */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display text-grape-800 flex items-center gap-2">
            <Film className="w-5 h-5 text-bubble-400" />
            Recent Episodes
          </h2>
          {readySessions.length > 0 && (
            <button
              onClick={() => navigate('library')}
              className="text-sm font-bold text-bubble-500 hover:text-bubble-600 transition-colors"
            >
              View all →
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/60 rounded-2xl border-2 border-lav-100 p-5 animate-pulse">
                <div className="h-4 bg-lav-100 rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-lav-100 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-lav-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : recentSessions.length === 0 ? (
          <EmptyState onAction={() => navigate('capture')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSessions.map((s, idx) => (
              <SessionCard key={s.id} session={s} index={idx} onClick={() => navigate('lesson', s.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="bg-white/70 rounded-2xl border-2 border-lav-100 p-4 card-shadow card-shadow-hover">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 text-white sticker-shadow`}>
        {icon}
      </div>
      <p className="text-xl md:text-2xl font-bold font-display text-grape-800 leading-none">{value}</p>
      <p className="text-xs text-ink-light mt-1.5 font-semibold">{label}</p>
    </div>
  );
}

function SessionCard({ session, index, onClick }: { session: Session; index: number; onClick: () => void }) {
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const colors = [
    'from-bubble-100 to-bubble-50',
    'from-lav-100 to-lav-50',
    'from-sky-100 to-sky-50',
    'from-peach-100 to-peach-50',
  ];
  const colorClass = colors[index % colors.length];

  return (
    <button
      onClick={onClick}
      className={`text-left bg-gradient-to-br ${colorClass} rounded-2xl border-2 border-white p-5 card-shadow card-shadow-hover transition-all duration-200 group animate-pop`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-light font-semibold">{date}</span>
        </div>
        <StatusSticker isDemo={session.is_demo} />
      </div>
      <h3 className="font-bold font-display text-grape-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-bubble-600 transition-colors">
        {session.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-ink-soft font-semibold">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {session.lesson_count} lessons
        </span>
      </div>
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

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="bg-white/50 rounded-3xl border-2 border-dashed border-lav-200 p-10 text-center">
      <div className="flex justify-center mb-4">
        <Mascot size={70} expression="thinking" />
      </div>
      <h3 className="text-grape-800 font-bold font-display text-lg mb-1">No episodes yet!</h3>
      <p className="text-sm text-ink-soft mb-5 font-medium">
        Import your first K-drama episode to start your Korean adventure
      </p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-bubble-400 to-bubble-500 text-white font-bold text-sm hover:from-bubble-500 hover:to-bubble-600 transition-all sticker-shadow hover:scale-105 active:scale-95"
      >
        <Camera className="w-4 h-4" />
        Start your first quest!
      </button>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-bubble-50 rounded-2xl border-2 border-bubble-200 p-5 text-center">
      <p className="text-sm text-bubble-700 font-medium">{message}</p>
    </div>
  );
}
