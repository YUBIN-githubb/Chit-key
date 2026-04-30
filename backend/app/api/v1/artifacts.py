from fastapi import APIRouter, Depends, Query

from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.supabase import get_supabase

router = APIRouter(prefix="/artifacts", tags=["artifacts"])

_AGENT_TYPES = {"company-analyze", "question-analyze", "essay-writer"}


@router.get("")
async def list_artifacts(
    agent_type: str | None = Query(default=None),
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    query = (
        supabase.table("artifacts")
        .select("id, agent_type, title, company_name, position, created_at")
        .eq("user_id", current_user["id"])
    )
    if agent_type:
        if agent_type not in _AGENT_TYPES:
            return []
        query = query.eq("agent_type", agent_type)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{artifact_id}")
async def get_artifact(
    artifact_id: str,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    result = (
        supabase.table("artifacts")
        .select("*")
        .eq("id", artifact_id)
        .single()
        .execute()
    )
    if not result.data:
        raise NotFoundError("산출물을 찾을 수 없습니다.")
    if result.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")
    return result.data
