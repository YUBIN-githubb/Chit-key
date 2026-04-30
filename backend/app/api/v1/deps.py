from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthError, OnboardingRequiredError
from app.core.supabase import get_supabase

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    """Authorization: Bearer <supabase_jwt> 헤더에서 사용자 정보를 반환."""
    token = credentials.credentials
    supabase = get_supabase()

    try:
        response = supabase.auth.get_user(token)
    except Exception:
        raise AuthError("유효하지 않은 토큰입니다.")

    if not response or not response.user:
        raise AuthError("유효하지 않은 토큰입니다.")

    return {"id": response.user.id, "email": response.user.email}


async def get_onboarded_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """온보딩이 완료된 사용자만 허용."""
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("onboarding_completed")
        .eq("id", current_user["id"])
        .single()
        .execute()
    )

    if not result.data or not result.data.get("onboarding_completed"):
        raise OnboardingRequiredError("온보딩을 먼저 완료해 주세요.")

    return current_user
