-- Create calorie_logs table
CREATE TABLE calorie_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('pre_workout', 'post_workout', 'breakfast', 'lunch', 'dinner', 'snack')),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "select_own_calorie_logs" ON calorie_logs FOR SELECT
  TO authenticated USING (auth.uid()::text = 'public');

CREATE POLICY "insert_own_calorie_logs" ON calorie_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = 'public');

CREATE POLICY "update_own_calorie_logs" ON calorie_logs FOR UPDATE
  TO authenticated USING (auth.uid()::text = 'public') WITH CHECK (auth.uid()::text = 'public');

CREATE POLICY "delete_own_calorie_logs" ON calorie_logs FOR DELETE
  TO authenticated USING (auth.uid()::text = 'public');

-- Create index for faster queries
CREATE INDEX idx_calorie_logs_date ON calorie_logs(log_date DESC);
