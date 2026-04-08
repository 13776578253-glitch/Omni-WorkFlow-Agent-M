from __future__ import annotations

from importlib import import_module


def _get_db_context():
    try:
        db_connect = import_module("zhi_lian.app.db.db_connect")
    except ImportError:
        db_connect = import_module("app.db.db_connect")
    return db_connect.db_context


def _sql_text(sql: str):
    sqlalchemy_module = import_module("sqlalchemy")
    return sqlalchemy_module.text(sql)


async def ensure_auth_preferences_schema() -> None:
    db_context = _get_db_context()
    async with db_context() as session:
        await session.execute(_sql_text("CREATE SCHEMA IF NOT EXISTS public"))
        await session.execute(
            _sql_text(
                """
                DO $$
                BEGIN
                    CREATE TYPE public.presetmodeenum AS ENUM ('custom', 'concise', 'formal');
                EXCEPTION
                    WHEN duplicate_object THEN NULL;
                END $$;
                """
            )
        )
        await session.execute(
            _sql_text(
                """
                CREATE TABLE IF NOT EXISTS public.users (
                    id SERIAL PRIMARY KEY,
                    account VARCHAR(50) UNIQUE,
                    password_hash VARCHAR(255),
                    phone_number VARCHAR(20) UNIQUE,
                    name VARCHAR(50) NOT NULL,
                    role VARCHAR(50),
                    avatar_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
        await session.execute(
            _sql_text(
                """
                CREATE TABLE IF NOT EXISTS public.user_preferences (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
                    preset_mode public.presetmodeenum NOT NULL DEFAULT 'custom',
                    preset_custom TEXT DEFAULT '',
                    preset_concise TEXT NOT NULL DEFAULT '',
                    preset_formal TEXT NOT NULL DEFAULT '',
                    quick_name_solt1 VARCHAR(255) DEFAULT '',
                    quick_name_solt2 VARCHAR(255) DEFAULT '',
                    quick_name_solt3 VARCHAR(255) DEFAULT '',
                    quick_name_solt4 VARCHAR(255) DEFAULT '',
                    quick_prompt_solt1 TEXT DEFAULT '',
                    quick_prompt_solt2 TEXT DEFAULT '',
                    quick_prompt_solt3 TEXT DEFAULT '',
                    quick_prompt_solt4 TEXT DEFAULT '',
                    memory_content TEXT DEFAULT '',
                    version INTEGER NOT NULL DEFAULT 1,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
