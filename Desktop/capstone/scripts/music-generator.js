// 음악 생성 페이지 JavaScript

// DOM 요소 선택
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const generateInitialMusicBtn = document.getElementById('generateInitialMusic');
const quotesContainer = document.getElementById('quotesContainer');
const starRating = document.getElementById('starRating');
const reviewTextarea = document.getElementById('reviewText');
const bookCover = document.getElementById('bookCover');
const changeCoverBtn = document.getElementById('changeCoverBtn');
const savePlaylistBtn = document.getElementById('savePlaylist');
const playIntegratedMusicBtn = document.getElementById('playIntegratedMusic');
const downloadIntegratedMusicBtn = document.getElementById('downloadIntegratedMusic');

// 상태 관리
let currentPlaylist = {
    bookTitle: '',
    bookAuthor: '',
    bookDescription: '',
    coverImage: '',
    quotes: [],
    rating: 0,
    review: '',
    musicTracks: [],
    createdAt: null
};

let quoteCounter = 0;
let isPlaying = false;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeQuoteInput();
    loadDraftIfExists();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 책 정보 입력
    bookTitleInput.addEventListener('input', updateBookInfo);
    bookAuthorInput.addEventListener('input', updateBookInfo);
    
    // 초기 음악 생성
    generateInitialMusicBtn.addEventListener('click', generateIntegratedMusic);
    
    // 별점 시스템
    setupStarRating();
    
    // 감상 입력
    reviewTextarea.addEventListener('input', updateReview);
    
    // 표지 변경
    changeCoverBtn.addEventListener('click', changeCover);
    
    // 통합 플레이어
    playIntegratedMusicBtn.addEventListener('click', toggleIntegratedPlayer);
    downloadIntegratedMusicBtn.addEventListener('click', downloadIntegratedMusic);
    
    // 플레이리스트 저장
    savePlaylistBtn.addEventListener('click', savePlaylist);
    
    // 페이지 떠날 때 자동 저장
    window.addEventListener('beforeunload', autosavePlaylist);
}

// 책 정보 업데이트
function updateBookInfo() {
    currentPlaylist.bookTitle = bookTitleInput.value.trim();
    currentPlaylist.bookAuthor = bookAuthorInput.value.trim();
    
    // 책 정보가 있으면 초기 음악 생성 버튼 활성화
    if (currentPlaylist.bookTitle && currentPlaylist.bookAuthor) {
        generateInitialMusicBtn.disabled = false;
    } else {
        generateInitialMusicBtn.disabled = true;
    }
    
    updateBookCoverPlaceholder();
}

// LLM 프롬프트 생성 함수
function createLLMPrompt({ bookTitle, bookAuthor, bookDescription, review, quotes }) {
    let prompt = `책 제목: ${bookTitle}\n저자: ${bookAuthor}`;
    if (bookDescription) prompt += `\n책 설명: ${bookDescription}`;
    if (review) prompt += `\n감상: ${review}`;
    if (quotes && quotes.length > 0) {
        prompt += `\n인상깊은 구절:`;
        quotes.forEach((q, i) => {
            if (q && q.text) prompt += `\n${i + 1}. ${q.text}`;
            else if (typeof q === 'string') prompt += `\n${i + 1}. ${q}`;
        });
    }
    prompt += '\n이 책의 분위기와 감상을 담은 음악을 만들어주세요.';
    return prompt;
}

