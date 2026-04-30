# 취트키 프론트엔드 Planning Document

> **Summary**: 백엔드 API 스펙 기반으로 설계하고 claude-design 데모를 시각적 레퍼런스로 삼아 구현하는 취트키 프론트엔드 — Vite + React(JS), Context + React Query, 토스뱅크 블루 디자인
>
> **Project**: Chit-key
> **Version**: 0.1.0
> **Author**: YUBIN-githubb
> **Date**: 2026-04-30
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 백엔드 API(FastAPI + Supabase)는 완성됐지만, 이를 실제로 사용할 수 있는 프론트엔드가 없음. claude-design 데모는 목업 수준으로 실제 API와 연결되지 않음 |
| **Solution** | 백엔드 API 스펙을 기준으로 상태 모델과 컴포넌트를 설계하고, claude-design 데모는 레이아웃·UX 흐름의 시각적 레퍼런스로만 활용. Vite + React + React Query로 구현 |
| **Function/UX Effect** | 로그인(Google OAuth) → 온보딩(닉네임+API Key) → AI 챗봇(기업분석·문항분석·자소서작성) → 경험관리(STAR 구조) → 마이페이지로 이어지는 완전한 플로우. 토스뱅크 스타일 블루 디자인으로 신뢰감 전달 |
| **Core Value** | 사용자의 경험 DB + AI 에이전트 3종을 UI에서 직접 조작해 자소서 초안까지 원스톱 완성 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 완성된 백엔드를 실제로 사용할 수 있도록 프론트엔드를 구축. 데모 코드 이식이 아닌 백엔드 스펙 기반 설계 |
| **WHO** | 취업 준비생. Google 계정 + Claude API Key를 보유한 사용자 |
| **RISK** | Supabase Google OAuth Redirect URL 설정 누락 / 백엔드 CORS 미설정 / 에이전트 30초+ 응답 대기 UX |
| **SUCCESS** | 5개 화면 정상 동작 + Google OAuth 로그인 + 에이전트 3종 실제 API 호출 성공 + 경험 CRUD 연동 |
| **SCOPE** | Phase 1: 전체 화면 구현 + 백엔드 API 연동. Phase 2: 배포(Vercel) |

---

## 1. Overview

### 1.1 Purpose

백엔드 API(FastAPI + Supabase)가 이미 완성된 상태에서, 이를 실제로 사용할 수 있는 프론트엔드를 구축한다. claude-design 폴더의 데모 코드는 **UI 레이아웃·UX 흐름의 레퍼런스**로만 사용하며, 컴포넌트 props와 상태 모델은 반드시 백엔드 API 스펙을 기준으로 새로 설계한다.

### 1.2 Background

- 백엔드 API(FastAPI + Supabase): 인증, 경험 CRUD, 채팅, 에이전트 3종 구현 완료
- claude-design 데모: 목업 수준의 React JSX 5파일. 인증·데이터 모두 가짜
- `frontend/index.html`: 현재 비어 있음
- 목표: 데모의 UX를 참고하되 실제 백엔드와 연결된 동작하는 앱 구현

### 1.3 데모 vs 백엔드 실제 차이 (구현 시 주의)

데모는 UI 프로토타입으로 실제 백엔드와 여러 부분이 다르다. 구현 시 데모 구조를 따르지 않고 **백엔드 스펙**을 기준으로 한다.

| 항목 | 데모 (claude-design) | 백엔드 실제 |
|------|---------------------|------------|
| **인증** | `setTimeout` 목업 | Supabase Google OAuth → JWT Bearer |
| **경험 데이터 모델** | `title, role, period, tags` | `name, role, period_start, period_end, star_situation, star_task, star_action, star_result, competency_tags` |
| **채팅 구조** | 인메모리 메시지 배열 | `chat_id → message → artifact` 3계층 DB |
| **문항 입력** | 문자열 배열 | `[{question: str, char_limit: int\|null}]` |
| **에이전트 응답** | 없음(목업) | `{artifact: {...}, result: string}` |
| **에이전트 파이프라인** | 독립 호출 | 기업분석 → 문항분석(company_artifact_id) → 자소서(question_artifact_id) 연결 |

### 1.4 Related Documents

- 백엔드 플랜: `backend/docs/01-plan/features/chit-key-backend.plan.md`
- 디자인 데모: `claude-design/` (app.jsx, auth.jsx, chat.jsx, experience.jsx, my-page.jsx)

---

## 2. Scope

### 2.1 In Scope

