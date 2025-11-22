"# 📝 URL 기반 메모장

간단하고 편리한 웹 기반 메모장입니다. URL을 통해 메모를 저장하고 공유할 수 있습니다.

## ✨ 주요 기능

- **URL 저장**: 메모를 URL 해시에 Base64 인코딩하여 저장
- **자동 저장**: 로컬 스토리지에 자동으로 메모 저장
- **URL 공유**: 저장된 URL을 복사하여 다른 사람과 메모 공유
- **실시간 통계**: 문자 수, 단어 수, 줄 수 실시간 표시
- **키보드 단축키**: 
  - `Ctrl/Cmd + S`: 저장
  - `Ctrl/Cmd + K`: 초기화
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🚀 사용 방법

1. **메모 작성**: 텍스트 영역에 메모를 입력합니다
2. **저장**: "💾 URL로 저장" 버튼을 클릭하면 URL에 메모가 저장됩니다
3. **공유**: "📋 URL 복사" 버튼으로 링크를 복사하여 공유합니다
4. **북마크**: URL을 북마크하면 언제든지 메모에 접근할 수 있습니다

## 🔧 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 그라디언트, 플렉스박스, 그리드, 반응형 디자인
- **JavaScript (Vanilla)**: 
  - Base64 인코딩/디코딩
  - URL 해시 API
  - Local Storage API
  - Clipboard API

## 📦 GitHub Pages 배포

### 1. GitHub에 푸시
```bash
git add .
git commit -m "Add URL-based notepad app"
git push origin main
```

### 2. GitHub Pages 활성화
1. https://github.com/lhwqaz-hue/site2 접속
2. **Settings** → **Pages** 이동
3. Branch: `main`, Folder: `/ (root)` 선택
4. **Save** 클릭

### 3. 배포된 사이트 접속
약 1-2분 후 다음 URL에서 접속 가능합니다:
```
https://lhwqaz-hue.github.io/site2/
```

## 📁 파일 구조
```
site2/
├── index.html    # 메인 HTML (메모장 UI)
├── style.css     # 스타일시트
├── app.js        # JavaScript 로직
└── README.md     # 프로젝트 설명
```

## 💡 작동 원리

1. **URL 저장**: 사용자가 입력한 텍스트를 Base64로 인코딩한 후 URL 해시(#)에 저장합니다
   ```
   https://example.com/#SGVsbG8gV29ybGQ=
   ```

2. **자동 로드**: 페이지 로드 시 URL 해시를 디코딩하여 메모를 복원합니다

3. **로컬 백업**: Local Storage에도 저장하여 URL이 없어도 메모를 복원할 수 있습니다

4. **공유**: URL을 복사하여 다른 사람에게 전달하면 동일한 메모를 볼 수 있습니다

## 🔒 보안 및 제한사항

- URL 길이 제한: 브라우저마다 다르지만 일반적으로 2,000자 정도까지 안전합니다
- 민감한 정보는 저장하지 마세요 (URL에 그대로 노출됨)
- 로컬 스토리지는 브라우저별로 관리됩니다

## 🎨 커스터마이징

색상, 폰트, 레이아웃을 원하는 대로 수정할 수 있습니다:
- `style.css`: 디자인 변경
- `app.js`: 기능 추가/수정
- `index.html`: 구조 변경" 
