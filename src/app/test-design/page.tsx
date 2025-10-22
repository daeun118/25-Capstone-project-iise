'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FilterBar } from '@/components/common/FilterBar';
import { BookOpen, Heart, Search, Music, Star, Mail, MessageSquare, Plus } from 'lucide-react';

// Error test component
function ErrorComponent(): React.ReactElement {
  return (() => { throw new Error('테스트 에러 발생!');
  })();
}

export default function TestDesignPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showError, setShowError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Component Showcase</h1>
          <p className="text-muted-foreground">모든 컴포넌트를 한 페이지에서 확인</p>
        </div>

        {/* Tabs for Categories */}
        <Tabs defaultValue="ui" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ui">UI 기본</TabsTrigger>
            <TabsTrigger value="form">폼</TabsTrigger>
            <TabsTrigger value="layout">레이아웃</TabsTrigger>
            <TabsTrigger value="common">공통</TabsTrigger>
          </TabsList>

          {/* UI 기본 컴포넌트 */}
          <TabsContent value="ui" className="space-y-8">
            {/* Button */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Button</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Plus className="size-4" /></Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Badge */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Badge</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Card */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Card</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>노인과 바다</CardTitle>
                    <CardDescription>어니스트 헤밍웨이</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="size-4" />
                      <span>생성된 곡: 5개</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">계속 읽기</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>1984</CardTitle>
                    <CardDescription>조지 오웰</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">상세보기</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <Badge className="w-fit">읽는 중</Badge>
                    <CardTitle className="mt-2">해리 포터</CardTitle>
                    <CardDescription>J.K. 롤링</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      마법사 해리 포터의 모험
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">독서 시작</Button>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* 폼 컴포넌트 */}
          <TabsContent value="form" className="space-y-8">
            {/* Input */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Input</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="example@email.com" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search">검색</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input id="search" type="search" placeholder="도서 검색..." className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="disabled">비활성화</Label>
                    <Input id="disabled" placeholder="수정할 수 없습니다" disabled />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Textarea */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Textarea</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="quote">인상 깊은 구절</Label>
                    <Textarea id="quote" placeholder="책에서 인상 깊었던 구절을 입력하세요..." rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review">감상평</Label>
                    <Textarea id="review" placeholder="책을 읽고 느낀 점을 자유롭게 작성하세요..." rows={6} />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* 레이아웃 컴포넌트 */}
          <TabsContent value="layout" className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Layout Components</h2>
              <Card>
                <CardHeader>
                  <CardTitle>AppLayout, Header, Footer</CardTitle>
                  <CardDescription>
                    전체 레이아웃 구조는 별도 페이지에서 확인할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Header</h3>
                      <p className="text-sm text-muted-foreground">
                        로고, 네비게이션, 검색, 사용자 메뉴를 포함하는 상단 헤더
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">AppLayout</h3>
                      <p className="text-sm text-muted-foreground">
                        Header + Content + Footer로 구성된 기본 레이아웃 래퍼
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Footer</h3>
                      <p className="text-sm text-muted-foreground">
                        서비스 링크, 법적 고지, 소셜 링크를 포함하는 하단 푸터
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => window.location.href = '/test-design/layout'}>
                    레이아웃 페이지 보기
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </TabsContent>

          {/* 공통 컴포넌트 */}
          <TabsContent value="common" className="space-y-8">
            {/* LoadingSpinner */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">LoadingSpinner</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-4">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm text-muted-foreground">Small</p>
                    </div>
                    <div className="text-center space-y-4">
                      <LoadingSpinner size="md" text="로딩 중..." />
                      <p className="text-sm text-muted-foreground">Medium (with message)</p>
                    </div>
                    <div className="text-center space-y-4">
                      <LoadingSpinner size="lg" />
                      <p className="text-sm text-muted-foreground">Large</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* EmptyState */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">EmptyState</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <EmptyState
                      icon={BookOpen}
                      title="독서 여정이 없습니다"
                      description="새로운 책으로 독서를 시작해보세요."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
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
              </div>
            </section>

            {/* Pagination */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Pagination</h2>
              <Card>
                <CardHeader>
                  <CardTitle>페이지네이션</CardTitle>
                  <CardDescription>현재 페이지: {currentPage}</CardDescription>
                </CardHeader>
                <CardContent className="py-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={20}
                    onPageChange={setCurrentPage}
                  />
                </CardContent>
              </Card>
            </section>

            {/* ErrorBoundary */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">ErrorBoundary</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>정상 동작</CardTitle>
                    <CardDescription>에러가 없는 컴포넌트</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ErrorBoundary>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm">✅ 정상적으로 렌더링됩니다</p>
                      </div>
                    </ErrorBoundary>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>에러 캐치</CardTitle>
                    <CardDescription>에러 발생 시 표시</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ErrorBoundary>
                      {showError && <ErrorComponent />}
                      {!showError && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            버튼을 클릭하면 에러가 발생합니다
                          </p>
                          <Button onClick={() => setShowError(true)} variant="destructive" size="sm">
                            에러 발생시키기
                          </Button>
                        </div>
                      )}
                    </ErrorBoundary>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ConfirmDialog */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">ConfirmDialog</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>기본 확인 다이얼로그</CardTitle>
                    <CardDescription>일반 확인 동작</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setConfirmOpen(true)}>
                      확인 다이얼로그 열기
                    </Button>
                    <ConfirmDialog
                      open={confirmOpen}
                      onOpenChange={setConfirmOpen}
                      title="변경사항 저장"
                      description="작성한 내용을 저장하시겠습니까?"
                      confirmText="저장"
                      cancelText="취소"
                      onConfirm={() => alert('저장되었습니다!')}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>위험 동작 확인</CardTitle>
                    <CardDescription>삭제 등 위험한 동작</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setDeleteConfirmOpen(true)} variant="destructive">
                      삭제 다이얼로그 열기
                    </Button>
                    <ConfirmDialog
                      open={deleteConfirmOpen}
                      onOpenChange={setDeleteConfirmOpen}
                      title="게시물 삭제"
                      description="이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                      confirmText="삭제"
                      cancelText="취소"
                      variant="destructive"
                      onConfirm={() => alert('삭제되었습니다!')}
                    />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* FilterBar */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">FilterBar</h2>
              <Card>
                <CardHeader>
                  <CardTitle>게시물 필터</CardTitle>
                  <CardDescription>
                    카테고리: {selectedCategory} | 정렬: {selectedSort}
                    {searchValue && ` | 검색: "${searchValue}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">검색 포함</h3>
                    <FilterBar
                      categories={[
                        { value: 'all', label: '전체' },
                        { value: 'novel', label: '소설' },
                        { value: 'essay', label: '에세이' },
                        { value: 'self-improvement', label: '자기계발' },
                        { value: 'tech', label: '기술/IT' },
                      ]}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      sortOptions={[
                        { value: 'latest', label: '최신순' },
                        { value: 'popular', label: '인기순' },
                        { value: 'oldest', label: '오래된순' },
                      ]}
                      selectedSort={selectedSort}
                      onSortChange={setSelectedSort}
                      showSearch
                      searchValue={searchValue}
                      onSearchChange={setSearchValue}
                      searchPlaceholder="게시물 검색..."
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">검색 없이</h3>
                    <FilterBar
                      categories={[
                        { value: 'all', label: '전체' },
                        { value: 'reading', label: '읽는 중' },
                        { value: 'completed', label: '완독' },
                      ]}
                      selectedCategory="all"
                      sortOptions={[
                        { value: 'latest', label: '최신순' },
                        { value: 'title', label: '제목순' },
                      ]}
                      selectedSort="latest"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>

        {/* Sample Posts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">샘플 게시물 카드</h2>
          <div className="grid gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
                  <div className="flex-1">
                    <CardTitle>노인과 바다 - 독서 플레이리스트</CardTitle>
                    <CardDescription className="mt-2">
                      책벌레123 · 2일 전
                    </CardDescription>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  바다와 노인의 싸움을 통해 느낀 인간의 존엄성과 용기.
                  책을 읽으며 생성된 음악들이 독서 경험을 더욱 풍부하게 만들어주었습니다.
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Music className="size-4" />
                    <span>5곡</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    <span>24</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="size-4" />
                    <span>8</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="ghost" size="sm"><Heart className="size-4" />좋아요</Button>
                <Button variant="ghost" size="sm"><MessageSquare className="size-4" />댓글</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
