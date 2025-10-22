'use client';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Inbox, Search } from 'lucide-react';
import { useState } from 'react';

export default function CommonComponentsTestPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Common Components Showcase</h1>
        <p className="text-muted-foreground">
          공통 유틸리티 컴포넌트 테스트 페이지
        </p>
      </div>

      {/* LoadingSpinner */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">LoadingSpinner</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Small</CardTitle>
              <CardDescription>작은 크기</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medium (Default)</CardTitle>
              <CardDescription>중간 크기 (기본값)</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Large</CardTitle>
              <CardDescription>큰 크기</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>With Message</CardTitle>
            <CardDescription>메시지 포함</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <LoadingSpinner size="md" text="로딩 중입니다..." />
          </CardContent>
        </Card>
      </section>

      {/* EmptyState */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">EmptyState</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 빈 상태</CardTitle>
              <CardDescription>아이콘과 텍스트만</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={BookOpen}
                title="독서 여정이 없습니다"
                description="새로운 책으로 독서를 시작해보세요."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>액션 버튼 포함</CardTitle>
              <CardDescription>버튼으로 액션 유도</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Search}
                title="검색 결과가 없습니다"
                description="다른 키워드로 검색해보세요."
                action={{
                  label: '다시 검색',
                  onClick: () => alert('검색 다이얼로그 열기'),
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>아이콘 없음</CardTitle>
              <CardDescription>간단한 메시지만</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="데이터를 불러올 수 없습니다"
                description="잠시 후 다시 시도해주세요."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>보관함 빈 상태</CardTitle>
              <CardDescription>스크랩한 게시물 없음</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Inbox}
                title="스크랩한 게시물이 없습니다"
                description="마음에 드는 게시물을 스크랩해보세요."
                action={{
                  label: '피드 둘러보기',
                  onClick: () => alert('피드로 이동'),
                }}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pagination */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Pagination</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>적은 페이지 (5페이지)</CardTitle>
              <CardDescription>모든 페이지 번호 표시</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
              <p className="text-sm text-center text-muted-foreground mt-4">
                현재 페이지: {currentPage}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>많은 페이지 (20페이지)</CardTitle>
              <CardDescription>... 으로 축약 표시</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <Pagination
                currentPage={currentPage}
                totalPages={20}
                onPageChange={setCurrentPage}
              />
              <p className="text-sm text-center text-muted-foreground mt-4">
                현재 페이지: {currentPage} / 20
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>매우 많은 페이지 (100페이지)</CardTitle>
              <CardDescription>긴 페이지네이션</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <Pagination
                currentPage={currentPage}
                totalPages={100}
                onPageChange={setCurrentPage}
              />
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="text-sm text-primary hover:underline"
                >
                  첫 페이지
                </button>
                <button
                  onClick={() => setCurrentPage(50)}
                  className="text-sm text-primary hover:underline"
                >
                  50페이지
                </button>
                <button
                  onClick={() => setCurrentPage(100)}
                  className="text-sm text-primary hover:underline"
                >
                  마지막 페이지
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real Use Cases</h2>
        <div className="space-y-6">
          {/* 로딩 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>데이터 로딩 중</CardTitle>
              <CardDescription>API 응답 대기</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <LoadingSpinner size="lg" text="독서 여정을 불러오는 중..." />
            </CardContent>
          </Card>

          {/* 빈 책장 */}
          <Card>
            <CardHeader>
              <CardTitle>빈 책장</CardTitle>
              <CardDescription>독서 여정이 없을 때</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={BookOpen}
                title="아직 시작한 독서 여정이 없습니다"
                description="첫 책을 선택하고 당신만의 독서 플레이리스트를 만들어보세요."
                action={{
                  label: '도서 검색하기',
                  onClick: () => alert('도서 검색 다이얼로그 열기'),
                }}
              />
            </CardContent>
          </Card>
        </div>
      </section>


    </div>
  );
}
