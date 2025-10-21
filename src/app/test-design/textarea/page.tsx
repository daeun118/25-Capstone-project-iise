'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, Edit, Mail } from 'lucide-react';
import { useState } from 'react';

export default function TextareaTestPage() {
  const [comment, setComment] = useState('');
  const [review, setReview] = useState('');
  const charLimit = 500;

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Textarea Component Showcase</h1>
        <p className="text-muted-foreground">
          shadcn/ui Textarea 컴포넌트의 다양한 사용 예시
        </p>
      </div>

      {/* Basic Textarea */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Textarea</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="basic">기본 텍스트 영역</Label>
            <Textarea id="basic" placeholder="여러 줄의 텍스트를 입력하세요..." />
          </div>
        </div>
      </section>

      {/* Different Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Different Sizes (Rows)</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="small">작은 크기 (3 rows)</Label>
            <Textarea id="small" rows={3} placeholder="3줄 높이..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medium">중간 크기 (5 rows)</Label>
            <Textarea id="medium" rows={5} placeholder="5줄 높이..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="large">큰 크기 (10 rows)</Label>
            <Textarea id="large" rows={10} placeholder="10줄 높이..." />
          </div>
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Disabled State</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="disabled">비활성화 텍스트 영역</Label>
            <Textarea
              id="disabled"
              placeholder="수정할 수 없습니다"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disabled-value">비활성화 (값 있음)</Label>
            <Textarea
              id="disabled-value"
              value="이 텍스트는 읽기 전용입니다."
              disabled
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Error State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error State</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="error">에러 상태</Label>
            <Textarea
              id="error"
              placeholder="필수 입력 항목입니다"
              aria-invalid="true"
              rows={4}
            />
            <p className="text-sm text-destructive">
              이 필드는 필수 입력 항목입니다. 최소 10자 이상 입력해주세요.
            </p>
          </div>
        </div>
      </section>

      {/* With Character Counter */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">With Character Counter</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="counter">댓글 작성 (최대 500자)</Label>
            <Textarea
              id="counter"
              placeholder="댓글을 입력하세요..."
              rows={4}
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= charLimit) {
                  setComment(e.target.value);
                }
              }}
              maxLength={charLimit}
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {comment.length} / {charLimit}자
              </span>
              {comment.length >= charLimit && (
                <span className="text-destructive">최대 글자 수에 도달했습니다</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* With Icon Label */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">With Icon Label</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="icon-comment" className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              댓글
            </Label>
            <Textarea
              id="icon-comment"
              placeholder="댓글을 입력하세요..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon-memo" className="flex items-center gap-2">
              <FileText className="size-4" />
              메모
            </Label>
            <Textarea
              id="icon-memo"
              placeholder="메모를 입력하세요..."
              rows={5}
            />
          </div>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real Use Cases</h2>

        <div className="space-y-8 max-w-2xl">
          {/* 독서 기록 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">독서 기록 추가</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="quote" className="flex items-center gap-2">
                  <Edit className="size-4" />
                  인상 깊은 구절
                </Label>
                <Textarea
                  id="quote"
                  placeholder="책에서 인상 깊었던 구절을 입력하세요..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">메모</Label>
                <Textarea
                  id="memo"
                  placeholder="구절에 대한 생각이나 느낌을 기록하세요..."
                  rows={3}
                />
              </div>

              <Button className="w-full">
                <FileText className="size-4" />
                기록 저장
              </Button>
            </div>
          </div>

          {/* 완독 후 감상평 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">완독 후 감상평</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="one-liner">한줄평 (최대 100자)</Label>
                <Textarea
                  id="one-liner"
                  placeholder="이 책을 한 줄로 표현한다면?"
                  rows={2}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  간단하고 인상적인 한 줄로 표현해보세요
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-review">감상평 (최대 2000자)</Label>
                <Textarea
                  id="full-review"
                  placeholder="책을 읽고 느낀 점, 생각, 인상적인 부분 등을 자유롭게 작성하세요..."
                  rows={10}
                  value={review}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) {
                      setReview(e.target.value);
                    }
                  }}
                  maxLength={2000}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {review.length} / 2000자
                  </span>
                  <span className="text-muted-foreground">
                    {review.length >= 100 ? '✓ 충분한 분량입니다' : '최소 100자 이상 작성을 권장합니다'}
                  </span>
                </div>
              </div>

              <Button className="w-full">완독 기록 저장</Button>
            </div>
          </div>

          {/* 댓글 작성 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">댓글 작성</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="comment-text" className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  댓글
                </Label>
                <Textarea
                  id="comment-text"
                  placeholder="이 게시물에 대한 댓글을 작성하세요..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">취소</Button>
                <Button className="flex-1">댓글 작성</Button>
              </div>
            </div>
          </div>

          {/* 문의하기 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">문의하기</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="inquiry-title">제목</Label>
                <Textarea
                  id="inquiry-title"
                  placeholder="문의 제목을 입력하세요"
                  rows={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiry-content" className="flex items-center gap-2">
                  <Mail className="size-4" />
                  문의 내용
                </Label>
                <Textarea
                  id="inquiry-content"
                  placeholder="문의하실 내용을 자세히 작성해주세요..."
                  rows={8}
                />
              </div>

              <Button className="w-full">
                <Mail className="size-4" />
                문의 제출
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Mode Test */}
      <section className="space-y-4 rounded-lg bg-slate-950 p-6">
        <h2 className="text-2xl font-semibold text-white">Dark Mode Test</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="dark-basic" className="text-white">
              기본 텍스트 영역
            </Label>
            <Textarea
              id="dark-basic"
              placeholder="다크 모드에서의 텍스트 영역..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dark-disabled" className="text-white">
              비활성화 상태
            </Label>
            <Textarea
              id="dark-disabled"
              placeholder="비활성화된 텍스트 영역"
              rows={3}
              disabled
            />
          </div>
        </div>
      </section>
    </div>
  );
}