// 음악 생성 (실제 API 호출)
async function generateMusic(type, prompt) {
    // type: 'integrated'일 때 통합 프롬프트 기반 생성
    if (type === 'integrated') {
        // 서버 API 호출
        const res = await API.music.generateInitialMusic({
            prompt,
            bookTitle: currentPlaylist.bookTitle,
            bookAuthor: currentPlaylist.bookAuthor,
            bookDescription: currentPlaylist.bookDescription,
            review: currentPlaylist.review,
            quotes: currentPlaylist.quotes
        });
        if (res && res.success && res.playlist && res.playlist.tracks && res.playlist.tracks.length > 0) {
            // 첫 트랙 반환 (통합 음악)
            return res.playlist.tracks[0];
        } else {
            throw new Error('음악 생성 실패');
        }
    } else {
        // 기존 구절/시뮬레이션 방식 유지
        return new Promise((resolve) => {
            setTimeout(() => {
                const trackId = Date.now() + Math.random();
                const music = {
                    id: trackId,
                    type: type,
                    title: type === 'initial' ? '초기 음악' : `구절 ${quoteCounter} 음악`,
                    prompt: prompt,
                    duration: Math.floor(Math.random() * 120 + 60), // 60-180초
                    audioUrl: `https://example.com/audio/${trackId}.mp3`, // 더미 URL
                    createdAt: new Date().toISOString()
                };
                resolve(music);
            }, 2000);
        });
    }
}

// 책 정보 가져오기 시뮬레이션
function fetchBookInfo(title, author) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 더미 책 정보
            const dummyBooks = {
                '어린 왕자': {
                    description: '어른들에게는 이해하기 어려운 순수한 마음을 가진 어린 왕자의 이야기. 사랑과 우정, 그리고 진정한 가치에 대해 생각해보게 하는 작품.',
                    coverImage: 'https://via.placeholder.com/200x280/667eea/ffffff?text=어린+왕자'
                },
                '변신': {
                    description: '한 남자가 어느 날 아침 거대한 벌레로 변해버린 기이한 이야기. 인간 소외와 현대 사회의 문제를 다룬 카프카의 대표작.',
                    coverImage: 'https://via.placeholder.com/200x280/764ba2/ffffff?text=변신'
                },
                '봄밤': {
                    description: '따뜻한 봄날 밤의 서정적인 감성을 담은 소설. 사랑과 이별, 그리고 새로운 시작에 대한 이야기.',
                    coverImage: 'https://via.placeholder.com/200x280/27ae60/ffffff?text=봄밤'
                }
            };
            
            const bookInfo = dummyBooks[title] || {
                description: `${title}는 ${author}의 작품으로, 깊이 있는 내용과 감동적인 스토리로 많은 독자들에게 사랑받고 있는 작품입니다.`,
                coverImage: `https://via.placeholder.com/200x280/95a5a6/ffffff?text=${encodeURIComponent(title)}`
            };
            
            resolve(bookInfo);
        }, 1500);
    });
}

// 구절 입력 초기화
function initializeQuoteInput() {
    const firstQuoteInput = quotesContainer.querySelector('.quote-input');
    if (firstQuoteInput) {
        setupQuoteInput(firstQuoteInput, 0);
    }
}

// 구절 입력 설정
function setupQuoteInput(quoteInput, index) {
    quoteInput.addEventListener('input', () => {
        if (quoteInput.value.trim() && !quoteInput.nextElementSibling) {
            addNewQuoteInput();
        }
    });
    
    // 음악 생성 버튼 이벤트
    const musicBtn = quoteInput.parentNode.querySelector('.generate-music-btn');
    musicBtn.addEventListener('click', () => generateQuoteMusic(index));
}

