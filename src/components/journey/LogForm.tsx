'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmotionTagSelector } from './EmotionTagSelector';
import { Loader2, Save, Music2, X, BookOpen, PenLine, Heart, Info, Sparkles } from 'lucide-react';
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
    if (!quote.trim()) return;

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
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote Section - Enhanced */}
      <m.div 
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label htmlFor="quote" className="text-base font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          인상 깊은 구절
          <span className="text-sm font-normal text-red-500">*</span>
        </Label>
        <div className="relative">
          <Textarea
            id="quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="책에서 마음에 남는 문장이나 구절을 적어보세요..."
            rows={3}
            maxLength={500}
            required
            disabled={isLoading}
            className="resize-none text-sm"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-medium">
            {quote.length}/500
          </span>
        </div>
      </m.div>

      {/* Memo Section - Enhanced */}
      <m.div 
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="memo" className="text-base font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <PenLine className="w-4 h-4 text-white" />
          </div>
          나의 생각과 느낌
          <span className="text-sm font-normal text-muted-foreground">(선택)</span>
        </Label>
        <div className="relative">
          <Textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이 부분을 읽으면서 어떤 생각이 들었나요? 어떤 감정을 느꼈나요?&#10;자유롭게 당신의 생각을 기록해보세요..."
            rows={5}
            maxLength={1000}
            disabled={isLoading}
            className="resize-none text-sm"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-medium">
            {memo.length}/1000
          </span>
        </div>
      </m.div>

      {/* Emotion Tags - Enhanced */}
      <m.div 
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label className="text-base font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          감정 태그
          <span className="text-sm font-normal text-muted-foreground">(선택)</span>
        </Label>
        <EmotionTagSelector
          selectedTags={emotions}
          onTagsChange={setEmotions}
        />
      </m.div>

      {/* Public Option - Enhanced */}
      <m.div
        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label
          htmlFor="isPublic"
          className="text-sm font-medium cursor-pointer flex-1 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          완독 후 게시물에 포함
        </Label>
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
          disabled={isLoading}
        />
      </m.div>

      {/* Action Buttons - Enhanced */}
      <m.div 
        className="flex gap-3 pt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-6 border-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
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
          disabled={!quote.trim() || isLoading}
          className="flex-1 h-12 font-medium border-2 hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          {isLoading && loadingMode === 'save' ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              저장 중
            </>
          ) : (
            <>
              <Save className="mr-2 size-5" />
              저장만
            </>
          )}
        </Button>

        {/* Generate Music Button - Premium Style */}
        <m.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!quote.trim() || isLoading}
            className="w-full h-12 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
            style={{
              background: isLoading && loadingMode === 'generate'
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                : 'linear-gradient(135deg, #a855f7, #ec4899, #f472b6)',
            }}
          >
            {isLoading && loadingMode === 'generate' ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                생성 중
              </>
            ) : (
              <>
                <m.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Music2 className="mr-2 size-5" />
                </m.div>
                음악 생성
              </>
            )}
          </Button>
        </m.div>
      </m.div>
    </m.div>
  );
}
