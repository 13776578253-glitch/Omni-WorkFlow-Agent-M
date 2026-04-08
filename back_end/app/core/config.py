from __future__ import annotations

import os
from importlib import import_module
from pathlib import Path
from typing import Final


def _load_dotenv_module() -> object | None:
    try:
        return import_module("dotenv")
    except ImportError:  # pragma: no cover - fallback for minimal runtime envs
        return None


def load_dotenv(*args: object, **kwargs: object) -> bool:
    dotenv_module = _load_dotenv_module()
    if dotenv_module is None:
        return False
    return bool(dotenv_module.load_dotenv(*args, **kwargs)) # type: ignore

# 项目根目录 app/
BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE)

# 日志
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "zhi_lian.log"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# 数据库
DEFAULT_DATABASE_URL: Final[str] = "postgresql+asyncpg://zhilian:123456@localhost:5432/zhilian_db"


def _normalize_database_url(value: str) -> str:
    if value.startswith("postgresql://"):
        return value.replace("postgresql://", "postgresql+asyncpg://", 1)
    return value


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL))

# 兼容旧代码导入
DB_FILE = DATABASE_URL

# 第三方模型与服务密钥
APPID = os.getenv("APPID", "")
API_KEY = os.getenv("API_KEY", "")
API_SECRET = os.getenv("API_SECRET", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

# 数据源策略
DATA_SOURCE_STRATEGIES = ("mock_only", "db_preferred_with_mock_fallback", "db_only")
DEFAULT_DATA_SOURCE_STRATEGY = os.getenv("DATA_SOURCE_DEFAULT", "mock_only")


def _normalize_strategy(value: str | None) -> str:
    candidate = (value or DEFAULT_DATA_SOURCE_STRATEGY or "mock_only").strip()
    if candidate not in DATA_SOURCE_STRATEGIES:
        return "mock_only"
    return candidate


def get_data_source_strategy(module_name: str) -> str:
    env_key = f"DATA_SOURCE_{module_name.upper()}"
    return _normalize_strategy(os.getenv(env_key))


def get_all_data_source_strategies() -> dict[str, str]:
    return {
        "auth": get_data_source_strategy("auth"),
        "preferences": get_data_source_strategy("preferences"),
        "history": get_data_source_strategy("history"),
        "workflow": get_data_source_strategy("workflow"),
        "portal": get_data_source_strategy("portal"),
        "file_audio_task": get_data_source_strategy("file_audio_task"),
    }
