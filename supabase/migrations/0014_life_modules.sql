-- Life OS Modules: Goals, Sport, Gaming, Reading, Finance, Wedding

-- Annual goals per life area
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL DEFAULT 2026,
  area text NOT NULL,
  title text NOT NULL,
  definition_of_done text,
  deadline date,
  xp_reward integer DEFAULT 100,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'active', 'done')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Individual run / workout logs
CREATE TABLE IF NOT EXISTS user_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  distance_km numeric(5,2) NOT NULL,
  duration_minutes integer,
  run_type text DEFAULT 'EL' CHECK (run_type IN ('EL', 'LL', 'Intervall', 'Fußball', 'Kraft', 'Sonstiges')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Game tracker
CREATE TABLE IF NOT EXISTS user_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  platform text,
  igdb_id integer,
  cover_url text,
  genre text,
  played_with text DEFAULT 'Solo',
  status text NOT NULL DEFAULT 'pipeline' CHECK (status IN ('pipeline', 'active', 'completed')),
  slot_number integer,
  year integer DEFAULT 2026,
  quarter text,
  completed_at timestamptz,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Books & audiobooks
CREATE TABLE IF NOT EXISTS user_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  type text NOT NULL DEFAULT 'book' CHECK (type IN ('book', 'audiobook')),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'reading', 'done')),
  slot_number integer,
  year integer DEFAULT 2026,
  quarter text,
  current_page integer,
  total_pages integer,
  narrator text,
  duration_hours numeric(5,1),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Monthly finance snapshots
CREATE TABLE IF NOT EXISTS finance_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  kk_saldo_end numeric(10,2),
  kk_free numeric(10,2),
  giro_saldo numeric(10,2),
  salary numeric(10,2),
  rent_return numeric(10,2),
  other_income numeric(10,2),
  notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Planned special expenses
CREATE TABLE IF NOT EXISTS finance_special_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount_eur numeric(10,2),
  planned_date date,
  status text DEFAULT 'open' CHECK (status IN ('open', 'paid', 'postponed')),
  year integer DEFAULT 2026,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Wedding checklists
CREATE TABLE IF NOT EXISTS wedding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  deadline date,
  area text DEFAULT 'standesamt' CHECK (area IN ('standesamt', 'freie_trauung', 'allgemein')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_run_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_special_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own run logs" ON user_run_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own games" ON user_games FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own books" ON user_books FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own finance months" ON finance_months FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own special expenses" ON finance_special_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own wedding tasks" ON wedding_tasks FOR ALL USING (auth.uid() = user_id);
