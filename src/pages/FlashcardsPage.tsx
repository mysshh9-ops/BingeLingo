import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/lib/router';
import { useSessionVocabulary, toggleVocabKnown } from '@/lib/hooks';
import type { Vocabulary } from '@/types';
import {
  ArrowLeft, Layers, RotateCcw, Check, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, BookOpen, Sparkles,
} from 'lucide-react';
import { Mascot } from '@/components/Mascot';

const cardThemes = [
  { front: 'from-bubble-300 to-bubble-400', back: 'from-bubble-200 to-bubble-300', accent: 'text-bubble-700' },
  { front: 'from-lav-300 to-lav-400', back: 'from-lav-200 to-lav-300', accent: 'text-lav-700' },
  { front: 'from-sky-300 to-sky-400', back: 'from-sky-200 to-sky-300', accent: 'text-sky-700' },
  { front: 'from-peach-300 to-peach-400', back: 'from-peach-200 to-peach-300', accent: 'text-peach-700' },
  { front: 'from-butter-300 to-butter-400', back: 'from-butter-200 to-butter-300', accent: 'text-butter-700' },
];

export function FlashcardsPage({ sessionId }: { sessionId: string }) {
  const { navigate } = useRouter();
  const { vocabulary, loading, error, reload } = useSessionVocabulary(sessionId);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const filteredVocab = vocabulary;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setDirection('next');
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setDirection('prev');
    setTimeout(() => {
      setCurrentIdx(prev => (prev - 1 + filteredVocab.length) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length]);

  const handleMarkKnown = async (vocab: Vocabulary) => {
    if (!vocab.is_known) {
      await toggleVocabKnown(vocab.id, false);
      reload();
    }
    handleNext();
  };

  const handleMarkUnknown = async (vocab: Vocabulary) => {
    if (vocab.is_known) {
      await toggleVocabKnown(vocab.id, true);
      reload();
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Mascot size={70} expression="thinking" className="animate-float" />
          <Loader2 className="w-6 h-6 text-lav-500 animate-spin mt-4" />
          <p className="text-sm text-ink-soft mt-3 font-medium">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <div className="bg-bubble-50 rounded-2xl border-2 border-bubble-200 p-5 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-bubble-600" />
          <p className="text-sm text-bubble-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredVocab.length === 0) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <button
          onClick={() => navigate('lesson', sessionId)}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-grape-700 transition-colors mb-4 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to lesson
        </button>
        <div className="bg-white/60 rounded-3xl border-2 border-dashed border-lav-200 p-8 text-center">
          <div className="flex justify-center mb-3">
            <Mascot size={70} expression="thinking" />
          </div>
          <h2 className="text-grape-800 font-bold font-display text-lg mb-1">No flashcards yet!</h2>
          <p className="text-sm text-ink-soft font-medium">This episode has no vocabulary to review.</p>
        </div>
      </div>
    );
  }

  const current = filteredVocab[currentIdx];
  const theme = cardThemes[currentIdx % cardThemes.length];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <button
        onClick={() => navigate('lesson', sessionId)}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-grape-700 transition-colors mb-4 font-bold animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lesson
      </button>

      <div className="flex items-center justify-between mb-3 animate-fade-in-up">
        <h1 className="text-xl font-bold font-display text-grape-800 flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          Flashcards
        </h1>
        <span className="text-sm font-bold text-ink-soft bg-white/60 px-3 py-1 rounded-chip">
          {currentIdx + 1} / {filteredVocab.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-lav-100 rounded-full overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div
          className="h-full bg-gradient-to-r from-bubble-400 via-peach-400 to-butter-400 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / filteredVocab.length) * 100}%` }}
        />
      </div>

      <div key={currentIdx} className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Card */}
        <div
          className="perspective-1000 cursor-pointer mb-6"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full min-h-[300px] transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front — Korean */}
            <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${theme.front} rounded-3xl border-4 border-white p-8 flex flex-col items-center justify-center card-shadow`}>
              <div className="absolute top-4 left-5 text-xs text-white/80 uppercase tracking-wider font-bold">
                Korean
              </div>
              <Sparkles className="absolute top-4 right-5 w-5 h-5 text-white/60 animate-sparkle" />
              <p className="font-korean text-4xl md:text-5xl text-white text-center leading-relaxed mb-4 font-bold drop-shadow-lg">
                {current.word_hangul}
              </p>
              <p className="text-sm text-white/80 italic font-medium">{current.word_romanization}</p>
              <p className="text-xs text-white/60 mt-6 font-bold">Tap to flip! 👆</p>
            </div>

            {/* Back — English */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br ${theme.back} rounded-3xl border-4 border-white p-8 flex flex-col items-center justify-center card-shadow`}>
              <div className={`absolute top-4 left-5 text-xs ${theme.accent} uppercase tracking-wider font-bold`}>
                English
              </div>
              <p className="text-2xl md:text-3xl text-grape-900 text-center font-bold font-display mb-3">
                {current.word_translation}
              </p>
              {current.part_of_speech && (
                <span className="text-xs px-3 py-1.5 rounded-chip bg-white/60 text-grape-700 font-bold border border-white mt-2 -rotate-2">
                  {current.part_of_speech}
                </span>
              )}
              <p className="text-xs text-grape-600 mt-6 font-bold">Tap to flip back 👆</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-2xl bg-white/80 border-2 border-lav-100 flex items-center justify-center text-ink-soft hover:text-grape-700 hover:border-lav-300 transition-all sticker-shadow active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <button
              onClick={() => handleMarkUnknown(current)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-bubble-100 border-2 border-bubble-200 text-bubble-700 font-bold text-sm hover:bg-bubble-200 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
              Practice again
            </button>
            <button
              onClick={() => handleMarkKnown(current)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                current.is_known
                  ? 'bg-lav-200 border-2 border-lav-300 text-lav-700'
                  : 'bg-lav-100 border-2 border-lav-200 text-lav-700 hover:bg-lav-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {current.is_known ? 'Known!' : 'Know it!'}
            </button>
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-2xl bg-white/80 border-2 border-lav-100 flex items-center justify-center text-ink-soft hover:text-grape-700 hover:border-lav-300 transition-all sticker-shadow active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-lav-100 text-lav-700">
            <Check className="w-3.5 h-3.5" />
            {filteredVocab.filter(v => v.is_known).length} known
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-bubble-100 text-bubble-700">
            <BookOpen className="w-3.5 h-3.5" />
            {filteredVocab.filter(v => !v.is_known).length} learning
          </span>
        </div>
      </div>
    </div>
  );
}