- [ ] Vite + React(JS) 프로젝트 초기화 및 환경 설정
- [ ] Supabase Auth — Google OAuth 로그인 / 로그아웃
- [ ] 온보딩 화면 — 닉네임 입력(Step 1) + Claude API Key 등록(Step 2)
- [ ] AI 챗봇 화면 — 에이전트 3종(기업분석·문항분석·자소서작성) 호출 + 결과 표시
- [ ] 경험관리 화면 — STAR 구조 기반 경험 CRUD
- [ ] 마이페이지 화면 — 프로필 조회 + API Key 관리 + 로그아웃
- [ ] 백엔드 API 클라이언트 (`src/services/api.js`) — JWT 자동 주입
- [ ] React Query 기반 서버 상태 관리
- [ ] 에이전트 호출 중 로딩 UX + 에러 처리
- [ ] artifact 결과 카드 컴포넌트
- [ ] 토스뱅크 블루 디자인 시스템 적용
- [ ] Google OAuth 프로필 이미지 — 사이드바·마이페이지 아바타
- [ ] 채팅 이력 & 산출물 관리 페이지 (새 탭)
- [ ] Artifact 첨부 picker UI — 에이전트 입력 시 이전 산출물 선택
- [ ] 글래스모피즘 디자인 — 투명도 + backdrop-filter blur
- [ ] BUG: 채팅 메시지 내 artifact 내용 렌더링 수정 (artifact_id → 내용 fetch)

### 2.2 Out of Scope

- TypeScript 마이그레이션 (Phase 2)
- 테스트 코드 (Phase 2)
- 배포 설정 (Phase 2)
- 다크모드
- 모바일 반응형 (데스크탑 우선)
- 채팅 히스토리 목록 사이드바 (Phase 2)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Google OAuth 로그인 / 로그아웃 | High | Pending |
| FR-02 | 온보딩 Step 1 — 닉네임 입력 및 저장 (`PATCH /users/me`) | High | Pending |
| FR-03 | 온보딩 Step 2 — Claude API Key 등록 (`POST /users/me/api-key`) | High | Pending |
| FR-04 | 온보딩 완료 여부에 따른 화면 분기 | High | Pending |
| FR-05 | 경험 목록 조회 (`GET /experiences`) | High | Pending |
| FR-06 | 경험 추가 — STAR 4개 필드 + 날짜 + competency_tags | High | Pending |
| FR-07 | 경험 수정 / 삭제 | High | Pending |
| FR-08 | 채팅 생성 (`POST /chats`) | High | Pending |
| FR-09 | 기업분석 에이전트 호출 (`POST /agents/company-analyze`) | High | Pending |
| FR-10 | 문항분석 에이전트 호출 — 문항+글자수 입력 (`POST /agents/question-analyze`) | High | Pending |
| FR-11 | 자소서작성 에이전트 호출 — 문항+글자수 + 선택적 문항분석 artifact 참조 | High | Pending |
| FR-12 | 에이전트 파이프라인 연결 (이전 단계 artifact_id 전달) | High | Pending |
| FR-13 | artifact 결과 카드 렌더링 (결과 텍스트 + 복사 버튼) | Medium | Done |
| FR-14 | 에이전트 호출 중 로딩 UX (문구 포함) | Medium | Done |
| FR-15 | 마이페이지 — API Key 현황·수정·삭제 | Medium | Done |
| FR-16 | 전체 에러 상태 처리 (토스 스타일 에러 메시지) | Medium | Done |
| FR-17 | Google OAuth 프로필 이미지 표시 — 사이드바·마이페이지 아바타 | Medium | Pending |
| FR-18 | 채팅 이력 페이지 — 채팅 목록·선택·삭제 (`GET/DELETE /chats`) | High | Pending |
| FR-19 | Artifacts 관리 페이지 — 전체 산출물 목록, agent_type별 필터 (`GET /artifacts`) | High | Pending |
| FR-20 | Artifact 첨부 기능 — 에이전트 입력 시 이전 산출물을 picker UI로 선택 첨부 | High | Pending |
| FR-21 | 글래스모피즘 디자인 — 사이드바·카드·모달에 투명도+blur 적용 | Medium | Pending |
| BUG-01 | 채팅 메시지 artifact 렌더링 버그 수정 — 현재 artifact_id만 있고 내용 없음 (`GET /artifacts/{id}` 별도 fetch 필요) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|--------------------|
| 응답성 | 에이전트 호출 외 화면 전환 < 200ms | 브라우저 DevTools |
| 보안 | JWT 토큰은 Supabase SDK가 관리. 코드에 직접 노출 금지 | 코드 리뷰 |
| 호환성 | Chrome 최신 버전 기준 동작 | 수동 테스트 |
| UX | 에이전트 로딩 중 명확한 상태 표시, 에러 시 토스 스타일 안내 문구 | 수동 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 5개 화면(로그인·온보딩·챗봇·경험관리·마이페이지) 렌더링 정상
- [ ] Google OAuth 로그인 → 온보딩(2단계) → 메인 앱 진입 플로우 동작
- [ ] 에이전트 3종 실제 API 호출 및 결과 표시 (artifact 카드)
- [ ] 경험 CRUD 백엔드 연동 완료 (STAR 구조 폼 포함)
- [ ] `npm run dev`로 로컬 실행 가능, `npm run build` 빌드 성공

### 4.2 Quality Criteria

