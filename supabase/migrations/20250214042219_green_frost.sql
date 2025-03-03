/*
  # Storage Setup for Profile and Trip Photos

  1. Storage Configuration
    - Create avatars bucket for profile photos
    - Create trips bucket for travel photos
  
  2. Security
    - Enable RLS for both buckets
    - Set up policies for authenticated access
    - Allow public read access for shared trip photos
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "storage";

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('trips', 'trips', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can update own avatar image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can delete own avatar image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Set up RLS policies for trips bucket
CREATE POLICY "Trip photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trips');

CREATE POLICY "Users can upload trip photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trips' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can update own trip photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'trips' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can delete own trip photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trips' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );