// 인증 관련 라우터
const express = require('express');
const config = require('../config');
const router = express.Router();

// 로그인 API
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 입력값 검증
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '사용자명과 비밀번호를 모두 입력해주세요.'
            });
        }
        
        // 더미 사용자 검증
        const user = config.dummyData.users.find(u => 
            u.username === username && u.password === password
        );
        
        if (user) {
            // 비밀번호 제거 후 응답
            const { password: _, ...userData } = user;
            
            res.json({
                success: true,
                message: '로그인 성공!',
                user: userData
            });
        } else {
            res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 회원가입 API
router.post('/register', async (req, res) => {
    try {
        const { username, password, nickname, email } = req.body;
        
        // 입력값 검증
        if (!username || !password || !nickname || !email) {
            return res.status(400).json({
                success: false,
                message: '모든 필드를 입력해주세요.'
            });
        }
        
        // 사용자명 중복 검사
        const existingUser = config.dummyData.users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 사용자명입니다.'
            });
        }
        
        // 이메일 중복 검사
        const existingEmail = config.dummyData.users.find(u => u.email === email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 이메일입니다.'
            });
        }
        
        // 새 사용자 생성
        const newUser = {
            id: Date.now(),
            username,
            password,
            nickname,
            email,
            profileImage: '/images/default-profile.png',
            joinDate: new Date().toISOString()
        };
        
        // 더미 데이터에 추가 (실제로는 데이터베이스에 저장)
        config.dummyData.users.push(newUser);
        
        // 비밀번호 제거 후 응답
        const { password: _, ...userData } = newUser;
        
        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다!',
            user: userData
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 로그아웃 API
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: '로그아웃되었습니다.'
    });
});

// 사용자 정보 조회 API
router.get('/me', (req, res) => {
    // 실제로는 토큰을 검증하고 사용자 정보를 반환
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '인증이 필요합니다.'
        });
    }
    
    // 더미 응답
    res.json({
        success: true,
        user: {
            id: 1,
            username: 'user',
            nickname: '북뮤직러',
            email: 'user@example.com',
            profileImage: '/images/default-profile.png',
            joinDate: '2024-01-01'
        }
    });
});

module.exports = router; 