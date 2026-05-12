# 취트키 배포 플랜

> 작성일: 2026-05-01  
> 확정 방향: 프론트엔드 Vercel + 백엔드 Railway + GitHub Actions CI/CD

---

## 1. 아키텍처 개요

```
사용자
  │
  ├─→ [Vercel] 프론트엔드 (React/Vite)
  │         │ API 요청
  │         ↓
  └─→ [Railway] 백엔드 (FastAPI)
                │
                ↓
           [Supabase] DB + Auth (이미 클라우드)
```

- **프론트엔드**: Vercel (정적 파일 호스팅, 글로벌 CDN)
- **백엔드**: Railway (FastAPI 서버, 무중단 배포)
- **DB / Auth**: Supabase (변경 없음)
- **배포 환경**: 프로덕션 1개만 운영
- **도메인**: 각 플랫폼 기본 URL 사용 (별도 도메인 없음)

---

## 2. 배포 전 코드 수정 사항

### 2-1. 백엔드 CORS 설정 수정 (`backend/app/main.py`)

현재 CORS가 `localhost`만 허용하고 있어 배포 후 프론트엔드에서 API 요청이 막힙니다.
`settings.frontend_url`을 활용하도록 수정해야 합니다.

**수정 전:**
```python
allow_origins=["http://localhost:5173", "http://localhost:3000"],
```

**수정 후:**
```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    settings.frontend_url,  # 프로덕션 Vercel URL
],
```

### 2-2. 프론트엔드 API URL 환경변수화

현재 API 요청 base URL이 하드코딩되어 있다면 `VITE_API_URL` 환경변수로 분리해야 합니다.  
(이미 환경변수를 쓰고 있다면 생략)

---

## 3. 환경변수 목록

### 백엔드 (Railway에 등록)

| 변수명 | 설명 | 예시 |
|---|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon 키 | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 | `eyJ...` |
| `API_KEY_ENCRYPTION_SECRET` | API 키 암호화 시크릿 (32바이트 hex) | `a1b2c3...` |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 | `GOCSPX-...` |
| `FRONTEND_URL` | Vercel 배포 URL | `https://chit-key.vercel.app` |

> ⚠️ `.env` 파일은 절대 Git에 올리지 마세요. `.gitignore`에 `backend/.env`가 포함되어 있는지 확인하세요.

### 프론트엔드 (Vercel에 등록)

| 변수명 | 설명 | 예시 |
|---|---|---|
| `VITE_API_URL` | Railway 백엔드 URL | `https://chit-key.up.railway.app` |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 키 | `eyJ...` |

---

## 4. 배포 순서

Railway와 Vercel 첫 연결은 순서가 중요합니다. 백엔드 URL이 있어야 프론트엔드 환경변수에 넣을 수 있습니다.

```
Step 1. 코드 수정 (CORS, 환경변수) → GitHub Push
Step 2. Railway에 백엔드 배포 → Railway URL 확인
Step 3. Vercel에 프론트엔드 배포 → Vercel URL 확인
Step 4. Railway에 FRONTEND_URL 환경변수 업데이트 (Vercel URL 입력)
Step 5. Railway 재배포 (환경변수 반영)
Step 6. 동작 테스트
```

---

## 5. Railway 백엔드 배포 절차

### 5-1. Railway 계정 설정

1. [railway.app](https://railway.app) 접속 → GitHub 계정으로 가입
2. New Project → Deploy from GitHub repo → `Chit-key` 저장소 선택
3. Root directory: `backend` 로 설정

### 5-2. 시작 명령어 설정

Railway가 Python 프로젝트를 자동 감지하지만, 시작 명령어를 명시해야 합니다.

Railway 프로젝트 설정 → Settings → Deploy → Start Command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

> Railway는 `$PORT` 환경변수를 자동으로 주입합니다.

### 5-3. 환경변수 등록

Railway 프로젝트 → Variables 탭 → [3. 환경변수 목록]의 백엔드 항목 모두 등록

### 5-4. 배포 확인

Railway 제공 URL (예: `https://chit-key-production.up.railway.app`)에서 헬스체크:

```
GET https://chit-key-production.up.railway.app/health
→ {"status": "ok"}
```

---

## 6. Vercel 프론트엔드 배포 절차

### 6-1. Vercel 계정 설정

1. [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 가입
2. New Project → Import Git Repository → `Chit-key` 저장소 선택
3. Root directory: `frontend` 로 설정
4. Framework Preset: **Vite** 자동 감지됨

### 6-2. 환경변수 등록

Vercel 프로젝트 → Settings → Environment Variables → [3. 환경변수 목록]의 프론트엔드 항목 등록

### 6-3. 배포 확인

Vercel 제공 URL (예: `https://chit-key.vercel.app`)에서 서비스 접속 및 로그인 테스트

---

## 7. GitHub Actions CI/CD 구성

Push 시 자동으로 빌드 검증을 수행합니다.  
(실제 배포는 Railway/Vercel이 자동으로 처리, Actions는 품질 게이트 역할)

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-check:
    name: Backend - 의존성 및 문법 검사
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Check syntax (pyflakes)
        run: |
          pip install pyflakes
          cd backend
          python -m pyflakes app/

  frontend-check:
    name: Frontend - 빌드 검사
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_URL: https://placeholder.railway.app
          VITE_SUPABASE_URL: https://placeholder.supabase.co
          VITE_SUPABASE_ANON_KEY: placeholder
```

> CI가 실패(빌드 오류 등)하면 Railway/Vercel 자동 배포도 함께 막을 수 있습니다.  
> Railway: Settings → GitHub → "Only deploy when CI passes" 옵션 활성화

---

## 8. 배포 후 체크리스트

- [ ] `/health` 엔드포인트 응답 확인
- [ ] 구글 로그인 동작 확인 (Google OAuth redirect URI에 프로덕션 URL 추가 필요)
- [ ] API 요청 CORS 오류 없는지 확인 (브라우저 개발자 도구 → Network 탭)
- [ ] Supabase 대시보드에서 DB 연결 확인
- [ ] 기업분석 / 문항분석 / 자소서 작성 에이전트 동작 테스트

### Google OAuth 추가 설정

Google Cloud Console → OAuth 2.0 클라이언트 → 승인된 redirect URI에 추가:

```
https://[프로젝트명].supabase.co/auth/v1/callback
```

(Supabase가 Google OAuth를 중계하므로 Supabase URL만 등록하면 됩니다)

---

## 9. 비용 요약

| 항목 | 플랜 | 월 비용 |
|---|---|---|
| Railway (백엔드) | Hobby ($5 크레딧 제공) | $0 ~ $5 |
| Vercel (프론트엔드) | Hobby | $0 |
| Supabase (DB) | Free | $0 |
| **합계** | | **$0 ~ $5/월** |

> Railway 무료 크레딧은 소규모 트래픽 기준 충분합니다. 트래픽이 늘면 Pro 플랜 ($20/월) 고려.
