import json
import logging

from app.agents.base import run_agent
from app.prompts.loader import load_prompt

logger = logging.getLogger(__name__)


class QuestionItem:
    def __init__(self, question: str, char_limit: int | None = None):
        self.question = question
        self.char_limit = char_limit


def run_question_analyze(
    *,
    company: str,
    position: str,
    questions: list,
    company_artifact: dict | None = None,
    api_key: str,
) -> str:
    logger.info("[QuestionAnalyze] 시작 | company=%s position=%s questions=%d개", company, position, len(questions))
    system_prompt = load_prompt("question-analyze")

    def _fmt(i: int, q) -> str:
        limit_str = f" (글자수 제한: {q.char_limit}자)" if q.char_limit else ""
        return f"{i+1}. {q.question}{limit_str}"

    question_list = "\n".join(_fmt(i, q) for i, q in enumerate(questions))

    company_section = ""
    if company_artifact:
        company_section = (
            "\n\n[기업 분석 리포트]\n"
            + json.dumps(company_artifact, ensure_ascii=False, indent=2)
        )

    user_message = (
        f"기업: {company}\n"
        f"직무: {position}\n\n"
        f"자소서 문항:\n{question_list}"
        f"{company_section}"
    )

    return run_agent(
        system_prompt=system_prompt,
        user_message=user_message,
        api_key=api_key,
    )
