/*
  # Fix travel preferences table and permissions

  1. Changes
    - Ensure travel preferences table exists with correct schema
    - Add proper RLS policies
    - Fix foreign key reference to use auth.users instead of profiles

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own preferences
*/

-- Drop existing table if it exists and recreate with correct schema
DROP TABLE IF EXISTS travel_preferences;

CREATE TABLE travel_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  destination text NOT NULL,
  budget text NOT NULL,
  duration text NOT NULL,
  interests text[] NOT NULL,
  travel_style text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

-- Travel preferences policies
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