// 새 구절 입력 추가
function addNewQuoteInput() {
    quoteCounter++;
    
    const newQuoteItem = document.createElement('div');
    newQuoteItem.className = 'quote-item';
    newQuoteItem.innerHTML = `
        <div class="quote-input-container">
            <textarea class="quote-input" placeholder="인상깊은 구절을 입력하세요..."></textarea>
            <button class="generate-music-btn" data-quote-index="${quoteCounter}">
                <i class="fas fa-music"></i>
                음악 생성
            </button>
        </div>
        <div class="quote-music-player" style="display: none;">
            <div class="music-player">
                <button class="play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="music-info">
                    <span class="music-title">구절 ${quoteCounter + 1} 음악</span>
                </div>
                <div class="music-controls">
                    <button class="download-btn">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    quotesContainer.appendChild(newQuoteItem);
    
    const newQuoteInput = newQuoteItem.querySelector('.quote-input');
    setupQuoteInput(newQuoteInput, quoteCounter);
    
    // 애니메이션 효과
    newQuoteItem.style.opacity = '0';
    newQuoteItem.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newQuoteItem.style.transition = 'all 0.5s ease-out';
        newQuoteItem.style.opacity = '1';
        newQuoteItem.style.transform = 'translateY(0)';
    }, 100);
}

// 구절 음악 생성
async function generateQuoteMusic(index) {
    const quoteItem = quotesContainer.children[index];
    const quoteInput = quoteItem.querySelector('.quote-input');
    const musicBtn = quoteItem.querySelector('.generate-music-btn');
    const musicPlayer = quoteItem.querySelector('.quote-music-player');
    
    const quoteText = quoteInput.value.trim();
    
    if (!quoteText) {
        showNotification('구절을 입력해주세요.', 'error');
        return;
    }
    
    setButtonLoading(musicBtn, true);
    
    try {
        const music = await generateMusic('quote', quoteText);
        
        if (music) {
            // 구절 저장
            currentPlaylist.quotes[index] = {
                text: quoteText,
                musicId: music.id
            };
            
            // 음악 트랙 추가
            currentPlaylist.musicTracks.push(music);
            
            // 플레이어 표시
            musicPlayer.style.display = 'block';
            setupQuoteMusicPlayer(musicPlayer, music);
            
            // 통합 플레이어 업데이트
            updateIntegratedPlayer();
            
            showNotification('구절 음악이 생성되었습니다!', 'success');
        }
        
    } catch (error) {
        showNotification('음악 생성 중 오류가 발생했습니다.', 'error');
        console.error('Quote music generation error:', error);
    } finally {
        setButtonLoading(musicBtn, false);
    }
}

// 구절 음악 플레이어 설정
function setupQuoteMusicPlayer(playerElement, music) {
    const playBtn = playerElement.querySelector('.play-btn');
    const downloadBtn = playerElement.querySelector('.download-btn');
    
    playBtn.addEventListener('click', () => playMusic(music.id));
    downloadBtn.addEventListener('click', () => downloadMusic(music.id));
}

// 별점 시스템 설정
function setupStarRating() {
    const stars = starRating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentPlaylist.rating = index + 1;
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    starRating.addEventListener('mouseleave', () => {
        updateStarDisplay();
    });
}

// 별점 표시 업데이트
function updateStarDisplay() {
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < currentPlaylist.rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// 별점 하이라이트
function highlightStars(count) {
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// 감상 업데이트
function updateReview() {
    currentPlaylist.review = reviewTextarea.value;
}

// 책 표지 변경
function changeCover() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                currentPlaylist.coverImage = imageUrl;
                updateBookCover(imageUrl);
                showNotification('표지가 변경되었습니다.', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// 책 표지 업데이트
function updateBookCover(imageUrl) {
    if (imageUrl) {
        bookCover.innerHTML = `<img src="${imageUrl}" alt="책 표지">`;
    } else {
        updateBookCoverPlaceholder();
    }
}

// 책 표지 플레이스홀더 업데이트
function updateBookCoverPlaceholder() {
    if (!currentPlaylist.coverImage) {
        const title = currentPlaylist.bookTitle || '책 표지';
        bookCover.innerHTML = `
            <div class="cover-placeholder">
                <i class="fas fa-book"></i>
                <p>${title}</p>
            </div>
        `;
    }
}

// 통합 플레이어 업데이트
function updateIntegratedPlayer() {
    if (currentPlaylist.musicTracks.length > 0) {
        playIntegratedMusicBtn.disabled = false;
        downloadIntegratedMusicBtn.disabled = false;
    }
}

// 통합 플레이어 토글
function toggleIntegratedPlayer() {
    if (isPlaying) {
        stopMusic();
    } else {
        playIntegratedPlaylist();
    }
}

// 통합 플레이리스트 재생
function playIntegratedPlaylist() {
    if (currentPlaylist.musicTracks.length === 0) {
        showNotification('재생할 음악이 없습니다.', 'error');
        return;
    }
    
    isPlaying = true;
    playIntegratedMusicBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    // 재생 시뮬레이션
    simulatePlayback();
    
    showNotification('플레이리스트 재생을 시작합니다.', 'info');
}

// 음악 정지
function stopMusic() {
    isPlaying = false;
    playIntegratedMusicBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    // 진행바 초기화
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
}

// 재생 시뮬레이션
function simulatePlayback() {
    const progressFill = document.querySelector('.progress-fill');
    const totalDuration = currentPlaylist.musicTracks.reduce((sum, track) => sum + track.duration, 0);
    let currentTime = 0;
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        currentTime += 1;
        const progress = (currentTime / totalDuration) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
        
        if (currentTime >= totalDuration) {
            clearInterval(interval);
            stopMusic();
            showNotification('플레이리스트 재생이 완료되었습니다.', 'success');
        }
    }, 1000);
}

// 음악 재생
function playMusic(musicId) {
    const music = currentPlaylist.musicTracks.find(track => track.id === musicId);
    if (music) {
        showNotification(`"${music.title}" 재생 중...`, 'info');
    }
}

// 음악 다운로드
function downloadMusic(musicId) {
    const music = currentPlaylist.musicTracks.find(track => track.id === musicId);
    if (music) {
        showNotification(`"${music.title}" 다운로드를 시작합니다.`, 'info');
        // 실제로는 파일 다운로드 처리
    }
}

// 통합 음악 다운로드
function downloadIntegratedMusic() {
    if (currentPlaylist.musicTracks.length === 0) {
        showNotification('다운로드할 음악이 없습니다.', 'error');
        return;
    }
    
    showNotification('통합 플레이리스트 다운로드를 시작합니다.', 'info');
    // 실제로는 모든 트랙을 합친 파일 생성 및 다운로드
}

// 플레이리스트 저장
async function savePlaylist() {
    if (!currentPlaylist.bookTitle || !currentPlaylist.bookAuthor) {
        showNotification('책 제목과 저자를 입력해주세요.', 'error');
        return;
    }
    
    if (currentPlaylist.musicTracks.length === 0) {
        showNotification('최소 하나의 음악을 생성해주세요.', 'error');
        return;
    }
    
    setButtonLoading(savePlaylistBtn, true);
    
    try {
        // 플레이리스트 데이터 준비
        const playlistData = {
            ...currentPlaylist,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'public' // public, private, draft
        };
        
        // 로컬 스토리지에 저장 (실제로는 서버 API 호출)
        const savedPlaylists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
        savedPlaylists.push(playlistData);
        localStorage.setItem('userPlaylists', JSON.stringify(savedPlaylists));
        
        // 임시 저장 데이터 삭제
        localStorage.removeItem('draftPlaylist');
        
        showNotification('플레이리스트가 성공적으로 저장되었습니다!', 'success');
        
        // 나의 책장으로 이동
        setTimeout(() => {
            window.location.href = 'my-bookshelf.html';
        }, 2000);
        
    } catch (error) {
        showNotification('저장 중 오류가 발생했습니다.', 'error');
        console.error('Save error:', error);
    } finally {
        setButtonLoading(savePlaylistBtn, false);
    }
}

// 자동 저장
function autosavePlaylist() {
    if (currentPlaylist.bookTitle || currentPlaylist.bookAuthor || currentPlaylist.quotes.length > 0) {
        localStorage.setItem('draftPlaylist', JSON.stringify(currentPlaylist));
    }
}

// 임시 저장 데이터 로드
function loadDraftIfExists() {
    const draft = localStorage.getItem('draftPlaylist');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            
            // 사용자에게 복원 여부 확인
            if (confirm('이전에 작성 중이던 플레이리스트가 있습니다. 복원하시겠습니까?')) {
                restoreFromDraft(draftData);
            } else {
                localStorage.removeItem('draftPlaylist');
            }
        } catch (e) {
            localStorage.removeItem('draftPlaylist');
        }
    }
}

// 임시 저장 데이터에서 복원
function restoreFromDraft(draftData) {
    currentPlaylist = draftData;
    
    // UI 복원
    bookTitleInput.value = currentPlaylist.bookTitle || '';
    bookAuthorInput.value = currentPlaylist.bookAuthor || '';
    reviewTextarea.value = currentPlaylist.review || '';
    currentPlaylist.rating = currentPlaylist.rating || 0;
    
    updateBookInfo();
    updateStarDisplay();
    
    if (currentPlaylist.coverImage) {
        updateBookCover(currentPlaylist.coverImage);
    }
    
    // 구절들 복원
    if (currentPlaylist.quotes && currentPlaylist.quotes.length > 0) {
        // 기존 구절 입력 초기화
        quotesContainer.innerHTML = '';
        
        currentPlaylist.quotes.forEach((quote, index) => {
            addQuoteFromDraft(quote, index);
        });
        
        // 마지막에 빈 입력 추가
        addNewQuoteInput();
    }
    
    // 음악 트랙 복원
    if (currentPlaylist.musicTracks && currentPlaylist.musicTracks.length > 0) {
        updateIntegratedPlayer();
    }
    
    showNotification('이전 작업이 복원되었습니다.', 'success');
}

// 임시 저장에서 구절 복원
function addQuoteFromDraft(quote, index) {
    const quoteItem = document.createElement('div');
    quoteItem.className = 'quote-item';
    quoteItem.innerHTML = `
        <div class="quote-input-container">
            <textarea class="quote-input" placeholder="인상깊은 구절을 입력하세요...">${quote.text}</textarea>
            <button class="generate-music-btn" data-quote-index="${index}">
                <i class="fas fa-music"></i>
                음악 생성
            </button>
        </div>
        <div class="quote-music-player" style="display: ${quote.musicId ? 'block' : 'none'};">
            <div class="music-player">
                <button class="play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="music-info">
                    <span class="music-title">구절 ${index + 1} 음악</span>
                </div>
                <div class="music-controls">
                    <button class="download-btn">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    quotesContainer.appendChild(quoteItem);
    
    const quoteInput = quoteItem.querySelector('.quote-input');
    setupQuoteInput(quoteInput, index);
    
    if (quote.musicId) {
        const musicPlayer = quoteItem.querySelector('.quote-music-player');
        const music = currentPlaylist.musicTracks.find(track => track.id === quote.musicId);
        if (music) {
            setupQuoteMusicPlayer(musicPlayer, music);
        }
    }
}

