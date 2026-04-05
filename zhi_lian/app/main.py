import logging
import uvicorn
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

try:
    from .routers.auth_router import router as auth_router
    from .routers.history_router import router as history_router
    from .routers.portal_router import router as portal_router
    from .routers.user_router import router as user_router
    from .routers.workflow_router import router as workflow_router
except ImportError:
    from app.routers.auth_router import router as auth_router
    from app.routers.history_router import router as history_router
    from app.routers.portal_router import router as portal_router
    from app.routers.user_router import router as user_router
    from app.routers.workflow_router import router as workflow_router

app = FastAPI()
logger = logging.getLogger(__name__)

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:5000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5000",
    "http://[::1]:*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # 可以访问的域名列表
    allow_credentials=True,      # 是否允许携带cookie
    allow_methods=["*"],         # 允许所有方法
    allow_headers=["*"],         # 允许所有请求头
)

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(history_router, prefix="/history", tags=["history"])
api_router.include_router(portal_router, prefix="/portal", tags=["portal"])
api_router.include_router(user_router, prefix="/user", tags=["user"])
api_router.include_router(workflow_router, prefix="/workflow", tags=["workflow"])
app.include_router(api_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    details = exc.detail if isinstance(exc.detail, dict) else None
    message = exc.detail.get("message") if isinstance(exc.detail, dict) else str(exc.detail)
    code = exc.detail.get("code") if isinstance(exc.detail, dict) else f"ERR_HTTP_{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": code,
            "message": message,
            "data": None,
            **({"details": details} if details else {}),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "code": "ERR_VALIDATION",
            "message": "request validation failed",
            "data": None,
            "details": {"errors": exc.errors()},
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "code": "ERR_INTERNAL",
            "message": "internal server error",
            "data": None,
        },
    )


if __name__ == "__main__":
    try:
        from .core.logger import setup_logging
    except ImportError:
        from app.core.logger import setup_logging
    setup_logging()
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
