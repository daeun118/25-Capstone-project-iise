'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/types/database';

type EmotionTag = Database['public']['Tables']['emotion_tags']['Row'];

export function useEmotionTags() {
  const [tags, setTags] = useState<EmotionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all emotion tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/emotion-tags');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '감정 태그를 불러오는데 실패했습니다.');
      }

      setTags(data.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('Error fetching emotion tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new custom emotion tag
  const createTag = async (name: string): Promise<EmotionTag | null> => {
    try {
      const response = await fetch('/api/emotion-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '감정 태그 생성에 실패했습니다.');
      }

      // Add new tag to local state if it doesn't exist
      const existingTag = tags.find((t) => t.id === data.tag.id);
      if (!existingTag) {
        setTags((prev) => [...prev, data.tag]);
      }

      return data.tag;
    } catch (err) {
      console.error('Error creating emotion tag:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return null;
    }
  };

  // Get predefined tags
  const predefinedTags = tags.filter((tag) => tag.is_predefined);

  // Get custom tags
  const customTags = tags.filter((tag) => !tag.is_predefined);

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    predefinedTags,
    customTags,
    loading,
    error,
    createTag,
    refetch: fetchTags,
  };
}