- [ ] 빌드 오류 없음 (`vite build` 성공)
- [ ] 정상 플로우에서 콘솔 에러 없음
- [ ] 토스뱅크 블루 디자인 가이드(`#1B64DA` 팔레트) 적용 확인
- [ ] 모든 버튼·안내 문구가 §7.2 말투 가이드 준수

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase Google OAuth Redirect URL 미등록 | High | High | Supabase 대시보드에서 `http://localhost:5173` 등록 필수 (초기 설정 시 체크) |
| 백엔드 CORS 미설정으로 API 호출 차단 | High | High | FastAPI에 `CORSMiddleware` 추가 (구현 전 확인) |
| 에이전트 응답 30초+ 지연 — 사용자 이탈 | High | High | 로딩 문구 + 단계별 진행 표시로 UX 완화. React Query `staleTime` 활용 |
| 경험 폼 STAR 구조가 데모보다 복잡 — 구현 난이도 | Medium | Medium | 폼을 여러 단계로 나누거나 접기/펼치기 방식으로 UX 단순화 |
| Inline style 방식으로 인한 토큰 일관성 유지 어려움 | Low | Medium | `src/styles/colors.js`에 색상 상수 정의 후 참조 |

---

## 6. Architecture Considerations

### 6.1 Project Level

**Dynamic** — BaaS(Supabase) + 커스텀 백엔드(FastAPI) 연동, 기능 기반 모듈 구조

### 6.2 구현 방식 — Context + React Query (확정)

인증/유저 전역 상태는 React Context, API 데이터는 TanStack Query로 처리. 컴포넌트 props와 상태 모델은 백엔드 API 스펙 기준으로 설계.

| 항목 | 내용 |
|------|------|
| 전역 상태 (Auth) | React Context — `user`, `session` (Supabase Auth 상태) |
| 서버 상태 | TanStack Query — experiences, messages, artifacts (자동 캐시·로딩·에러) |
| API 레이어 | `src/services/api.js` — fetch wrapper, Authorization 헤더 자동 주입 |
| 컴포넌트 props | 백엔드 API 응답 스펙 기준 설계 (데모 props 구조 그대로 쓰지 않음) |
| 추가 의존성 | `@tanstack/react-query`, `@supabase/supabase-js` |

### 6.3 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | React 18 + Vite | 빠른 개발 환경, HMR |
| 언어 | JavaScript (JSX) | Phase 1 속도 우선. TS는 Phase 2 |
| 전역 상태 | React Context | auth/user만 담당. 단순하게 유지 |
| 서버 상태 | TanStack Query | experiences·messages·artifacts 자동 캐시·로딩·에러 처리 |
| API Client | fetch (native) + `api.js` wrapper | 의존성 최소화 |
| Auth | Supabase JS SDK | 백엔드와 동일 Supabase 프로젝트. JWT 자동 관리 |
| Styling | Inline styles + `src/styles/colors.js` 상수 | 데모 스타일 구조 유지, 색상만 상수로 통일 |
| 환경변수 | `.env.local` (VITE_ prefix) | Vite 컨벤션 |

### 6.4 폴더 구조

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.local                   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
├── docs/
│   └── 01-plan/features/frontend.plan.md
└── src/
    ├── main.jsx                 # React Query Provider + AuthProvider + App 마운트
    ├── App.jsx                  # screen state 라우터 (login/onboarding/main)
    ├── styles/
    │   └── colors.js            # 토스뱅크 블루 색상 상수
    ├── lib/
    │   └── supabase.js          # Supabase 클라이언트 초기화
    ├── context/
    │   └── AuthContext.jsx      # user, session 전역 상태 (auth만)
    ├── services/
    │   └── api.js               # FastAPI 호출 함수 + JWT 헤더 주입
    ├── hooks/
    │   ├── useExperiences.js    # React Query — 경험 CRUD hooks
    │   ├── useMessages.js       # React Query — 채팅 메시지 hooks
    │   └── useAgents.js         # React Query — 에이전트 호출 mutation hooks
    └── components/
        ├── auth/
        │   ├── LoginScreen.jsx
        │   └── OnboardingScreen.jsx   # Step 1(닉네임) + Step 2(API Key)
        ├── layout/
        │   └── AppShell.jsx           # 사이드바 + 탭 네비게이션
        ├── chat/
        │   ├── ChatScreen.jsx
        │   ├── MessageList.jsx        # 메시지 + artifact 카드 렌더링
        │   ├── ArtifactCard.jsx       # 에이전트 결과 카드
        │   └── AgentInputPanel.jsx    # 에이전트별 입력 폼 (기업/문항/자소서)
        ├── experience/
        │   ├── ExperienceScreen.jsx
        │   ├── ExperienceCard.jsx
        │   └── ExperienceForm.jsx     # STAR 구조 폼
        └── mypage/
            └── MyPage.jsx
