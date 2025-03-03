/*
  # Ensure travel preferences table exists

  1. Changes
    - Safely create travel_preferences table if it doesn't exist
    - Add proper constraints and indexes
    - Ensure RLS policies are in place

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper user isolation
*/

-- Create table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'travel_preferences') THEN
    CREATE TABLE travel_preferences (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
      destination text NOT NULL,
      budget text NOT NULL CHECK (budget IN ('Budget', 'Moderate', 'Luxury')),
      duration text NOT NULL,
      interests text[] NOT NULL,
      travel_style text NOT NULL CHECK (travel_style IN ('Luxury & Comfort', 'Balanced & Flexible', 'Adventure & Backpacking', 'Local & Authentic')),
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'travel_preferences' 
    AND indexname = 'travel_preferences_user_id_idx'
  ) THEN
    CREATE INDEX travel_preferences_user_id_idx ON travel_preferences(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can insert own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can update own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can delete own travel preferences" ON travel_preferences;
END $$;

-- Create policies
CREATE POLICY "Users can view own travel preferences"
  ON travel_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own travel preferences"
  ON travel_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own travel preferences"
  ON travel_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own travel preferences"
  ON travel_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());