// 음악 생성 관련 라우터
const express = require('express');
const router = express.Router();

// 음악 생성 API
router.post('/generate', async (req, res) => {
    try {
        const { bookTitle, author, quotes, bookCover, type = 'playlist' } = req.body;
        
        // 입력값 검증
        if (!bookTitle || !author) {
            return res.status(400).json({
                success: false,
                message: '책 제목과 저자를 입력해주세요.'
            });
        }
        
        // 음악 생성 시뮬레이션
        await simulateMusicGeneration(bookTitle);
        
        // 트랙 생성
        const tracks = [];
        
        // 초기 음악 (오프닝) 생성
        tracks.push({
            id: Date.now(),
            title: `${bookTitle} - 오프닝`,
            type: 'opening',
            duration: generateRandomDuration(),
            audioUrl: generateDummyAudioUrl(),
            createdAt: new Date().toISOString()
        });
        
        // 구절별 음악 생성
        if (quotes && quotes.length > 0) {
            quotes.forEach((quote, index) => {
                tracks.push({
                    id: Date.now() + index + 1,
                    title: `${bookTitle} - 구절 ${index + 1}`,
                    type: 'quote',
                    quote: quote.text || quote,
                    duration: generateRandomDuration(),
                    audioUrl: generateDummyAudioUrl(),
                    createdAt: new Date().toISOString()
                });
            });
        }
        
        // 응답 데이터
        const playlist = {
            id: Date.now(),
            title: bookTitle,
            author,
            coverImage: bookCover || '/images/default-book-cover.png',
            tracks,
            totalDuration: calculateTotalDuration(tracks),
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '음악이 성공적으로 생성되었습니다!',
            playlist
        });
    } catch (error) {
        console.error('Music generation error:', error);
        res.status(500).json({
            success: false,
            message: '음악 생성 중 오류가 발생했습니다.'
        });
    }
});

// 개별 구절 음악 생성 API
router.post('/generate-quote', async (req, res) => {
    try {
        const { bookTitle, quote, quoteIndex } = req.body;
        
        if (!bookTitle || !quote) {
            return res.status(400).json({
                success: false,
                message: '책 제목과 구절을 입력해주세요.'
            });
        }
        
        // 구절 음악 생성 시뮬레이션
        await simulateMusicGeneration(quote, 2000);
        
        const track = {
            id: Date.now(),
            title: `${bookTitle} - 구절 ${quoteIndex || 1}`,
            type: 'quote',
            quote,
            duration: generateRandomDuration(),
            audioUrl: generateDummyAudioUrl(),
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '구절 음악이 생성되었습니다!',
            track
        });
    } catch (error) {
        console.error('Quote music generation error:', error);
        res.status(500).json({
            success: false,
            message: '구절 음악 생성 중 오류가 발생했습니다.'
        });
    }
});

// 음악 스타일 설정 API
router.post('/style', (req, res) => {
    try {
        const { genre, mood, tempo, instruments } = req.body;
        
        // 음악 스타일 설정 저장 (실제로는 데이터베이스에 저장)
        const styleConfig = {
            genre: genre || 'ambient',
            mood: mood || 'calm',
            tempo: tempo || 'medium',
            instruments: instruments || ['piano', 'strings'],
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '음악 스타일이 설정되었습니다!',
            styleConfig
        });
    } catch (error) {
        console.error('Style setting error:', error);
        res.status(500).json({
            success: false,
            message: '음악 스타일 설정 중 오류가 발생했습니다.'
        });
    }
});

// 음악 다운로드 API
router.get('/download/:trackId', (req, res) => {
    try {
        const { trackId } = req.params;
        
        // 실제로는 파일 시스템에서 음악 파일을 찾아서 다운로드
        // 현재는 더미 응답
        res.json({
            success: true,
            message: '음악 다운로드가 시작됩니다.',
            downloadUrl: `/audio/track-${trackId}.mp3`,
            filename: `track-${trackId}.mp3`
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: '음악 다운로드 중 오류가 발생했습니다.'
        });
    }
});

// 음악 재생 기록 API
router.post('/play-history', (req, res) => {
    try {
        const { trackId, playlistId, duration } = req.body;
        
        // 재생 기록 저장 (실제로는 데이터베이스에 저장)
        const playHistory = {
            id: Date.now(),
            trackId,
            playlistId,
            duration,
            userId: 1, // 실제로는 인증된 사용자 ID
            playedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '재생 기록이 저장되었습니다.',
            playHistory
        });
    } catch (error) {
        console.error('Play history error:', error);
        res.status(500).json({
            success: false,
            message: '재생 기록 저장 중 오류가 발생했습니다.'
        });
    }
});

// 음악 생성 상태 확인 API
router.get('/status/:jobId', (req, res) => {
    try {
        const { jobId } = req.params;
        
        // 실제로는 큐나 캐시에서 작업 상태를 확인
        // 현재는 더미 응답
        const statuses = ['pending', 'processing', 'completed', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        res.json({
            success: true,
            jobId,
            status: randomStatus,
            progress: randomStatus === 'processing' ? Math.floor(Math.random() * 100) : null,
            estimatedTime: randomStatus === 'processing' ? Math.floor(Math.random() * 60) + 30 : null
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: '상태 확인 중 오류가 발생했습니다.'
        });
    }
});

// 헬퍼 함수들
async function simulateMusicGeneration(prompt, delay = 3000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`음악 생성 완료: ${prompt}`);
            resolve();
        }, delay);
    });
}

function generateRandomDuration() {
    const minutes = Math.floor(Math.random() * 3) + 2; // 2-4분
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function generateDummyAudioUrl() {
    const audioId = Date.now() + Math.floor(Math.random() * 1000);
    return `/audio/generated-${audioId}.mp3`;
}

function calculateTotalDuration(tracks) {
    let totalSeconds = 0;
    
    tracks.forEach(track => {
        const [minutes, seconds] = track.duration.split(':').map(Number);
        totalSeconds += minutes * 60 + seconds;
    });
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

module.exports = router; 