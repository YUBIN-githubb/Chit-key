import json
import logging

from app.agents.base import run_agent
from app.prompts.loader import load_prompt
from app.tools.experience_query import TOOL_DEFINITION, search_experiences_by_tags

logger = logging.getLogger(__name__)


def run_essay_writer(
    *,
    user_id: str,
    company: str,
    position: str,
    questions: list,
    question_artifact: dict | None = None,
    api_key: str,
) -> str:
    logger.info("[EssayWriter] 시작 | user_id=%s company=%s position=%s questions=%d개", user_id, company, position, len(questions))
    system_prompt = load_prompt("essay-writer")

    def _fmt(i: int, q) -> str:
        limit_str = f" (글자수 제한: {q.char_limit}자)" if q.char_limit else ""
        return f"{i+1}. {q.question}{limit_str}"

    question_list = "\n".join(_fmt(i, q) for i, q in enumerate(questions))

    question_section = ""
    if question_artifact:
        question_section = (
            "\n\n[문항 분석 결과]\n"
            + json.dumps(question_artifact, ensure_ascii=False, indent=2)
        )

    user_message = (
        f"기업: {company}\n"
        f"직무: {position}\n\n"
        f"자소서 문항:\n{question_list}\n\n"
        f"위 문항에 맞는 자소서 초안을 작성해 주세요."
        f"{question_section}"
    )

    def tool_executor(tool_name: str, tool_input: dict) -> str:
        if tool_name == "search_experiences_by_tags":
            tags = tool_input.get("tags", [])
            experiences = search_experiences_by_tags(user_id=user_id, tags=tags)
            return json.dumps(experiences, ensure_ascii=False, default=str)
        return json.dumps({"error": f"알 수 없는 툴: {tool_name}"})

    return run_agent(
        system_prompt=system_prompt,
        user_message=user_message,
        api_key=api_key,
        tools=[TOOL_DEFINITION],
        tool_executor=tool_executor,
    )
