import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.core.exceptions import (
    AgentError,
    AuthError,
    ChitkeyError,
    ExternalAPIError,
    ForbiddenError,
    InvalidAPIKeyError,
    MaxIterationsError,
    NotFoundError,
    OnboardingRequiredError,
)

logger = logging.getLogger(__name__)


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AuthError)
    async def auth_error_handler(request: Request, exc: AuthError):
        return _error_response(401, "AUTH_REQUIRED", exc.message)

    @app.exception_handler(ForbiddenError)
    async def forbidden_error_handler(request: Request, exc: ForbiddenError):
        return _error_response(403, "FORBIDDEN", exc.message)

    @app.exception_handler(OnboardingRequiredError)
    async def onboarding_required_handler(request: Request, exc: OnboardingRequiredError):
        return _error_response(403, "ONBOARDING_REQUIRED", exc.message)

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return _error_response(404, "NOT_FOUND", exc.message)

    @app.exception_handler(InvalidAPIKeyError)
    async def invalid_api_key_handler(request: Request, exc: InvalidAPIKeyError):
        return _error_response(400, "INVALID_API_KEY", exc.message)

    @app.exception_handler(MaxIterationsError)
    async def max_iterations_handler(request: Request, exc: MaxIterationsError):
        logger.error("Max iterations exceeded: %s", exc.message)
        return _error_response(500, "MAX_ITERATIONS_EXCEEDED", exc.message)

    @app.exception_handler(AgentError)
    async def agent_error_handler(request: Request, exc: AgentError):
        logger.error("Agent error: %s", exc.message)
        return _error_response(500, "AGENT_ERROR", exc.message)

    @app.exception_handler(ExternalAPIError)
    async def external_api_error_handler(request: Request, exc: ExternalAPIError):
        logger.error("External API error: %s", exc.message)
        return _error_response(502, "EXTERNAL_API_ERROR", exc.message)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        return _error_response(422, "VALIDATION_ERROR", "입력값이 올바르지 않습니다.")

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return _error_response(exc.status_code, "HTTP_ERROR", exc.detail)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.")
