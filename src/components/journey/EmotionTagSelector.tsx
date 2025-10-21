'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useEmotionTags } from '@/hooks/useEmotionTags';

interface EmotionTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function EmotionTagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 5,
}: EmotionTagSelectorProps) {
  const [customTag, setCustomTag] = useState('');
  const { predefinedTags, createTag, loading } = useEmotionTags();

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag]);
      }
    }
  };

  const handleAddCustomTag = async () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < maxTags) {
      // Create tag in database first
      await createTag(trimmed);
      onTagsChange([...selectedTags, trimmed]);
      setCustomTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">
          감정 태그 선택 ({selectedTags.length}/{maxTags})
        </p>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm text-muted-foreground">태그 로딩 중...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleToggleTag(tag.name)}
              >
                {tag.name}
                {selectedTags.includes(tag.name) && (
                  <X className="ml-1 size-3" />
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">커스텀 태그 추가</p>
        <div className="flex gap-2">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="나만의 감정 표현 (최대 10자)"
            maxLength={10}
            disabled={selectedTags.length >= maxTags}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim() || selectedTags.length >= maxTags}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">선택된 태그</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
                <button
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
