from app.core.supabase import get_supabase

# 자소서작성 에이전트가 Claude tool_use로 호출하는 툴 정의
TOOL_DEFINITION = {
    "name": "search_experiences_by_tags",
    "description": (
        "사용자의 경험 DB에서 특정 역량 태그를 가진 경험을 검색합니다. "
        "반환된 경험의 STAR 내용을 자소서 작성에 활용하세요."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "검색할 역량 태그 목록 (예: ['문제해결', '주도성'])",
            }
        },
        "required": ["tags"],
    },
}


def search_experiences_by_tags(user_id: str, tags: list[str]) -> list[dict]:
    """역량 태그로 경험을 필터링해 반환."""
    supabase = get_supabase()
    result = (
        supabase.table("experiences")
        .select("id, name, role, period_start, period_end, star_situation, star_task, star_action, star_result, competency_tags")
        .eq("user_id", user_id)
        .contains("competency_tags", tags)
        .execute()
    )
    return result.data or []
