// 메인 페이지 JavaScript

// 더미 데이터
const samplePlaylists = [
    {
        id: 1,
        title: "어린 왕자의 멜로디",
        bookTitle: "어린 왕자",
        author: "생텍쥐페리",
        creator: "음악 애호가",
        likes: 42,
        quote: "네가 장미꽃한테 정성 들인 시간이, 그 장미꽃을 그렇게 소중하게 만든 거야.",
        image: "https://via.placeholder.com/280x200/667eea/ffffff?text=어린+왕자"
    },
    {
        id: 2,
        title: "카프카의 밤",
        bookTitle: "변신",
        author: "프란츠 카프카",
        creator: "독서광",
        likes: 38,
        quote: "그는 자신이 침대에서 거대한 벌레로 변해 있는 것을 발견했다.",
        image: "https://via.placeholder.com/280x200/764ba2/ffffff?text=변신"
    },
    {
        id: 3,
        title: "봄날의 서정",
        bookTitle: "봄밤",
        author: "김은국",
        creator: "시인의마음",
        likes: 55,
        quote: "봄이 오면 언제나 마음이 설렌다. 새로운 시작에 대한 기대 때문일까.",
        image: "https://via.placeholder.com/280x200/27ae60/ffffff?text=봄밤"
    }
];

// DOM 요소 선택
const profileContainer = document.getElementById('profileContainer');
const profilePlaceholder = document.getElementById('profilePlaceholder');
const profileInfo = document.getElementById('profileInfo');
const loginBtn = document.getElementById('loginBtn');
const playlistGrid = document.getElementById('playlistGrid');

// 사용자 상태 관리
let currentUser = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadRecommendedPlaylists();
    setupEventListeners();
});

// 사용자 로그인 상태 확인
function checkUserLogin() {
    // 로컬 스토리지에서 사용자 정보 확인 (실제로는 서버에서 인증)
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        currentUser = JSON.parse(userData);
        showUserProfile();
    } else {
        showLoginButton();
    }
}

// 사용자 프로필 표시
function showUserProfile() {
    profilePlaceholder.style.display = 'none';
    profileInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
    
    const profileImage = profileInfo.querySelector('.profile-image');
    const profileName = profileInfo.querySelector('.profile-name');
    
    profileImage.src = currentUser.profileImage || 'https://via.placeholder.com/40';
    profileName.textContent = currentUser.nickname || currentUser.username;
}

// 로그인 버튼 표시
function showLoginButton() {
    profilePlaceholder.style.display = 'flex';
    profileInfo.style.display = 'none';
    loginBtn.style.display = 'block';
}

// 추천 플레이리스트 로딩
function loadRecommendedPlaylists() {
    // 실제로는 서버 API 호출
    setTimeout(() => {
        displayPlaylists(samplePlaylists);
    }, 500);
}

// 플레이리스트 표시
function displayPlaylists(playlists) {
    if (!playlistGrid) return;
    
    playlistGrid.innerHTML = '';
    
    playlists.forEach(playlist => {
        const playlistCard = createPlaylistCard(playlist);
        playlistGrid.appendChild(playlistCard);
    });
}

// 플레이리스트 카드 생성
function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.onclick = () => goToPlaylistDetail(playlist.id);
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${playlist.image}" alt="${playlist.title}">
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-title">${playlist.title}</h3>
            <div class="card-author">${playlist.bookTitle} - ${playlist.author}</div>
            <div class="card-quote">"${playlist.quote}"</div>
            <div class="card-meta">
                <span class="card-creator">${playlist.creator}</span>
                <div class="card-likes">
                    <i class="fas fa-heart"></i>
                    <span>${playlist.likes}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// 플레이리스트 상세 페이지로 이동
function goToPlaylistDetail(playlistId) {
    window.location.href = `playlist-detail.html?id=${playlistId}`;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 버튼 클릭
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    // 프로필 클릭 (로그인 상태일 때)
    if (profileInfo) {
        profileInfo.addEventListener('click', () => {
            if (currentUser) {
                window.location.href = 'my-profile.html';
            }
        });
    }
    
    // 페이지 새로고침 시 추천 플레이리스트 변경
    window.addEventListener('beforeunload', () => {
        shuffleRecommendations();
    });
}

// 추천 플레이리스트 셔플
function shuffleRecommendations() {
    // 페이지 새로고침 때마다 순서 변경
    const shuffled = [...samplePlaylists].sort(() => Math.random() - 0.5);
    localStorage.setItem('shuffledPlaylists', JSON.stringify(shuffled));
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 유틸리티 함수들
const utils = {
    // 시간 포매팅
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        
        return date.toLocaleDateString('ko-KR');
    },
    
    // 숫자 포매팅
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    // 로컬 스토리지 안전하게 사용
    safeLocalStorage: {
        setItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('로컬 스토리지 저장 실패:', e);
                return false;
            }
        },
        
        getItem(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('로컬 스토리지 읽기 실패:', e);
                return null;
            }
        },
        
        removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('로컬 스토리지 삭제 실패:', e);
                return false;
            }
        }
    }
};

// 전역에서 사용할 수 있도록 export
window.BookMusicApp = {
    utils,
    showNotification,
    currentUser,
    checkUserLogin,
    showUserProfile,
    showLoginButton
}; 