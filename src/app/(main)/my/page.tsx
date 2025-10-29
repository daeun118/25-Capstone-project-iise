'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { useAuth } from '@/hooks/useAuth';
import { ProfileEditDialog } from '@/components/user/ProfileEditDialog';
import { DeleteAccountDialog } from '@/components/my/DeleteAccountDialog';
import { BookOpen, Heart, TrendingUp, LogOut, User, Music } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  journeys: {
    total: number;
    reading: number;
    completed: number;
  };
  content: {
    totalReadingLogs: number;
    totalMusicTracks: number;
    postsPublished: number;
  };
  engagement: {
    likesReceived: number;
    commentsReceived: number;
  };
  insights: {
    averageRating: number;
    completionRate: number;
    totalReadingDays: number;
  };
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/stats'),
      ]);

      const profileData = await profileRes.json();
      const statsData = await statsRes.json();

      if (profileRes.ok) {
        setProfile(profileData.profile);
      } else {
        toast.error('프로필을 불러오는데 실패했습니다');
      }

      if (statsRes.ok) {
        setStats(statsData.stats);
      } else {
        toast.error('통계를 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdated = (newNickname: string) => {
    if (profile) {
      setProfile({ ...profile, nickname: newNickname });
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="프로필을 불러오는 중..." />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <AuthRequired
          title="로그인이 필요한 서비스입니다"
          description="마이페이지를 확인하려면 로그인해주세요."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {profile && (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {profile.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.nickname}</h1>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditDialogOpen(true)}>
              <User className="w-4 h-4" />
              프로필 수정
            </Button>
            <DeleteAccountDialog
              variant="outline"
              size="sm"
              buttonText="회원 탈퇴"
              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border-red-200"
            />
          </div>
        </div>

        {/* 히어로 섹션 - Suno 스타일 */}
        {stats && (
          <div className="card-elevated mb-8 overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                지금까지 {stats.journeys.total}권의 책과 함께 독서 여정을 떠났어요
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="card-elevated p-6 text-center hover-lift-sm">
                  <div className="text-5xl font-bold text-orange-600 mb-2">{stats.journeys.reading}</div>
                  <div className="text-sm font-medium text-muted-foreground">읽는 중</div>
                </div>
                <div className="card-elevated p-6 text-center hover-lift-sm">
                  <div className="text-5xl font-bold text-green-600 mb-2">{stats.journeys.completed}</div>
                  <div className="text-sm font-medium text-muted-foreground">완독</div>
                </div>
                <div className="card-elevated p-6 text-center hover-lift-sm">
                  <div className="text-5xl font-bold text-purple-600 mb-2">{stats.content.totalMusicTracks}</div>
                  <div className="text-sm font-medium text-muted-foreground">생성된 음악</div>
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* 탭 네비게이션 */}
        {stats && (
          <Tabs defaultValue="activity" className="mb-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="activity" className="text-base">활동 현황</TabsTrigger>
              <TabsTrigger value="community" className="text-base">커뮤니티</TabsTrigger>
              <TabsTrigger value="insights" className="text-base">인사이트</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6 mt-6">
              {/* 독서/창작 활동 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg">독서 활동</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">읽는 중</span>
                        <span className="text-2xl font-bold text-blue-600">{stats.journeys.reading}권</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">완독</span>
                        <span className="text-2xl font-bold text-green-600">{stats.journeys.completed}권</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">총 여정</span>
                        <span className="text-2xl font-bold text-purple-600">{stats.journeys.total}권</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Music className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-lg">창작 활동</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">독서 기록</span>
                        <span className="text-2xl font-bold text-purple-600">{stats.content.totalReadingLogs}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-pink-50 rounded-lg">
                        <span className="text-sm font-medium">음악 트랙</span>
                        <span className="text-2xl font-bold text-pink-600">{stats.content.totalMusicTracks}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium">게시물</span>
                        <span className="text-2xl font-bold text-orange-600">{stats.content.postsPublished}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="space-y-6 mt-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-pink-500" />
                    </div>
                    <div className="text-4xl font-bold text-pink-600 mb-2">{stats.engagement.likesReceived}</div>
                    <div className="text-sm font-medium text-gray-600">받은 좋아요</div>
                  </CardContent>
                </div>
                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{stats.engagement.commentsReceived}</div>
                    <div className="text-sm font-medium text-gray-600">받은 댓글</div>
                  </CardContent>
                </div>
                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">{stats.content.postsPublished}</div>
                    <div className="text-sm font-medium text-gray-600">게시물</div>
                  </CardContent>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-lg">평균 별점</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-600 mb-2">{stats.insights.averageRating}</div>
                      <div className="text-sm text-muted-foreground">/ 5.0</div>
                    </div>
                  </CardContent>
                </div>

                <div className="card-elevated hover-lift-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">완독률</h3>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-green-600 mb-2">{stats.insights.completionRate}%</div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                        style={{width: `${stats.insights.completionRate}%`}}
                      />
                    </div>
                  </CardContent>
                </div>
              </div>

              <div className="card-elevated hover-lift-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg">총 독서 일수</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{stats.insights.totalReadingDays}</div>
                    <div className="text-sm text-muted-foreground">일</div>
                  </div>
                </CardContent>
              </div>
            </TabsContent>
          </Tabs>
        )}

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
