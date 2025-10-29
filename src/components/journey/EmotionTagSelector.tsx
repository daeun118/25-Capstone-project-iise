'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Loader2, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useEmotionTags } from '@/hooks/useEmotionTags';
import { m } from 'framer-motion';

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
      } else {
        // Visual feedback when limit reached
        const badge = document.querySelector(`[data-tag="${tag}"]`);
        if (badge) {
          badge.classList.add('animate-shake');
          setTimeout(() => badge.classList.remove('animate-shake'), 500);
        }
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
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            감정 태그 선택
          </p>
          <m.div
            className="text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
            style={{
              background: selectedTags.length >= maxTags
                ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
                : 'linear-gradient(135deg, #ec4899, #f472b6)',
              color: 'white',
            }}
            animate={{ 
              scale: selectedTags.length >= maxTags ? [1, 1.15, 1] : 1,
            }}
            transition={{ 
              duration: 0.5,
              repeat: selectedTags.length >= maxTags ? Infinity : 0,
              repeatDelay: 2
            }}
          >
            {selectedTags.length}/{maxTags}
            {selectedTags.length >= maxTags && (
              <span className="ml-1">✨</span>
            )}
          </m.div>
        </div>
        {selectedTags.length >= maxTags && (
          <m.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            최대 {maxTags}개까지 선택 가능합니다
          </m.p>
        )}
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin text-pink-500" />
            <span className="text-sm text-muted-foreground">태그 로딩 중...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag, index) => (
              <m.div
                key={tag.id}
                data-tag={tag.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ 
                  scale: selectedTags.includes(tag.name) || selectedTags.length < maxTags ? 1.08 : 1.02,
                  y: selectedTags.includes(tag.name) || selectedTags.length < maxTags ? -2 : 0
                }}
                whileTap={{ scale: 0.92 }}
              >
                <Badge
                  variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all h-9 px-3 text-sm font-medium shadow-sm hover:shadow-md"
                  style={{
                    background: selectedTags.includes(tag.name)
                      ? 'linear-gradient(135deg, #ec4899, #f472b6)'
                      : selectedTags.length >= maxTags
                      ? '#f3f4f6'
                      : 'transparent',
                    borderColor: selectedTags.includes(tag.name) ? 'transparent' : '#e5e7eb',
                    color: selectedTags.includes(tag.name) ? 'white' : selectedTags.length >= maxTags ? '#9ca3af' : 'inherit',
                    opacity: selectedTags.length >= maxTags && !selectedTags.includes(tag.name) ? 0.5 : 1,
                  }}
                  onClick={() => handleToggleTag(tag.name)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.name) && (
                    <m.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="ml-1.5"
                    >
                      <X className="size-3.5" />
                    </m.div>
                  )}
                </Badge>
              </m.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          커스텀 태그 추가
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedTags.length >= maxTags ? `태그를 먼저 삭제해주세요` : "나만의 감정 표현 (최대 10자)"}
              maxLength={10}
              disabled={selectedTags.length >= maxTags}
              className="h-11 border-2 border-purple-200/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 bg-gradient-to-br from-purple-50/30 to-pink-50/30 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            {customTag && (
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-600"
              >
                {customTag.length}/10
              </m.div>
            )}
          </div>
          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
            type="button"
            size="icon"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim() || selectedTags.length >= maxTags}
            className="h-11 w-11 border-0 shadow-lg hover:shadow-xl transition-all"
            style={{
            background: !customTag.trim() || selectedTags.length >= maxTags
            ? '#9ca3af'
            : 'linear-gradient(135deg, #a855f7, #ec4899)',
            }}
            >
            <Plus className="size-5" />
            </Button>
          </m.div>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-xl bg-gradient-to-br from-pink-50/50 to-purple-50/50 border-2 border-pink-200/30"
        >
          <p className="text-sm font-semibold flex items-center gap-2 mb-3">
            <m.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </m.div>
            선택된 태그
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <m.div
                key={tag}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  variant="default"
                  className="h-9 text-sm font-semibold shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                  }}
                >
                  {tag}
                  <m.button
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="ml-2"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <X className="size-3.5" />
                  </m.button>
                </Badge>
              </m.div>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
