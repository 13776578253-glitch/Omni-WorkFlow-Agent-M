import uvicorn, os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routers.auth_router import router as auth_router

app = FastAPI()

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

app.include_router(auth_router, prefix="/auth", tags=["auth"])

BASE_DIR = Path(__file__).parent.parent
# app.mount("/music_player/front_end", StaticFiles(directory=BASE_DIR / "front_end", html=True), name="front_end")


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()
    uvicorn.run(app, host="0.0.0.0", port=8000)
    