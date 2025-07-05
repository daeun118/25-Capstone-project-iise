const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// 설정 및 라우터 불러오기
const config = require('./server/config');
const authRouter = require('./server/routes/auth');
const playlistsRouter = require('./server/routes/playlists');
const musicRouter = require('./server/routes/music');

const app = express();
const PORT = config.port;

// 미들웨어 설정
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static('.'));

// 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.upload.destination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: config.upload.maxFileSize }
});

// 정적 페이지 라우팅
const pages = {
  '/': 'index.html',
  '/login': 'login.html',
  '/music-generator': 'music-generator.html',
  '/board': 'board.html',
  '/my-bookshelf': 'my-bookshelf.html',
  '/playlist-detail': 'playlist-detail.html',
  '/my-profile': 'my-profile.html'
};

Object.entries(pages).forEach(([route, filename]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, filename));
  });
});

// API 라우터 설정
app.use('/api/auth', authRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/music', musicRouter);

// 기존 API 호환성을 위한 별칭
app.use('/api/login', authRouter);
app.use('/api/register', authRouter);
app.use('/api/generate-music', musicRouter);

// 파일 업로드 API
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: '파일이 선택되지 않았습니다.' 
      });
    }
    
    // 파일 형식 검증
    const allowedTypes = [...config.upload.allowedImageTypes, ...config.upload.allowedAudioTypes];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: '지원되지 않는 파일 형식입니다.'
      });
    }
    
    res.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      fileUrl: `/uploads/${req.file.filename}`,
      fileInfo: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.'
    });
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Multer 에러 처리
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: '파일 크기가 너무 큽니다.'
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: '서버 내부 오류가 발생했습니다.' 
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '페이지를 찾을 수 없습니다.' 
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🎵 북뮤직 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
  console.log(`📚 메인 페이지: http://localhost:${PORT}`);
  console.log(`🎶 음악 생성: http://localhost:${PORT}/music-generator`);
  console.log(`📋 게시판: http://localhost:${PORT}/board`);
  console.log(`📖 나의 책장: http://localhost:${PORT}/my-bookshelf`);
  console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
}); 