// 버튼 로딩 상태 설정
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
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

// --- Google Books API로 책 검색 및 선택 기능 추가 ---
async function searchBooksByTitle(title) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items || [];
}

function renderBookSearchResults(books) {
    const container = document.createElement('div');
    container.className = 'book-search-results';
    books.forEach((item, idx) => {
        const info = item.volumeInfo;
        const div = document.createElement('div');
        div.className = 'book-search-item';
        div.innerHTML = `
            <img src="${info.imageLinks?.thumbnail || ''}" style="width:40px;height:60px;object-fit:cover;vertical-align:middle;"> 
            <b>${info.title}</b> <span style='font-size:0.9em;color:#666;'>${info.authors ? info.authors.join(', ') : ''}</span>
        `;
        div.onclick = () => selectBookFromSearch(item);
        container.appendChild(div);
    });
    return container;
}

async function handleBookSearch() {
    const title = bookTitleInput.value.trim();
    if (!title) return;
    const results = await searchBooksByTitle(title);
    const section = document.querySelector('.book-info-section');
    let resultDiv = section.querySelector('.book-search-results');
    if (resultDiv) resultDiv.remove();
    if (results.length === 0) {
        const noDiv = document.createElement('div');
        noDiv.className = 'book-search-results';
        noDiv.innerText = '검색 결과가 없습니다.';
        section.appendChild(noDiv);
        return;
    }
    const listDiv = renderBookSearchResults(results);
    section.appendChild(listDiv);
}

