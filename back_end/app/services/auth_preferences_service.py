from __future__ import annotations

import hashlib
import logging
import secrets
from importlib import import_module
from typing import Any

try:
    from .data_source import get_module_binding
    from .mock_store import mock_store
except ImportError:
    from app.services.data_source import get_module_binding
    from app.services.mock_store import mock_store


logger = logging.getLogger(__name__)


class AuthPreferencesService:
    @classmethod
    def _get_db_context(cls) -> Any:
        try:
            db_connect = import_module("zhi_lian.app.db.db_connect")
        except ImportError:
            db_connect = import_module("app.db.db_connect")
        return db_connect.db_context

    @classmethod
    def _sql_text(cls, sql: str) -> Any:
        sqlalchemy_module = import_module("sqlalchemy")
        return sqlalchemy_module.text(sql)

    @classmethod
    def _load_pwd_context(cls) -> Any | None:
        try:
            passlib_context = import_module("passlib.context")
        except ImportError:
            return None
        return passlib_context.CryptContext(schemes=["bcrypt"], deprecated="auto")

    @classmethod
    def _hash_password(cls, password: str) -> str:
        pwd_context = cls._load_pwd_context()
        if pwd_context is not None:
            return pwd_context.hash(password)

        salt = secrets.token_hex(16)
        digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
        return f"sha256${salt}${digest}"

    @classmethod
    def _verify_password(cls, password: str, password_hash: str) -> bool:
        pwd_context = cls._load_pwd_context()
        if pwd_context is not None:
            return pwd_context.verify(password, password_hash)

        if password_hash.startswith("sha256$"):
            _, salt, digest = password_hash.split("$", 2)
            candidate = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
            return secrets.compare_digest(candidate, digest)

        return password == password_hash

    @staticmethod
    def _normalize_user_row(row: Any) -> dict[str, str] | None:
        if row is None:
            return None
        return {
            "id": str(row["id"]),
            "phone": row["phone_number"],
            "name": row["name"],
            "password_hash": row["password_hash"],
        }

    @staticmethod
    def _normalize_preferences_row(row: Any) -> dict[str, Any] | None:
        if row is None:
            return None

        preset_mode = row["preset_mode"]
        if hasattr(preset_mode, "value"):
            preset_mode = preset_mode.value

        return {
            "presetMode": str(preset_mode),
            "presetPrompts": {
                "custom": row["preset_custom"] or "",
                "concise": row["preset_concise"] or "",
                "formal": row["preset_formal"] or "",
            },
            "quickActionNames": {
                "solt1": row["quick_name_solt1"] or "",
                "solt2": row["quick_name_solt2"] or "",
                "solt3": row["quick_name_solt3"] or "",
                "solt4": row["quick_name_solt4"] or "",
            },
            "quickActionPrompts": {
                "solt1": row["quick_prompt_solt1"] or "",
                "solt2": row["quick_prompt_solt2"] or "",
                "solt3": row["quick_prompt_solt3"] or "",
                "solt4": row["quick_prompt_solt4"] or "",
            },
            "memoryContent": row["memory_content"] or "",
        }

    @classmethod
    async def _db_get_user_by_phone(cls, phone: str) -> dict[str, str] | None:
        db_context = cls._get_db_context()
        async with db_context() as session:
            result = await session.execute(
                cls._sql_text(
                    """
                    SELECT id, phone_number, name, password_hash
                    FROM public.users
                    WHERE phone_number = :phone
                    LIMIT 1
                    """
                ),
                {"phone": phone},
            )
            return cls._normalize_user_row(result.mappings().first())

    @classmethod
    async def _db_create_default_preferences(cls, user_id: int) -> None:
        defaults = mock_store.get_preferences(str(user_id)) or {
            "presetMode": "custom",
            "presetPrompts": {"custom": "", "concise": "", "formal": ""},
            "quickActionNames": {"solt1": "", "solt2": "", "solt3": "", "solt4": ""},
            "quickActionPrompts": {"solt1": "", "solt2": "", "solt3": "", "solt4": ""},
            "memoryContent": "",
        }
        db_context = cls._get_db_context()
        async with db_context() as session:
            await session.execute(
                cls._sql_text(
                    """
                    INSERT INTO public.user_preferences (
                        user_id,
                        preset_mode,
                        preset_custom,
                        preset_concise,
                        preset_formal,
                        quick_name_solt1,
                        quick_name_solt2,
                        quick_name_solt3,
                        quick_name_solt4,
                        quick_prompt_solt1,
                        quick_prompt_solt2,
                        quick_prompt_solt3,
                        quick_prompt_solt4,
                        memory_content
                    ) VALUES (
                        :user_id,
                        CAST(:preset_mode AS public.presetmodeenum),
                        :preset_custom,
                        :preset_concise,
                        :preset_formal,
                        :quick_name_solt1,
                        :quick_name_solt2,
                        :quick_name_solt3,
                        :quick_name_solt4,
                        :quick_prompt_solt1,
                        :quick_prompt_solt2,
                        :quick_prompt_solt3,
                        :quick_prompt_solt4,
                        :memory_content
                    )
                    """
                ),
                {
                    "user_id": user_id,
                    "preset_mode": defaults["presetMode"],
                    "preset_custom": defaults["presetPrompts"]["custom"],
                    "preset_concise": defaults["presetPrompts"]["concise"],
                    "preset_formal": defaults["presetPrompts"]["formal"],
                    "quick_name_solt1": defaults["quickActionNames"]["solt1"],
                    "quick_name_solt2": defaults["quickActionNames"]["solt2"],
                    "quick_name_solt3": defaults["quickActionNames"]["solt3"],
                    "quick_name_solt4": defaults["quickActionNames"]["solt4"],
                    "quick_prompt_solt1": defaults["quickActionPrompts"]["solt1"],
                    "quick_prompt_solt2": defaults["quickActionPrompts"]["solt2"],
                    "quick_prompt_solt3": defaults["quickActionPrompts"]["solt3"],
                    "quick_prompt_solt4": defaults["quickActionPrompts"]["solt4"],
                    "memory_content": defaults["memoryContent"],
                },
            )

    @classmethod
    async def _db_create_user(cls, phone: str, password: str, name: str) -> dict[str, str]:
        password_hash = cls._hash_password(password)
        db_context = cls._get_db_context()
        async with db_context() as session:
            result = await session.execute(
                cls._sql_text(
                    """
                    INSERT INTO public.users (phone_number, password_hash, name, role)
                    VALUES (:phone, :password_hash, :name, 'user')
                    RETURNING id, phone_number, name, password_hash
                    """
                ),
                {
                    "phone": phone,
                    "password_hash": password_hash,
                    "name": name,
                },
            )
            created_user = cls._normalize_user_row(result.mappings().first())

        assert created_user is not None
        await cls._db_create_default_preferences(int(created_user["id"]))
        return created_user

    @classmethod
    async def _db_reset_password(cls, phone: str, new_password: str) -> dict[str, str] | None:
        password_hash = cls._hash_password(new_password)
        db_context = cls._get_db_context()
        async with db_context() as session:
            result = await session.execute(
                cls._sql_text(
                    """
                    UPDATE public.users
                    SET password_hash = :password_hash
                    WHERE phone_number = :phone
                    RETURNING id, phone_number, name, password_hash
                    """
                ),
                {"phone": phone, "password_hash": password_hash},
            )
            return cls._normalize_user_row(result.mappings().first())

    @classmethod
    async def _db_get_preferences(cls, user_id: str) -> dict[str, Any] | None:
        db_context = cls._get_db_context()
        async with db_context() as session:
            result = await session.execute(
                cls._sql_text(
                    """
                    SELECT
                        user_id,
                        preset_mode,
                        preset_custom,
                        preset_concise,
                        preset_formal,
                        quick_name_solt1,
                        quick_name_solt2,
                        quick_name_solt3,
                        quick_name_solt4,
                        quick_prompt_solt1,
                        quick_prompt_solt2,
                        quick_prompt_solt3,
                        quick_prompt_solt4,
                        memory_content
                    FROM public.user_preferences
                    WHERE user_id = :user_id
                    LIMIT 1
                    """
                ),
                {"user_id": int(user_id)},
            )
            return cls._normalize_preferences_row(result.mappings().first())

    @classmethod
    async def _db_save_preferences(cls, user_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        db_context = cls._get_db_context()
        async with db_context() as session:
            result = await session.execute(
                cls._sql_text(
                    """
                    UPDATE public.user_preferences
                    SET
                        preset_mode = CAST(:preset_mode AS public.presetmodeenum),
                        preset_custom = :preset_custom,
                        preset_concise = :preset_concise,
                        preset_formal = :preset_formal,
                        quick_name_solt1 = :quick_name_solt1,
                        quick_name_solt2 = :quick_name_solt2,
                        quick_name_solt3 = :quick_name_solt3,
                        quick_name_solt4 = :quick_name_solt4,
                        quick_prompt_solt1 = :quick_prompt_solt1,
                        quick_prompt_solt2 = :quick_prompt_solt2,
                        quick_prompt_solt3 = :quick_prompt_solt3,
                        quick_prompt_solt4 = :quick_prompt_solt4,
                        memory_content = :memory_content
                    WHERE user_id = :user_id
                    RETURNING
                        user_id,
                        preset_mode,
                        preset_custom,
                        preset_concise,
                        preset_formal,
                        quick_name_solt1,
                        quick_name_solt2,
                        quick_name_solt3,
                        quick_name_solt4,
                        quick_prompt_solt1,
                        quick_prompt_solt2,
                        quick_prompt_solt3,
                        quick_prompt_solt4,
                        memory_content
                    """
                ),
                {
                    "user_id": int(user_id),
                    "preset_mode": payload["presetMode"],
                    "preset_custom": payload["presetPrompts"]["custom"],
                    "preset_concise": payload["presetPrompts"]["concise"],
                    "preset_formal": payload["presetPrompts"]["formal"],
                    "quick_name_solt1": payload["quickActionNames"]["solt1"],
                    "quick_name_solt2": payload["quickActionNames"]["solt2"],
                    "quick_name_solt3": payload["quickActionNames"]["solt3"],
                    "quick_name_solt4": payload["quickActionNames"]["solt4"],
                    "quick_prompt_solt1": payload["quickActionPrompts"]["solt1"],
                    "quick_prompt_solt2": payload["quickActionPrompts"]["solt2"],
                    "quick_prompt_solt3": payload["quickActionPrompts"]["solt3"],
                    "quick_prompt_solt4": payload["quickActionPrompts"]["solt4"],
                    "memory_content": payload["memoryContent"],
                },
            )
            return cls._normalize_preferences_row(result.mappings().first())

    @classmethod
    def _should_use_db(cls, module_name: str) -> bool:
        return get_module_binding(module_name).db_enabled

    @classmethod
    def _should_use_mock(cls, module_name: str) -> bool:
        return get_module_binding(module_name).mock_enabled

    @classmethod
    def _log_db_fallback(cls, module_name: str, exc: Exception) -> None:
        logger.warning("DB path failed for %s, falling back to mock: %s", module_name, exc)

    @classmethod
    async def send_code(cls, phone: str) -> str:
        return mock_store.generate_code(phone)

    @classmethod
    async def login_with_code(cls, phone: str) -> dict[str, str] | None:
        if cls._should_use_db("auth"):
            try:
                user = await cls._db_get_user_by_phone(phone)
                if user is not None or not cls._should_use_mock("auth"):
                    return user
            except Exception as exc:
                if not cls._should_use_mock("auth"):
                    raise
                cls._log_db_fallback("auth", exc)

        if cls._should_use_mock("auth"):
            return mock_store.login_with_code(phone)
        return None

    @classmethod
    async def login_with_password(cls, phone: str, password: str) -> tuple[dict[str, str] | None, str | None]:
        if cls._should_use_db("auth"):
            try:
                user = await cls._db_get_user_by_phone(phone)
                if user is not None:
                    if cls._verify_password(password, user["password_hash"]):
                        return user, None
                    return None, "invalid_password"
                if not cls._should_use_mock("auth"):
                    return None, "user_not_found"
            except Exception as exc:
                if not cls._should_use_mock("auth"):
                    raise
                cls._log_db_fallback("auth", exc)

        if cls._should_use_mock("auth"):
            existing_user = mock_store.get_user_by_phone(phone)
            if not existing_user:
                return None, "user_not_found"
            user = mock_store.login_with_password(phone, password)
            if not user:
                return None, "invalid_password"
            return user, None

        return None, "user_not_found"

    @classmethod
    async def register(cls, phone: str, password: str, name: str) -> str:
        if cls._should_use_db("auth"):
            try:
                existing_user = await cls._db_get_user_by_phone(phone)
                if existing_user is None:
                    created_user = await cls._db_create_user(phone, password, name)
                    return created_user["id"]
                if not cls._should_use_mock("auth"):
                    raise ValueError("user already exists")
            except ValueError:
                raise
            except Exception as exc:
                if not cls._should_use_mock("auth"):
                    raise
                cls._log_db_fallback("auth", exc)

        if cls._should_use_mock("auth"):
            if mock_store.get_user_by_phone(phone):
                raise ValueError("user already exists")
            created_user = mock_store.create_user(phone=phone, password=password, name=name)
            return created_user["id"]

        raise ValueError("user already exists")

    @classmethod
    async def reset_password(cls, phone: str, new_password: str) -> dict[str, str] | None:
        if cls._should_use_db("auth"):
            try:
                user = await cls._db_reset_password(phone, new_password)
                if user is not None or not cls._should_use_mock("auth"):
                    return user
            except Exception as exc:
                if not cls._should_use_mock("auth"):
                    raise
                cls._log_db_fallback("auth", exc)

        if cls._should_use_mock("auth"):
            return mock_store.reset_password(phone, new_password)
        return None

    @classmethod
    async def get_preferences(cls, user_id: str) -> dict[str, Any] | None:
        if cls._should_use_db("preferences"):
            try:
                preferences = await cls._db_get_preferences(user_id)
                if preferences is not None or not cls._should_use_mock("preferences"):
                    return preferences
            except Exception as exc:
                if not cls._should_use_mock("preferences"):
                    raise
                cls._log_db_fallback("preferences", exc)

        if cls._should_use_mock("preferences"):
            return mock_store.get_preferences(user_id)
        return None

    @classmethod
    async def save_preferences(cls, user_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        if cls._should_use_db("preferences"):
            try:
                saved = await cls._db_save_preferences(user_id, payload)
                if saved is not None or not cls._should_use_mock("preferences"):
                    return saved
            except Exception as exc:
                if not cls._should_use_mock("preferences"):
                    raise
                cls._log_db_fallback("preferences", exc)

        if cls._should_use_mock("preferences"):
            return mock_store.save_preferences(user_id, payload)
        return None
