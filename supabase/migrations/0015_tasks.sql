-- Month 2: General task manager

CREATE TABLE IF NOT EXISTS user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  area text NOT NULL DEFAULT 'allgemein',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  deadline date,
  notes text,
  sort_order integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON user_tasks FOR ALL USING (auth.uid() = user_id);
