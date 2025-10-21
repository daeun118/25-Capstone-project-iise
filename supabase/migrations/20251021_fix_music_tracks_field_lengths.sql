-- Migration: Fix music_tracks field length constraints
-- Date: 2025-10-21
-- Issue: VARCHAR(200) limit on description causing insertion failures
-- Solution: Increase field sizes to accommodate AI-generated content

-- Increase description field from VARCHAR(200) to TEXT
-- This allows GPT-4o-mini to generate detailed descriptions without length constraints
ALTER TABLE music_tracks
  ALTER COLUMN description TYPE TEXT;

-- Increase genre field from VARCHAR(50) to VARCHAR(100)
-- GPT sometimes generates compound genres like "classical crossover with electronic elements"
ALTER TABLE music_tracks
  ALTER COLUMN genre TYPE VARCHAR(100);

-- Increase mood field from VARCHAR(50) to VARCHAR(100)
-- GPT sometimes generates detailed moods like "contemplative and melancholic with undertones of hope"
ALTER TABLE music_tracks
  ALTER COLUMN mood TYPE VARCHAR(100);

-- Note: prompt is already TEXT, tempo is INTEGER, file_url is TEXT - no changes needed

COMMENT ON COLUMN music_tracks.description IS 'AI-generated description of the music (no length limit)';
COMMENT ON COLUMN music_tracks.genre IS 'Music genre (up to 100 characters)';
COMMENT ON COLUMN music_tracks.mood IS 'Emotional mood (up to 100 characters)';
