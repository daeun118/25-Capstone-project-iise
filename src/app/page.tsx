'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Music, Users, Sparkles, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
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
      <section className="relative min-h-screen overflow-hidden flex items-center">
        {/* Stripe 그라데이션 배경 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          }}
        />

        {/* 그리드 패턴 오버레이 */}
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* 컨텐츠 */}
        <div className="relative container mx-auto px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                AI가 만드는 나만의 독서 플레이리스트
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="display-hero text-white text-center mb-8"
            >
              독서 여정을
              <br />
              음악으로 기록하세요
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-white/90 text-center max-w-2xl mx-auto mb-12"
            >
              책을 읽으며 느낀 감정들이 음악이 되어,
              <br />
              당신만의 독서 플레이리스트를 완성합니다
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/journey/new">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-xl"
                >
                  <BookOpen className="mr-2 h-6 w-6" />
                  독서 시작하기
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl"
                >
                  <Users className="mr-2 h-6 w-6" />
                  여정 둘러보기
                </Button>
              </Link>
            </motion.div>

            {/* Demo Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="card-elevated max-w-4xl mx-auto p-8"
            >
              <div className="flex items-center gap-6">
                {/* 앨범커버 미리보기 */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-12 h-12 text-white/80" />
                  </div>
                </div>

                {/* 음악 정보 */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">독서 여정의 시작</h3>
                  <p className="text-sm text-gray-500 mb-3">노인과 바다 • 헤밍웨이</p>

                  {/* 프로그레스 바 */}
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: '60%' }}
                      transition={{ delay: 1, duration: 1.5 }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>1:23</span>
                    <span>3:45</span>
                  </div>
                </div>

                {/* 재생 버튼 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  }}
                >
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              BookBeats의 특별한 경험
            </h2>
            <p className="text-lg text-gray-600">
              독서와 음악이 만나는 새로운 방식
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="card-elevated p-8 group cursor-pointer"
              >
                {/* 그라데이션 아이콘 배경 */}
                <div
                  className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold">이렇게 작동합니다</h2>
            <p className="text-lg text-gray-600">
              4단계로 완성하는 나만의 독서 플레이리스트
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-gradient text-center"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 독서 여정을 시작하세요
            </h2>
            <p className="text-lg text-white/90 mb-8">
              무료로 회원가입하고 당신만의 독서 플레이리스트를 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl"
                >
                  회원가입하기
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl"
                >
                  로그인
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
