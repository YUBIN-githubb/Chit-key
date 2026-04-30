from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.v1.deps import get_current_user
from app.core.exceptions import InvalidAPIKeyError, NotFoundError
from app.core.security import encrypt_api_key
from app.core.supabase import get_supabase

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    nickname: str | None = None
    onboarding_completed: bool | None = None


class APIKeyUpdate(BaseModel):
    api_key: str


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("id, email, nickname, onboarding_completed, claude_api_key_encrypted, created_at")
        .eq("id", current_user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise NotFoundError("사용자를 찾을 수 없습니다.")
    data = result.data
    data["has_api_key"] = bool(data.pop("claude_api_key_encrypted", None))
    return data


@router.patch("/me")
async def update_me(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise InvalidAPIKeyError("변경할 내용이 없습니다.")

    supabase = get_supabase()
    result = (
        supabase.table("users")
        .update(update_data)
        .eq("id", current_user["id"])
        .execute()
    )
    return result.data[0]


@router.post("/me/api-key")
async def update_api_key(
    body: APIKeyUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not body.api_key.startswith("sk-ant-"):
        raise InvalidAPIKeyError("유효하지 않은 Claude API Key 형식입니다.")

    encrypted = encrypt_api_key(body.api_key)
    supabase = get_supabase()
    supabase.table("users").update(
        {"claude_api_key_encrypted": encrypted}
    ).eq("id", current_user["id"]).execute()

    return {"message": "API Key가 저장됐습니다."}
