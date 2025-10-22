'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmotionTagSelector } from './EmotionTagSelector';
import { Loader2, Save, Music2, X, BookOpen, PenLine, Heart, Info } from 'lucide-react';
import { m } from 'framer-motion';

interface LogFormProps {
  onSubmit: (data: LogFormData, generateMusic: boolean) => Promise<void>;
  onCancel?: () => void;
}

export interface LogFormData {
  quote: string;
  memo: string;
  emotions: string[];
  isPublic: boolean;
}

export function LogForm({ onSubmit, onCancel }: LogFormProps) {
  const [quote, setQuote] = useState('');
  const [memo, setMemo] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'save' | 'generate' | null>(null);

  const handleSubmit = async (generateMusic: boolean) => {
    if (!memo.trim()) return;

    setIsLoading(true);
    setLoadingMode(generateMusic ? 'generate' : 'save');

    try {
      await onSubmit({ quote, memo, emotions, isPublic }, generateMusic);
      // Reset form
      setQuote('');
      setMemo('');
      setEmotions([]);
      setIsPublic(false);
    } catch (err) {
      console.error('Failed to submit log:', err);
    } finally {
      setIsLoading(false);
      setLoadingMode(null);
    }
  };

  return (
    <m.div 
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote Section */}
      <div className="space-y-2">
        <Label htmlFor="quote" className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          인상 깊은 구절
          <span className="text-xs font-normal text-muted-foreground">(선택)</span>
        </Label>
        <div className="relative">
          <Textarea
            id="quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="책에서 마음에 남는 문장이나 구절을 적어보세요..."
            rows={3}
            maxLength={500}
            disabled={isLoading}
            className="resize-none text-sm leading-relaxed bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-muted/40"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {quote.length}/500
          </span>
        </div>
      </div>

      {/* Memo Section */}
      <div className="space-y-2">
        <Label htmlFor="memo" className="text-sm font-medium flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary" />
          나의 생각과 느낌
          <span className="text-xs font-normal text-red-500">*</span>
        </Label>
        <div className="relative">
          <Textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이 부분을 읽으면서 어떤 생각이 들었나요? 어떤 감정을 느꼈나요?&#10;자유롭게 당신의 생각을 기록해보세요..."
            rows={5}
            maxLength={1000}
            required
            disabled={isLoading}
            className="resize-none text-sm leading-relaxed bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:bg-muted/40"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {memo.length}/1000
          </span>
        </div>
      </div>

      {/* Emotion Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          감정 태그
          <span className="text-xs font-normal text-muted-foreground">(선택)</span>
        </Label>
        <EmotionTagSelector
          selectedTags={emotions}
          onTagsChange={setEmotions}
        />
      </div>

      {/* Public Option */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
        <Label
          htmlFor="isPublic"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          완독 후 게시물에 포함
        </Label>
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-6"
          >
            <X className="mr-2 size-4" />
            취소
          </Button>
        )}
        
        {/* Save Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={!memo.trim() || isLoading}
          className="flex-1 h-11 font-medium"
        >
          {isLoading && loadingMode === 'save' ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              저장 중
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              저장만
            </>
          )}
        </Button>

        {/* Generate Music Button */}
        <Button
          type="button"
          variant="gradient"
          onClick={() => handleSubmit(true)}
          disabled={!memo.trim() || isLoading}
          className="flex-1 h-11 font-semibold shadow-lg"
        >
          {isLoading && loadingMode === 'generate' ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              생성 중
            </>
          ) : (
            <>
              <Music2 className="mr-2 size-4" />
              음악 생성
            </>
          )}
        </Button>
      </div>
    </m.div>
  );
}
