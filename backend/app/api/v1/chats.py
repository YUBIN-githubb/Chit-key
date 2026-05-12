import logging
from datetime import datetime, timezone

import anthropic
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel

from app.agents.general_chat import run_general_chat
from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import ForbiddenError, InvalidAPIKeyError, NotFoundError
from app.core.security import decrypt_api_key
from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chats", tags=["chats"])

_TITLE_MODEL = "claude-haiku-4-5-20251001"


def _is_default_title(title: str) -> bool:
    """자동 생성된 기본 제목인지 확인."""
    return not title or title.startswith("새 채팅") or title == "새 자소서 작업"


def _generate_title_background(chat_id: str, user_message: str, assistant_reply: str, api_key: str):
    """백그라운드에서 대화 내용을 요약해 채팅 제목을 생성·저장한다."""
    try:
        supabase = get_supabase()
        chat = supabase.table("chats").select("title").eq("id", chat_id).single().execute()
        if not chat.data or not _is_default_title(chat.data.get("title", "")):
            return  # 이미 의미있는 제목이 있으면 건너뜀

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=_TITLE_MODEL,
            max_tokens=50,
            system="대화를 보고 채팅 제목을 한국어로 15자 이내로 만들어 주세요. 제목 텍스트만 반환하고 따옴표나 부가 설명은 포함하지 마세요.",
            messages=[{
                "role": "user",
                "content": f"사용자: {user_message[:300]}\nAI: {assistant_reply[:300]}",
            }],
        )
        title = response.content[0].text.strip().strip('"').strip("'")
        if title:
            supabase.table("chats").update({"title": title}).eq("id", chat_id).execute()
            logger.info("[TitleGen] 제목 생성 완료 | chat_id=%s title=%s", chat_id, title)
    except Exception as e:
        logger.warning("[TitleGen] 제목 생성 실패 (무시) | chat_id=%s error=%s", chat_id, e)


class ChatCreate(BaseModel):
    title: str | None = None


class ChatTitleUpdate(BaseModel):
    title: str


class MessageCreate(BaseModel):
    content: str


@router.get("")
async def list_chats(current_user: dict = Depends(get_onboarded_user)):
    supabase = get_supabase()
    result = (
        supabase.table("chats")
        .select("id, title, created_at, updated_at")
        .eq("user_id", current_user["id"])
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


@router.post("", status_code=201)
async def create_chat(
    body: ChatCreate,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    default_title = f"새 채팅 {now.month:02d}.{now.day:02d} {now.hour:02d}:{now.minute:02d}"
    title = body.title if body.title else default_title
    result = (
        supabase.table("chats")
        .insert({"user_id": current_user["id"], "title": title})
        .execute()
    )
    return result.data[0]


@router.get("/{chat_id}")
async def get_chat(
    chat_id: str,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    chat = (
        supabase.table("chats")
        .select("*")
        .eq("id", chat_id)
        .single()
        .execute()
    )
    if not chat.data:
        raise NotFoundError("채팅을 찾을 수 없습니다.")
    if chat.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    messages = (
        supabase.table("messages")
        .select("id, role, content, agent_type, artifact_id, created_at")
        .eq("chat_id", chat_id)
        .order("created_at", desc=False)
        .execute()
    )

    return {**chat.data, "messages": messages.data}


@router.patch("/{chat_id}")
async def update_chat_title(
    chat_id: str,
    body: ChatTitleUpdate,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    chat = (
        supabase.table("chats")
        .select("user_id")
        .eq("id", chat_id)
        .single()
        .execute()
    )
    if not chat.data:
        raise NotFoundError("채팅을 찾을 수 없습니다.")
    if chat.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    result = (
        supabase.table("chats")
        .update({"title": body.title.strip()})
        .eq("id", chat_id)
        .execute()
    )
    return result.data[0]


@router.delete("/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: str,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    chat = (
        supabase.table("chats")
        .select("user_id")
        .eq("id", chat_id)
        .single()
        .execute()
    )
    if not chat.data:
        raise NotFoundError("채팅을 찾을 수 없습니다.")
    if chat.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    supabase.table("chats").delete().eq("id", chat_id).execute()


@router.post("/{chat_id}/messages", status_code=201)
async def add_message(
    chat_id: str,
    body: MessageCreate,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    chat = (
        supabase.table("chats")
        .select("user_id")
        .eq("id", chat_id)
        .single()
        .execute()
    )
    if not chat.data:
        raise NotFoundError("채팅을 찾을 수 없습니다.")
    if chat.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    result = (
        supabase.table("messages")
        .insert({"chat_id": chat_id, "role": "user", "content": body.content})
        .execute()
    )
    return result.data[0]


@router.post("/{chat_id}/chat")
async def chat(
    chat_id: str,
    body: MessageCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_onboarded_user),
):
    """일반 대화: 사용자 메시지 저장 → Claude 응답 생성 → 어시스턴트 메시지 저장."""
    supabase = get_supabase()

    # 채팅 권한 확인
    chat_row = (
        supabase.table("chats")
        .select("user_id")
        .eq("id", chat_id)
        .single()
        .execute()
    )
    if not chat_row.data:
        raise NotFoundError("채팅을 찾을 수 없습니다.")
    if chat_row.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    # Claude API Key 확인
    user_row = (
        supabase.table("users")
        .select("claude_api_key_encrypted")
        .eq("id", current_user["id"])
        .single()
        .execute()
    )
    encrypted = user_row.data and user_row.data.get("claude_api_key_encrypted")
    if not encrypted:
        raise InvalidAPIKeyError("Claude API Key가 등록되지 않았습니다.")
    api_key = decrypt_api_key(encrypted)

    # 최근 메시지 히스토리 로드 (최대 10개 — 컨텍스트용)
    history_result = (
        supabase.table("messages")
        .select("role, content")
        .eq("chat_id", chat_id)
        .order("created_at", desc=False)
        .limit(10)
        .execute()
    )
    history = [
        {"role": m["role"], "content": m["content"]}
        for m in (history_result.data or [])
        if m["content"]
    ]

    # 사용자 메시지 저장
    supabase.table("messages").insert({
        "chat_id": chat_id,
        "role": "user",
        "content": body.content,
    }).execute()

    # Claude 호출 (히스토리 + 현재 메시지)
    messages_for_ai = history + [{"role": "user", "content": body.content}]
    reply = run_general_chat(messages=messages_for_ai, api_key=api_key)

    # 어시스턴트 응답 저장
    result = (
        supabase.table("messages")
        .insert({"chat_id": chat_id, "role": "assistant", "content": reply})
        .execute()
    )

    # 제목이 기본값이면 백그라운드에서 대화 요약 제목 생성
    background_tasks.add_task(
        _generate_title_background, chat_id, body.content, reply, api_key
    )

    return {"role": "assistant", "content": reply, "id": result.data[0]["id"]}
