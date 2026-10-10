import { useRouter } from '@/lib/router';
import { useSession, useLessons } from '@/lib/hooks';
import { useState } from 'react';
import {
  ArrowLeft, Clock, BookOpen, GraduationCap, HelpCircle, Layers,
  AlertCircle, ChevronDown, ChevronUp, Volume2, Tag,
} from 'lucide-react';
import type { Lesson } from '@/types';

export function LessonPage({ sessionId }: { sessionId: string }) {
  const { navigate } = useRouter();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { lessons, loading: lessonsLoading, error } = useLessons(sessionId);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  if (sessionLoading || lessonsLoading) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-charcoal-700 rounded w-24 mb-4"></div>
          <div className="h-7 bg-charcoal-700 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-charcoal-700 rounded w-1/3 mb-8"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-5 mb-3">
              <div className="h-5 bg-charcoal-700 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-charcoal-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-charcoal-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="bg-rose/10 rounded-xl border border-rose/20 p-5 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose" />
          <p className="text-sm text-rose">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <p className="text-cream-muted">Session not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <button
        onClick={() => navigate('library')}
        className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors mb-4 animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </button>

      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          {session.is_demo ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender/15 text-lavender border border-lavender/20 font-medium">
              DEMO
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose/15 text-rose border border-rose/20 font-medium">
              CAPTURED
            </span>
          )}
          <span className="text-xs text-cream-muted">
            {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-cream mb-1">{session.title}</h1>
        <p className="text-sm text-cream-muted">{lessons.length} lessons from this episode</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => navigate('quiz', sessionId)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lavender/15 text-lavender border border-lavender/20 text-sm font-medium hover:bg-lavender/25 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Take Quiz
        </button>
        <button
          onClick={() => navigate('flashcards', sessionId)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose/15 text-rose border border-rose/20 text-sm font-medium hover:bg-rose/25 transition-colors"
        >
          <Layers className="w-4 h-4" />
          Flashcards
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {lessons.map((lesson, idx) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={idx}
            isExpanded={expandedLesson === lesson.id}
            onToggle={() => setExpandedLesson(
              expandedLesson === lesson.id ? null : lesson.id
            )}
          />
        ))}
      </div>
    </div>
  );
}

function LessonCard({ lesson, index, isExpanded, onToggle }: {
  lesson: Lesson;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 card-glow overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-lavender-dim bg-charcoal-700/50 px-2 py-0.5 rounded">
              {lesson.timestamp_start || '--:--:--'}
            </span>
            {lesson.politeness && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose/10 text-rose border border-rose/15 font-medium">
                {lesson.politeness}
              </span>
            )}
          </div>
          <p className="font-korean text-lg text-cream leading-relaxed mb-1">{lesson.hangul}</p>
          <p className="text-sm text-cream-muted italic">{lesson.romanization}</p>
          <p className="text-sm text-cream-dim mt-1">{lesson.translation}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-cream-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cream-muted" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-charcoal-700/30 pt-4 space-y-4 animate-fade-in">
          {lesson.grammar_note && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-lavender" />
                <h4 className="text-xs font-semibold text-lavender uppercase tracking-wider">Grammar Note</h4>
              </div>
              <p className="text-sm text-cream-dim leading-relaxed pl-6">{lesson.grammar_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