```

---

## 7. UX 원칙

### 7.1 온보딩 개념

온보딩은 단순한 초기 설정 화면이 아니라 서비스가 사용자를 처음 맞이하는 경험이다. 사용자가 자연스럽게 무엇을 해야 하는지 이해하고, "이 서비스가 나를 위한 것"임을 느끼게 해야 한다.

**온보딩 단계:**

| 단계 | 화면 | 목적 | 핵심 문구 |
|------|------|------|-----------|
| 0 | 로그인 | 서비스 가치 한 줄 전달 + 진입 장벽 최소화 | "취업 준비, AI와 함께라면 달라요" |
| 1 | Step 1 — 닉네임 | 개인화 시작. 이름으로 부르기 위해 | "어떻게 불러드릴까요?" |
| 2 | Step 2 — API Key | 서비스 동작 원리 설명 + Key 등록 | "취트키는 내 Claude API Key로 동작해요" |
| 3 | 완료 | 환영 + 첫 번째 행동 안내 | "준비됐어요! 경험을 먼저 등록해 보세요" |

**UX 원칙:**
- 한 화면 = 한 행동 (분산 금지)
- Step 진행률 표시 (1/2, 2/2)로 끝이 보이게
- API Key는 필수라 "나중에" 없음 — 대신 발급 링크 제공으로 부담 완화
- 틀렸을 때 혼내지 않고 조용하게 안내

### 7.2 말투 & 톤앤매너

토스뱅크처럼 **친절하고 따뜻하되, 불필요하게 길지 않은** 말투 사용.

**원칙:**
- "~하세요" → "~해 보세요" / "~할 수 있어요"
- 에러도 위로 먼저: "앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요"
- 로딩 중에도 기다림이 즐거운 문구 사용
- 성공 시 함께 기뻐하기

**상황별 말투 기준:**

| 상황 | ❌ 피할 말투 | ✅ 권장 말투 |
|------|------------|------------|
| 로그인 버튼 | "로그인" | "Google로 시작하기" |
| 닉네임 입력 | "닉네임을 입력하세요" | "어떻게 불러드릴까요?" |
| API Key 안내 | "Claude API Key를 입력하세요" | "취트키는 내 Claude API Key로 동작해요. 아직 없다면 여기서 발급할 수 있어요" |
| 에이전트 로딩 | "처리 중..." | "AI가 기업을 분석하고 있어요. 조금만 기다려 주세요" |
| 에러 발생 | "오류가 발생했습니다" | "앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요" |
| 경험 등록 완료 | "저장되었습니다" | "경험이 추가됐어요! 자소서 작성 때 활용할 수 있어요" |
| 온보딩 완료 | "설정이 완료되었습니다" | "준비 완료! 이제 취업 준비를 시작해 봐요" |
| 빈 경험 목록 | "등록된 경험이 없습니다" | "아직 경험이 없어요. 첫 번째 경험을 등록해 볼까요?" |

**적용 범위:** 버튼 라벨, 플레이스홀더, 에러·로딩·empty state 안내 문구 전체

### 7.3 디자인 방향 — 토스뱅크 블루 모티브

claude-design 데모의 보라/인디고 계열(`#5468FF`)을 **토스뱅크 스타일 블루**로 전환. 신뢰감·확신감이 핵심.

**컬러 팔레트 (`src/styles/colors.js`):**

| 상수명 | Hex | 용도 |
|--------|-----|------|
| `PRIMARY` | `#1B64DA` | 주요 버튼, 활성 탭, 강조 |
| `PRIMARY_LIGHT` | `#EBF2FF` | 활성 배경, hover 상태 |
| `PRIMARY_DARK` | `#1250B0` | 버튼 hover/pressed |
| `TEXT_PRIMARY` | `#191F28` | 본문, 제목 |
| `TEXT_SECONDARY` | `#8B95A1` | 설명, 부제목 |
| `BG` | `#F9FAFB` | 앱 전체 배경 |
| `SURFACE` | `#FFFFFF` | 카드, 패널 |
| `BORDER` | `#E5E8EB` | 카드 테두리, 구분선 |
| `SUCCESS` | `#00B493` | 완료, 긍정 상태 |
| `WARNING` | `#F5A623` | API Key 미등록 등 주의 |
| `ERROR` | `#F04452` | 에러 상태 |

**디자인 원칙:**
- **여백이 신뢰다**: 요소 간 여백 넉넉하게. 빽빽하면 불안해 보임
- **블루는 하나**: `PRIMARY`는 CTA 버튼·활성 탭에만. 남발 금지
- **카드 = 흰 배경 + 얇은 테두리**: 그림자 최소화, `BORDER`로 구분
- **타이포 계층 명확**: 제목 굵고 크게, 설명은 `TEXT_SECONDARY`로 조용하게
- **데모 컬러 대체**: `#5468FF` → `PRIMARY`, `#EEF0FF` → `PRIMARY_LIGHT`, `#F5F6FF` → `BG`

---

## 8. Environment Variables

| Variable | Purpose | 예시 |
|----------|---------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJ...` |
| `VITE_API_URL` | FastAPI 백엔드 URL | `http://localhost:8000` |

---

## 9. Convention Prerequisites

