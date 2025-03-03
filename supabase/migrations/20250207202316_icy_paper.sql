-- Drop existing table if it exists
DROP TABLE IF EXISTS public.travel_preferences;

-- Create travel preferences table
CREATE TABLE public.travel_preferences (
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
CREATE INDEX idx_travel_preferences_user_id ON public.travel_preferences(user_id);

-- Enable RLS
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read for users based on user_id" ON public.travel_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON public.travel_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.travel_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.travel_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary privileges
GRANT ALL ON public.travel_preferences TO authenticated;
GRANT ALL ON public.travel_preferences TO service_role;