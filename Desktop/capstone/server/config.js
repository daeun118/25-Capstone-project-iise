// 서버 설정 관리
const config = {
    // 서버 설정
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    
    // 파일 업로드 설정
    upload: {
        destination: 'uploads/',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3']
    },
    
    // CORS 설정
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    
    // JWT 설정 (향후 구현용)
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },
    
    // 더미 데이터 설정
    dummyData: {
        users: [
            {
                id: 1,
                username: 'user',
                password: 'password',
                nickname: '북뮤직러',
                email: 'user@example.com',
                profileImage: '/images/default-profile.png',
                joinDate: '2024-01-01'
            },
            {
                id: 2,
                username: 'admin',
                password: 'admin',
                nickname: '관리자',
                email: 'admin@example.com',
                profileImage: '/images/default-profile.png',
                joinDate: '2024-01-01'
            }
        ],
        
        playlists: [
            {
                id: 1,
                title: '데미안',
                author: '헤르만 헤세',
                creator: '책읽는사람',
                coverImage: '/images/demian-cover.jpg',
                likes: 156,
                plays: 1240,
                createdAt: '2024-01-15',
                description: '헤르만 헤세의 데미안을 읽고 감명받아 만든 플레이리스트입니다.',
                tracks: [
                    {
                        id: 1,
                        title: '데미안 - 오프닝',
                        duration: '3:45',
                        audioUrl: '/audio/demian-opening.mp3'
                    }
                ]
            },
            {
                id: 2,
                title: '노르웨이의 숲',
                author: '무라카미 하루키',
                creator: '음악애호가',
                coverImage: '/images/norwegian-wood-cover.jpg',
                likes: 234,
                plays: 1890,
                createdAt: '2024-01-14',
                description: '무라카미 하루키의 노르웨이의 숲을 읽고 만든 감성적인 플레이리스트입니다.',
                tracks: [
                    {
                        id: 1,
                        title: '노르웨이의 숲 - 오프닝',
                        duration: '4:12',
                        audioUrl: '/audio/norwegian-wood-opening.mp3'
                    }
                ]
            },
            {
                id: 3,
                title: '82년생 김지영',
                author: '조남주',
                creator: '현대소설팬',
                coverImage: '/images/kim-jiyoung-cover.jpg',
                likes: 189,
                plays: 1456,
                createdAt: '2024-01-13',
                description: '조남주 작가의 82년생 김지영을 읽고 느낀 감정을 담은 플레이리스트입니다.',
                tracks: [
                    {
                        id: 1,
                        title: '82년생 김지영 - 오프닝',
                        duration: '3:28',
                        audioUrl: '/audio/kim-jiyoung-opening.mp3'
                    }
                ]
            }
        ]
    }
};

module.exports = config; 