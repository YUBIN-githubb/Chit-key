# 취트키 백엔드 Planning Document

> **Summary**: AI 자소서 작성 서비스 "취트키"의 FastAPI 백엔드 — 3개 에이전트 루프 + 사용자 경험 DB 기반으로 동작
>
> **Project**: Chit-key
> **Version**: 0.1.0
> **Author**: YUBIN-githubb
> **Date**: 2026-04-27
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 취업 준비생이 기업 정보 수집 → 문항 분석 → 자소서 작성을 개별 도구로 흩어서 처리하느라 비효율이 크고, 본인의 경험을 문항에 어떻게 연결할지 막막한 상황 |
| **Solution** | 기업분석·문항분석·자소서작성 3개 Claude 에이전트를 순차적으로 활용하는 챗봇 서비스. 사용자 본인의 Claude API Key로 동작하며, 경험 DB와 연동해 최적 에피소드를 자동 매칭 |
| **Function/UX Effect** | 채팅 인터페이스에서 에이전트 산출물을 "첨부파일처럼" 주고받으며 자소서 초안까지 원스톱 완성. 경험 라이브러리를 축적할수록 품질 향상 |
| **Core Value** | "내 경험 DB + AI 에이전트"가 결합된 개인화된 자소서 작성 파이프라인 — 상투어 없이 구체적 사실 기반 자소서 생성 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 취업 준비생의 자소서 작성 파이프라인을 AI 에이전트로 자동화하여 품질과 효율을 동시에 개선 |
| **WHO** | 취업 준비생 (대학생/졸업생). 본인 Claude API Key를 보유하거나 발급할 의향이 있는 사용자 |
| **RISK** | 사용자 Claude API Key 노출 위험 / 에이전트 루프 무한 반복 / Supabase Row-Level Security 미설정 |
| **SUCCESS** | 3개 에이전트 API 동작 완료 + Google OAuth 로그인 + 경험 CRUD + 채팅 저장/조회 + 산출물 저장 |
| **SCOPE** | Phase 1: 백엔드 API 전체(인증·경험·채팅·에이전트). Phase 2: 프론트엔드 연동. Phase 3: 배포 |

---

## 1. Overview

### 1.1 Purpose

취업 준비생이 기업분석 → 문항분석 → 자소서작성으로 이어지는 흐름을 3개의 Claude 에이전트가 처리하도록 하는 백엔드 API를 구축한다. 각 에이전트는 독립된 산출물을 생성하며, 후속 에이전트 호출 시 앞 단계 산출물을 컨텍스트로 주입할 수 있다.

### 1.2 Background

- 자소서 작성은 다단계 작업(기업 조사 → 문항 의도 파악 → 에피소드 선택 → 글쓰기)으로, 각 단계 사이 컨텍스트가 단절되는 게 핵심 고통
- 기존 ChatGPT 사용 방식은 대화가 길어질수록 컨텍스트 관리가 사용자 몫 → 자동화 필요
- 사용자 본인의 경험(STAR 구조)을 DB에 축적해 에이전트가 검색·참조하면 개인화 품질 대폭 향상

### 1.3 Related Documents

- 에이전트 프롬프트: `agent-prompt/company-analyze.md`, `agent-prompt/question-analyze.md`, `agent-prompt/essay-writer.md`
- Claude API 문서: https://docs.anthropic.com/en/api/

---

## 2. Scope

### 2.1 In Scope (백엔드 Phase 1)

- [ ] Google OAuth 로그인/회원가입 (Supabase Auth)
- [ ] 온보딩 플로우 (닉네임, Claude API Key 등록, 첫 경험 입력)
- [ ] 경험 CRUD (경험이름·역할·활동기간·STAR 내용·역량 태그)
- [ ] 채팅 세션 생성·조회·목록
- [ ] 채팅 메시지 저장·조회 (대화 히스토리)
- [ ] 기업분석 에이전트 API (web_search, web_fetch 도구 루프)
- [ ] 문항분석 에이전트 API (기업분석 산출물 컨텍스트 주입 가능)
- [ ] 자소서작성 에이전트 API (문항분석 산출물 컨텍스트 주입 + 경험 DB 쿼리 툴)
- [ ] 에이전트 산출물(artifacts) 저장·조회
- [ ] Claude API Key 암호화 저장/복호화