function selectBookFromSearch(item) {
    const info = item.volumeInfo;
    bookTitleInput.value = info.title;
    bookAuthorInput.value = info.authors ? info.authors.join(', ') : '';
    currentPlaylist.bookTitle = info.title;
    currentPlaylist.bookAuthor = info.authors ? info.authors.join(', ') : '';
    currentPlaylist.bookDescription = info.description || '';
    currentPlaylist.coverImage = info.imageLinks?.thumbnail || '';
    updateBookCover(currentPlaylist.coverImage);
    updateBookCoverPlaceholder();
    // 설명 표시
    let descDiv = document.getElementById('book-desc-info');
    if (!descDiv) {
        descDiv = document.createElement('div');
        descDiv.id = 'book-desc-info';
        descDiv.style = 'margin:10px 0; color:#444; font-size:0.98em;';
        bookTitleInput.parentNode.appendChild(descDiv);
    }
    descDiv.innerText = currentPlaylist.bookDescription;
    // 검색 결과 제거
    const section = document.querySelector('.book-info-section');
    const resultDiv = section.querySelector('.book-search-results');
    if (resultDiv) resultDiv.remove();
}

// 책 제목 입력 후 엔터 시 검색
bookTitleInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        handleBookSearch();
    }
});
// 검색 버튼이 있다면 클릭 시에도 검색
const searchBtn = document.getElementById('searchBookBtn');
if (searchBtn) {
    searchBtn.onclick = handleBookSearch;
}

