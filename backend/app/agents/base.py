import json
import logging
from typing import Callable

import anthropic

from app.core.exceptions import AgentError, ExternalAPIError, MaxIterationsError

logger = logging.getLogger(__name__)

MAX_ITERATIONS = 10
MODEL = "claude-sonnet-4-6"


def run_agent(
    *,
    system_prompt: str,
    user_message: str,
    api_key: str,
    tools: list[dict] | None = None,
    tool_executor: Callable[[str, dict], str] | None = None,
    max_iterations: int = MAX_ITERATIONS,
) -> str:
    """
    Claude 에이전트 루프를 실행하고 최종 텍스트 응답을 반환.

    - tools가 없으면 단순 1회 호출.
    - tool_executor(tool_name, tool_input) → str 결과 반환 함수가 필요.
    """
    tool_names = [t.get("name", t.get("type", "?")) for t in tools] if tools else []
    logger.info("[Agent] 시작 | model=%s max_tokens=16384 tools=%s", MODEL, tool_names)

    try:
        client = anthropic.Anthropic(api_key=api_key)
    except Exception as e:
        raise ExternalAPIError(f"Anthropic 클라이언트 초기화 실패: {e}")

    messages = [{"role": "user", "content": user_message}]
    create_kwargs = {
        "model": MODEL,
        "max_tokens": 16384,
        "system": system_prompt,
        "messages": messages,
    }
    if tools:
        create_kwargs["tools"] = tools

    for iteration in range(max_iterations):
        logger.info("[Agent] 반복 %d/%d | Claude API 호출 중...", iteration + 1, max_iterations)
        try:
            response = client.messages.create(**create_kwargs)
        except anthropic.AuthenticationError:
            raise ExternalAPIError("Claude API Key가 유효하지 않습니다.")
        except anthropic.APIError as e:
            raise ExternalAPIError(f"Anthropic API 오류: {e}")

        logger.info("[Agent] 반복 %d 완료 | stop_reason=%s input_tokens=%s output_tokens=%s",
                    iteration + 1, response.stop_reason,
                    response.usage.input_tokens, response.usage.output_tokens)

        if response.stop_reason == "end_turn":
            result = _extract_text(response)
            logger.info("[Agent] 완료 | 총 %d회 반복, 응답 길이=%d자", iteration + 1, len(result))
            return result

        if response.stop_reason == "tool_use":
            if tool_executor is None:
                raise AgentError("tool_use 응답이 왔지만 tool_executor가 없습니다.")

            # 어시스턴트 응답을 대화 기록에 추가
            messages.append({"role": "assistant", "content": response.content})

            # 모든 tool_use 블록 처리
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue
                logger.info("[Agent] 툴 호출 | tool=%s input_keys=%s", block.name, list(block.input.keys()))
                try:
                    result_str = tool_executor(block.name, block.input)
                    logger.info("[Agent] 툴 결과 | tool=%s 결과 길이=%d자", block.name, len(result_str))
                except Exception as e:
                    logger.warning("[Agent] 툴 실행 실패 | tool=%s error=%s", block.name, e)
                    result_str = json.dumps({"error": str(e)}, ensure_ascii=False)

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result_str,
                })

            messages.append({"role": "user", "content": tool_results})
            create_kwargs["messages"] = messages
            continue

        # 예상치 못한 stop_reason
        raise AgentError(f"예상치 못한 stop_reason: {response.stop_reason}")

    raise MaxIterationsError(f"에이전트가 {max_iterations}회 반복 후에도 완료되지 않았습니다.")


def _extract_text(response) -> str:
    """응답 content 블록에서 텍스트만 추출."""
    parts = [block.text for block in response.content if hasattr(block, "text")]
    return "\n".join(parts)
