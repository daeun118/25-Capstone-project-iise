'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ProfileEditDialog } from '@/components/user/ProfileEditDialog';
import { StatsDashboard } from '@/components/user/StatsDashboard';
import { User, Mail, Calendar, Edit, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      } else {
        toast.error(data.error || '프로필을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('프로필을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdated = (newNickname: string) => {
    if (profile) {
      setProfile({ ...profile, nickname: newNickname });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'kakao':
        return 'Kakao';
      case 'email':
        return '이메일';
      default:
        return provider;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <m.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold">마이페이지</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/my/bookmarks')}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              보관함
            </Button>
          </m.div>

          {/* Profile Card - Gradient Hero */}
          <m.div
            className="relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* 그라데이션 배경 */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              }}
            />

            {/* 콘텐츠 */}
            <div className="relative z-10 p-8">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 animate-pulse" />
                    <div className="space-y-3 flex-1">
                      <div className="h-8 w-48 bg-white/20 animate-pulse rounded" />
                      <div className="h-5 w-64 bg-white/20 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-white/10 backdrop-blur-sm rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : profile ? (
                <>
                  {/* 상단: 아바타 + 기본 정보 */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                      {/* 아바타 */}
                      <m.div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
                          color: '#6366f1',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {profile.nickname.charAt(0).toUpperCase()}
                      </m.div>

                      {/* 닉네임 + 이메일 */}
                      <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {profile.nickname}
                        </h2>
                        <p className="text-white/80 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </p>
                      </m.div>
                    </div>

                    {/* 수정 버튼 */}
                    <m.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditDialogOpen(true)}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        프로필 수정
                      </Button>
                    </m.div>
                  </div>

                  {/* 하단: 계정 정보 카드들 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 로그인 방식 */}
                    <m.div
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">로그인 방식</p>
                          <p className="text-white font-semibold text-lg">
                            {getProviderName(profile.auth_provider)}
                          </p>
                        </div>
                      </div>
                    </m.div>

                    {/* 가입일 */}
                    <m.div
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                        >
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">가입일</p>
                          <p className="text-white font-semibold text-lg">
                            {formatDate(profile.created_at)}
                          </p>
                        </div>
                      </div>
                    </m.div>
                  </div>
                </>
              ) : (
                <m.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-white/80 text-lg">프로필 정보를 불러올 수 없습니다.</p>
                </m.div>
              )}
            </div>
          </m.div>

          {/* Statistics Dashboard */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">독서 통계</h2>
            <StatsDashboard />
          </m.div>
        </div>

        {/* Profile Edit Dialog */}
        {profile && (
          <ProfileEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            currentNickname={profile.nickname}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </div>
    </AppLayout>
  );
}
