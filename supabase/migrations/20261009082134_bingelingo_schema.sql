/*
# BingeLingo — Korean language learning app for K-drama fans

## Summary
Creates the full database schema for BingeLingo: learning sessions (imported/captured
subtitle batches), individual lessons (vocabulary + grammar extracted from each subtitle line),
vocabulary items saved for flashcard review, quiz results tracking, and user learning stats.

This is a single-tenant app (no sign-in screen). All policies use `TO anon, authenticated`
so the anon-key frontend can read and write its own data.

## Tables

### `sessions`
- `id` (uuid, PK)
- `title` (text) — the video/show title
- `source_url` (text, nullable) — URL of the video source
- `is_demo` (boolean, default false) — true for sample/demo data, false for real captured data
- `status` (text) — 'pending' | 'processing' | 'ready' | 'error'
- `error_message` (text, nullable) — error detail if generation failed
- `lesson_count` (int, default 0) — denormalized count of lessons for quick display
- `created_at` (timestamptz)

### `lessons`
- `id` (uuid, PK)
- `session_id` (uuid, FK → sessions, CASCADE)
- `hangul` (text) — the Korean subtitle line
- `romanization` (text) — romanized pronunciation
- `translation` (text) — English translation
- `timestamp_start` (text, nullable) — timestamp reference (e.g. "00:12:34")
- `timestamp_end` (text, nullable)
- `politeness` (text, nullable) — formality label (e.g. "해요체 (polite)")
- `grammar_note` (text, nullable) — grammar explanation
- `order_index` (int) — ordering within the session
- `created_at` (timestamptz)

### `vocabulary`
- `id` (uuid, PK)
- `lesson_id` (uuid, FK → lessons, CASCADE)
- `session_id` (uuid, FK → sessions, CASCADE) — denormalized for easier queries
- `word_hangul` (text) — the Korean word
- `word_romanization` (text) — romanized form
- `word_translation` (text) — English meaning
- `part_of_speech` (text, nullable) — noun, verb, etc.
- `is_known` (boolean, default false) — user has marked this word as known
- `is_saved` (boolean, default true) — saved for flashcard review
- `created_at` (timestamptz)

### `quiz_results`
- `id` (uuid, PK)
- `session_id` (uuid, FK → sessions, CASCADE)
- `score` (int) — number of correct answers
- `total_questions` (int) — total questions in the quiz
- `created_at` (timestamptz)

## Security
- RLS enabled on ALL tables.
- All policies use `TO anon, authenticated` (single-tenant, no auth screen).
- Full CRUD access for anon + authenticated on all tables.

## Notes
1. This is a single-tenant app — no user_id or auth dependency.
2. `is_demo` flag on sessions distinguishes demo/sample data from real captured data.
3. Vocabulary has `session_id` denormalized so flashcards can be loaded without a join.
4. `lesson_count` on sessions is denormalized for dashboard performance.
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_url text,
  is_demo boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  lesson_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  hangul text NOT NULL,
  romanization text NOT NULL DEFAULT '',
  translation text NOT NULL DEFAULT '',
  timestamp_start text,
  timestamp_end text,
  politeness text,
  grammar_note text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lessons" ON lessons;
CREATE POLICY "anon_select_lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lessons" ON lessons;
CREATE POLICY "anon_insert_lessons" ON lessons FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lessons" ON lessons;
CREATE POLICY "anon_update_lessons" ON lessons FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lessons" ON lessons;
CREATE POLICY "anon_delete_lessons" ON lessons FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_hangul text NOT NULL,
  word_romanization text NOT NULL DEFAULT '',
  word_translation text NOT NULL DEFAULT '',
  part_of_speech text,
  is_known boolean NOT NULL DEFAULT false,
  is_saved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vocabulary" ON vocabulary;
CREATE POLICY "anon_select_vocabulary" ON vocabulary FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vocabulary" ON vocabulary;
CREATE POLICY "anon_insert_vocabulary" ON vocabulary FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vocabulary" ON vocabulary;
CREATE POLICY "anon_update_vocabulary" ON vocabulary FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vocabulary" ON vocabulary;
CREATE POLICY "anon_delete_vocabulary" ON vocabulary FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_results" ON quiz_results;
CREATE POLICY "anon_select_quiz_results" ON quiz_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quiz_results" ON quiz_results;
CREATE POLICY "anon_insert_quiz_results" ON quiz_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quiz_results" ON quiz_results;
CREATE POLICY "anon_update_quiz_results" ON quiz_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quiz_results" ON quiz_results;
CREATE POLICY "anon_delete_quiz_results" ON quiz_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lessons_session_id ON lessons(session_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_session_id ON vocabulary(session_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_session_id ON quiz_results(session_id);
