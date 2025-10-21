# Reading Experience Platform (독서 여정 플랫폼)

책을 읽는 여정을 음악으로 기록하고 공유하는 웹 서비스

## 프로젝트 개요

독서 과정의 각 단계마다 AI가 음악을 생성하여, 완독 시 독서 경험 전체를 담은 플레이리스트가 자동으로 완성됩니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: GPT-4o-mini (음악 프롬프트), Mureka MCP (음악 생성)
- **State Management**: Zustand
- **Form**: React Hook Form + Zod

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```bash
cp .env.example .env.local
```

필요한 API 키:
- **Supabase**: https://supabase.com/dashboard
- **OpenAI**: https://platform.openai.com/api-keys
- **Mureka**: Mureka API
- **Kakao** (선택): https://developers.kakao.com/

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   ├── (main)/            # 메인 페이지들
│   │   ├── journey/       # 독서 여정
│   │   ├── library/       # 내 책장
│   │   ├── feed/          # 게시판
│   │   └── my/            # 마이페이지
│   └── api/               # API Routes
│       ├── books/         # 도서 검색
│       ├── journeys/      # 독서 여정 관리
│       ├── music/         # 음악 생성
│       └── posts/         # 게시물 관리
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── journey/          # 독서 여정 컴포넌트
│   ├── music/            # 음악 플레이어 컴포넌트
│   └── post/             # 게시물 컴포넌트
├── lib/                   # 라이브러리 및 유틸리티
│   ├── supabase/         # Supabase 클라이언트
│   └── openai/           # OpenAI 클라이언트
├── hooks/                 # Custom React Hooks
└── types/                 # TypeScript 타입 정의
```

## 개발 단계

현재 Phase 0 (초기 세팅) 완료

다음 단계:
- [ ] Phase 1: 데이터베이스 구축
- [ ] Phase 2: 인증 시스템
- [ ] Phase 3: 도서 검색
- [ ] Phase 4: 독서 여정 시작 & v0 음악 생성
- [ ] Phase 5: 독서 기록 추가 & vN 음악 생성
- [ ] Phase 6: 완독 & 최종 음악 생성

자세한 개발 계획은 [execution_plan.md](./execution_plan.md)를 참고하세요.

## 문서

- [PRD (Product Requirements Document)](./PRD_instruction.md)
- [실행 계획](./execution_plan.md)

## 라이선스

MIT