### 2.2 Out of Scope

- 프론트엔드 구현 (별도 Phase)
- 배포 인프라 설정 (미결정)
- 결제/구독 기능
- 다국어 지원
- 자소서 PDF 내보내기

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Google OAuth 2.0으로 로그인/회원가입 처리 (Supabase Auth 활용) | High | Pending |
| FR-02 | 온보딩 완료 여부 플래그 관리 (닉네임·API Key·첫 경험 등록 시 완료) | High | Pending |
| FR-03 | 사용자 Claude API Key를 AES-256으로 암호화하여 DB 저장, 에이전트 호출 시 복호화 | High | Pending |
| FR-04 | 경험 CRUD: 경험이름·역할·활동기간·STAR 4개 필드·역량 태그 배열 | High | Pending |
| FR-05 | 채팅 세션 생성·목록·상세 조회 (제목 자동 생성 또는 사용자 지정) | High | Pending |
| FR-06 | 채팅 메시지 저장·조회 (role: user/assistant, agent_type 필드) | High | Pending |
| FR-07 | 기업분석 에이전트 호출: 사용자 Claude API Key로 에이전트 루프 실행 | High | Pending |
| FR-08 | 문항분석 에이전트 호출: 기업분석 산출물 artifact_id를 컨텍스트로 주입 가능 | High | Pending |
| FR-09 | 자소서작성 에이전트 호출: 경험 DB 쿼리 툴 구현 + 문항분석 산출물 주입 가능 | High | Pending |
| FR-10 | 에이전트 산출물(artifact) 저장·조회·목록 (agent_type별 필터) | High | Pending |
| FR-11 | 에이전트 루프 최대 반복 횟수 제한 (무한 루프 방지, default: 10) | Medium | Pending |
| FR-12 | 역량 태그로 경험 필터링 쿼리 (자소서작성 에이전트 툴로 사용) | High | Pending |
| FR-13 | 채팅 메시지에 artifact 참조 추가 (artifact_id 연결) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Security | Claude API Key AES-256 암호화. JWT 인증 모든 보호 엔드포인트 | 코드 리뷰 + Supabase RLS 정책 확인 |
| Security | Supabase Row-Level Security: 사용자 본인 데이터만 접근 가능 | RLS 정책 단위 테스트 |
| Performance | 에이전트 API는 스트리밍 응답 고려 (첫 토큰 < 3초 목표) | 추후 부하 테스트 |
| Reliability | 에이전트 루프 최대 반복 횟수 초과 시 명확한 에러 응답 | 통합 테스트 |
| Maintainability | 에이전트 프롬프트는 `agent-prompt/` 디렉토리 파일로 외부화. 코드 수정 없이 프롬프트 변경 가능 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Google OAuth 로그인 → JWT 발급 흐름 정상 동작
- [ ] 온보딩 5단계 API 전체 동작 (닉네임·API Key·경험 등록)
- [ ] 경험 CRUD 4개 엔드포인트 동작
- [ ] 채팅 생성·목록·메시지 조회 동작
- [ ] 3개 에이전트 엔드포인트 동작 (에이전트 루프 완료 후 산출물 저장)
- [ ] 산출물 artifact 조회 API 동작
- [ ] 경험 역량 태그 필터링 쿼리 동작

### 4.2 Quality Criteria

- [ ] 모든 보호 API에 JWT 인증 적용 (미인증 시 401)
- [ ] Supabase RLS 적용 (타인 데이터 접근 불가)
- [ ] Claude API Key 평문으로 로그에 노출되지 않음
- [ ] 에이전트 루프 max_iterations 초과 시 에러 반환

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Claude API Key DB 노출 | High | Low | AES-256 암호화 저장, 환경변수로 암호화 키 관리, 로그에서 제외 |
| 에이전트 루프 무한 반복 | Medium | Medium | `max_iterations=10` 하드 제한, 초과 시 마지막 응답으로 종료 |
| Supabase RLS 미설정으로 데이터 노출 | High | Medium | 각 테이블 RLS 정책 설계 후 반드시 적용, 통합 테스트로 검증 |
| web_search/web_fetch 툴 오류 | Medium | Medium | try/except로 툴 에러 처리 후 tool_result에 에러 메시지 반환 |
| 사용자 API Key 만료/잘못된 키 | Low | High | Anthropic API 호출 시 인증 에러 명확히 사용자에게 전달 (401/403) |

