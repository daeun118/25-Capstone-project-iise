'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Play, Clock, Lock, Loader2, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { motion } from 'framer-motion';

interface MusicTrack {
  id: string;
  prompt: string;
  genre: string | null;
  mood: string | null;
  tempo: string | null;
  file_url: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface Log {
  id: string;
  version: number;
  log_type: string;
  quote: string | null;
  memo: string | null;
  emotions: string[];
  is_public: boolean;
  created_at: string;
  music_track: MusicTrack | null;
}

interface LogListProps {
  logs: Log[];
  onPlayMusic?: (track: MusicTrack) => void;
}

export function LogList({ logs, onPlayMusic }: LogListProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="독서 기록이 없습니다"
        description="첫 독서 기록을 추가해보세요"
      />
    );
  }

  return (
    <div className="relative">
      {/* Timeline 세로선 */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-accent" />

      <div className="space-y-8">
        {logs.map((log, index) => {
          const isV0 = log.log_type === 'v0';
          const isFinal = log.log_type === 'vFinal';
          const isGenerating = log.music_track?.status === 'pending' || log.music_track?.status === 'generating';
          const isCompleted = log.music_track?.status === 'completed';
          const isFailed = log.music_track?.status === 'error';

          return (
            <motion.div
              key={log.id}
              className="relative pl-16"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Timeline 아이콘 */}
              <motion.div
                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isFinal ? 'bg-gradient-warm' : isV0 ? 'bg-gradient-hero' : 'bg-gradient-accent'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isFinal ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <BookOpen className="w-6 h-6 text-white" />
                )}
              </motion.div>

              {/* 카드 */}
              <motion.div
                className="card-elevated overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* 헤더 */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {isV0 ? 'v0 - 여정 시작' : 
                         isFinal ? 'vFinal - 완독' :
                         `v${log.version}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(log.created_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!log.is_public && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          비공개
                        </Badge>
                      )}
                      {isCompleted && onPlayMusic && (
                        <motion.button
                          onClick={() => onPlayMusic(log.music_track!)}
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* 음악 생성 상태 */}
                  {log.music_track && (
                    <div className="mb-4">
                      {isGenerating && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-accent" style={{ opacity: 0.1 }}>
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm font-medium text-primary">음악 생성 중...</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                          <Music className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-600">음악 준비 완료</span>
                        </div>
                      )}
                      {isFailed && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">음악 생성 실패</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 본문 */}
                <div className="px-6 pb-6 space-y-4">
                  {log.quote && (
                    <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', borderColor: '#6366f1' }}>
                      <p className="text-sm italic leading-relaxed">&ldquo;{log.quote}&rdquo;</p>
                    </div>
                  )}

                  {log.memo && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{log.memo}</p>
                  )}

                  {log.music_track && log.music_track.description && (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(240, 147, 251, 0.1)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">음악 설명</p>
                      </div>
                      <p className="text-sm leading-relaxed">{log.music_track.description}</p>
                      {log.music_track.genre && log.music_track.mood && (
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs px-3 py-1 rounded-full font-medium text-white bg-gradient-accent">
                            {log.music_track.genre}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full font-medium text-white bg-gradient-accent">
                            {log.music_track.mood}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {log.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {log.emotions.map((emotion, i) => (
                        <motion.span
                          key={emotion}
                          className="text-xs px-3 py-1.5 rounded-full font-medium text-white shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, hsl(${(i * 30) % 360}, 70%, 60%), hsl(${(i * 30 + 30) % 360}, 70%, 60%))`
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {emotion}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
