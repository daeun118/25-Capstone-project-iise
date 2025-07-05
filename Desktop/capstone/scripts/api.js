// API 호출 통합 모듈
const API = {
    // 기본 설정
    baseURL: window.location.origin,
    timeout: 10000,
    
    // HTTP 요청 헬퍼
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };
        
        try {
            // 로딩 표시
            if (options.showLoading !== false) {
                Utils.loading.showPageLoading(true);
            }
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('API request failed:', error);
            throw this.handleError(error);
        } finally {
            if (options.showLoading !== false) {
                Utils.loading.showPageLoading(false);
            }
        }
    },
    
    // GET 요청
    get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { ...options, method: 'GET' });
    },
    
    // POST 요청
    post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT 요청
    put(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE 요청
    delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    },
    
    // 파일 업로드
    async upload(endpoint, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
            headers: {
                // Content-Type을 설정하지 않으면 브라우저가 자동으로 boundary 설정
                ...options.headers
            }
        });
    },
    
    // 에러 처리
    handleError(error) {
        let message = '알 수 없는 오류가 발생했습니다.';
        
        if (error.name === 'TypeError') {
            message = '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('404')) {
            message = '요청한 페이지를 찾을 수 없습니다.';
        } else if (error.message.includes('500')) {
            message = '서버에서 오류가 발생했습니다.';
        } else if (error.message.includes('timeout')) {
            message = '요청 시간이 초과되었습니다.';
        }
        
        return new Error(message);
    },
    
    // 인증 관련 API
    auth: {
        async login(credentials) {
            const response = await API.post('/api/login', credentials);
            
            if (response.success) {
                // 로그인 성공 시 토큰 저장
                if (response.token) {
                    Utils.storage.setItem('authToken', response.token);
                }
                Utils.storage.setItem('currentUser', response.user);
            }
            
            return response;
        },
        
        async register(userData) {
            return API.post('/api/register', userData);
        },
        
        async logout() {
            Utils.storage.removeItem('authToken');
            Utils.storage.removeItem('currentUser');
            window.location.href = '/login';
        },
        
        getCurrentUser() {
            return Utils.storage.getItem('currentUser');
        },
        
        isAuthenticated() {
            return !!Utils.storage.getItem('authToken');
        }
    },
    
    // 음악 생성 관련 API
    music: {
        async generateInitialMusic(bookData) {
            return API.post('/api/generate-music', {
                type: 'initial',
                ...bookData
            });
        },
        
        async generateQuoteMusic(quoteData) {
            return API.post('/api/generate-music', {
                type: 'quote',
                ...quoteData
            });
        },
        
        async savePlaylist(playlistData) {
            return API.post('/api/playlists', playlistData);
        },
        
        async getPlaylist(playlistId) {
            return API.get(`/api/playlists/${playlistId}`);
        },
        
        async updatePlaylist(playlistId, playlistData) {
            return API.put(`/api/playlists/${playlistId}`, playlistData);
        },
        
        async deletePlaylist(playlistId) {
            return API.delete(`/api/playlists/${playlistId}`);
        }
    },
    
    // 게시판 관련 API
    board: {
        async getPlaylists(params = {}) {
            return API.get('/api/playlists', params);
        },
        
        async searchPlaylists(query, params = {}) {
            return API.get('/api/playlists/search', { q: query, ...params });
        },
        
        async likePlaylist(playlistId) {
            return API.post(`/api/playlists/${playlistId}/like`);
        },
        
        async unlikePlaylist(playlistId) {
            return API.delete(`/api/playlists/${playlistId}/like`);
        }
    },
    
    // 사용자 프로필 관련 API
    profile: {
        async getUserProfile(userId) {
            return API.get(`/api/users/${userId}`);
        },
        
        async updateProfile(profileData) {
            return API.put('/api/users/profile', profileData);
        },
        
        async uploadProfileImage(imageFile) {
            return API.upload('/api/users/profile/image', imageFile);
        },
        
        async getUserPlaylists(userId, params = {}) {
            return API.get(`/api/users/${userId}/playlists`, params);
        }
    },
    
    // 책 정보 관련 API
    books: {
        async searchBooks(query) {
            // Google Books API 호출 시뮬레이션
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockBooks = [
                        {
                            id: 1,
                            title: query,
                            author: '작가명',
                            description: `${query}에 대한 설명입니다.`,
                            coverImage: `https://via.placeholder.com/200x280?text=${encodeURIComponent(query)}`,
                            publishedDate: '2024-01-01',
                            isbn: '9781234567890'
                        }
                    ];
                    
                    resolve({
                        success: true,
                        books: mockBooks,
                        total: mockBooks.length
                    });
                }, 1000);
            });
        },
        
        async getBookDetails(bookId) {
            return API.get(`/api/books/${bookId}`);
        }
    },
    
    // 파일 업로드 관련 API
    files: {
        async uploadImage(imageFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(imageFile.type)) {
                throw new Error('지원되지 않는 이미지 형식입니다.');
            }
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxSize) {
                throw new Error('이미지 파일 크기는 5MB 이하여야 합니다.');
            }
            
            return API.upload('/api/upload', imageFile);
        },
        
        async uploadAudio(audioFile) {
            const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
            if (!allowedTypes.includes(audioFile.type)) {
                throw new Error('지원되지 않는 오디오 형식입니다.');
            }
            
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (audioFile.size > maxSize) {
                throw new Error('오디오 파일 크기는 10MB 이하여야 합니다.');
            }
            
            return API.upload('/api/upload', audioFile);
        }
    },
    
    // 댓글 관련 API
    comments: {
        async getComments(playlistId, params = {}) {
            return API.get(`/api/playlists/${playlistId}/comments`, params);
        },
        
        async addComment(playlistId, commentData) {
            return API.post(`/api/playlists/${playlistId}/comments`, commentData);
        },
        
        async updateComment(commentId, commentData) {
            return API.put(`/api/comments/${commentId}`, commentData);
        },
        
        async deleteComment(commentId) {
            return API.delete(`/api/comments/${commentId}`);
        }
    }
};

// 요청 인터셉터 - 토큰 자동 추가
const originalRequest = API.request;
API.request = async function(endpoint, options = {}) {
    const token = Utils.storage.getItem('authToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    
    return originalRequest.call(this, endpoint, options);
};

// 전역 접근을 위한 window 객체에 추가
if (typeof window !== 'undefined') {
    window.API = API;
}

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
} 