---

## 6. Database Schema 명세

### 6.1 ERD 개요

```
users ──< experiences
  │
  └──< chats ──< messages
        │
        └──< artifacts
```

### 6.2 테이블 상세

---

#### `users` (사용자)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | 사용자 고유 ID |
| `google_id` | VARCHAR(255) | UNIQUE, NOT NULL | Google OAuth sub 값 |
| `email` | VARCHAR(255) | NOT NULL | 구글 이메일 |
| `nickname` | VARCHAR(50) | NULL | 온보딩에서 입력한 닉네임 |
| `claude_api_key_encrypted` | TEXT | NULL | AES-256 암호화된 Claude API Key |
| `onboarding_completed` | BOOLEAN | DEFAULT false | 온보딩 완료 여부 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 가입일시 |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | 수정일시 |

**RLS**: 본인 row만 SELECT/UPDATE 가능.
**Notes**: `claude_api_key_encrypted`는 서버에서 복호화하여 Claude API 호출에만 사용, 응답에 절대 포함하지 않음.

---

#### `experiences` (경험)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | 경험 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 소유 사용자 |
| `name` | VARCHAR(100) | NOT NULL | 경험 이름 (ex: "삼성SDS 인턴십") |
| `role` | VARCHAR(100) | NOT NULL | 역할 (ex: "백엔드 개발자") |
| `period_start` | DATE | NOT NULL | 활동 시작일 |
| `period_end` | DATE | NULL | 활동 종료일 (NULL = 진행 중) |
| `star_situation` | TEXT | NULL | STAR: Situation |
| `star_task` | TEXT | NULL | STAR: Task |
| `star_action` | TEXT | NULL | STAR: Action |
| `star_result` | TEXT | NULL | STAR: Result |
| `competency_tags` | TEXT[] | DEFAULT '{}' | 역량 태그 배열 (ex: ["리더십", "문제해결"]) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성일시 |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | 수정일시 |

**RLS**: `user_id = auth.uid()` 조건으로 본인 경험만 접근.
**Index**: `idx_experiences_user_id` on (user_id), `idx_experiences_tags` on (competency_tags) using GIN.
**Notes**: 역량 태그는 문항분석 에이전트의 표준 역량 사전과 동일한 값을 사용하여 자소서작성 에이전트가 GIN 인덱스로 빠르게 필터링 가능.

---

#### `chats` (채팅 세션)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | 채팅 세션 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 소유 사용자 |
| `title` | VARCHAR(200) | NULL | 채팅 제목 (NULL이면 첫 메시지로 자동 생성) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성일시 |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | 최근 메시지 시각 |

**RLS**: 본인 채팅만 접근.
**Index**: `idx_chats_user_id_created` on (user_id, created_at DESC).

---

#### `messages` (채팅 메시지)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | 메시지 ID |
| `chat_id` | UUID | FK → chats.id, NOT NULL | 소속 채팅 |
| `role` | VARCHAR(20) | NOT NULL | 'user' \| 'assistant' |
| `content` | TEXT | NOT NULL | 메시지 텍스트 내용 |
| `agent_type` | VARCHAR(30) | NULL | 'company-analyze' \| 'question-analyze' \| 'essay-writer' \| NULL |
| `artifact_id` | UUID | FK → artifacts.id, NULL | 이 메시지에서 생성된 산출물 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성일시 |

**RLS**: chats 테이블 통해 user_id 검증.
**Index**: `idx_messages_chat_id_created` on (chat_id, created_at ASC).

---

