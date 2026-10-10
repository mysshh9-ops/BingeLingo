import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useSessionVocabulary, toggleVocabKnown } from '@/lib/hooks';
import type { Vocabulary } from '@/types';
import {
  ArrowLeft, Layers, RotateCcw, Check, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, BookOpen,
} from 'lucide-react';

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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-lavender animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <div className="bg-rose/10 rounded-xl border border-rose/20 p-5 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose" />
          <p className="text-sm text-rose">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredVocab.length === 0) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto pb-24 md:pb-8">
        <button
          onClick={() => navigate('lesson', sessionId)}
          className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to lesson
        </button>
        <div className="bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-8 text-center">
          <Layers className="w-10 h-10 text-cream-muted mx-auto mb-3" />
          <h2 className="text-cream font-medium mb-1">No flashcards yet</h2>
          <p className="text-sm text-cream-muted">This episode has no vocabulary to review.</p>
        </div>
      </div>
    );
  }

  const current = filteredVocab[currentIdx];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <button
        onClick={() => navigate('lesson', sessionId)}
        className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors mb-4 animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lesson
      </button>

      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-xl font-bold text-cream flex items-center gap-2">
          <Layers className="w-5 h-5 text-lavender" />
          Flashcards
        </h1>
        <span className="text-sm text-cream-muted">
          {currentIdx + 1} / {filteredVocab.length}
        </span>
      </div>

      <div className="h-1.5 bg-charcoal-800 rounded-full overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div
          className="h-full bg-gradient-to-r from-lavender to-rose transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / filteredVocab.length) * 100}%` }}
        />
      </div>

      <div key={currentIdx} className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div
          className="perspective-1000 cursor-pointer mb-6"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full min-h-[280px] transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front — Korean */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-charcoal-800 to-charcoal-850 rounded-2xl border border-charcoal-700/50 p-8 flex flex-col items-center justify-center card-glow">
              <div className="absolute top-4 left-5 text-xs text-cream-muted uppercase tracking-wider font-medium">
                Korean
              </div>
              <p className="font-korean text-4xl md:text-5xl text-cream text-center leading-relaxed mb-4">
                {current.word_hangul}
              </p>
              <p className="text-sm text-lavender-dim italic">{current.word_romanization}</p>
              <p className="text-xs text-cream-muted mt-6">Tap to reveal translation</p>
            </div>

            {/* Back — English */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-charcoal-700 to-charcoal-800 rounded-2xl border border-lavender/20 p-8 flex flex-col items-center justify-center card-glow">
              <div className="absolute top-4 left-5 text-xs text-lavender uppercase tracking-wider font-medium">
                English
              </div>
              <p className="text-2xl md:text-3xl text-cream text-center font-semibold mb-3">
                {current.word_translation}
              </p>
              {current.part_of_speech && (
                <span className="text-xs px-3 py-1 rounded-full bg-rose/10 text-rose border border-rose/15 font-medium mt-2">
                  {current.part_of_speech}
                </span>
              )}
              <p className="text-xs text-cream-muted mt-6">Tap to flip back</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-xl bg-charcoal-800 border border-charcoal-700/50 flex items-center justify-center text-cream-muted hover:text-cream hover:border-lavender/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <button
              onClick={() => handleMarkUnknown(current)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose/10 border border-rose/20 text-rose font-medium text-sm hover:bg-rose/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Don't know
            </button>
            <button
              onClick={() => handleMarkKnown(current)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                current.is_known
                  ? 'bg-lavender/20 border border-lavender/30 text-lavender'
                  : 'bg-lavender/10 border border-lavender/20 text-lavender hover:bg-lavender/20'
              }`}
            >
              <Check className="w-4 h-4" />
              {current.is_known ? 'Known' : 'I know this'}
            </button>
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-xl bg-charcoal-800 border border-charcoal-700/50 flex items-center justify-center text-cream-muted hover:text-cream hover:border-lavender/30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-cream-muted">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-lavender" />
            {filteredVocab.filter(v => v.is_known).length} known
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-rose" />
            {filteredVocab.filter(v => !v.is_known).length} learning
          </span>
        </div>
      </div>
    </div>
  );
}
