// 공통 유틸리티 함수들
const Utils = {
    // 시간 포맷팅
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        
        return date.toLocaleDateString('ko-KR');
    },
    
    // 숫자 포맷팅
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    // 텍스트 길이 제한
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // 로컬 스토리지 헬퍼
    storage: {
        setItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage setItem error:', error);
                return false;
            }
        },
        
        getItem(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Storage getItem error:', error);
                return null;
            }
        },
        
        removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage removeItem error:', error);
                return false;
            }
        }
    },
    
    // 디바운스 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 이벤트 리스너 관리
    eventManager: {
        listeners: new Map(),
        
        addEventListener(element, event, handler, options = {}) {
            const key = `${element.tagName}-${event}`;
            
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            
            this.listeners.get(key).push({ element, event, handler, options });
            element.addEventListener(event, handler, options);
        },
        
        removeAllListeners() {
            this.listeners.forEach(eventList => {
                eventList.forEach(({ element, event, handler, options }) => {
                    element.removeEventListener(event, handler, options);
                });
            });
            this.listeners.clear();
        }
    },
    
    // 입력값 검증
    validation: {
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        isValidUsername(username) {
            return username && username.length >= 3 && username.length <= 20;
        },
        
        isValidPassword(password) {
            return password && password.length >= 4;
        },
        
        sanitizeInput(input) {
            return input.trim().replace(/[<>]/g, '');
        }
    },
    
    // DOM 조작 헬퍼
    dom: {
        createElement(tag, className = '', innerHTML = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            return element;
        },
        
        findElement(selector, parent = document) {
            return parent.querySelector(selector);
        },
        
        findElements(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        },
        
        toggleClass(element, className, force = undefined) {
            if (force !== undefined) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    },
    
    // 알림 시스템
    notification: {
        show(message, type = 'info', duration = 3000) {
            const notification = Utils.dom.createElement('div', `notification ${type}`);
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // 애니메이션 효과
            setTimeout(() => notification.classList.add('show'), 100);
            
            // 자동 제거
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
            
            return notification;
        },
        
        success(message, duration = 3000) {
            return this.show(message, 'success', duration);
        },
        
        error(message, duration = 5000) {
            return this.show(message, 'error', duration);
        },
        
        warning(message, duration = 4000) {
            return this.show(message, 'warning', duration);
        },
        
        info(message, duration = 3000) {
            return this.show(message, 'info', duration);
        }
    },
    
    // 로딩 상태 관리
    loading: {
        setButtonLoading(button, isLoading, text = '처리 중...') {
            if (isLoading) {
                button.classList.add('loading');
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.textContent = text;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
                button.textContent = button.dataset.originalText || button.textContent;
            }
        },
        
        showPageLoading(show = true) {
            const loader = document.getElementById('pageLoader');
            if (loader) {
                loader.style.display = show ? 'flex' : 'none';
            }
        }
    },
    
    // URL 파라미터 관리
    urlParams: {
        get(key) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(key);
        },
        
        set(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.replaceState({}, '', url);
        },
        
        remove(key) {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            window.history.replaceState({}, '', url);
        }
    }
};

// 전역 접근을 위한 window 객체에 추가
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} 