#### `artifacts` (에이전트 산출물)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | 산출물 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 소유 사용자 |
| `chat_id` | UUID | FK → chats.id, NULL | 생성된 채팅 세션 |
| `agent_type` | VARCHAR(30) | NOT NULL | 'company-analyze' \| 'question-analyze' \| 'essay-writer' |
| `title` | VARCHAR(200) | NOT NULL | 산출물 제목 (ex: "삼성전자 SW직군 기업분석") |
| `content` | JSONB | NOT NULL | 에이전트별 구조화 산출물 (아래 상세) |
| `company_name` | VARCHAR(100) | NULL | 관련 기업명 |
| `position` | VARCHAR(100) | NULL | 관련 직무명 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성일시 |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | 수정일시 |

**RLS**: `user_id = auth.uid()` 조건.
**Index**: `idx_artifacts_user_agent` on (user_id, agent_type), `idx_artifacts_user_created` on (user_id, created_at DESC).

**content JSONB 구조 (agent_type별)**:

```jsonc
// agent_type = 'company-analyze'
{
  "company": "삼성전자",
  "position": "SW개발",
  "summary": "...",           // 섹션 1: 한 줄 요약
  "recent_moves": [...],      // 섹션 2: 최근 움직임
  "direction": "...",         // 섹션 3: 방향성
  "role_needs": "...",        // 섹션 4: 직무에서 찾는 것
  "culture": "...",           // 섹션 5: 문화
  "usage_points": [...],      // 섹션 6: 자소서 활용 포인트
  "sources": [...]
}

// agent_type = 'question-analyze'
{
  "company": "삼성전자",
  "position": "SW개발",
  "question_count": 3,
  "company_report_applied": true,
  "questions": [
    {
      "number": 1,
      "original": "...",
      "category": "경험서술",
      "primary_tags": ["문제해결", "주도성"],
      "secondary_tags": ["협업"],
      "episode_search_spec": {
        "primary_competency": ["문제해결"],
        "tags_include": ["문제해결", "주도성"],
        "preferred_experience_type": ["인턴", "프로젝트"]
      }
    }
  ],
  "overall_top_tags": ["문제해결", "협업", "주도성"]
}

// agent_type = 'essay-writer'
{
  "company": "삼성전자",
  "position": "SW개발",
  "essays": [
    {
      "question_number": 1,
      "question": "...",
      "draft": "...",         // 자소서 초안
      "used_experience_ids": ["uuid1", "uuid2"],
      "char_count": 500
    }
  ]
}
```

---

### 6.3 역량 태그 표준 사전

자소서작성 에이전트의 경험 필터링 툴이 사용하는 표준 태그 목록 (문항분석 에이전트 프롬프트와 동일):

```
리더십 팀장경험 역할분배 동기부여 의사결정 위임 목표설정 성과관리
협업 팀워크 갈등관리 설득 경청 이해관계조율 피드백수용 다양성존중
문제해결 원인분석 데이터기반판단 가설검증 창의적접근 트레이드오프 우선순위판단 논리적사고
도전정신 실패경험 회복탄력성 한계돌파 처음시도 불확실성대응 피벗 재도전
자기주도학습 역량개발 자격증 독학 멘토링 습관형성 꾸준함 성장마인드셋
주도성 기획 실행력 프로세스개선 자동화 일정관리 자원관리 결과도출
책임감 윤리의식 정직 원칙준수 사회적책임 고객지향 봉사 공정성
인턴 대외활동 학교프로젝트 동아리 아르바이트 공모전 연구 창업 봉사활동 해외경험 군경험
```

---

## 7. Architecture Considerations

### 7.1 Project Level

