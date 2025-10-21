-- Function to increment emotion tag usage count
-- This is called whenever a tag is used in a reading log

CREATE OR REPLACE FUNCTION increment_emotion_tag_usage(tag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE emotion_tags
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_emotion_tag_usage(UUID) TO authenticated;
