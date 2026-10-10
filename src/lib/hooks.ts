import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, Lesson, Vocabulary } from '@/types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setSessions(data as Session[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  return { sessions, loading, error, reload: load };
}

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      if (error) setError(error.message);
      else setSession(data as Session);
      setLoading(false);
    })();
  }, [sessionId]);

  return { session, loading, error };
}

export function useLessons(sessionId: string | null) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true });
      if (error) setError(error.message);
      else setLessons(data as Lesson[]);
      setLoading(false);
    })();
  }, [sessionId]);

  return { lessons, loading, error };
}

export function useAllVocabulary() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setVocabulary(data as Vocabulary[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  return { vocabulary, loading, error, reload: load };
}

export function useSessionVocabulary(sessionId: string | null) {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reload = () => setReloadTrigger(prev => prev + 1);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) setError(error.message);
      else setVocabulary(data as Vocabulary[]);
      setLoading(false);
    })();
  }, [sessionId, reloadTrigger]);

  return { vocabulary, loading, error, reload };
}

export async function toggleVocabKnown(vocabId: string, isKnown: boolean) {
  const { error } = await supabase
    .from('vocabulary')
    .update({ is_known: !isKnown })
    .eq('id', vocabId);
  return !error;
}

export async function saveQuizResult(sessionId: string, score: number, totalQuestions: number) {
  const { error } = await supabase
    .from('quiz_results')
    .insert({ session_id: sessionId, score, total_questions: totalQuestions });
  return !error;
}

export function useProgressStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalLessons: 0,
    totalVocabulary: 0,
    knownVocabulary: 0,
    totalQuizScore: 0,
    totalQuizQuestions: 0,
    quizCount: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: sessions }, { data: lessons }, { data: vocab }, { data: quizzes }] = await Promise.all([
          supabase.from('sessions').select('id, lesson_count, status').eq('status', 'ready'),
          supabase.from('lessons').select('id'),
          supabase.from('vocabulary').select('id, is_known'),
          supabase.from('quiz_results').select('score, total_questions'),
        ]);

        const totalQuizScore = (quizzes || []).reduce((sum, q: any) => sum + q.score, 0);
        const totalQuizQuestions = (quizzes || []).reduce((sum, q: any) => sum + q.total_questions, 0);

        setStats({
          totalSessions: sessions?.length || 0,
          totalLessons: lessons?.length || 0,
          totalVocabulary: vocab?.length || 0,
          knownVocabulary: vocab?.filter((v: any) => v.is_known).length || 0,
          totalQuizScore,
          totalQuizQuestions,
          quizCount: quizzes?.length || 0,
          loading: false,
          error: null,
        });
      } catch (e: any) {
        setStats(prev => ({ ...prev, loading: false, error: e.message }));
      }
    })();
  }, []);

  return stats;
}
