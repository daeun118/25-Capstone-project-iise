'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Star, MessageSquare, Edit3, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface CompleteFormProps {
  onSubmit: (data: CompleteFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface CompleteFormData {
  rating: number;
  oneLiner: string;
  review: string;
}

const ratingLabels: Record<number, string> = {
  1: '별로예요',
  2: '그저 그래요',
  3: '괜찮아요',
  4: '좋아요!',
  5: '최고예요!'
};

export function CompleteForm({ onSubmit, onCancel }: CompleteFormProps) {
  const [rating, setRating] = useState(5);
  const [oneLiner, setOneLiner] = useState('');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({ rating, oneLiner, review });
    } catch (err) {
      console.error('Failed to complete journey:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = oneLiner.trim() && review.trim() && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          독서 감상을 남겨주세요
        </h2>
        <p className="text-muted-foreground">
          입력하신 내용을 바탕으로 최종 음악(vFinal)이 생성됩니다
        </p>
      </div>

      {/* Interactive Rating */}
      <div className="card-elevated p-8 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">이 책은 몇 점인가요?</h3>
          <p className="text-sm text-muted-foreground">별을 클릭해서 평가해주세요</p>
        </div>

        {/* Large Interactive Stars */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={isLoading}
              className="group relative transition-transform hover:scale-125 active:scale-110 disabled:opacity-50"
            >
              <Star
                className={`w-12 h-12 transition-all ${
                  star <= rating
                    ? 'fill-amber-500 text-amber-500 drop-shadow-lg'
                    : 'text-gray-300 group-hover:text-amber-400'
                }`}
              />

              {/* Tooltip on Hover */}
              {hoveredStar === star && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {ratingLabels[star]}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected Rating Display */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{rating}.0</span>
          </div>
        </div>
      </div>

      {/* One-liner Input (Enhanced) */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              한줄평 <span className="text-red-500">*</span>
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {oneLiner.length}/100
          </span>
        </div>

        {/* Placeholder Examples */}
        {!oneLiner && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="italic">예: "인생책을 만났다", "다시 읽고 싶은 책"</p>
          </div>
        )}

        <Textarea
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="이 책을 한 문장으로 표현한다면?"
          rows={2}
          maxLength={100}
          disabled={isLoading}
          className="resize-none text-lg"
        />

        {/* Character Count Progress */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-accent transition-all"
            style={{ width: `${(oneLiner.length / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Review Input (Enhanced with Tabs) */}
      <div className="card-elevated p-6 space-y-4">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">
              <Edit3 className="w-4 h-4 mr-2" />
              작성하기
            </TabsTrigger>
            <TabsTrigger value="guide">
              <HelpCircle className="w-4 h-4 mr-2" />
              작성 가이드
            </TabsTrigger>
          </TabsList>

          {/* Write Tab */}
          <TabsContent value="write" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                감상평 <span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {review.length}/2000
              </span>
            </div>

            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="책을 읽고 느낀 점을 자유롭게 작성하세요..."
              rows={10}
              maxLength={2000}
              disabled={isLoading}
              className="resize-none"
            />

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-accent transition-all"
                style={{ width: `${(review.length / 2000) * 100}%` }}
              />
            </div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-3">
            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-primary">💡 이런 내용을 담아보세요:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>가장 인상 깊었던 장면이나 구절</li>
                <li>책을 읽으며 느낀 감정의 변화</li>
                <li>책이 내게 준 영향이나 깨달음</li>
                <li>추천하고 싶은 독자층</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 md:flex-none md:w-auto"
          >
            취소
          </Button>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={!canSubmit}
          className="flex-1 md:flex-auto relative overflow-hidden group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-warm-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="font-bold">독서 완료 🎉</span>
              </div>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
