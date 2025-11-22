// Supabase 클라이언트 초기화
let supabase;
let currentUser = null;

// DOM 요소
const authSection = document.getElementById('authSection');
const noteSection = document.getElementById('noteSection');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserSpan = document.getElementById('currentUser');
const notepad = document.getElementById('notepad');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');
const lastSaved = document.getElementById('lastSaved');
const notification = document.getElementById('notification');

// 자동저장 타이머
let autoSaveTimer;

// 페이지 로드 시 Supabase 초기화
window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});

// Supabase 초기화
function initSupabase() {
    if (typeof SUPABASE_CONFIG === 'undefined') {
        showNotification('설정 파일이 필요합니다. README를 참고하세요.', true);
        return;
    }
    
    try {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('Supabase 연결 성공');
    } catch (error) {
        console.error('Supabase 초기화 오류:', error);
        showNotification('Supabase 연결에 실패했습니다.', true);
    }
}

// 비밀번호 해시화 (간단한 SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 로그인 또는 회원가입
async function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (username.length < 4) {
        showNotification('사용자 이름은 4자 이상이어야 합니다.', true);
        return;
    }
    
    if (password.length < 6) {
        showNotification('비밀번호는 6자 이상이어야 합니다.', true);
        return;
    }
    
    try {
        loginBtn.disabled = true;
        loginBtn.textContent = '로그인 중...';
        
        const passwordHash = await hashPassword(password);
        
        // 사용자 확인
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 데이터 없음
            throw fetchError;
        }
        
        if (existingUser) {
            // 기존 사용자 로그인
            if (existingUser.password_hash === passwordHash) {
                currentUser = existingUser;
                showNoteSection();
                await loadNote();
                showNotification('로그인 성공! 환영합니다. 👋');
            } else {
                showNotification('비밀번호가 일치하지 않습니다.', true);
            }
        } else {
            // 새 사용자 등록
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ username, password_hash: passwordHash }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            currentUser = newUser;
            showNoteSection();
            showNotification('계정이 생성되었습니다! 🎉');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showNotification('로그인에 실패했습니다: ' + error.message, true);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '로그인';
    }
}

// 로그아웃
function handleLogout() {
    currentUser = null;
    notepad.value = '';
    authSection.style.display = 'block';
    noteSection.style.display = 'none';
    usernameInput.value = '';
    passwordInput.value = '';
    clearTimeout(autoSaveTimer);
    showNotification('로그아웃되었습니다.');
}

// 메모 섹션 표시
function showNoteSection() {
    authSection.style.display = 'none';
    noteSection.style.display = 'block';
    currentUserSpan.textContent = `사용자: ${currentUser.username}`;
    startAutoSave();
}

// 메모 저장
async function saveNote() {
    if (!currentUser) return;
    
    const content = notepad.value;
    
    try {
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';
        
        // 기존 메모 확인
        const { data: existingNote } = await supabase
            .from('notes')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();
        
        if (existingNote) {
            // 업데이트
            const { error } = await supabase
                .from('notes')
                .update({ 
                    content, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', existingNote.id);
            
            if (error) throw error;
        } else {
            // 새로 생성
            const { error } = await supabase
                .from('notes')
                .insert([{ 
                    user_id: currentUser.id, 
                    content 
                }]);
            
            if (error) throw error;
        }
        
        updateLastSaved();
        showNotification('메모가 저장되었습니다! 💾');
    } catch (error) {
        console.error('저장 오류:', error);
        showNotification('저장에 실패했습니다: ' + error.message, true);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 저장';
    }
}

// 메모 불러오기
async function loadNote() {
    if (!currentUser) return;
    
    try {
        loadBtn.disabled = true;
        loadBtn.textContent = '불러오는 중...';
        
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        if (data) {
            notepad.value = data.content || '';
            updateStats();
            updateLastSaved(data.updated_at);
            showNotification('메모를 불러왔습니다! 📥');
        } else {
            notepad.value = '';
            updateStats();
            showNotification('저장된 메모가 없습니다.', false, 'info');
        }
    } catch (error) {
        console.error('불러오기 오류:', error);
        showNotification('불러오기에 실패했습니다: ' + error.message, true);
    } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = '📥 불러오기';
    }
}

// 메모 초기화
function clearNote() {
    if (notepad.value && !confirm('정말로 메모를 초기화하시겠습니까?')) {
        return;
    }
    
    notepad.value = '';
    updateStats();
    showNotification('메모가 초기화되었습니다. 🗑️');
}

// 통계 업데이트
function updateStats() {
    const content = notepad.value;
    
    charCount.textContent = content.length;
    
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = content.trim() ? words.length : 0;
    
    const lines = content.split('\n').length;
    lineCount.textContent = lines;
}

// 마지막 저장 시간 업데이트
function updateLastSaved(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        lastSaved.textContent = date.toLocaleString('ko-KR');
    } else {
        lastSaved.textContent = '방금 전';
    }
}

// 자동 저장 시작
function startAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setInterval(async () => {
        if (currentUser && notepad.value.trim()) {
            await saveNote();
        }
    }, 5000); // 5초마다
}

// 알림 표시
function showNotification(message, isError = false, type = '') {
    notification.textContent = message;
    notification.className = 'notification show';
    
    if (isError) {
        notification.classList.add('error');
    } else if (type === 'info') {
        notification.classList.add('info');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.remove('error', 'info');
        }, 300);
    }, 3000);
}

// 이벤트 리스너
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
saveBtn.addEventListener('click', saveNote);
loadBtn.addEventListener('click', loadNote);
clearBtn.addEventListener('click', clearNote);

notepad.addEventListener('input', updateStats);

// Enter 키로 로그인
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (currentUser && (e.ctrlKey || e.metaKey)) {
        if (e.key === 's') {
            e.preventDefault();
            saveNote();
        } else if (e.key === 'l') {
            e.preventDefault();
            loadNote();
        }
    }
});

// 페이지 종료 시 자동 저장
window.addEventListener('beforeunload', () => {
    clearTimeout(autoSaveTimer);
});
