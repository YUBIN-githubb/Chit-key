import logging

from app.agents.base import run_agent

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """당신은 취트키(Chit-key)의 AI 취업 도우미입니다.
취트키는 취업 준비생이 자기소개서를 작성하는 것을 돕는 서비스입니다.

당신이 도울 수 있는 영역:
- 자기소개서 작성 팁과 전략
- 특정 기업/직무에 대한 일반적인 조언
- 면접 준비 방법
- 취업 준비 과정 전반에 대한 상담
- 취트키 서비스 사용 방법 안내 (기업분석 → 문항분석 → 자소서 작성 순서로 진행)

말투 원칙:
- 친절하고 따뜻하되 간결하게 답변하세요
- 토스뱅크처럼 쉽고 명확한 문장을 사용하세요
- 지나치게 딱딱하거나 형식적이지 않게 대화하세요
- 모르는 내용은 솔직하게 인정하세요

답변은 반드시 한국어로 하세요."""


def run_general_chat(
    *,
    messages: list[dict],
    api_key: str,
) -> str:
    """
    일반 대화용 Claude 호출.
    messages: [{"role": "user"|"assistant", "content": str}, ...]
    마지막 메시지는 현재 사용자의 질문.
    """
    logger.info("[GeneralChat] 시작 | messages_count=%d", len(messages))

    # 대화 히스토리를 단일 user_message 문자열로 변환
    # base.run_agent는 단일 user_message 방식이므로 히스토리를 포함해 구성
    if len(messages) == 1:
        user_message = messages[0]["content"]
    else:
        # 히스토리를 포함한 컨텍스트 구성
        history_parts = []
        for msg in messages[:-1]:
            role = "사용자" if msg["role"] == "user" else "AI"
            history_parts.append(f"[{role}]: {msg['content']}")
        history = "\n".join(history_parts)
        current = messages[-1]["content"]
        user_message = f"이전 대화:\n{history}\n\n현재 질문: {current}"

    return run_agent(
        system_prompt=_SYSTEM_PROMPT,
        user_message=user_message,
        api_key=api_key,
    )
