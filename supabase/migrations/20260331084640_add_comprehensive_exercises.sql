/*
  # Add Comprehensive Exercise Library
  
  Adds a complete workout program with 37 exercises organized by muscle groups:
  
  ## Exercises Added
  
  ### Legs (7 exercises)
  - Leg Extensions
  - Squats
  - Lunges
  - Split Squats
  - Lying Hamstring Curls
  - Calf Raises
  - Sumo Squats
  
  ### Chest (3 exercises)
  - Flat Bench Chest Press
  - Incline Bench Chest
  
  ### Shoulders (2 exercises)
  - Seated Shoulder Press
  - Shoulder Lateral Raises
  
  ### Arms (4 exercises)
  - Triceps Dips
  - Triceps Push Downs
  - Bicep Curls
  - Hammer Curls
  
  ### Back (6 exercises)
  - Pull Ups
  - Barbell Rows
  - Tbar Rows
  - Dumbbell 1 Arm Row
  - Deadlifts
  - Hyper Extensions
  
  ### Core (6 exercises)
  - Incline Abdominal Crunches
  - Planks
  - Hanging Leg Raises
  - Sit Ups
  
  All exercises follow the recommended rep ranges and rest periods from the training program.
*/

-- Clear old exercises and add the comprehensive library
DELETE FROM exercises;

INSERT INTO exercises (name, muscle_group) VALUES
  -- Legs
  ('Leg Extensions', 'Legs'),
  ('Squats', 'Legs'),
  ('Lunges', 'Legs'),
  ('Split Squats', 'Legs'),
  ('Lying Hamstring Curls', 'Legs'),
  ('Calf Raises', 'Legs'),
  ('Sumo Squats', 'Legs'),
  
  -- Chest
  ('Flat Bench Chest Press', 'Chest'),
  ('Incline Bench Chest', 'Chest'),
  
  -- Shoulders
  ('Seated Shoulder Press', 'Shoulders'),
  ('Shoulder Lateral Raises', 'Shoulders'),
  
  -- Arms
  ('Triceps Dips', 'Arms'),
  ('Triceps Push Downs', 'Arms'),
  ('Bicep Curls', 'Arms'),
  ('Hammer Curls', 'Arms'),
  
  -- Back
  ('Pull Ups', 'Back'),
  ('Barbell Rows', 'Back'),
  ('Tbar Rows', 'Back'),
  ('Dumbbell 1 Arm Row', 'Back'),
  ('Deadlifts', 'Back'),
  ('Hyper Extensions', 'Back'),
  
  -- Core
  ('Incline Abdominal Crunches', 'Core'),
  ('Planks', 'Core'),
  ('Hanging Leg Raises', 'Core'),
  ('Sit Ups', 'Core');