| 항목 | 기준 |
|------|------|
| 파일명 | 컴포넌트 PascalCase, 유틸/훅 camelCase |
| 색상 | 하드코딩 금지. `colors.js` 상수 참조 |
| API 호출 | 컴포넌트 직접 fetch 금지. 반드시 `services/api.js` 통해 호출 |
| 상태 | 서버 데이터는 React Query. Context는 auth만 |
| 말투 | §7.2 가이드 준수. 임의 문구 작성 금지 |

---

## 10. Implementation Plan

> 7개 Phase, 총 38개 세부 스텝. 순서대로 진행하며 각 Phase 완료 후 동작 확인.

---

### Phase 0 — 프로젝트 초기화 및 환경 설정

> 목표: 로컬에서 `npm run dev` 실행 가능한 상태

- [x] **0-1** `npm create vite@latest frontend -- --template react` 실행
- [x] **0-2** 의존성 설치: `@tanstack/react-query`, `@supabase/supabase-js`
- [x] **0-3** `src/styles/colors.js` 생성 — 토스뱅크 블루 색상 상수 정의
- [x] **0-4** `.env.local` 생성 — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` 설정
- [x] **0-5** `src/` 하위 폴더 구조 생성 (§6.4 기준)
- [x] **0-6** 백엔드 `main.py`에 `CORSMiddleware` 추가 (`localhost:5173` 허용) ← **API 연동 전 필수**
- [x] **0-7** Supabase 대시보드 — Google OAuth Redirect URL에 `http://localhost:5173` 등록

  **검증:** `npm run dev` 실행 후 브라우저에서 기본 화면 확인

---

### Phase 1 — 기반 레이어 (Auth + API Client)

> 목표: 로그인 후 JWT를 자동으로 API 요청에 실어 보낼 수 있는 상태

- [x] **1-1** `src/lib/supabase.js` — Supabase 클라이언트 초기화
- [x] **1-2** `src/context/AuthContext.jsx` — `user`, `session` 전역 상태. `onAuthStateChange` 구독
- [x] **1-3** `src/services/api.js` — `apiFetch(path, options)` wrapper: Supabase session에서 JWT 꺼내 `Authorization: Bearer` 헤더 자동 주입
- [x] **1-4** `src/main.jsx` — `QueryClientProvider` + `AuthProvider` 감싸기
- [x] **1-5** `src/App.jsx` — `screen` state로 `login` / `onboarding` / `main` 분기. `AuthContext` 기반으로 초기 화면 결정

  **검증:** `apiFetch`로 `GET /health` 호출 → `{"status": "ok"}` 확인

---

### Phase 2 — 인증 화면 (로그인 + 온보딩)

> 목표: Google 로그인 → 온보딩 2단계 완료 → 메인 앱 진입

- [x] **2-1** `LoginScreen.jsx` — 서비스 소개 문구 + "Google로 시작하기" 버튼. 토스 블루 스타일
- [x] **2-2** Supabase `signInWithOAuth({ provider: 'google' })` 연결 및 리다이렉트 처리
- [x] **2-3** 로그인 후 `GET /users/me` 호출 → `onboarding_completed` 값으로 화면 분기
- [x] **2-4** `OnboardingScreen.jsx` Step 1 — 닉네임 입력 폼. "어떻게 불러드릴까요?" 문구. `PATCH /users/me` 저장
- [x] **2-5** `OnboardingScreen.jsx` Step 2 — API Key 입력 폼. 역할 설명 + Anthropic 발급 링크. `POST /users/me/api-key` 저장
- [x] **2-6** Step 진행률 표시 (1/2 → 2/2) 및 Step 간 전환
- [x] **2-7** 온보딩 완료 후 `onboarding_completed: true` 저장 → 메인 앱으로 전환
- [x] **2-8** 로그아웃: `supabase.auth.signOut()` → 로그인 화면으로

  **검증:** Google 로그인 → 닉네임 입력 → API Key 입력 → 메인 앱 진입 전체 플로우 확인

---

### Phase 3 — 레이아웃 & 공통 컴포넌트

> 목표: 사이드바 + 탭 전환이 동작하고, 공통 UI 컴포넌트가 준비된 상태

- [x] **3-1** `AppShell.jsx` — 사이드바(로고·탭·유저 정보) + 메인 콘텐츠 영역. 토스 블루 적용
- [x] **3-2** 사이드바 탭 — AI 챗봇 / 내 경험 / 마이페이지. 활성 탭 `PRIMARY` 색상
- [x] **3-3** API Key 상태 인디케이터 — 등록됨(`SUCCESS`) / 미등록(`WARNING`)
- [x] **3-4** 로딩 컴포넌트 — 에이전트 대기용. "AI가 분석하고 있어요..." 문구 포함
- [x] **3-5** 에러 메시지 컴포넌트 — 토스 스타일 안내 문구. 재시도 버튼 포함

  **검증:** 탭 전환 시 콘텐츠 영역 변경 확인

---

### Phase 4 — 경험관리 화면

> 목표: STAR 구조 경험 CRUD 백엔드 완전 연동

