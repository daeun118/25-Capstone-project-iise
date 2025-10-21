import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, MessageSquare, Share2, Star, Music, Calendar, User } from 'lucide-react';

export default function CardTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Card Component Showcase</h1>
        <p className="text-muted-foreground">
          shadcn/ui Card 컴포넌트의 다양한 사용 예시
        </p>
      </div>

      {/* Basic Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Card</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
              <CardDescription>CardDescription 영역입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content 영역입니다. 여기에 주요 내용이 들어갑니다.</p>
            </CardContent>
            <CardFooter>
              <Button>액션 버튼</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer 없는 카드</CardTitle>
              <CardDescription>CardFooter를 생략할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <p>이 카드는 Footer가 없습니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description 없는 카드</CardTitle>
            </CardHeader>
            <CardContent>
              <p>CardDescription을 생략할 수도 있습니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p>Header를 생략하고 Content만 사용할 수도 있습니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Book Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Book Cards (독서 카드)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="size-10 text-primary" />
                <Badge>읽는 중</Badge>
              </div>
              <CardTitle className="mt-4">노인과 바다</CardTitle>
              <CardDescription>어니스트 헤밍웨이</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  바다와 노인의 싸움을 통해 인간의 존엄성과 용기를 그린 작품
                </p>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">외국소설</Badge>
                  <Badge variant="outline">고전</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1">계속 읽기</Button>
              <Button variant="outline" size="icon">
                <Heart className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="size-10 text-primary" />
                <Badge variant="secondary">완독</Badge>
              </div>
              <CardTitle className="mt-4">1984</CardTitle>
              <CardDescription>조지 오웰</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="size-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm mt-2">
                  전체주의 사회의 공포를 생생하게 그려낸 걸작
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" variant="outline">상세보기</Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="size-10 text-primary" />
                <Badge variant="outline">검색 결과</Badge>
              </div>
              <CardTitle className="mt-4">해리 포터와 마법사의 돌</CardTitle>
              <CardDescription>J.K. 롤링</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  마법사 해리 포터의 모험이 시작되는 첫 번째 이야기
                </p>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">판타지</Badge>
                  <Badge variant="outline">청소년</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">독서 시작</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Journey Cards (독서 여정)</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center">
                    <BookOpen className="size-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">노인과 바다</CardTitle>
                    <CardDescription>어니스트 헤밍웨이</CardDescription>
                  </div>
                </div>
                <Badge>읽는 중</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Music className="size-4 text-muted-foreground" />
                  <span>생성된 곡: <strong>5개</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>시작일: 2025-10-15</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  마지막 업데이트: 2일 전
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1">계속 읽기</Button>
              <Button variant="outline" className="flex-1">상세보기</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-secondary/50 rounded flex items-center justify-center">
                    <BookOpen className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">1984</CardTitle>
                    <CardDescription>조지 오웰</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">완독</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="size-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Music className="size-4 text-muted-foreground" />
                  <span>플레이리스트: <strong>8곡</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>완독일: 2025-10-10</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" variant="outline">플레이리스트</Button>
              <Button className="flex-1" variant="outline">공유하기</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Post Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Post Cards (게시물)</h2>
        <div className="grid gap-6 max-w-2xl">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-20 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>노인과 바다 - 독서 플레이리스트</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>책벌레123</span>
                      <span className="text-xs">·</span>
                      <span>2일 전</span>
                    </div>
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
              <Button variant="ghost" size="sm">
                <Heart className="size-4" />
                좋아요
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="size-4" />
                댓글
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="size-4" />
                공유
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>1984 - 디스토피아의 경고</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>독서광456</span>
                      <span className="text-xs">·</span>
                      <span>1주 전</span>
                    </div>
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="size-4 fill-yellow-500 text-yellow-500" />
                    ))}
                    <Star className="size-4 text-yellow-500" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                전체주의 사회의 공포를 생생하게 그려낸 걸작.
                현대 사회에 던지는 경고의 메시지가 여전히 유효하다는 것을 느꼈습니다.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Music className="size-4" />
                  <span>7곡</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="size-4" />
                  <span>56</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="size-4" />
                  <span>15</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="size-4" />
                좋아요
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="size-4" />
                댓글
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="size-4" />
                공유
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Stats Cards (통계)</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>읽는 중</CardDescription>
              <CardTitle className="text-4xl">3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">진행 중인 책</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>완독</CardDescription>
              <CardTitle className="text-4xl">12</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">완독한 책</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>생성된 음악</CardDescription>
              <CardTitle className="text-4xl">47</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">총 플레이리스트</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>평균 별점</CardDescription>
              <CardTitle className="text-4xl">4.2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">완독 책 평균</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dark Mode Test */}
      <section className="space-y-4 rounded-lg bg-slate-950 p-6">
        <h2 className="text-2xl font-semibold text-white">Dark Mode Test</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>다크 모드 카드</CardTitle>
              <CardDescription>다크 모드에서의 카드 표시</CardDescription>
            </CardHeader>
            <CardContent>
              <p>다크 모드에서 카드가 어떻게 보이는지 확인하세요.</p>
            </CardContent>
            <CardFooter>
              <Button>액션 버튼</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>호버 효과</CardTitle>
              <CardDescription>마우스를 올려보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p>카드에 마우스를 올리면 그림자 효과가 나타납니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
