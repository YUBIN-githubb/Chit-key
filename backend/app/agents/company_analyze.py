import logging

from app.agents.base import run_agent
from app.prompts.loader import load_prompt

logger = logging.getLogger(__name__)

# Claude built-in 웹 검색 툴
_WEB_TOOLS = [
    {"type": "web_search_20250305", "name": "web_search"},
]


def run_company_analyze(
    *,
    company: str,
    position: str,
    api_key: str,
) -> str:
    logger.info("[CompanyAnalyze] 시작 | company=%s position=%s", company, position)
    system_prompt = load_prompt("company-analyze")
    user_message = f"기업: {company}\n직무: {position}\n\n위 기업과 직무에 대한 기업 분석 리포트를 작성해 주세요."

    return run_agent(
        system_prompt=system_prompt,
        user_message=user_message,
        api_key=api_key,
        tools=_WEB_TOOLS,
    )
