'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Search, Eye, EyeOff, Lock, User, Phone, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function InputTestPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Input Component Showcase</h1>
        <p className="text-muted-foreground">
          shadcn/ui Input 컴포넌트의 다양한 사용 예시
        </p>
      </div>

      {/* Basic Input */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Input</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="basic">기본 입력</Label>
            <Input id="basic" placeholder="텍스트를 입력하세요" />
          </div>
        </div>
      </section>

      {/* Input Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Types</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input id="text" type="text" placeholder="일반 텍스트" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-type">Email</Label>
            <Input id="email-type" type="email" placeholder="example@email.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-type">Password</Label>
            <Input id="password-type" type="password" placeholder="비밀번호" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Number</Label>
            <Input id="number" type="number" placeholder="숫자" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tel">Tel</Label>
            <Input id="tel" type="tel" placeholder="010-1234-5678" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" type="url" placeholder="https://example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" />
          </div>
        </div>
      </section>

      {/* Input with Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input with Icons</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email-icon">이메일 (왼쪽 아이콘)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="email-icon" type="email" placeholder="이메일" className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-icon">검색 (왼쪽 아이콘)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="search-icon"
                type="search"
                placeholder="도서 검색..."
                className="pl-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-toggle">비밀번호 (토글 버튼)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password-toggle"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Disabled State</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="disabled">비활성화 입력</Label>
            <Input id="disabled" placeholder="수정할 수 없습니다" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disabled-value">비활성화 (값 있음)</Label>
            <Input id="disabled-value" value="읽기 전용 값" disabled />
          </div>
        </div>
      </section>

      {/* Error State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error State</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="error-email">이메일 (에러)</Label>
            <Input
              id="error-email"
              type="email"
              placeholder="example@email.com"
              aria-invalid="true"
            />
            <p className="text-sm text-destructive">유효한 이메일 주소를 입력하세요</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="error-password">비밀번호 (에러)</Label>
            <Input
              id="error-password"
              type="password"
              placeholder="비밀번호"
              aria-invalid="true"
            />
            <p className="text-sm text-destructive">비밀번호는 8자 이상이어야 합니다</p>
          </div>
        </div>
      </section>

      {/* File Input */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">File Input</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="file">파일 선택</Label>
            <Input id="file" type="file" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-multiple">다중 파일 선택</Label>
            <Input id="file-multiple" type="file" multiple />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-image">이미지만 선택</Label>
            <Input id="file-image" type="file" accept="image/*" />
          </div>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real Use Cases</h2>

        <div className="space-y-8 max-w-md">
          {/* 로그인 폼 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">로그인 폼</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="login-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="비밀번호"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full">로그인</Button>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">회원가입 폼</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="signup-name">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="홍길동"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">전화번호</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="8자 이상"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="signup-password-confirm"
                    type="password"
                    placeholder="비밀번호 재입력"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full">회원가입</Button>
            </div>
          </div>

          {/* 도서 검색 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">도서 검색</h3>
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="book-search">책 제목 또는 저자</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="book-search"
                    type="search"
                    placeholder="노인과 바다"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full">
                <Search className="size-4" />
                검색
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Mode Test */}
      <section className="space-y-4 rounded-lg bg-slate-950 p-6">
        <h2 className="text-2xl font-semibold text-white">Dark Mode Test</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="dark-email" className="text-white">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="dark-email"
                type="email"
                placeholder="example@email.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dark-search" className="text-white">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="dark-search"
                type="search"
                placeholder="검색어 입력"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
