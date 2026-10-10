import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, Lesson, Vocabulary } from '@/types';
import { generateDemoLessons } from '@/data/demoLessons';
import type { SubtitleLine } from '@/types';

export type SessionStatus = 'pending' | 'processing' | 'ready' | 'error';

export async function createSession(
  title: string,
  sourceUrl: string | null,
  isDemo: boolean,
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      title,
      source_url: sourceUrl,
      is_demo: isDemo,
      status: 'processing',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Session;
}

export async function saveDemoLessons(
  sessionId: string,
  subtitles: SubtitleLine[],
): Promise<{ lessons: Lesson[]; vocabulary: Vocabulary[] }> {
  const parsed = generateDemoLessons(subtitles);

  const lessonRows = parsed.map((p) => ({
    session_id: sessionId,
    hangul: p.lesson.hangul,
    romanization: p.lesson.romanization,
    translation: p.lesson.translation,
    timestamp_start: p.lesson.timestamp_start,
    timestamp_end: p.lesson.timestamp_end,
    politeness: p.lesson.politeness,
    grammar_note: p.lesson.grammar_note,
    order_index: p.lesson.order_index,
  }));

  const { data: savedLessons, error: lessonError } = await supabase
    .from('lessons')
    .insert(lessonRows)
    .select();

  if (lessonError) throw lessonError;

  const vocabToInsert = savedLessons.flatMap((lesson, idx) =>
    parsed[idx].vocabulary.map((v) => ({
      lesson_id: lesson.id,
      session_id: sessionId,
      word_hangul: v.word_hangul,
      word_romanization: v.word_romanization,
      word_translation: v.word_translation,
      part_of_speech: v.part_of_speech,
      is_known: v.is_known,
      is_saved: v.is_saved,
    }))
  );

  const { data: savedVocab, error: vocabError } = await supabase
    .from('vocabulary')
    .insert(vocabToInsert)
    .select();

  if (vocabError) throw vocabError;

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ status: 'ready', lesson_count: savedLessons.length })
    .eq('id', sessionId);

  if (updateError) throw updateError;

  return {
    lessons: savedLessons as Lesson[],
    vocabulary: savedVocab as Vocabulary[],
  };
}

export async function generateAILessons(
  sessionId: string,
  subtitles: SubtitleLine[],
  title: string,
): Promise<void> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lessons`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, subtitles, title }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    const message = errorBody.error || `Request failed (${response.status})`;
    await supabase
      .from('sessions')
      .update({ status: 'error', error_message: message })
      .eq('id', sessionId);
    throw new Error(message);
  }

  const result = await response.json();
  if (!result.success) {
    const message = result.error || 'Lesson generation failed';
    await supabase
      .from('sessions')
      .update({ status: 'error', error_message: message })
      .eq('id', sessionId);
    throw new Error(message);
  }
}

export function useLoadingState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { loading, setLoading, error, setError };
}
