/*
  # Gym Tracker Database Schema

  ## Overview
  Creates a comprehensive gym tracking system to log exercises, sets, weights, and muscle groups.

  ## New Tables
  
  ### `exercises`
  Stores exercise definitions with their target muscle groups
  - `id` (uuid, primary key) - Unique identifier for each exercise
  - `name` (text, unique) - Exercise name (e.g., "Bench Press", "Squats")
  - `muscle_group` (text) - Primary muscle group targeted (e.g., "Chest", "Legs", "Back")
  - `created_at` (timestamptz) - When the exercise was added
  
  ### `workout_logs`
  Records individual sets performed during workouts
  - `id` (uuid, primary key) - Unique identifier for each logged set
  - `exercise_id` (uuid, foreign key) - References the exercise performed
  - `workout_date` (date) - The date the workout was performed
  - `set_number` (integer) - Which set in the workout (1, 2, 3, etc.)
  - `weight` (decimal) - Weight used for this set
  - `reps` (integer) - Number of repetitions completed
  - `notes` (text, optional) - Additional notes about the set
  - `created_at` (timestamptz) - When the log entry was created

  ## Security
  - Enable RLS on both tables
  - Public read access for exercises (anyone can view exercise library)
  - Public write access for workout logs (simplified for single-user app)
  
  ## Notes
  - Weight is stored as decimal to support fractional weights (e.g., 45.5 lbs)
  - Workout date is separate from created_at to allow backdating entries
  - Muscle groups use text for flexibility (could be enum in future)
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  muscle_group text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workout logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  set_number integer NOT NULL DEFAULT 1,
  weight decimal NOT NULL,
  reps integer NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Policies for exercises table
CREATE POLICY "Anyone can view exercises"
  ON exercises FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert exercises"
  ON exercises FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update exercises"
  ON exercises FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete exercises"
  ON exercises FOR DELETE
  TO public
  USING (true);

-- Policies for workout_logs table
CREATE POLICY "Anyone can view workout logs"
  ON workout_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert workout logs"
  ON workout_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update workout logs"
  ON workout_logs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete workout logs"
  ON workout_logs FOR DELETE
  TO public
  USING (true);

-- Insert some common exercises to get started
INSERT INTO exercises (name, muscle_group) VALUES
  ('Bench Press', 'Chest'),
  ('Squats', 'Legs'),
  ('Deadlift', 'Back'),
  ('Overhead Press', 'Shoulders'),
  ('Barbell Row', 'Back'),
  ('Pull-ups', 'Back'),
  ('Bicep Curls', 'Arms'),
  ('Tricep Dips', 'Arms'),
  ('Leg Press', 'Legs'),
  ('Lat Pulldown', 'Back')
ON CONFLICT (name) DO NOTHING;