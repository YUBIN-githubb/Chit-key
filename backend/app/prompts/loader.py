from pathlib import Path

_PROMPT_DIR = Path(__file__).parent.parent.parent.parent / "agent-prompt"


def load_prompt(agent_name: str) -> str:
    """agent-prompt/{agent_name}.md 파일을 읽어 반환."""
    path = _PROMPT_DIR / f"{agent_name}.md"
    if not path.exists():
        raise FileNotFoundError(f"프롬프트 파일을 찾을 수 없습니다: {path}")
    return path.read_text(encoding="utf-8").strip("`").strip()
