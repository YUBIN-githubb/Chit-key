from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.supabase import get_supabase

router = APIRouter(prefix="/chats", tags=["chats"])


class ChatCreate(BaseModel):
    title: str | None = None


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
    result = (
        supabase.table("chats")
        .insert({"user_id": current_user["id"], "title": body.title})
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
