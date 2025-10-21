-- Setup Supabase Storage for Music Files
-- Run this in Supabase SQL Editor to create the storage bucket and policies

-- 1. Create storage bucket for music tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music-tracks',
  'music-tracks',
  true, -- Public read access
  10485760, -- 10MB limit per file
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public read access to music files
CREATE POLICY "Public read access to music tracks"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-tracks');

-- 4. Policy: Allow authenticated users to upload music files
-- Only service role should upload (from backend), but allow for manual testing
CREATE POLICY "Authenticated users can upload music tracks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-tracks' 
  AND auth.role() = 'authenticated'
);

-- 5. Policy: Allow service role to update music files
CREATE POLICY "Service role can update music tracks"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music-tracks'
  AND auth.role() = 'service_role'
);

-- 6. Policy: Allow service role to delete music files
CREATE POLICY "Service role can delete music tracks"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music-tracks'
  AND auth.role() = 'service_role'
);

-- Verify setup
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'music-tracks';
