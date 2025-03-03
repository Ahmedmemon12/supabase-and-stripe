/*
  # Initial Auth Setup

  1. Tables
    - profiles table for user data
    - travel_preferences table for storing user preferences
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create travel_preferences table
CREATE TABLE IF NOT EXISTS new_travel_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Travel Goals & Interests
  trip_purpose text NOT NULL,
  activities text[] NOT NULL DEFAULT '{}',
  
  -- Timing & Duration
  travel_dates jsonb NOT NULL DEFAULT '{"is_flexible": true}'::jsonb,
  trip_length text NOT NULL,
  
  -- Destinations & Geography
  preferred_regions text[] NOT NULL DEFAULT '{}',
  environment_preference text NOT NULL,
  
  -- Budget & Accommodation
  total_budget numeric NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
  accommodation_type text NOT NULL,
  accommodation_budget numeric NOT NULL DEFAULT 0 CHECK (accommodation_budget >= 0),
  
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
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_travel_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Travel preferences policies
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

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();