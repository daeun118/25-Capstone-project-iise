'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, CheckCircle, Sparkles, Trophy, PartyPopper } from 'lucide-react';
import { Star } from 'lucide-react';
import { m } from 'framer-motion';

interface CompleteFormProps {
  onSubmit: (data: CompleteFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface CompleteFormData {
  rating: number;
  oneLiner: string;
  review: string;
}

export function CompleteForm({ onSubmit, onCancel }: CompleteFormProps) {
  const [rating, setRating] = useState(5);
  const [oneLiner, setOneLiner] = useState('');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Celebration Background */}
      <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706, #ea580c)',
          }}
        />
      </div>

      <Card className="border-2 shadow-2xl overflow-hidden">
        {/* Gold Gradient Top Border */}
        <div
          className="h-1.5"
          style={{
            background: 'linear-gradient(90deg, #f59e0b, #eab308, #f59e0b)',
          }}
        />

        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              {/* Celebration Icon */}
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-full flex items-center justify-center relative"
              >
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  }}
                />
                <Trophy className="w-7 h-7 text-amber-600 relative z-10" />
              </m.div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  독서 완료
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  축하합니다! 여정을 완주하셨습니다
                </p>
              </div>
              <m.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="w-6 h-6 text-amber-500" />
              </m.div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Rating Section with Enhanced Animation */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label className="text-base font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                별점
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <m.button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      disabled={isLoading}
                      className="focus:outline-none relative group"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {/* Glow effect for selected stars */}
                      {star <= rating && (
                        <m.div
                          className="absolute inset-0 rounded-full blur-xl"
                          style={{
                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%)',
                          }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <Star
                        className={`size-10 relative z-10 transition-all duration-300 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'text-gray-300 group-hover:text-amber-300 group-hover:scale-110'
                        }`}
                      />
                    </m.button>
                  ))}
                </div>
                <m.div
                  className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                  key={rating}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {rating}.0
                </m.div>
              </div>
            </m.div>

            {/* One-liner Section */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="oneLiner" className="text-base font-semibold flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-amber-500" />
                한줄평
                <span className="text-sm font-normal text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="oneLiner"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder="이 책을 한 문장으로 표현한다면?"
                  rows={2}
                  maxLength={100}
                  required
                  disabled={isLoading}
                  className="resize-none bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-medium">
                  {oneLiner.length}/100
                </span>
              </div>
            </m.div>

            {/* Review Section */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="review" className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                감상평
                <span className="text-sm font-normal text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="책을 읽고 느낀 점을 자유롭게 작성하세요...&#10;&#10;• 가장 인상 깊었던 장면이나 문장&#10;• 이 책이 당신에게 준 영향&#10;• 추천하고 싶은 독자층"
                  rows={8}
                  maxLength={2000}
                  required
                  disabled={isLoading}
                  className="resize-none bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all leading-relaxed"
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-medium">
                  {review.length}/2000
                </span>
              </div>
            </m.div>
          </CardContent>

          <CardFooter className="flex gap-3 justify-end pt-6">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={isLoading}
                className="px-6 border-2 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
              >
                취소
              </Button>
            )}
            <m.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                disabled={!oneLiner.trim() || !review.trim() || isLoading}
                className="px-8 h-12 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
                style={{
                  background: isLoading 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(135deg, #f59e0b, #ea580c, #d97706)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    완료 처리 중...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 size-5" />
                    독서 완료
                  </>
                )}
              </Button>
            </m.div>
          </CardFooter>
        </form>
      </Card>
    </m.div>
  );
}
