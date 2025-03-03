/*
  # Add profile photos and trip photos support

  1. New Tables
    - `profile_photos` for user avatars
    - `trip_photos` for travel memories
    
  2. Updates
    - Add new fields to `profiles` table
    
  3. Security
    - Enable RLS on new tables
    - Add policies for photo access
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reward_programs jsonb DEFAULT '[]'::jsonb;

-- Create profile_photos table
CREATE TABLE IF NOT EXISTS profile_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    url text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create trip_photos table
CREATE TABLE IF NOT EXISTS trip_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    url text NOT NULL,
    title text,
    description text,
    location text,
    taken_at date,
    is_public boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;

-- Profile photos policies
CREATE POLICY "Users can view own profile photo"
    ON profile_photos FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile photo"
    ON profile_photos FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile photo"
    ON profile_photos FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile photo"
    ON profile_photos FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Trip photos policies
CREATE POLICY "Users can view public trip photos"
    ON trip_photos FOR SELECT
    TO authenticated
    USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users can insert own trip photos"
    ON trip_photos FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip photos"
    ON trip_photos FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip photos"
    ON trip_photos FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);