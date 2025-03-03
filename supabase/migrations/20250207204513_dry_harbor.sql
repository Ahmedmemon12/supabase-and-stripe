/*
  # Fix Travel Preferences Table

  1. Changes
    - Drop and recreate new_travel_preferences table with correct schema
    - Add proper constraints and indexes
    - Enable RLS with appropriate policies
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS new_travel_preferences;

-- Create new_travel_preferences table with correct schema
CREATE TABLE new_travel_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    
    -- Travel Goals & Interests
    trip_purpose text NOT NULL,
    activities text[] NOT NULL DEFAULT '{}',
    
    -- Timing & Duration
    travel_dates jsonb NOT NULL,
    trip_length text NOT NULL,
    
    -- Destinations & Geography
    preferred_regions text[] NOT NULL DEFAULT '{}',
    environment_preference text NOT NULL,
    
    -- Budget & Accommodation
    total_budget numeric NOT NULL,
    accommodation_type text NOT NULL,
    accommodation_budget numeric NOT NULL,
    
    -- Food & Dining
    cuisine_preferences text[] NOT NULL DEFAULT '{}',
    dining_budget text NOT NULL,
    
    -- Travel Companions
    travel_companions text NOT NULL,
    special_considerations text,
    
    -- Adventure & Special Interests
    adventure_level text NOT NULL,
    bucket_list_items text[] NOT NULL DEFAULT '{}',
    
    -- Travel Style & Logistics
    travel_pace text NOT NULL,
    transportation_preference text NOT NULL,
    travel_experience_level text NOT NULL,
    
    -- Safety & Comfort
    comfort_level text NOT NULL,
    health_safety_concerns text,
    
    -- Personal Touches
    previous_experiences text,
    
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_new_travel_preferences_user_id ON new_travel_preferences(user_id);
CREATE INDEX idx_new_travel_preferences_created_at ON new_travel_preferences(created_at);

-- Enable Row Level Security
ALTER TABLE new_travel_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own travel preferences"
    ON new_travel_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel preferences"
    ON new_travel_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel preferences"
    ON new_travel_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel preferences"
    ON new_travel_preferences
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON new_travel_preferences TO authenticated;
GRANT ALL ON new_travel_preferences TO service_role;