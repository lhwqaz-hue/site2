"# ☁️ Supabase 클라우드 메모장

Supabase를 사용하여 클라우드에 안전하게 저장되는 메모장 앱입니다.

## ✨ 주요 기능

- **클라우드 저장**: Supabase PostgreSQL 데이터베이스에 메모 저장
- **사용자 인증**: 간단한 사용자명/비밀번호 시스템
- **자동 저장**: 5초마다 자동으로 메모 저장
- **실시간 통계**: 문자 수, 단어 수, 줄 수, 마지막 저장 시간 표시
- **보안**: 비밀번호 SHA-256 해시화
- **반응형 디자인**: 모든 기기에서 사용 가능

## 🚀 설치 및 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입 (무료)
2. 새 프로젝트 생성
3. 프로젝트 대시보드에서 **Settings** → **API** 이동
4. 다음 정보 복사:
   - Project URL
   - anon public key

### 2. 데이터베이스 테이블 생성

Supabase 대시보드에서 **SQL Editor**를 열고 다음 SQL을 실행:

```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메모 테이블
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_users_username ON users(username);

-- RLS (Row Level Security) 비활성화 (간단한 앱이므로)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
```

### 3. 설정 파일 생성

프로젝트 폴더에 `config.js` 파일을 생성하고 다음 내용 입력:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // https://xxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
};
```

⚠️ **중요**: `config.js`는 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다!

### 4. 로컬에서 테스트

`index.html` 파일을 브라우저에서 열어 테스트합니다.

## 📤 GitHub Pages 배포

### 옵션 1: 환경 변수 사용 (권장)

GitHub Pages에서는 `config.js`를 직접 포함할 수 없으므로, HTML에 직접 설정을 추가:

`index.html`의 `<script src="config.js"></script>` 줄을 다음으로 교체:

```html
<script>
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
</script>
```

그 다음 배포:

```bash
git add .
git commit -m "Add Supabase notepad app"
git push origin main
```

GitHub Settings → Pages → Branch를 `main`으로 설정

### 옵션 2: 로컬에서만 사용

`config.js`를 로컬에만 유지하고 개인용으로 사용

## 📁 파일 구조

```
site2/
├── index.html           # 메인 HTML
├── style.css            # 스타일시트
├── app.js              # JavaScript (Supabase 통합)
├── config.js           # Supabase 설정 (gitignore됨)
├── config.example.js   # 설정 예제
├── .gitignore          # Git 제외 파일
└── README.md           # 프로젝트 설명
```

## 💡 사용 방법

1. **회원가입/로그인**
   - 사용자 이름 (4자 이상) 입력
   - 비밀번호 (6자 이상) 입력
   - 로그인 버튼 클릭
   - 처음 사용하는 이름이면 자동으로 계정 생성

2. **메모 작성**
   - 텍스트 영역에 메모 입력
   - 자동으로 5초마다 저장됨
   - 또는 "저장" 버튼 클릭

3. **메모 불러오기**
   - "불러오기" 버튼으로 저장된 메모 로드

4. **키보드 단축키**
   - `Ctrl/Cmd + S`: 저장
   - `Ctrl/Cmd + L`: 불러오기

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL)
- **인증**: SHA-256 비밀번호 해시
- **호스팅**: GitHub Pages

## 🔒 보안

- 비밀번호는 SHA-256으로 해시화되어 저장
- API 키는 anon key로 제한된 권한
- 프로덕션 환경에서는 RLS(Row Level Security) 활성화 권장

## 📊 Supabase 무료 플랜 제한

- 데이터베이스: 500MB
- API 요청: 월 50,000회
- 대역폭: 월 2GB
- 개인 프로젝트에 충분!

## 🛠️ 커스터마이징

- `style.css`: 디자인 변경
- `app.js`: 기능 추가 (예: 메모 목록, 검색 등)
- SQL: 테이블 구조 확장

## 🐛 문제 해결

**"설정 파일이 필요합니다" 오류**
- `config.js` 파일이 없거나 잘못된 위치에 있음
- `config.example.js`를 참고하여 `config.js` 생성

**로그인 실패**
- Supabase 프로젝트가 활성화되어 있는지 확인
- API URL과 Key가 정확한지 확인
- 브라우저 콘솔에서 에러 메시지 확인

**저장 실패**
- 데이터베이스 테이블이 올바르게 생성되었는지 확인
- Supabase 대시보드에서 테이블 확인" 