// 통합 음악 생성 (책 정보, 감상, 구절 모두 기반)
async function generateIntegratedMusic() {
    if (!currentPlaylist.bookTitle || !currentPlaylist.bookAuthor) {
        showNotification('책 제목과 저자를 모두 입력해주세요.', 'error');
        return;
    }
    if (currentPlaylist.quotes.length === 0 || !currentPlaylist.quotes[0].text) {
        showNotification('최소 1개의 인상깊은 구절을 입력해주세요.', 'error');
        return;
    }
    setButtonLoading(generateInitialMusicBtn, true);
    showLoadingSpinner(true, '음악을 생성 중입니다. 잠시만 기다려주세요...');
    try {
        // 책 정보 보강
        const bookInfo = await fetchBookInfo(currentPlaylist.bookTitle, currentPlaylist.bookAuthor);
        if (bookInfo) {
            currentPlaylist.bookDescription = bookInfo.description;
            currentPlaylist.coverImage = bookInfo.coverImage;
            updateBookCover(bookInfo.coverImage);
        }
        // LLM 프롬프트 생성
        const prompt = createLLMPrompt({
            bookTitle: currentPlaylist.bookTitle,
            bookAuthor: currentPlaylist.bookAuthor,
            bookDescription: currentPlaylist.bookDescription,
            review: currentPlaylist.review,
            quotes: currentPlaylist.quotes
        });
        // musicgen 호출 (실제 API 연동 시 prompt 전달)
        const integratedMusic = await generateMusic('integrated', prompt);
        if (integratedMusic) {
            currentPlaylist.musicTracks = [integratedMusic];
            showNotification('통합 음악이 성공적으로 생성되었습니다!', 'success');
        }
    } catch (error) {
        showNotification('음악 생성 중 오류가 발생했습니다.', 'error');
        console.error('Integrated music generation error:', error);
    } finally {
        setButtonLoading(generateInitialMusicBtn, false);
        showLoadingSpinner(false);
    }
}

// 로딩 스피너 표시 함수
function showLoadingSpinner(show, message) {
    let spinner = document.getElementById('musicgen-loading-spinner');
    if (show) {
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'musicgen-loading-spinner';
            spinner.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(255,255,255,0.7);display:flex;flex-direction:column;align-items:center;justify-content:center;';
            spinner.innerHTML = `<div class="spinner" style="border:8px solid #eee;border-top:8px solid #667eea;border-radius:50%;width:60px;height:60px;animation:spin 1s linear infinite;"></div><div style='margin-top:18px;font-size:1.1em;color:#333;'>${message || '로딩 중...'}</div>`;
            document.body.appendChild(spinner);
            // CSS 애니메이션 추가
            const style = document.createElement('style');
            style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
            document.head.appendChild(style);
        } else {
            spinner.style.display = 'flex';
            spinner.querySelector('div:last-child').innerText = message || '로딩 중...';
        }
    } else if (spinner) {
        spinner.style.display = 'none';
    }
} 