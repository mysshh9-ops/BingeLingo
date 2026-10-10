import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useProgressStats } from '@/lib/hooks';
import type { Session } from '@/types';
import {
  TrendingUp, BookOpen, Layers, HelpCircle, Award, Target,
  Clock, Sparkles, ArrowRight, AlertCircle, BarChart3,
} from 'lucide-react';

interface SessionWithQuiz {
  session: Session;
  quizResults: { score: number; total_questions: number; created_at: string }[];
  lessonCount: number;
  vocabCount: number;
}

export function ProgressPage() {
  const { navigate } = useRouter();
  const stats = useProgressStats();
  const [sessionDetails, setSessionDetails] = useState<SessionWithQuiz[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (!sessions || sessions.length === 0) {
        setDetailsLoading(false);
        return;
      }

      const details: SessionWithQuiz[] = [];
      for (const s of sessions) {
        const [{ data: lessons }, { data: vocab }, { data: quizzes }] = await Promise.all([
          supabase.from('lessons').select('id').eq('session_id', s.id),
          supabase.from('vocabulary').select('id').eq('session_id', s.id),
          supabase.from('quiz_results').select('score, total_questions, created_at').eq('session_id', s.id).order('created_at', { ascending: false }),
        ]);
        details.push({
          session: s as Session,
          quizResults: (quizzes || []).map(q => ({ score: q.score, total_questions: q.total_questions, created_at: q.created_at })),
          lessonCount: lessons?.length || 0,
          vocabCount: vocab?.length || 0,
        });
      }
      setSessionDetails(details);
      setDetailsLoading(false);
    })();
  }, [stats.totalSessions]);

  const accuracy = stats.totalQuizQuestions > 0
    ? Math.round((stats.totalQuizScore / stats.totalQuizQuestions) * 100)
    : 0;
  const knownPercent = stats.totalVocabulary > 0
    ? Math.round((stats.knownVocabulary / stats.totalVocabulary) * 100)
    : 0;

  if (stats.loading || detailsLoading) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="animate-pulse">
          <div className="h-7 bg-charcoal-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-charcoal-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-4 h-28"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="bg-rose/10 rounded-xl border border-rose/20 p-5 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose" />
          <p className="text-sm text-rose">{stats.error}</p>
        </div>
      </div>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-cream mb-1 animate-fade-in-up">Progress</h1>
        <p className="text-cream-muted text-sm mb-8 animate-fade-in-up">Track your Korean learning journey</p>
        <div className="bg-charcoal-800/50 rounded-xl border border-dashed border-charcoal-700 p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-charcoal-700/50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-cream-muted" />
          </div>
          <h3 className="text-cream font-medium mb-1">No progress data yet</h3>
          <p className="text-sm text-cream-muted mb-5">
            Import your first episode to start tracking your learning
          </p>
          <button
            onClick={() => navigate('capture')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-lavender/15 text-lavender border border-lavender/20 text-sm font-medium hover:bg-lavender/25 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Import an episode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-cream mb-1">Progress</h1>
        <p className="text-cream-muted text-sm">Your Korean learning stats, calculated from real data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard icon={Clock} label="Sessions" value={String(stats.totalSessions)} accent="lavender" />
        <StatCard icon={BookOpen} label="Total Lessons" value={String(stats.totalLessons)} accent="rose" />
        <StatCard icon={Layers} label="Vocabulary" value={String(stats.totalVocabulary)} accent="lavender" />
        <StatCard icon={Target} label="Known Words" value={`${stats.knownVocabulary} (${knownPercent}%)`} accent="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <ProgressCard
          icon={Award}
          title="Quiz Accuracy"
          value={accuracy}
          total={100}
          suffix="%"
          description={`${stats.totalQuizScore} correct out of ${stats.totalQuizQuestions} questions`}
          accent="lavender"
        />
        <ProgressCard
          icon={TrendingUp}
          title="Vocabulary Mastery"
          value={stats.knownVocabulary}
          total={stats.totalVocabulary}
          suffix=""
          description={`${knownPercent}% of all saved words marked as known`}
          accent="rose"
        />
      </div>

      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-semibold text-cream mb-4">Per-Episode Breakdown</h2>
        <div className="space-y-3">
          {sessionDetails.map((detail, idx) => {
            const bestScore = detail.quizResults.length > 0
              ? Math.max(...detail.quizResults.map(q => Math.round((q.score / q.total_questions) * 100)))
              : null;
            const knownVocab = detail.session;

            return (
              <button
                key={detail.session.id}
                onClick={() => navigate('lesson', detail.session.id)}
                className="w-full text-left bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 card-glow card-glow-hover transition-all duration-200 group animate-fade-in-up flex items-center gap-4"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {detail.session.is_demo ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender/15 text-lavender border border-lavender/20 font-medium">DEMO</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose/15 text-rose border border-rose/20 font-medium">CAPTURED</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-cream text-sm leading-snug group-hover:text-lavender transition-colors line-clamp-1 mb-2">
                    {detail.session.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-cream-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {detail.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {detail.vocabCount} words
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {detail.quizResults.length} {detail.quizResults.length === 1 ? 'quiz' : 'quizzes'}
                    </span>
                  </div>
                </div>
                {bestScore !== null && (
                  <div className="flex-shrink-0 text-center">
                    <div className={`text-2xl font-bold ${bestScore >= 70 ? 'text-lavender' : 'text-rose'}`}>
                      {bestScore}%
                    </div>
                    <div className="text-[10px] text-cream-muted uppercase tracking-wider">Best</div>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-cream-muted group-hover:text-lavender group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: typeof TrendingUp;
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
      <p className="text-xl md:text-2xl font-bold text-cream leading-none">{value}</p>
      <p className="text-xs text-cream-muted mt-1.5">{label}</p>
    </div>
  );
}

function ProgressCard({ icon: Icon, title, value, total, suffix, description, accent }: {
  icon: typeof Award;
  title: string;
  value: number;
  total: number;
  suffix: string;
  description: string;
  accent: 'lavender' | 'rose';
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const barColor = accent === 'lavender' ? 'from-lavender to-lavender-bright' : 'from-rose to-rose-bright';
  const iconColor = accent === 'lavender' ? 'text-lavender' : 'text-rose';
  const bgColor = accent === 'lavender' ? 'bg-lavender/10' : 'bg-rose/10';

  return (
    <div className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 card-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-cream text-sm">{title}</h3>
          <p className="text-xs text-cream-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-cream">{value}{suffix}</span>
        {total > 0 && total !== 100 && (
          <span className="text-sm text-cream-muted">/ {total}{suffix}</span>
        )}
      </div>
      <div className="h-2 bg-charcoal-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
