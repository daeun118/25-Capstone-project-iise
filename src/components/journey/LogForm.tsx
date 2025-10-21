'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmotionTagSelector } from './EmotionTagSelector';
import { Loader2, Save, Music2, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote Section */}
      <div className="space-y-3">
        <Label htmlFor="quote" className="text-base font-semibold flex items-center gap-2">
          📖 인상 깊은 구절
          <span className="text-xs font-normal text-muted-foreground">(선택사항)</span>
        </Label>
        <Textarea
          id="quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="책에서 마음에 남는 문장이나 구절을 적어보세요..."
          rows={3}
          maxLength={500}
          disabled={isLoading}
          className="resize-none text-base leading-relaxed"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            독서 중 감동받은 구절을 기록해보세요
          </p>
          <p className="text-xs text-muted-foreground">
            {quote.length}/500
          </p>
        </div>
      </div>

      {/* Memo Section */}
      <div className="space-y-3">
        <Label htmlFor="memo" className="text-base font-semibold flex items-center gap-2">
          ✍️ 나의 생각과 느낌
          <span className="text-xs font-normal text-red-500">*필수</span>
        </Label>
        <Textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이 부분을 읽으면서 어떤 생각이 들었나요? 어떤 감정을 느꼈나요?&#10;자유롭게 당신의 생각을 기록해보세요..."
          rows={6}
          maxLength={1000}
          required
          disabled={isLoading}
          className="resize-none text-base leading-relaxed"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            솔직한 감상이 더 좋은 음악을 만들어냅니다
          </p>
          <p className="text-xs text-muted-foreground">
            {memo.length}/1000
          </p>
        </div>
      </div>

      {/* Emotion Tags */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          💭 감정 태그
          <span className="text-xs font-normal text-muted-foreground">(선택사항)</span>
        </Label>
        <EmotionTagSelector
          selectedTags={emotions}
          onTagsChange={setEmotions}
        />
        <p className="text-xs text-muted-foreground">
          지금 느끼는 감정을 선택하면 음악에 반영됩니다
        </p>
      </div>

      {/* Public Option */}
      <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
          disabled={isLoading}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label
            htmlFor="isPublic"
            className="text-sm font-medium cursor-pointer leading-relaxed"
          >
            완독 후 이 기록을 게시물에 포함하기
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            체크하면 완독 시 다른 사람들과 이 기록을 공유할 수 있습니다
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="sm:w-auto"
          >
            <X className="mr-2 size-4" />
            취소
          </Button>
        )}
        
        <div className="flex-1 flex gap-3">
          {/* Save Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={!memo.trim() || isLoading}
            className="flex-1 h-12 text-base font-semibold"
          >
            {isLoading && loadingMode === 'save' ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 size-5" />
                저장만 하기
              </>
            )}
          </Button>

          {/* Generate Music Button */}
          <Button
            type="button"
            variant="gradient"
            onClick={() => handleSubmit(true)}
            disabled={!memo.trim() || isLoading}
            className="flex-1 h-12 text-base font-semibold shadow-lg"
          >
            {isLoading && loadingMode === 'generate' ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Music2 className="mr-2 size-5" />
                음악 생성하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <motion.div 
        className="p-4 rounded-lg border border-primary/20 bg-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary">💡 팁:</span> 
          {' '}<strong>"저장만 하기"</strong>를 선택하면 기록만 저장되고, 
          {' '}<strong>"음악 생성하기"</strong>를 선택하면 기록과 함께 AI가 당신의 감정을 담은 음악을 만들어줍니다.
          여러 기록을 빠르게 저장한 뒤, 원할 때 음악을 생성할 수도 있습니다.
        </p>
      </motion.div>
    </motion.div>
  );
}