**Dynamic** 선택 — BaaS(Supabase) + 커스텀 서버(FastAPI) 조합.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Backend Framework | Django / FastAPI / Flask | **FastAPI** | 비동기 지원, Pydantic 스키마, Claude API 스트리밍 친화적 |
| Database | Supabase / PlanetScale / RDS | **Supabase** | PostgreSQL + Auth + RLS 통합, 빠른 MVP |
| Authentication | Supabase Auth / Auth0 / Custom | **Supabase Auth** | Google OAuth 내장, JWT 자동 발급 |
| API Key 암호화 | AES-256 / bcrypt / 평문 | **AES-256 (cryptography 라이브러리)** | 복호화 가능해야 하므로 단방향 해시 불가 |
| 에이전트 루프 | Streaming SSE / 동기 응답 | **동기 응답 (MVP)** | 구현 단순성 우선, 추후 SSE 전환 고려 |
| 프롬프트 관리 | DB 저장 / 파일 외부화 | **파일 외부화 (agent-prompt/)** | 프롬프트 버전 관리를 git으로, 코드 수정 없이 편집 가능 |

### 7.3 Backend 폴더 구조

```
backend/
├── app/
│   ├── main.py                  # FastAPI app 생성, 라우터 등록
│   ├── core/
│   │   ├── config.py            # 환경변수 (pydantic Settings)
│   │   ├── security.py          # AES-256 암호화/복호화
│   │   └── supabase.py          # Supabase 클라이언트 싱글톤
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Google OAuth 콜백, 토큰 발급
│   │       ├── users.py         # 프로필 조회/수정, 온보딩 상태
│   │       ├── experiences.py   # 경험 CRUD
│   │       ├── chats.py         # 채팅 세션 관리
│   │       ├── messages.py      # 메시지 조회
│   │       └── agents.py        # 에이전트 3종 호출 엔드포인트
│   ├── agents/
│   │   ├── base.py              # 공통 에이전트 루프 (tool_use 처리)
│   │   ├── company_analyze.py   # 기업분석 에이전트 (web_search, web_fetch)
│   │   ├── question_analyze.py  # 문항분석 에이전트
│   │   └── essay_writer.py      # 자소서작성 에이전트 + experience_query 툴
│   ├── tools/
│   │   └── experience_query.py  # 역량태그로 경험 필터링 DB 쿼리 툴
│   ├── schemas/
│   │   └── models.py            # Pydantic 요청/응답 모델 전체
│   └── prompts/
│       └── loader.py            # agent-prompt/ 파일 로드 유틸
├── agent-prompt/                # (프로젝트 루트에서 관리)
│   ├── company-analyze.md
│   ├── question-analyze.md
│   └── essay-writer.md
├── requirements.txt
├── .env.example
└── README.md
```

### 7.4 에이전트 루프 흐름 (base.py)

```
run_agent(system_prompt, user_message, tools, api_key, max_iter=10)
  ├── messages = [{"role": "user", "content": user_message}]
  ├── loop (iter < max_iter):
  │   ├── response = anthropic.messages.create(
  │   │     model="claude-sonnet-4-6",
  │   │     system=system_prompt,
  │   │     messages=messages,
  │   │     tools=tools
  │   │   )
  │   ├── if stop_reason == "end_turn":
  │   │   └── return final_text
  │   └── if stop_reason == "tool_use":
  │       ├── tool_name, tool_input = extract_tool_call(response)
  │       ├── tool_result = execute_tool(tool_name, tool_input)
  │       ├── messages.append(assistant_response)
  │       └── messages.append(tool_result_message)
  └── raise MaxIterationsError
```

---

## 8. Convention Prerequisites

### 8.1 Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | Server |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 보안비밀 | Server |
| `SUPABASE_URL` | Supabase 프로젝트 URL | Server |
| `SUPABASE_ANON_KEY` | Supabase anon 키 | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 (RLS 우회) | Server |
| `API_KEY_ENCRYPTION_SECRET` | Claude API Key 암호화 마스터 키 (32 bytes) | Server |
| `JWT_SECRET` | JWT 서명 키 | Server |
| `FRONTEND_URL` | OAuth 콜백 리디렉트용 프론트 URL | Server |

> **보안 주의**: 위 값들은 `.env`에만 보관, git에 절대 커밋 금지. `.env.example`에 키 이름만 명시.

### 8.2 Coding Conventions