- [x] **4-1** `src/hooks/useExperiences.js` — `useQuery(['experiences'], ...)` 목록 조회
- [x] **4-2** `ExperienceScreen.jsx` — 경험 카드 목록 + 추가 버튼. 빈 상태 문구 ("첫 번째 경험을 등록해 볼까요?")
- [x] **4-3** `ExperienceCard.jsx` — `name`, `role`, `period_start~end`, `competency_tags` 표시. hover 시 수정/삭제 버튼
- [x] **4-4** `ExperienceForm.jsx` — STAR 4개 필드(situation·task·action·result) + 이름·역할·기간 + 태그 멀티 선택
- [x] **4-5** 경험 생성 `useMutation` — `POST /experiences`. 성공 시 목록 자동 갱신(`invalidateQueries`)
- [x] **4-6** 경험 수정 `useMutation` — `PUT /experiences/{id}`
- [x] **4-7** 경험 삭제 `useMutation` — `DELETE /experiences/{id}`. 삭제 전 확인 처리

  **검증:** 경험 추가 → 목록 표시 → 수정 → 삭제 전 플로우 확인

---

### Phase 5 — AI 챗봇 화면

> 목표: 에이전트 3종 실제 API 호출 + artifact 결과 렌더링 + 파이프라인 연결

- [x] **5-1** 채팅 생성 — `POST /chats` 호출해 `chat_id` 발급. ChatScreen 진입 시 자동 생성
- [x] **5-2** `src/hooks/useMessages.js` — `useQuery(['messages', chatId], ...)` 메시지 + artifact 목록 조회
- [x] **5-3** `MessageList.jsx` — 메시지(role: user/assistant) + artifact 카드 순서대로 렌더링
- [x] **5-4** `ArtifactCard.jsx` — `agent_type` 뱃지 + 결과 텍스트 + "복사" 버튼
- [x] **5-5** `AgentInputPanel.jsx` — 현재 에이전트 단계 선택 UI (기업분석 / 문항분석 / 자소서작성)
- [x] **5-6** 기업분석 입력 폼 — `company`, `position` 필드. "분석 시작" 버튼
- [x] **5-7** 기업분석 `useMutation` — `POST /agents/company-analyze`. 로딩 중 "AI가 기업을 분석하고 있어요..." 표시
- [x] **5-8** 문항분석 입력 폼 — 문항 동적 추가/삭제 + 각 문항별 글자수 입력 (`char_limit`)
- [x] **5-9** 문항분석 `useMutation` — `POST /agents/question-analyze`. `company_artifact_id` 선택적 전달
- [x] **5-10** 자소서작성 입력 폼 — 문항+글자수 입력 + 이전 문항분석 artifact 선택 드롭다운
- [x] **5-11** 자소서작성 `useMutation` — `POST /agents/essay-writer`. `question_artifact_id` 선택적 전달
- [x] **5-12** 에이전트 파이프라인 — 기업분석 완료 artifact → 문항분석에 자동 전달. 문항분석 artifact → 자소서작성에 전달

  **검증:** 기업분석 → 문항분석 → 자소서작성 전체 파이프라인 실제 API로 확인

---

### Phase 6 — 마이페이지

> 목표: 프로필 조회 + API Key 관리 + 로그아웃 동작

- [x] **6-1** `MyPage.jsx` — 프로필 카드 (닉네임, 이메일). `GET /users/me` 데이터 표시
- [x] **6-2** API Key 현황 표시 — 등록됨(`SUCCESS` 인디케이터) / 미등록(`WARNING`)
- [x] **6-3** API Key 수정 폼 — 입력 후 `POST /users/me/api-key` 저장. 성공 시 "저장됐어요!" 피드백
- [x] **6-4** 로그아웃 버튼 — `supabase.auth.signOut()` → 로그인 화면 전환

  **검증:** API Key 수정 후 재로그인 시 유지 확인

---

### Phase 7 — 통합 검증 & 마무리

> 목표: 전체 플로우 이상 없음 확인 + 빌드 성공

- [ ] **7-1** 전체 Happy Path 수동 테스트: 로그인 → 온보딩 → 경험 등록 → 챗봇(3종 에이전트) → 마이페이지 → 로그아웃
- [ ] **7-2** 에러 케이스 확인: API Key 없을 때 에이전트 호출 / 네트워크 오류 / 빈 경험 상태
- [ ] **7-3** 말투 최종 검토 — §7.2 가이드와 불일치하는 문구 수정
- [ ] **7-4** 색상 최종 검토 — 하드코딩된 `#5468FF` 등 데모 색상 잔류 여부 확인
- [ ] **7-5** `npm run build` 빌드 성공 확인

  *(Phase 7은 Phase 13 완료 후 최종 검증)*

---

---

### Phase 8 — BUG 수정: 채팅 메시지 Artifact 렌더링 (BUG-01)

> 원인: `GET /chats/{id}` 응답의 messages에는 `artifact_id`만 있고 artifact 내용이 없음.
> 현재 ChatScreen이 `m.artifact`를 참조하지만 실제로는 undefined.

