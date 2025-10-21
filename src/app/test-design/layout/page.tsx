import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Music, Star } from 'lucide-react';

export default function LayoutTestPage() {
  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Layout Component Showcase</h1>
          <p className="text-muted-foreground">
            AppLayout, Header, Footer 컴포넌트 테스트 페이지
          </p>
        </div>

        {/* Layout Info */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Layout 구조</h2>
          <Card>
            <CardHeader>
              <CardTitle>AppLayout 컴포넌트</CardTitle>
              <CardDescription>
                Header, Main Content, Footer로 구성된 기본 레이아웃
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">구성 요소:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Header: 로고, 네비게이션, 검색, 다크모드 토글, 사용자 메뉴</li>
                  <li>Main Content: 페이지 콘텐츠 영역 (현재 보고 있는 영역)</li>
                  <li>Footer: 서비스 링크, 법적 고지, 소셜 링크</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">기능:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Sticky Header: 스크롤 시 상단 고정</li>
                  <li>반응형 네비게이션: 모바일에서 숨김</li>
                  <li>다크모드 지원</li>
                  <li>드롭다운 사용자 메뉴</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sample Content */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">샘플 콘텐츠</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="size-10 text-primary" />
                    <Badge>{i % 2 === 0 ? '읽는 중' : '완독'}</Badge>
                  </div>
                  <CardTitle className="mt-4">샘플 도서 {i}</CardTitle>
                  <CardDescription>저자명</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {i % 2 === 0 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Music className="size-4 text-muted-foreground" />
                        <span>생성된 곡: {i * 2}개</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-4 ${
                              star <= 4 ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scroll Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">스크롤 테스트</h2>
          <Card>
            <CardHeader>
              <CardTitle>긴 콘텐츠 영역</CardTitle>
              <CardDescription>
                아래로 스크롤하면 Header가 상단에 고정되는 것을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <p key={i} className="text-muted-foreground">
                  {i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Footer 안내 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Footer 확인</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                이 페이지의 맨 아래로 스크롤하면 Footer를 확인할 수 있습니다.
                Footer에는 서비스 링크, 지원 링크, 법적 고지, 소셜 미디어 링크가 포함되어 있습니다.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
