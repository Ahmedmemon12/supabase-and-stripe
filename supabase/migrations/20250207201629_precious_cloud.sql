/*
  # Final fix for travel preferences table

  1. Changes
    - Ensure travel_preferences table exists with proper schema
    - Add proper constraints and indexes
    - Add proper error handling for table creation
    - Ensure RLS policies are in place

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper user isolation
*/

-- Begin transaction to ensure atomic operations
BEGIN;

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table if it doesn't exist with proper error handling
DO $$ 
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'travel_preferences'
  ) INTO table_exists;

  IF NOT table_exists THEN
    CREATE TABLE travel_preferences (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL,
      destination text NOT NULL,
      budget text NOT NULL,
      duration text NOT NULL,
      interests text[] NOT NULL,
      travel_style text NOT NULL,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
      CONSTRAINT valid_budget
        CHECK (budget IN ('Budget', 'Moderate', 'Luxury')),
      CONSTRAINT valid_travel_style
        CHECK (travel_style IN ('Luxury & Comfort', 'Balanced & Flexible', 'Adventure & Backpacking', 'Local & Authentic'))
    );

    -- Create index for user_id if it doesn't exist
    CREATE INDEX IF NOT EXISTS travel_preferences_user_id_idx ON travel_preferences(user_id);
  ELSE
    -- If table exists, ensure all necessary columns and constraints are present
    DO $columns$ 
    BEGIN
      -- Add columns if they don't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'travel_preferences' 
                    AND column_name = 'interests') THEN
        ALTER TABLE travel_preferences ADD COLUMN interests text[] NOT NULL DEFAULT '{}';
      END IF;

      -- Add constraints if they don't exist
      IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                    WHERE table_schema = 'public' 
                    AND table_name = 'travel_preferences' 
                    AND constraint_name = 'valid_budget') THEN
        ALTER TABLE travel_preferences 
          ADD CONSTRAINT valid_budget 
          CHECK (budget IN ('Budget', 'Moderate', 'Luxury'));
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                    WHERE table_schema = 'public' 
                    AND table_name = 'travel_preferences' 
                    AND constraint_name = 'valid_travel_style') THEN
        ALTER TABLE travel_preferences 
          ADD CONSTRAINT valid_travel_style 
          CHECK (travel_style IN ('Luxury & Comfort', 'Balanced & Flexible', 'Adventure & Backpacking', 'Local & Authentic'));
      END IF;
    END $columns$;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can insert own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can update own travel preferences" ON travel_preferences;
  DROP POLICY IF EXISTS "Users can delete own travel preferences" ON travel_preferences;

  -- Create new policies
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
END $$;

COMMIT;