- [x] **8-1** `api.js`에 `getArtifact(id)` 함수 추가 (`GET /artifacts/{id}`)
- [x] **8-2** `useMessages` hook 수정 — messages fetch 후 artifact_id 있는 메시지에 대해 `GET /artifacts/{id}` 병렬 fetch, `artifact` 필드로 병합
- [x] **8-3** `ChatScreen` — `artifacts` 목록을 messages에서 추출하는 로직 검증

  **검증:** 에이전트 호출 후 artifact 카드가 메시지에 정상 표시되는지 확인

---

### Phase 9 — Google OAuth 프로필 이미지 (FR-17)

> `user.user_metadata.avatar_url`이 Google OAuth에서 자동으로 넘어옴.

- [x] **9-1** `AuthContext`에서 `user.user_metadata.avatar_url` 추출해 context에 포함
- [x] **9-2** `AppShell` 사이드바 아바타 — `<img>` 태그로 프로필 이미지 표시. 로드 실패 시 이니셜 fallback
- [x] **9-3** `MyPage` 프로필 카드 — 더 큰 사이즈(64px)로 프로필 이미지 표시

  **검증:** 로그인 후 사이드바와 마이페이지에 Google 프로필 사진 표시 확인

---

### Phase 10 — 채팅 이력 & Artifacts 관리 페이지 (FR-18, FR-19)

> 사이드바에 "이력" 탭 추가. 채팅 목록 + 전체 산출물 목록.

**데이터 흐름:**
- `GET /chats` → 채팅 목록 (id, title, updated_at)
- `GET /chats/{id}` → 선택한 채팅의 메시지 전체
- `GET /artifacts?agent_type=...` → 산출물 필터 목록
- `DELETE /chats/{id}` → 채팅 삭제

- [x] **10-1** `api.js`에 `getArtifacts(agentType)`, `deleteChat(id)` 함수 추가
- [x] **10-2** `src/hooks/useChats.js` — `useQuery(['chats'], getChats)` + `useDeleteChat` mutation
- [x] **10-3** `src/hooks/useArtifacts.js` — `useQuery(['artifacts', agentType], ...)` 목록 조회
- [x] **10-4** `src/components/history/HistoryScreen.jsx` — 채팅 이력 / 산출물 2개 서브탭
- [x] **10-5** 채팅 이력 탭 — 채팅 카드 목록 (제목·날짜·삭제 버튼). 클릭 시 해당 채팅으로 이동
- [x] **10-6** 산출물 탭 — 전체 artifact 목록. agent_type 필터 칩. 클릭 시 내용 펼침
- [x] **10-7** `AppShell` 사이드바 — "이력" 탭 추가 (아이콘: 🗂️)
- [x] **10-8** `App.jsx` — `tab === 'history'` 분기 추가. ChatScreen에 `chatId prop` 전달 구조로 변경

  **검증:** 이력 탭 진입 → 채팅 선택 → 해당 채팅의 메시지 확인. Artifact 필터 동작 확인

---

### Phase 11 — Artifact 첨부 Picker UI (FR-20)

> 드롭다운 대신 시각적인 picker로 이전 산출물을 첨부.

**설계:**
- `AgentInputPanel` 하단에 "산출물 첨부" 버튼
- 클릭 시 `ArtifactPicker` 모달/패널 등장
- 현재 채팅의 artifact 목록을 type별로 탭 구분해 표시
- 선택하면 입력 영역 위에 "첨부됨" 칩 형태로 표시
- 기존 숨겨진 드롭다운 방식 제거

- [x] **11-1** `src/components/chat/ArtifactPicker.jsx` — 채팅 내 artifacts를 type별로 보여주는 picker 패널
- [x] **11-2** `AgentInputPanel` 리팩토링 — 각 폼에 "산출물 첨부" 버튼 + 선택된 artifact 칩 표시
- [x] **11-3** 선택된 artifact_id를 에이전트 요청 body에 자동 포함
- [x] **11-4** 첨부 해제 (칩의 ✕ 버튼)

  **검증:** 기업분석 후 → 문항분석에서 "산출물 첨부" → 기업분석 결과 선택 → 에이전트 호출 시 company_artifact_id 전달 확인

---

### Phase 12 — 글래스모피즘 디자인 (FR-21)

> 불투명 흰 배경 → 반투명 + blur로 깊이감 추가. 배경 그라디언트와 어우러지도록.

**디자인 토큰 추가:**
| 토큰 | 값 | 용도 |
|------|-----|------|
| `SURFACE_GLASS` | `rgba(255,255,255,0.75)` | 카드, 패널 |
| `SIDEBAR_GLASS` | `rgba(255,255,255,0.85)` | 사이드바 |
| `MODAL_GLASS` | `rgba(255,255,255,0.80)` | 모달 |
| `BLUR_SM` | `blur(12px)` | 카드 |
| `BLUR_MD` | `blur(20px)` | 사이드바, 모달 |
| `OVERLAY` | `rgba(25,31,40,0.25)` | 모달 배경 |