| Category | Rule |
|----------|------|
| 파일 명명 | snake_case (Python 표준) |
| API 경로 | `/api/v1/{resource}` REST 컨벤션 |
| 에러 응답 | `{"error": {"code": "...", "message": "..."}}` 통일 |
| 인증 | `Authorization: Bearer <supabase_jwt>` 헤더, `get_current_user` 의존성 주입 |
| 로그 | Claude API Key 포함 필드 로깅 금지 |

### 8.3 Global Error Handling Strategy

**파일 위치**: `app/core/exceptions.py` (커스텀 예외), `app/core/error_handlers.py` (핸들러 등록)

#### 통일 에러 응답 형식

모든 에러는 아래 단일 구조로 반환합니다:

```json
{
  "error": {
    "code": "SNAKE_CASE_ERROR_CODE",
    "message": "사람이 읽을 수 있는 설명"
  }
}
```

#### 커스텀 예외 계층 (`app/core/exceptions.py`)

```
ChitkeyError(Exception)              # 모든 커스텀 예외의 base
  ├── AuthError          → 401       # JWT 없음 / 만료 / 유효하지 않음
  ├── ForbiddenError     → 403       # 인증은 됐으나 권한 없음 (타인 리소스)
  ├── OnboardingRequiredError → 403  # 온보딩 미완료 상태로 보호 API 접근
  ├── NotFoundError      → 404       # 리소스 없음
  ├── InvalidAPIKeyError → 400       # Claude API Key 형식 오류 / 미등록
  ├── AgentError         → 500       # 에이전트 루프 내부 오류
  │   └── MaxIterationsError → 500   # max_iterations 초과
  └── ExternalAPIError   → 502       # Anthropic / 외부 API 호출 실패
```

#### 핸들러 등록 (`app/core/error_handlers.py`)

| 예외 타입 | HTTP 상태 | error.code |
|-----------|-----------|------------|
| `AuthError` | 401 | `AUTH_REQUIRED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `OnboardingRequiredError` | 403 | `ONBOARDING_REQUIRED` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `InvalidAPIKeyError` | 400 | `INVALID_API_KEY` |
| `MaxIterationsError` | 500 | `MAX_ITERATIONS_EXCEEDED` |
| `AgentError` | 500 | `AGENT_ERROR` |
| `ExternalAPIError` | 502 | `EXTERNAL_API_ERROR` |
| `RequestValidationError` (Pydantic) | 422 | `VALIDATION_ERROR` |
| `HTTPException` (FastAPI 기본) | 원본 status | `HTTP_ERROR` |
| `Exception` (미처리 예외) | 500 | `INTERNAL_SERVER_ERROR` |

#### 적용 규칙

- 비즈니스 로직에서는 `ChitkeyError` 서브클래스만 raise, `HTTPException` 직접 사용 금지
- `ExternalAPIError`는 Anthropic SDK `APIError` 를 catch하여 래핑
- 500 에러는 서버 로그에 스택 트레이스 기록 (응답에는 포함 금지)
- Claude API Key 관련 필드는 에러 로그에서도 마스킹

---

## 9. Agent Prompt 개선 방향

현재 프롬프트(`company-analyze.md`, `question-analyze.md`)는 에이전트 루프 관점의 지시사항이 빠져 있어 개선이 필요합니다.

### 9.1 company-analyze.md 보완 필요 사항

- [ ] 사용 도구: `web_search`, `web_fetch`를 명시 (현재 언급 있으나 Claude built-in 툴로 명확화 필요)
- [ ] 산출물 형식: JSON 구조로 명확화 (섹션별 필드명 정의)
- [ ] 닉네임 호칭: 사용자 닉네임으로 호칭하는 지시 추가

### 9.2 question-analyze.md 보완 필요 사항

- [ ] `${companyAnalyzeReport}` 변수 주입 방식 명확화 (artifact content를 어떤 형태로 주입할지)
- [ ] 에피소드 검색 명세 JSON 구조 확정 (자소서작성 에이전트가 파싱할 포맷)
- [ ] 산출물 JSON 구조 명세화

### 9.3 essay-writer.md 신규 작성 필요

```
작성할 내용:
- 역할: 사용자의 경험 DB를 기반으로 STAR 구조로 자소서를 작성하는 전문가
- 사용 툴: search_experiences_by_tags(tags: list[str]) → 경험 목록 반환
- 작업 순서:
  1. 문항분석 산출물(question-analyze artifact)에서 문항별 역량 태그 파악
  2. search_experiences_by_tags 툴로 해당 태그의 경험 검색
  3. 검색된 경험 중 가장 적합한 에피소드 선택
  4. STAR 구조로 각 문항 초안 작성 (글자수 제한 준수)
  5. 전체 문항 초안을 JSON 구조로 반환
