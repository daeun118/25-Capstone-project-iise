// 플레이리스트 관련 라우터
const express = require('express');
const config = require('../config');
const router = express.Router();

// 플레이리스트 목록 조회 API
router.get('/', (req, res) => {
    try {
        const { page = 1, limit = 12, sort = 'latest', search = '' } = req.query;
        
        let playlists = [...config.dummyData.playlists];
        
        // 검색 필터
        if (search) {
            playlists = playlists.filter(playlist => 
                playlist.title.toLowerCase().includes(search.toLowerCase()) ||
                playlist.author.toLowerCase().includes(search.toLowerCase()) ||
                playlist.creator.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // 정렬
        switch (sort) {
            case 'latest':
                playlists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                playlists.sort((a, b) => b.likes - a.likes);
                break;
            case 'plays':
                playlists.sort((a, b) => b.plays - a.plays);
                break;
            default:
                break;
        }
        
        // 페이지네이션
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedPlaylists = playlists.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            playlists: paginatedPlaylists,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: playlists.length,
                totalPages: Math.ceil(playlists.length / limit)
            }
        });
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 상세 조회 API
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const playlist = config.dummyData.playlists.find(p => p.id === parseInt(id));
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            playlist
        });
    } catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 생성 API
router.post('/', (req, res) => {
    try {
        const { title, author, coverImage, description, tracks, rating, review } = req.body;
        
        // 입력값 검증
        if (!title || !author) {
            return res.status(400).json({
                success: false,
                message: '책 제목과 저자를 입력해주세요.'
            });
        }
        
        // 새 플레이리스트 생성
        const newPlaylist = {
            id: Date.now(),
            title,
            author,
            creator: '사용자', // 실제로는 인증된 사용자 정보
            coverImage: coverImage || '/images/default-book-cover.png',
            description: description || '',
            tracks: tracks || [],
            rating: rating || 0,
            review: review || '',
            likes: 0,
            plays: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // 더미 데이터에 추가
        config.dummyData.playlists.push(newPlaylist);
        
        res.status(201).json({
            success: true,
            message: '플레이리스트가 생성되었습니다!',
            playlist: newPlaylist
        });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 수정 API
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const playlistIndex = config.dummyData.playlists.findIndex(p => p.id === parseInt(id));
        
        if (playlistIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        // 플레이리스트 업데이트
        config.dummyData.playlists[playlistIndex] = {
            ...config.dummyData.playlists[playlistIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '플레이리스트가 수정되었습니다!',
            playlist: config.dummyData.playlists[playlistIndex]
        });
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 삭제 API
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const playlistIndex = config.dummyData.playlists.findIndex(p => p.id === parseInt(id));
        
        if (playlistIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        // 플레이리스트 삭제
        config.dummyData.playlists.splice(playlistIndex, 1);
        
        res.json({
            success: true,
            message: '플레이리스트가 삭제되었습니다!'
        });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 좋아요 API
router.post('/:id/like', (req, res) => {
    try {
        const { id } = req.params;
        const playlist = config.dummyData.playlists.find(p => p.id === parseInt(id));
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        playlist.likes += 1;
        
        res.json({
            success: true,
            message: '좋아요가 추가되었습니다!',
            likes: playlist.likes
        });
    } catch (error) {
        console.error('Like playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 좋아요 취소 API
router.delete('/:id/like', (req, res) => {
    try {
        const { id } = req.params;
        const playlist = config.dummyData.playlists.find(p => p.id === parseInt(id));
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        playlist.likes = Math.max(0, playlist.likes - 1);
        
        res.json({
            success: true,
            message: '좋아요가 취소되었습니다!',
            likes: playlist.likes
        });
    } catch (error) {
        console.error('Unlike playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 플레이리스트 재생 수 증가 API
router.post('/:id/play', (req, res) => {
    try {
        const { id } = req.params;
        const playlist = config.dummyData.playlists.find(p => p.id === parseInt(id));
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '플레이리스트를 찾을 수 없습니다.'
            });
        }
        
        playlist.plays += 1;
        
        res.json({
            success: true,
            plays: playlist.plays
        });
    } catch (error) {
        console.error('Play playlist error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 