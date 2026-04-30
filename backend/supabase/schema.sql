-- ============================================================
-- Chit-key Database Schema
-- Supabase SQL Editor에서 순서대로 실행하세요.
-- ============================================================

-- ────────────────────────────────────────
-- 1. users
-- auth.users(Supabase Auth)와 1:1 연결되는 프로필 테이블
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   VARCHAR(255) NOT NULL,
    nickname                VARCHAR(50),
    claude_api_key_encrypted TEXT,
    onboarding_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: 본인만 조회" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: 본인만 수정" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Google OAuth 로그인 시 users row 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────
-- 2. experiences
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    role             VARCHAR(100) NOT NULL,
    period_start     DATE NOT NULL,
    period_end       DATE,
    star_situation   TEXT,
    star_task        TEXT,
    star_action      TEXT,
    star_result      TEXT,
    competency_tags  TEXT[] NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiences_user_id
    ON public.experiences (user_id);

CREATE INDEX idx_experiences_tags
    ON public.experiences USING GIN (competency_tags);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiences: 본인만 조회" ON public.experiences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "experiences: 본인만 생성" ON public.experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "experiences: 본인만 수정" ON public.experiences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "experiences: 본인만 삭제" ON public.experiences
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 3. chats
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chats (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title      VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chats_user_id_created
    ON public.chats (user_id, created_at DESC);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chats: 본인만 조회" ON public.chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chats: 본인만 생성" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chats: 본인만 수정" ON public.chats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "chats: 본인만 삭제" ON public.chats
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 4. artifacts (에이전트 산출물)
-- messages보다 먼저 생성 (messages가 FK 참조)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.artifacts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chat_id      UUID REFERENCES public.chats(id) ON DELETE SET NULL,
    agent_type   VARCHAR(30) NOT NULL
                     CHECK (agent_type IN ('company-analyze', 'question-analyze', 'essay-writer')),
    title        VARCHAR(200) NOT NULL,
    content      JSONB NOT NULL DEFAULT '{}',
    company_name VARCHAR(100),
    position     VARCHAR(100),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artifacts_user_agent
    ON public.artifacts (user_id, agent_type);

CREATE INDEX idx_artifacts_user_created
    ON public.artifacts (user_id, created_at DESC);

ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artifacts: 본인만 조회" ON public.artifacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "artifacts: 본인만 생성" ON public.artifacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "artifacts: 본인만 수정" ON public.artifacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "artifacts: 본인만 삭제" ON public.artifacts
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 5. messages
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id     UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    agent_type  VARCHAR(30)
                    CHECK (agent_type IN ('company-analyze', 'question-analyze', 'essay-writer')),
    artifact_id UUID REFERENCES public.artifacts(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_id_created
    ON public.messages (chat_id, created_at ASC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- messages는 chat 소유자 여부로 RLS 판단
CREATE POLICY "messages: 본인 채팅만 조회" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
              AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "messages: 본인 채팅에만 생성" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
              AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "messages: 본인 채팅만 삭제" ON public.messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
              AND chats.user_id = auth.uid()
        )
    );


-- ────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_experiences
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_chats
    BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_artifacts
    BEFORE UPDATE ON public.artifacts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
