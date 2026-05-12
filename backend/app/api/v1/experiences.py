from datetime import date

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, field_validator

from app.api.v1.deps import get_onboarded_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.supabase import get_supabase

router = APIRouter(prefix="/experiences", tags=["experiences"])

# 카테고리당 최대 2개 제한을 위한 사전
_TAG_CATEGORIES: list[list[str]] = [
    ['리더십', '팀장경험', '역할분배', '동기부여', '의사결정', '위임', '목표설정', '성과관리'],
    ['협업', '팀워크', '갈등관리', '설득', '경청', '이해관계조율', '피드백수용', '다양성존중'],
    ['문제해결', '원인분석', '데이터기반판단', '가설검증', '창의적접근', '트레이드오프', '우선순위판단', '논리적사고'],
    ['도전정신', '실패경험', '회복탄력성', '한계돌파', '처음시도', '불확실성대응', '피벗', '재도전'],
    ['자기주도학습', '역량개발', '자격증', '독학', '멘토링', '습관형성', '꾸준함', '성장마인드셋'],
    ['주도성', '기획', '실행력', '프로세스개선', '자동화', '일정관리', '자원관리', '결과도출'],
    ['책임감', '윤리의식', '정직', '원칙준수', '사회적책임', '고객지향', '봉사', '공정성'],
    ['인턴', '대외활동', '학교프로젝트', '동아리', '아르바이트', '공모전', '연구', '창업', '봉사활동', '해외경험', '군경험'],
]


def _validate_tags(tags: list[str]) -> list[str]:
    for category in _TAG_CATEGORIES:
        count = sum(1 for t in tags if t in category)
        if count > 2:
            raise ValueError("카테고리당 역량 태그는 최대 2개까지 선택할 수 있습니다.")
    return tags


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

    @field_validator('competency_tags')
    @classmethod
    def check_tags(cls, v: list[str]) -> list[str]:
        return _validate_tags(v)


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

    @field_validator('competency_tags')
    @classmethod
    def check_tags(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        return _validate_tags(v)


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
