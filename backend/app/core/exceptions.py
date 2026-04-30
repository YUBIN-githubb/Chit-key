class ChitkeyError(Exception):
    """모든 커스텀 예외의 base."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class AuthError(ChitkeyError):
    """JWT 없음 / 만료 / 유효하지 않음 → 401."""
    pass


class ForbiddenError(ChitkeyError):
    """인증은 됐으나 타인 리소스 접근 → 403."""
    pass


class OnboardingRequiredError(ChitkeyError):
    """온보딩 미완료 상태로 보호 API 접근 → 403."""
    pass


class NotFoundError(ChitkeyError):
    """리소스 없음 → 404."""
    pass


class InvalidAPIKeyError(ChitkeyError):
    """Claude API Key 형식 오류 / 미등록 → 400."""
    pass


class AgentError(ChitkeyError):
    """에이전트 루프 내부 오류 → 500."""
    pass


class MaxIterationsError(AgentError):
    """max_iterations 초과 → 500."""
    pass


class ExternalAPIError(ChitkeyError):
    """Anthropic / 외부 API 호출 실패 → 502."""
    pass