**적용 대상:**
- [x] **12-1** `colors.js`에 glass 토큰 추가
- [x] **12-2** `AppShell` — 전체 배경에 미묘한 그라디언트 패턴. 사이드바에 `backdrop-filter: blur(20px)` + `SIDEBAR_GLASS`
- [x] **12-3** `ExperienceCard`, `ArtifactCard` — `SURFACE_GLASS` + `backdrop-filter: blur(12px)`
- [x] **12-4** `ExperienceForm` 모달 — `MODAL_GLASS` + `blur(20px)`, 오버레이 `OVERLAY`
- [x] **12-5** `ArtifactPicker` 패널 — glass 스타일
- [x] **12-6** `AppShell` 사이드바 유저 정보 카드·API Key 인디케이터 — glass 적용

  **검증:** 배경 그라디언트가 카드 뒤로 비쳐 보이는지 시각 확인

---

---

### Phase 13 — 사용자 피드백 기반 버그 수정 및 기능 개선

> 실사용 테스트에서 발견된 6개 이슈 수정

**이슈 목록:**

| ID | 내용 | 원인 |
|----|------|------|
| BUG-02 | 경험 날짜가 일(day)까지 입력 — 월까지만 필요 | `type="date"` → `type="month"` 변경 필요 |
| BUG-03 | 챗봇에 일반 텍스트 입력창 없음 | AgentInputPanel 외 자유 메시지 입력 UI 미구현 |
| BUG-04 | API 키 등록 후에도 미등록으로 표시 | 백엔드 `GET /users/me`가 `claude_api_key_encrypted` 컬럼을 select에서 누락 |
| BUG-05 | 이력 탭에 채팅이 너무 많이 생성됨 | ChatScreen 마운트마다 `createChat` 자동 호출 → `chatId` 상태를 App.jsx로 올려야 함 |
| FR-22 | 새 채팅 시작 버튼 없음 | 명시적 새 채팅 생성 UI 필요 |
| BUG-06 | 산출물 탭에서 content 미표시 + 마크다운 그대로 노출 | `GET /artifacts` 목록 API가 content 미포함. 개별 fetch 필요 + 마크다운 렌더링 |

**수정 계획:**

- [x] **13-1** `ExperienceForm` — 날짜 입력 `type="date"` → `type="month"` 변경 (YYYY-MM 저장)
- [x] **13-2** 백엔드 `users.py` — `GET /users/me`에 `has_api_key: bool` 필드 추가 (`claude_api_key_encrypted` IS NOT NULL 체크)
- [x] **13-3** 프론트 `App.jsx` — `apiKeyRegistered` 판단을 `profile.has_api_key`로 변경
- [x] **13-4** 백엔드 `chats.py` — `POST /chats/{chat_id}/messages` 엔드포인트 추가 (role: user 일반 메시지 저장)
- [x] **13-5** `api.js` — `addMessage(chatId, content)` 함수 추가
- [x] **13-6** `ChatScreen` — 일반 텍스트 입력창 추가 (에이전트 패널 위). 전송 시 `addMessage` 호출 + 쿼리 무효화
- [x] **13-7** `App.jsx` — `chatId` 상태를 App 레벨로 올림. ChatScreen은 prop으로 받음. 최초 진입 시 최근 채팅 재사용, 없으면 생성
- [x] **13-8** `AppShell` — 사이드바에 "새 채팅" 버튼 추가. 클릭 시 `createChat` 호출 + chat 탭으로 이동
- [x] **13-9** `HistoryScreen` — artifact 펼칠 때 `getArtifact(id)` 호출로 content lazy 로드
- [x] **13-10** 외부 라이브러리 없이 직접 마크다운 파서 구현. HistoryScreen·ArtifactCard에 렌더링 적용

- [x] **13-11** 백엔드 `general_chat.py` — 일반 대화용 Claude 에이전트 추가 (히스토리 컨텍스트 포함)
- [x] **13-12** 백엔드 `chats.py` — `POST /chats/{chat_id}/chat` 엔드포인트: 사용자 메시지 저장 → Claude 호출 → 어시스턴트 응답 저장
- [x] **13-13** 프론트 `api.js` — `sendChatMessage(chatId, content)` 함수 추가
- [x] **13-14** 프론트 `ChatScreen` — `handleSendText`를 `sendChatMessage`로 교체. AI 응답 대기 중 로딩 표시 추가

  **검증:** 각 이슈 번호별 수동 테스트로 해결 확인

---

## 11. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-30 | Initial draft | YUBIN-githubb |
| 0.2 | 2026-04-30 | Option C 확정, 데모 vs 백엔드 차이 명시, 토스 블루 디자인 추가 | YUBIN-githubb |
| 0.3 | 2026-04-30 | 전체 일관성 정비, 7 Phase 38개 세부 스텝으로 구현 계획 세분화 | YUBIN-githubb |
| 0.4 | 2026-04-30 | Phase 1~12 완료 체크, Phase 13 버그수정 추가 | YUBIN-githubb |
