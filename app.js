// DOM 요소 가져오기
const notepad = document.getElementById('notepad');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');
const notification = document.getElementById('notification');

// 로컬 스토리지 키
const STORAGE_KEY = 'notepad_content';

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', () => {
    loadNoteFromURL();
    updateStats();
});

// 유니코드 안전한 Base64 인코딩
function base64Encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    }));
}

// 유니코드 안전한 Base64 디코딩
function base64Decode(str) {
    return decodeURIComponent(atob(str).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// URL 해시에서 메모 로드
function loadNoteFromURL() {
    try {
        // URL 해시에서 데이터 가져오기
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            // URL 디코딩 및 Base64 디코딩 (유니코드 지원)
            const decodedData = decodeURIComponent(hash);
            const noteContent = base64Decode(decodedData);
            notepad.value = noteContent;
            showNotification('메모를 불러왔습니다! 📖');
        } else {
            // URL에 데이터가 없으면 로컬 스토리지에서 로드
            const savedNote = localStorage.getItem(STORAGE_KEY);
            if (savedNote) {
                notepad.value = savedNote;
                showNotification('로컬 저장소에서 메모를 복원했습니다! 💾');
            }
        }
    } catch (error) {
        console.error('메모 로드 오류:', error);
        showNotification('메모를 불러오는데 실패했습니다.', true);
        
        // 실패 시 로컬 스토리지에서 시도
        const savedNote = localStorage.getItem(STORAGE_KEY);
        if (savedNote) {
            notepad.value = savedNote;
        }
    }
    updateStats();
}

// URL로 저장
function saveToURL() {
    const content = notepad.value.trim();
    
    if (!content) {
        showNotification('저장할 내용이 없습니다.', true);
        return;
    }
    
    try {
        // Base64 인코딩 및 URL 인코딩 (유니코드 지원)
        const encodedData = base64Encode(content);
        const urlSafeData = encodeURIComponent(encodedData);
        
        // URL 해시 업데이트
        window.location.hash = urlSafeData;
        
        // 로컬 스토리지에도 저장
        localStorage.setItem(STORAGE_KEY, content);
        
        showNotification('URL에 메모가 저장되었습니다! 🎉');
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('메모 저장에 실패했습니다.', true);
    }
}

// URL 복사
function copyURL() {
    const url = window.location.href;
    
    if (!window.location.hash) {
        showNotification('먼저 메모를 저장해주세요!', true);
        return;
    }
    
    // 클립보드에 복사
    navigator.clipboard.writeText(url)
        .then(() => {
            showNotification('URL이 클립보드에 복사되었습니다! 📋');
        })
        .catch(() => {
            // 대체 방법
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('URL이 클립보드에 복사되었습니다! 📋');
            } catch (err) {
                showNotification('URL 복사에 실패했습니다.', true);
            }
            document.body.removeChild(textArea);
        });
}

// 메모 초기화
function clearNote() {
    if (notepad.value && !confirm('정말로 메모를 초기화하시겠습니까?')) {
        return;
    }
    
    notepad.value = '';
    window.location.hash = '';
    localStorage.removeItem(STORAGE_KEY);
    updateStats();
    showNotification('메모가 초기화되었습니다. 🗑️');
}

// 통계 업데이트
function updateStats() {
    const content = notepad.value;
    
    // 문자 수
    charCount.textContent = content.length;
    
    // 단어 수 (공백 기준)
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = content.trim() ? words.length : 0;
    
    // 줄 수
    const lines = content.split('\n').length;
    lineCount.textContent = lines;
}

// 알림 표시
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'notification show';
    
    if (isError) {
        notification.classList.add('error');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.remove('error');
        }, 300);
    }, 3000);
}

// 자동 저장 (로컬 스토리지)
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const content = notepad.value;
        if (content) {
            localStorage.setItem(STORAGE_KEY, content);
        }
    }, 1000); // 1초 후 자동 저장
}

// 이벤트 리스너
saveBtn.addEventListener('click', saveToURL);
clearBtn.addEventListener('click', clearNote);
copyBtn.addEventListener('click', copyURL);

notepad.addEventListener('input', () => {
    updateStats();
    autoSave();
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: 저장
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToURL();
    }
    
    // Ctrl/Cmd + K: 초기화
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearNote();
    }
});

// URL 해시 변경 감지
window.addEventListener('hashchange', () => {
    loadNoteFromURL();
});
