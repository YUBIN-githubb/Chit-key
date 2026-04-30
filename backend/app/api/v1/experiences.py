from datetime import date

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.supabase import get_supabase

router = APIRouter(prefix="/experiences", tags=["experiences"])


class ExperienceCreate(BaseModel):
    name: str
    role: str
    period_start: date
    period_end: date | None = None
    star_situation: str | None = None
    star_task: str | None = None
    star_action: str | None = None
    star_result: str | None = None
    competency_tags: list[str] = []


class ExperienceUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    period_start: date | None = None
    period_end: date | None = None
    star_situation: str | None = None
    star_task: str | None = None
    star_action: str | None = None
    star_result: str | None = None
    competency_tags: list[str] | None = None


@router.get("")
async def list_experiences(
    tags: list[str] = Query(default=[]),
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    query = supabase.table("experiences").select("*").eq("user_id", current_user["id"])

    if tags:
        query = query.contains("competency_tags", tags)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.post("", status_code=201)
async def create_experience(
    body: ExperienceCreate,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    data = body.model_dump()
    data["user_id"] = current_user["id"]
    # date → str 변환 (supabase-py 직렬화)
    data["period_start"] = str(data["period_start"])
    if data["period_end"]:
        data["period_end"] = str(data["period_end"])

    result = supabase.table("experiences").insert(data).execute()
    return result.data[0]


@router.put("/{experience_id}")
async def update_experience(
    experience_id: str,
    body: ExperienceUpdate,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    existing = (
        supabase.table("experiences")
        .select("user_id")
        .eq("id", experience_id)
        .single()
        .execute()
    )
    if not existing.data:
        raise NotFoundError("경험을 찾을 수 없습니다.")
    if existing.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    update_data = body.model_dump(exclude_none=True)
    if "period_start" in update_data:
        update_data["period_start"] = str(update_data["period_start"])
    if "period_end" in update_data:
        update_data["period_end"] = str(update_data["period_end"])

    result = (
        supabase.table("experiences")
        .update(update_data)
        .eq("id", experience_id)
        .execute()
    )
    return result.data[0]


@router.delete("/{experience_id}", status_code=204)
async def delete_experience(
    experience_id: str,
    current_user: dict = Depends(get_onboarded_user),
):
    supabase = get_supabase()
    existing = (
        supabase.table("experiences")
        .select("user_id")
        .eq("id", experience_id)
        .single()
        .execute()
    )
    if not existing.data:
        raise NotFoundError("경험을 찾을 수 없습니다.")
    if existing.data["user_id"] != current_user["id"]:
        raise ForbiddenError("접근 권한이 없습니다.")

    supabase.table("experiences").delete().eq("id", experience_id).execute()
