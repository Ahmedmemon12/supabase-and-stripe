/*
  # Fix travel preferences table

  1. Changes
    - Drop and recreate travel_preferences table with correct schema
    - Add proper foreign key constraints
    - Enable RLS and add policies
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper user isolation
*/

-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS travel_preferences;

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

-- Create index for faster queries
CREATE INDEX travel_preferences_user_id_idx ON travel_preferences(user_id);

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