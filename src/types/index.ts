export interface Session {
  id: string;
  title: string;
  source_url: string | null;
  is_demo: boolean;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error_message: string | null;
  lesson_count: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  session_id: string;
  hangul: string;
  romanization: string;
  translation: string;
  timestamp_start: string | null;
  timestamp_end: string | null;
  politeness: string | null;
  grammar_note: string | null;
  order_index: number;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  lesson_id: string;
  session_id: string;
  word_hangul: string;
  word_romanization: string;
  word_translation: string;
  part_of_speech: string | null;
  is_known: boolean;
  is_saved: boolean;
  created_at: string;
}

export interface QuizResult {
  id: string;
  session_id: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface SessionWithDetails extends Session {
  lessons?: Lesson[];
}

export interface SubtitleLine {
  timestamp_start: string;
  timestamp_end?: string;
  korean: string;
}
