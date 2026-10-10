import { useState, useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { useSession, useLessons } from '@/lib/hooks';
import { saveQuizResult } from '@/lib/hooks';
import type { Lesson } from '@/types';
import {
  ArrowLeft, HelpCircle, CheckCircle2, XCircle, RotateCcw,
  Trophy, Loader2, AlertCircle,
} from 'lucide-react';

interface QuizQuestion {
  lesson: Lesson;
  type: 'translation' | 'romanization' | 'meaning';
  question: string;
  questionHangul: string;
  options: string[];
  correctAnswer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuiz(lessons: Lesson[]): QuizQuestion[] {
  const validLessons = lessons.filter(l => l.hangul.trim() && l.translation.trim() && l.romanization.trim());
  if (validLessons.length < 2) return [];

  const questions: QuizQuestion[] = [];
  const types: QuizQuestion['type'][] = ['translation', 'romanization', 'meaning'];

  validLessons.forEach((lesson, idx) => {
    const type = types[idx % types.length];
    const otherLessons = validLessons.filter(l => l.id !== lesson.id);
    const distractors = shuffleArray(otherLessons).slice(0, 3);

    if (type === 'translation') {
      const rawOptions = [lesson.translation, ...distractors.map(d => d.translation)];
      const options = shuffleArray([...new Set(rawOptions)]);
      questions.push({
        lesson,
        type: 'translation',
        question: 'What does this Korean sentence mean in English?',
        questionHangul: lesson.hangul,
        options,
        correctAnswer: lesson.translation,
      });
    } else if (type === 'romanization') {
      const rawOptions = [lesson.romanization, ...distractors.map(d => d.romanization)];
      const options = shuffleArray([...new Set(rawOptions)]);
      questions.push({
        lesson,
        type: 'romanization',
        question: 'Which romanization matches this Korean text?',
        questionHangul: lesson.hangul,
        options,
        correctAnswer: lesson.romanization,
      });
    } else {
      const rawOptions = [lesson.hangul, ...distractors.map(d => d.hangul)];
      const options = shuffleArray([...new Set(rawOptions)]);
      questions.push({
        lesson,
        type: 'meaning',
        question: 'Which Korean sentence matches this English translation?',
        questionHangul: lesson.translation,
        options,
        correctAnswer: lesson.hangul,
      });
    }
  });

  return questions;
}

type QuizState = 'answering' | 'result';

export function QuizPage({ sessionId }: { sessionId: string }) {
  const { navigate } = useRouter();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { lessons, loading: lessonsLoading, error } = useLessons(sessionId);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [saving, setSaving] = useState(false);

  const questions = useMemo(() => buildQuiz(lessons), [lessons]);

  const handleSelect = (option: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === questions[currentIdx].correctAnswer;
    const newAnswers = [...answers, isCorrect];
    const newSelectedAnswers = [...selectedAnswers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswers(newSelectedAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    } else {
      setSaving(true);
      const score = newAnswers.filter(a => a).length;
      await saveQuizResult(sessionId, score, questions.length);
      setSaving(false);
      setQuizState('result');
    }
  };

  const handleRetry = () => {
    setQuizState('answering');
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setAnswers([]);
  };

  if (sessionLoading || lessonsLoading) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-lavender animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <div className="bg-rose/10 rounded-xl border border-rose/20 p-5 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose" />
          <p className="text-sm text-rose">{error}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <button
          onClick={() => navigate('lesson', sessionId)}
          className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to lesson
        </button>
        <div className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-8 text-center">
          <HelpCircle className="w-10 h-10 text-cream-muted mx-auto mb-3" />
          <h2 className="text-cream font-medium mb-1">Not enough lessons for a quiz</h2>
          <p className="text-sm text-cream-muted">You need at least 2 lessons to take a quiz.</p>
        </div>
      </div>
    );
  }

  if (quizState === 'result') {
    const score = answers.filter(a => a).length;
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-850 rounded-2xl border border-charcoal-700/50 p-8 text-center card-glow animate-fade-in-up">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            passed ? 'bg-lavender/15' : 'bg-rose/15'
          }`}>
            <Trophy className={`w-10 h-10 ${passed ? 'text-lavender' : 'text-rose'}`} />
          </div>
          <h1 className="text-2xl font-bold text-cream mb-2">Quiz Complete!</h1>
          <p className="text-cream-muted text-sm mb-6">
            {session?.title}
          </p>

          <div className="inline-flex items-center gap-4 bg-charcoal-850 rounded-xl border border-charcoal-700/50 px-8 py-4 mb-6">
            <div>
              <p className="text-3xl font-bold text-cream">{score}</p>
              <p className="text-xs text-cream-muted">Correct</p>
            </div>
            <div className="w-px h-10 bg-charcoal-700"></div>
            <div>
              <p className="text-3xl font-bold text-cream">{questions.length}</p>
              <p className="text-xs text-cream-muted">Total</p>
            </div>
            <div className="w-px h-10 bg-charcoal-700"></div>
            <div>
              <p className={`text-3xl font-bold ${passed ? 'text-lavender' : 'text-rose'}`}>{percentage}%</p>
              <p className="text-xs text-cream-muted">Score</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lavender text-charcoal-900 font-semibold text-sm hover:bg-lavender-bright transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
            <button
              onClick={() => navigate('lesson', sessionId)}
              className="px-4 py-2.5 rounded-lg border border-charcoal-600 text-cream-muted text-sm font-medium hover:text-cream transition-colors"
            >
              Back to lesson
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-cream mb-3">Review your answers</h3>
          {questions.map((q, i) => (
            <div
              key={i}
              className={`bg-charcoal-800 rounded-lg border p-4 flex items-start gap-3 animate-fade-in-up ${
                answers[i] ? 'border-lavender/20' : 'border-rose/20'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {answers[i] ? (
                <CheckCircle2 className="w-5 h-5 text-lavender flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-korean text-sm text-cream mb-1">{q.questionHangul}</p>
                <p className="text-xs text-cream-muted">
                  Correct: <span className="text-lavender-dim">{q.correctAnswer}</span>
                </p>
                {!answers[i] && (
                  <p className="text-xs text-rose-dim mt-0.5">
                    Your answer: {selectedAnswers[i] || '—'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const question = questions[currentIdx];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === question.correctAnswer;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto pb-24 md:pb-8">
      <button
        onClick={() => navigate('lesson', sessionId)}
        className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors mb-4 animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lesson
      </button>

      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-xl font-bold text-cream flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-lavender" />
          Quiz
        </h1>
        <span className="text-sm text-cream-muted">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      <div className="h-1.5 bg-charcoal-800 rounded-full overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div
          className="h-full bg-gradient-to-r from-lavender to-rose transition-all duration-300"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div key={currentIdx} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700/50 p-6 card-glow mb-4">
          <p className="text-sm text-cream-muted mb-3">{question.question}</p>
          <p className="font-korean text-2xl text-cream text-center py-4 leading-relaxed">
            {question.questionHangul}
          </p>
        </div>

        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;
            let className = 'bg-charcoal-800 border-charcoal-700/50 hover:border-charcoal-600 text-cream-dim';

            if (isAnswered) {
              if (isCorrectOption) {
                className = 'bg-lavender/10 border-lavender/30 text-cream';
              } else if (isSelected) {
                className = 'bg-rose/10 border-rose/30 text-cream';
              } else {
                className = 'bg-charcoal-800 border-charcoal-700/30 text-cream-muted';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm ${className} ${
                  !isAnswered ? 'hover:scale-[1.01]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={question.type === 'meaning' ? 'font-korean' : ''}>{option}</span>
                  {isAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-lavender flex-shrink-0" />}
                  {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`mt-4 p-4 rounded-xl border animate-fade-in ${
            isCorrect ? 'bg-lavender/5 border-lavender/20' : 'bg-rose/5 border-rose/20'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-lavender" />
              ) : (
                <XCircle className="w-5 h-5 text-rose" />
              )}
              <p className={`text-sm font-medium ${isCorrect ? 'text-lavender' : 'text-rose'}`}>
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </p>
            </div>
            {!isCorrect && (
              <p className="text-xs text-cream-muted ml-7">
                The correct answer is: <span className="text-lavender-dim">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!isAnswered || saving}
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lavender text-charcoal-900 font-semibold text-sm hover:bg-lavender-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : currentIdx + 1 < questions.length ? (
            'Next Question'
          ) : (
            'See Results'
          )}
        </button>
      </div>
    </div>
  );
}
