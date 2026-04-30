import json
import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.agents.company_analyze import run_company_analyze
from app.agents.essay_writer import run_essay_writer
from app.agents.question_analyze import run_question_analyze
from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import InvalidAPIKeyError, NotFoundError
from app.core.security import decrypt_api_key
from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agents", tags=["agents"])


def _get_api_key(user_id: str) -> str:
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("claude_api_key_encrypted")
        .eq("id", user_id)
        .single()
        .execute()
    )
    encrypted = result.data and result.data.get("claude_api_key_encrypted")
    if not encrypted:
        raise InvalidAPIKeyError("Claude API Key가 등록되지 않았습니다. 온보딩에서 먼저 등록해 주세요.")
    return decrypt_api_key(encrypted)


def _save_artifact(*, user_id: str, chat_id: str | None, agent_type: str, title: str, content: dict, company_name: str | None, position: str | None) -> dict:
    supabase = get_supabase()
    result = (
        supabase.table("artifacts")
        .insert({
            "user_id": user_id,
            "chat_id": chat_id,
            "agent_type": agent_type,
            "title": title,
            "content": content,
            "company_name": company_name,
            "position": position,
        })
        .execute()
    )
    return result.data[0]


def _save_message(*, chat_id: str, role: str, content: str, agent_type: str | None, artifact_id: str | None):
    supabase = get_supabase()
    supabase.table("messages").insert({
        "chat_id": chat_id,
        "role": role,
        "content": content,
        "agent_type": agent_type,
        "artifact_id": artifact_id,
    }).execute()


# ── 기업분석 ──────────────────────────────────────

class CompanyAnalyzeRequest(BaseModel):
    chat_id: str
    company: str
    position: str


@router.post("/company-analyze")
async def company_analyze(
    body: CompanyAnalyzeRequest,
    current_user: dict = Depends(get_onboarded_user),
):
    logger.info("[API] company-analyze 요청 | user_id=%s company=%s position=%s chat_id=%s",
                current_user["id"], body.company, body.position, body.chat_id)

    api_key = _get_api_key(current_user["id"])
    logger.info("[API] Claude API Key 확인 완료")

    _save_message(chat_id=body.chat_id, role="user", content=f"{body.company} {body.position} 기업 분석", agent_type="company-analyze", artifact_id=None)
    logger.info("[API] 유저 메시지 저장 완료")

    result_text = run_company_analyze(company=body.company, position=body.position, api_key=api_key)
    logger.info("[API] 기업분석 완료 | 결과 길이=%d자", len(result_text))

    artifact = _save_artifact(
        user_id=current_user["id"],
        chat_id=body.chat_id,
        agent_type="company-analyze",
        title=f"{body.company} {body.position} 기업분석",
        content={"raw": result_text},
        company_name=body.company,
        position=body.position,
    )
    logger.info("[API] artifact 저장 완료 | artifact_id=%s", artifact["id"])

    _save_message(chat_id=body.chat_id, role="assistant", content=result_text, agent_type="company-analyze", artifact_id=artifact["id"])
    logger.info("[API] 어시스턴트 메시지 저장 완료 | company-analyze 전체 완료")

    return {"artifact": artifact, "result": result_text}


# ── 문항분석 ──────────────────────────────────────

class QuestionItem(BaseModel):
    question: str
    char_limit: int | None = None


class QuestionAnalyzeRequest(BaseModel):
    chat_id: str
    company: str
    position: str
    questions: list[QuestionItem]
    company_artifact_id: str | None = None


@router.post("/question-analyze")
async def question_analyze(
    body: QuestionAnalyzeRequest,
    current_user: dict = Depends(get_onboarded_user),
):
    api_key = _get_api_key(current_user["id"])

    company_artifact = None
    if body.company_artifact_id:
        supabase = get_supabase()
        res = supabase.table("artifacts").select("content").eq("id", body.company_artifact_id).eq("user_id", current_user["id"]).single().execute()
        if not res.data:
            raise NotFoundError("기업분석 산출물을 찾을 수 없습니다.")
        company_artifact = res.data["content"]

    _save_message(chat_id=body.chat_id, role="user", content=f"{body.company} 문항 분석 ({len(body.questions)}개)", agent_type="question-analyze", artifact_id=None)

    result_text = run_question_analyze(
        company=body.company,
        position=body.position,
        questions=body.questions,
        company_artifact=company_artifact,
        api_key=api_key,
    )

    artifact = _save_artifact(
        user_id=current_user["id"],
        chat_id=body.chat_id,
        agent_type="question-analyze",
        title=f"{body.company} {body.position} 문항분석",
        content={"raw": result_text},
        company_name=body.company,
        position=body.position,
    )
    _save_message(chat_id=body.chat_id, role="assistant", content=result_text, agent_type="question-analyze", artifact_id=artifact["id"])

    return {"artifact": artifact, "result": result_text}


# ── 자소서작성 ────────────────────────────────────

class EssayWriterRequest(BaseModel):
    chat_id: str
    company: str
    position: str
    questions: list[QuestionItem]
    question_artifact_id: str | None = None


@router.post("/essay-writer")
async def essay_writer(
    body: EssayWriterRequest,
    current_user: dict = Depends(get_onboarded_user),
):
    api_key = _get_api_key(current_user["id"])

    question_artifact = None
    if body.question_artifact_id:
        supabase = get_supabase()
        res = supabase.table("artifacts").select("content").eq("id", body.question_artifact_id).eq("user_id", current_user["id"]).single().execute()
        if not res.data:
            raise NotFoundError("문항분석 산출물을 찾을 수 없습니다.")
        question_artifact = res.data["content"]

    _save_message(chat_id=body.chat_id, role="user", content=f"{body.company} 자소서 작성 ({len(body.questions)}개 문항)", agent_type="essay-writer", artifact_id=None)

    result_text = run_essay_writer(
        user_id=current_user["id"],
        company=body.company,
        position=body.position,
        questions=body.questions,
        question_artifact=question_artifact,
        api_key=api_key,
    )

    artifact = _save_artifact(
        user_id=current_user["id"],
        chat_id=body.chat_id,
        agent_type="essay-writer",
        title=f"{body.company} {body.position} 자소서 초안",
        content={"raw": result_text},
        company_name=body.company,
        position=body.position,
    )
    _save_message(chat_id=body.chat_id, role="assistant", content=result_text, agent_type="essay-writer", artifact_id=artifact["id"])

    return {"artifact": artifact, "result": result_text}
