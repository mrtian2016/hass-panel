import time
from uuid import UUID, uuid4
from asyncio.exceptions import TimeoutError
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Callable, Optional

if TYPE_CHECKING:
    from starlette.types import ASGIApp, Message, Receive, Scope, Send
from starlette.datastructures import Headers, MutableHeaders
from starlette.middleware.base import BaseHTTPMiddleware
from contextvars import ContextVar
from fastapi import Request
from fastapi.responses import JSONResponse

from .exc import CustomException
from utils.common import generate_resp


"""
add_process_time_header
"""
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

"""
proc_custom_exception
"""
async def proc_custom_exception(request: Request, call_next):
    try:
        response = await call_next(request)
    except TimeoutError:
        response = JSONResponse(generate_resp(code=-1, message="MicroService Disconnect"))
    except CustomException as e:
        response = JSONResponse(generate_resp(**e.ret))
    return response

"""
LogMiddleware
Tip: can't log request body
"""
async def log_request(request: Request, call_next):
    logger = request.app.state.logger
    logger.debug(f"{request.method} {request.url}")
    params = {
        'path_params': request.path_params,
        'query_params': request.query_params
    }
    logger.debug("Params:")
    for name, value in params.items():
        logger.debug(f"\t{name}: {value}")
    logger.debug("Headers:")
    for name, value in request.headers.items():
        logger.debug(f"\t{name}: {value}")

    response = await call_next(request)
    return response

"""
CorrelationIdMiddleware
"""
# Middleware
correlation_id: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)

# Celery extension
celery_parent_id: ContextVar[Optional[str]] = ContextVar('celery_parent', default=None)
celery_current_id: ContextVar[Optional[str]] = ContextVar('celery_current', default=None)

def is_valid_uuid4(uuid_: str) -> bool:
    """
    Check whether a string is a valid v4 uuid.
    """
    try:
        return bool(UUID(uuid_, version=4))
    except ValueError:
        return False

@dataclass
class CorrelationIdMiddleware:
    app: 'ASGIApp'
    header_name: str = 'X-Correlation-ID'

    # ID-generating callable
    generator: Callable[[], str] = field(default=lambda: uuid4().hex)

    # ID validator
    validator: Optional[Callable[[str], bool]] = field(default=is_valid_uuid4)

    # ID transformer - can be used to clean/mutate IDs
    transformer: Optional[Callable[[str], str]] = field(default=lambda a: a)

    async def __call__(self, scope: 'Scope', receive: 'Receive', send: 'Send') -> None:
        """
        Load request ID from headers if present. Generate one otherwise.
        """
        if scope['type'] != 'http':
            await self.app(scope, receive, send)
            return

        # Try to load request ID from the request headers
        header_value = Headers(scope=scope).get(self.header_name.lower())

        if not header_value:
            # Generate request ID if none was found
            id_value = self.generator()
        elif self.validator and not self.validator(header_value):
            # Also generate a request ID if one was found, but it was deemed invalid
            id_value = self.generator()
        else:
            # Otherwise, use the found request ID
            id_value = header_value

        # Clean/change the ID if needed
        if self.transformer:
            id_value = self.transformer(id_value)

        correlation_id.set(id_value)

        async def handle_outgoing_request(message: 'Message') -> None:
            if message['type'] == 'http.response.start' and correlation_id.get():
                headers = MutableHeaders(scope=message)
                headers.append(self.header_name, correlation_id.get())
                headers.append('Access-Control-Expose-Headers', self.header_name)

            await send(message)

        await self.app(scope, receive, handle_outgoing_request)
        return
    