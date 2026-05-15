-- Month 3: Knowledge base / Cossu Enzyklopädie

CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'allgemein',
  content text DEFAULT '',
  lektion_nr integer,
  lektion_zeitraum text,
  is_pinned boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON user_notes FOR ALL USING (auth.uid() = user_id);