- 절대 하지 않는 것:
  - 경험 DB에 없는 경험을 지어내지 않음
  - 상투어("귀사의 인재상에 부합하여") 사용 금지
  - 글자수 제한 초과 금지
```

---

## 10. API Endpoint 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/auth/google` | Google OAuth 시작 | - |
| GET | `/api/v1/auth/callback` | OAuth 콜백 처리, JWT 발급 | - |
| GET | `/api/v1/users/me` | 내 프로필 조회 | JWT |
| PATCH | `/api/v1/users/me` | 닉네임/온보딩 완료 업데이트 | JWT |
| POST | `/api/v1/users/me/api-key` | Claude API Key 등록/변경 | JWT |
| GET | `/api/v1/experiences` | 경험 목록 조회 (태그 필터) | JWT |
| POST | `/api/v1/experiences` | 경험 생성 | JWT |
| PUT | `/api/v1/experiences/{id}` | 경험 수정 | JWT |
| DELETE | `/api/v1/experiences/{id}` | 경험 삭제 | JWT |
| GET | `/api/v1/chats` | 채팅 목록 | JWT |
| POST | `/api/v1/chats` | 채팅 생성 | JWT |
| GET | `/api/v1/chats/{id}` | 채팅 상세 + 메시지 | JWT |
| DELETE | `/api/v1/chats/{id}` | 채팅 삭제 | JWT |
| POST | `/api/v1/agents/company-analyze` | 기업분석 에이전트 실행 | JWT |
| POST | `/api/v1/agents/question-analyze` | 문항분석 에이전트 실행 | JWT |
| POST | `/api/v1/agents/essay-writer` | 자소서작성 에이전트 실행 | JWT |
| GET | `/api/v1/artifacts` | 산출물 목록 (agent_type 필터) | JWT |
| GET | `/api/v1/artifacts/{id}` | 산출물 상세 조회 | JWT |

---

## 11. Impact Analysis

새 프로젝트이므로 기존 소비자 없음. 단, `agent-prompt/` 파일 변경은 에이전트 동작에 즉시 영향을 주므로 변경 시 에이전트 엔드포인트 통합 테스트 필수.

---

## 12. Next Steps

1. [x] 플랜 문서 작성 (DB 스키마 + 에러 핸들링 전략 포함)
2. [x] FastAPI 프로젝트 초기화 (`requirements.txt`, `app/main.py`, 폴더 구조)
3. [x] **전역 에러 핸들링 구현** (`app/core/exceptions.py`, `app/core/error_handlers.py`)
4. [x] 환경변수 설정 (`app/core/config.py`, `.env.example`)
5. [x] Supabase 클라이언트 초기화 (`app/core/supabase.py`)
6. [x] Claude API Key 암호화 유틸 (`app/core/security.py`)
7. [x] Supabase DB 테이블 생성 SQL + RLS 정책 (`supabase/schema.sql`)
8. [x] Google OAuth + Supabase Auth 연동 (Supabase Auth 위임 + `deps.py` JWT 검증)
9. [x] 사용자 프로필 + 온보딩 API (`/api/v1/users/`)
10. [x] 경험 CRUD API (`/api/v1/experiences/`)
11. [x] 채팅 세션·메시지 API (`/api/v1/chats/`)
12. [x] 에이전트 루프 base.py + 3개 에이전트 구현 (`/api/v1/agents/`)
13. [x] 산출물 artifact API (`/api/v1/artifacts/`)
14. [ ] `essay-writer.md` 프롬프트 작성
15. [ ] 전체 통합 테스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-27 | Initial draft | YUBIN-githubb |
