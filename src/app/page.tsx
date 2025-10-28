'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { SignupDialog } from '@/components/auth/SignupDialog';
import { BookOpen, Music, Users, Sparkles, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { m } from 'framer-motion';

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: '독서 기록',
      description: '인상 깊은 구절과 감정을 기록하며 독서의 순간을 담아내세요',
    },
    {
      icon: Music,
      title: 'AI 음악 생성',
      description: '당신의 감정과 기록을 바탕으로 AI가 독서 여정을 음악으로 표현합니다',
    },
    {
      icon: Users,
      title: '커뮤니티 공유',
      description: '완성된 독서 플레이리스트를 공유하고 다른 독자들과 소통하세요',
    },
  ];

  const steps = [
    { step: '1', title: '책 선택', desc: '읽고 싶은 책을 검색하고 독서를 시작합니다' },
    { step: '2', title: '감정 기록', desc: '인상 깊은 구절과 느낀 감정을 기록합니다' },
    { step: '3', title: '음악 생성', desc: 'AI가 당신의 감정을 음악으로 표현합니다' },
    { step: '4', title: '플레이리스트 완성', desc: '완독 시 전체 여정이 담긴 플레이리스트가 완성됩니다' },
  ];

  return (
    <AppLayout>
      {/* Hero Section - Stripe Style */}
      <section className="relative min-h-[calc(100vh-4rem)] md:min-h-screen overflow-hidden flex items-center">
        {/* Stripe 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-hero" />

        {/* 그리드 패턴 오버레이 */}
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* 컨텐츠 */}
        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-32">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6 sm:mb-8"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs sm:text-sm font-medium text-white">
                AI가 만드는 나만의 독서 플레이리스트
              </span>
            </m.div>

            {/* Title */}
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-6 sm:mb-8 leading-tight"
            >
              독서 여정을
              <br />
              음악으로 기록하세요
            </m.h1>

            {/* Description */}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-white/90 text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
            >
              책을 읽으며 느낀 감정들이 음악이 되어,
              <br className="hidden sm:inline" />
              당신만의 독서 플레이리스트를 완성합니다
            </m.p>

            {/* CTA Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4"
            >
              <Link href="/journey/new" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-xl min-h-[44px]"
                >
                  <BookOpen className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  독서 시작하기
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>
              <Link href="/feed" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl min-h-[44px]"
                >
                  <Users className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  여정 둘러보기
                </Button>
              </Link>
            </m.div>

            {/* Demo Card */}
            <m.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="card-elevated max-w-4xl mx-auto p-4 sm:p-6 md:p-8"
            >
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                {/* 앨범커버 미리보기 */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-accent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />
                  </div>
                </div>

                {/* 음악 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 truncate">독서 여정의 시작</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 truncate">노인과 바다 • 헤밍웨이</p>

                  {/* 프로그레스 바 */}
                  <div className="relative h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <m.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: '60%' }}
                      transition={{ delay: 1, duration: 1.5 }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-xs text-gray-400">
                    <span>1:23</span>
                    <span>3:45</span>
                  </div>
                </div>

                {/* 재생 버튼 */}
                <m.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-accent min-h-[44px] min-w-[44px]"
                  aria-label="재생"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
                </m.button>
              </div>
            </m.div>
          </m.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              ReadTune의 특별한 경험
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              독서와 음악이 만나는 새로운 방식
            </p>
          </m.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="card-elevated p-6 sm:p-8 group cursor-pointer"
              >
                {/* 그라데이션 아이콘 배경 */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-5 sm:mb-6 flex items-center justify-center bg-gradient-accent">
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">이렇게 작동합니다</h2>
            <p className="text-base sm:text-lg text-gray-600">
              4단계로 완성하는 나만의 독서 플레이리스트
            </p>
          </m.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((item, i) => (
              <m.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center space-y-3 sm:space-y-4"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto text-white bg-gradient-accent">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-gradient text-center"
          >
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 text-white/90" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              지금 바로 독서 여정을 시작하세요
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 px-4">
              무료로 회원가입하고 당신만의 독서 플레이리스트를 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl min-h-[44px]"
                onClick={() => setSignupOpen(true)}
              >
                회원가입하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl min-h-[44px]"
                onClick={() => setLoginOpen(true)}
              >
                로그인
              </Button>
            </div>
          </m.div>
        </div>
      </section>

      {/* Auth Dialogs */}
      <LoginDialog 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog 
        open={signupOpen} 
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </AppLayout>
  );
}
