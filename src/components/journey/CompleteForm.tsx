'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, CheckCircle } from 'lucide-react';
import { Star } from 'lucide-react';

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
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>독서 완료</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>별점</Label>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    disabled={isLoading}
                  >
                    <Star
                      className={`size-8 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-2xl font-bold">{rating}.0</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oneLiner">한줄평</Label>
            <Textarea
              id="oneLiner"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="이 책을 한 문장으로 표현한다면?"
              rows={2}
              maxLength={100}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {oneLiner.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">감상평</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="책을 읽고 느낀 점을 자유롭게 작성하세요..."
              rows={8}
              maxLength={2000}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/2000
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
          )}
          <Button type="submit" disabled={!oneLiner.trim() || !review.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                완료 처리 중...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 size-4" />
                독서 완료
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
