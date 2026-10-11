import { useRouter } from '@/lib/router';
import { useSession, useLessons } from '@/lib/hooks';
import { useState } from 'react';
import {
  ArrowLeft, BookOpen, GraduationCap, HelpCircle, Layers,
  AlertCircle, ChevronDown, ChevronUp, Tag,
} from 'lucide-react';
import type { Lesson } from '@/types';
import { Mascot } from '@/components/Mascot';

export function LessonPage({ sessionId }: { sessionId: string }) {
  const { navigate } = useRouter();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { lessons, loading: lessonsLoading, error } = useLessons(sessionId);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  if (sessionLoading || lessonsLoading) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-lav-100 rounded w-24"></div>
          <div className="h-7 bg-lav-100 rounded w-2/3"></div>
          <div className="h-3 bg-lav-100 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/60 rounded-2xl border-2 border-lav-100 p-5">
              <div className="h-5 bg-lav-100 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-lav-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-lav-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="bg-bubble-50 rounded-2xl border-2 border-bubble-200 p-5 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-bubble-600" />
          <p className="text-sm text-bubble-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="flex flex-col items-center py-12">
          <Mascot size={70} expression="thinking" />
          <p className="text-ink-soft mt-4 font-medium">Session not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <button
        onClick={() => navigate('library')}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-grape-700 transition-colors mb-4 font-bold animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </button>

      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <StatusSticker isDemo={session.is_demo} />
          <span className="text-xs text-ink-soft font-semibold">
            {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-display text-grape-800 mb-1">{session.title}</h1>
        <p className="text-sm text-ink-soft font-medium">{lessons.length} lessons from this episode 📚</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => navigate('quiz', sessionId)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-lav-300 to-lav-400 text-white font-bold text-sm hover:from-lav-400 hover:to-lav-500 transition-all sticker-shadow hover:scale-105 active:scale-95"
        >
          <HelpCircle className="w-4 h-4" />
          Take Quiz
        </button>
        <button
          onClick={() => navigate('flashcards', sessionId)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-bubble-300 to-bubble-400 text-white font-bold text-sm hover:from-bubble-400 hover:to-bubble-500 transition-all sticker-shadow hover:scale-105 active:scale-95"
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

const cardGradients = [
  'from-bubble-50 to-bubble-100',
  'from-lav-50 to-lav-100',
  'from-sky-50 to-sky-100',
  'from-peach-50 to-peach-100',
  'from-butter-50 to-butter-100',
];

function LessonCard({ lesson, index, isExpanded, onToggle }: {
  lesson: Lesson;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const gradient = cardGradients[index % cardGradients.length];

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl border-2 border-white card-shadow overflow-hidden animate-pop`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-grape-600 bg-white/60 px-2.5 py-1 rounded-chip font-bold">
              {lesson.timestamp_start || '--:--:--'}
            </span>
            {lesson.politeness && (
              <span className="text-[10px] px-2.5 py-1 rounded-chip bg-bubble-200 text-bubble-700 font-bold border border-bubble-300 -rotate-2 sticker-shadow">
                {lesson.politeness}
              </span>
            )}
          </div>
          <p className="font-korean text-lg text-grape-900 leading-relaxed mb-1 font-medium">{lesson.hangul}</p>
          <p className="text-sm text-lav-500 italic font-medium">{lesson.romanization}</p>
          <p className="text-sm text-ink-soft mt-1 font-medium">{lesson.translation}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-grape-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-grape-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/40 pt-4 space-y-4 animate-fade-in">
          {lesson.grammar_note && (
            <div className="bg-white/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-lav-200 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-lav-700" />
                </div>
                <h4 className="text-xs font-bold text-lav-700 uppercase tracking-wider">Grammar Tip</h4>
              </div>
              <p className="text-sm text-ink leading-relaxed pl-9 font-medium">{lesson.grammar_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
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
