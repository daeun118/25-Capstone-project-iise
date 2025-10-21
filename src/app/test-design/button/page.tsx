import { Button } from '@/components/ui/button';
import { Plus, Trash2, Download, Heart, Share2, Settings } from 'lucide-react';

export default function ButtonTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Button Component Showcase</h1>
        <p className="text-muted-foreground">
          shadcn/ui Button 컴포넌트의 다양한 variants와 sizes
        </p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Icon Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Icon Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="icon-sm" variant="outline">
            <Plus className="size-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Plus className="size-4" />
          </Button>
          <Button size="icon-lg" variant="outline">
            <Plus className="size-4" />
          </Button>
        </div>
      </section>

      {/* Buttons with Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Plus />
            추가하기
          </Button>
          <Button variant="destructive">
            <Trash2 />
            삭제
          </Button>
          <Button variant="outline">
            <Download />
            다운로드
          </Button>
          <Button variant="secondary">
            <Heart />
            좋아요
          </Button>
          <Button variant="ghost">
            <Share2 />
            공유
          </Button>
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Disabled State</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Default Disabled</Button>
          <Button variant="destructive" disabled>
            Destructive Disabled
          </Button>
          <Button variant="outline" disabled>
            Outline Disabled
          </Button>
          <Button variant="secondary" disabled>
            Secondary Disabled
          </Button>
        </div>
      </section>

      {/* Loading State Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading State (Custom)</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            로딩 중...
          </Button>
          <Button variant="outline" disabled>
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            처리 중
          </Button>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real Use Cases</h2>

        <div className="space-y-6">
          {/* 로그인 버튼 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">로그인 페이지</h3>
            <div className="flex gap-2">
              <Button className="flex-1">로그인</Button>
              <Button variant="outline" className="flex-1">
                회원가입
              </Button>
            </div>
          </div>

          {/* 액션 버튼 그룹 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">게시물 액션</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="size-4" />
                좋아요
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="size-4" />
                공유
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="size-4" />
                설정
              </Button>
            </div>
          </div>

          {/* 위험한 액션 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">위험한 액션</h3>
            <div className="flex gap-2">
              <Button variant="outline">취소</Button>
              <Button variant="destructive">
                <Trash2 />
                삭제하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Mode Test */}
      <section className="space-y-4 rounded-lg bg-slate-950 p-6">
        <h2 className="text-2xl font-semibold text-white">Dark Mode Test</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>
    </div>
  );
}
