// 로그인 페이지 JavaScript

// DOM 요소 선택
const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginButton = loginForm.querySelector('.login-button');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkRememberedUser();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 제출 이벤트
    loginForm.addEventListener('submit', handleLogin);
    
    // 입력 필드 실시간 검증
    userIdInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);
    
    // 엔터 키 처리
    userIdInput.addEventListener('keypress', handleEnterKey);
    passwordInput.addEventListener('keypress', handleEnterKey);
    
    // 체크박스 이벤트
    rememberMeCheckbox.addEventListener('change', handleRememberMe);
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = {
        userId: userIdInput.value.trim(),
        password: passwordInput.value,
        rememberMe: rememberMeCheckbox.checked
    };
    
    // 입력 검증
    if (!validateInputs(formData)) {
        return;
    }
    
    // 로딩 상태 시작
    setLoadingState(true);
    
    try {
        // 로그인 시뮬레이션 (실제로는 서버 API 호출)
        const result = await simulateLogin(formData);
        
        if (result.success) {
            // 로그인 성공
            handleLoginSuccess(result.user, formData.rememberMe);
        } else {
            // 로그인 실패
            handleLoginError(result.message);
        }
    } catch (error) {
        handleLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        setLoadingState(false);
    }
}

// 입력 검증
function validateInputs(formData) {
    clearErrorMessages();
    
    let isValid = true;
    
    // 아이디 검증
    if (!formData.userId) {
        showFieldError(userIdInput, '아이디를 입력해주세요.');
        isValid = false;
    } else if (formData.userId.length < 3) {
        showFieldError(userIdInput, '아이디는 3자 이상 입력해주세요.');
        isValid = false;
    }
    
    // 비밀번호 검증
    if (!formData.password) {
        showFieldError(passwordInput, '비밀번호를 입력해주세요.');
        isValid = false;
    } else if (formData.password.length < 4) {
        showFieldError(passwordInput, '비밀번호는 4자 이상 입력해주세요.');
        isValid = false;
    }
    
    return isValid;
}

// 폼 실시간 검증
function validateForm() {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    
    // 버튼 활성화/비활성화
    if (userId && password) {
        loginButton.disabled = false;
    } else {
        loginButton.disabled = true;
    }
}

// 로그인 시뮬레이션
function simulateLogin(formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 더미 사용자 데이터
            const dummyUsers = [
                { userId: 'user1', password: '1234', nickname: '독서 애호가', email: 'user1@example.com' },
                { userId: 'admin', password: 'admin', nickname: '관리자', email: 'admin@example.com' },
                { userId: 'test', password: 'test', nickname: '테스트 사용자', email: 'test@example.com' }
            ];
            
            const user = dummyUsers.find(u => 
                u.userId === formData.userId && u.password === formData.password
            );
            
            if (user) {
                resolve({
                    success: true,
                    user: {
                        id: Date.now(),
                        username: user.userId,
                        nickname: user.nickname,
                        email: user.email,
                        profileImage: 'https://via.placeholder.com/100',
                        joinDate: new Date().toISOString()
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: '아이디 또는 비밀번호가 올바르지 않습니다.'
                });
            }
        }, 1000); // 1초 지연으로 로딩 시뮬레이션
    });
}

// 로그인 성공 처리
function handleLoginSuccess(user, rememberMe) {
    // 사용자 정보 저장
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // 자동 로그인 설정
    if (rememberMe) {
        localStorage.setItem('rememberUser', JSON.stringify({
            userId: user.username,
            timestamp: Date.now()
        }));
    }
    
    // 성공 메시지 표시
    showSuccessMessage('로그인 성공! 메인 페이지로 이동합니다.');
    
    // 메인 페이지로 리다이렉트
    setTimeout(() => {
        const returnUrl = new URLSearchParams(window.location.search).get('return');
        window.location.href = returnUrl || 'index.html';
    }, 1500);
}

// 로그인 실패 처리
function handleLoginError(message) {
    showErrorMessage(message);
    passwordInput.value = '';
    passwordInput.focus();
}

// 로딩 상태 설정
function setLoadingState(isLoading) {
    if (isLoading) {
        loginButton.classList.add('loading');
        loginButton.disabled = true;
        userIdInput.disabled = true;
        passwordInput.disabled = true;
    } else {
        loginButton.classList.remove('loading');
        userIdInput.disabled = false;
        passwordInput.disabled = false;
        validateForm();
    }
}

// 에러 메시지 표시
function showErrorMessage(message) {
    clearErrorMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    clearErrorMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
}

// 필드별 에러 메시지 표시
function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    errorSpan.style.color = '#e74c3c';
    errorSpan.style.fontSize = '0.8rem';
    errorSpan.style.marginTop = '0.25rem';
    errorSpan.style.display = 'block';
    
    field.parentNode.appendChild(errorSpan);
}

// 에러 메시지 모두 제거
function clearErrorMessages() {
    // 전체 에러/성공 메시지 제거
    const messages = loginForm.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
    
    // 필드별 에러 메시지 제거
    const fieldErrors = loginForm.querySelectorAll('.field-error');
    fieldErrors.forEach(error => error.remove());
    
    // 필드 스타일 초기화
    userIdInput.style.borderColor = '';
    passwordInput.style.borderColor = '';
}

// 엔터 키 처리
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        if (e.target === userIdInput) {
            passwordInput.focus();
        } else if (e.target === passwordInput) {
            if (!loginButton.disabled) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    }
}

// 자동 로그인 처리
function handleRememberMe() {
    if (!rememberMeCheckbox.checked) {
        localStorage.removeItem('rememberUser');
    }
}

// 기억된 사용자 확인
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberUser');
    
    if (rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            const daysPassed = (Date.now() - userData.timestamp) / (1000 * 60 * 60 * 24);
            
            // 30일 이내인 경우만 자동 입력
            if (daysPassed <= 30) {
                userIdInput.value = userData.userId;
                rememberMeCheckbox.checked = true;
                passwordInput.focus();
            } else {
                localStorage.removeItem('rememberUser');
            }
        } catch (e) {
            localStorage.removeItem('rememberUser');
        }
    }
}

// 소셜 로그인 (향후 확장용)
function setupSocialLogin() {
    const socialButtons = document.querySelectorAll('.social-login-button');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = button.dataset.provider;
            showNotification(`${provider} 로그인은 준비 중입니다.`, 'info');
        });
    });
}

// 알림 메시지 표시 (main.js와 동일한 함수)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 