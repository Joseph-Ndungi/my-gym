import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  created_at: string;
};

export type WorkoutLog = {
  id: string;
  exercise_id: string;
  workout_date: string;
  set_number: number;
  weight: number;
  reps: number;
  notes: string;
  created_at: string;
};

export type WorkoutLogWithExercise = WorkoutLog & {
  exercises: Exercise;
};
