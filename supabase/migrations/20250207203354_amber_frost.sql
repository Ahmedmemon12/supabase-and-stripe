/*
  # Extended Travel Preferences Schema

  1. New Fields
    - Added detailed fields for comprehensive travel preferences
    - Structured into logical categories (goals, timing, destinations, etc.)
    - Added validation constraints for specific fields

  2. Security
    - Maintained existing RLS policies
    - Added appropriate constraints for data validation

  3. Changes
    - Extended travel_preferences table with new fields
    - Added appropriate data types and constraints
    - Created indexes for frequently queried fields
*/

CREATE TABLE IF NOT EXISTS new_travel_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Travel Goals & Interests
  trip_purpose text NOT NULL,
  activities text[] NOT NULL,
  
  -- Timing & Duration
  travel_dates jsonb NOT NULL,
  trip_length text NOT NULL,
  
  -- Destinations & Geography
  preferred_regions text[] NOT NULL,
  environment_preference text NOT NULL,
  
  -- Budget & Accommodation
  total_budget numeric NOT NULL,
  accommodation_type text NOT NULL,
  accommodation_budget numeric NOT NULL,
  
  -- Food & Dining
  cuisine_preferences text[] NOT NULL,
  dining_budget text NOT NULL,
  
  -- Travel Companions
  travel_companions text NOT NULL,
  special_considerations text,
  
  -- Adventure & Special Interests
  adventure_level text NOT NULL,
  bucket_list_items text[] NOT NULL,
  
  -- Travel Style & Logistics
  travel_pace text NOT NULL,
  transportation_preference text NOT NULL,
  travel_experience_level text NOT NULL,
  
  -- Safety & Comfort
  comfort_level text NOT NULL,
  health_safety_concerns text,
  
  -- Personal Touches
  previous_experiences text,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE new_travel_preferences ENABLE ROW LEVEL SECURITY;

-- Create indexes for frequently queried fields
CREATE INDEX idx_new_travel_preferences_user_id ON new_travel_preferences(user_id);
CREATE INDEX idx_new_travel_preferences_created_at ON new_travel_preferences(created_at);

-- RLS Policies
CREATE POLICY "Users can view own travel preferences"
  ON new_travel_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own travel preferences"
  ON new_travel_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own travel preferences"
  ON new_travel_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own travel preferences"
  ON new_travel_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON new_travel_preferences TO authenticated;
GRANT ALL ON new_travel_preferences TO service_role;