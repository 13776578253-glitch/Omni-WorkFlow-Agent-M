import asyncio
import os
import unittest
from uuid import uuid4

os.environ["DATA_SOURCE_AUTH"] = "db_only"
os.environ["DATA_SOURCE_PREFERENCES"] = "db_only"

try:
    import asyncpg
except ImportError:  # pragma: no cover
    asyncpg = None

from zhi_lian.app.core.config import DATABASE_URL
from zhi_lian.app.db.services.auth_preferences_bootstrap import ensure_auth_preferences_schema
from zhi_lian.app.main import app


async def _db_available() -> bool:
    if asyncpg is None:
        return False
    try:
        conn = await asyncpg.connect(DATABASE_URL.replace("+asyncpg", ""))
        await conn.close()
        return True
    except Exception:
        return False


DB_AVAILABLE = asyncio.run(_db_available())

if DB_AVAILABLE:
    from fastapi.testclient import TestClient


@unittest.skipUnless(DB_AVAILABLE, "Postgres is not available for step 2 DB-mode tests")
class Step2DbAuthPreferencesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        asyncio.run(ensure_auth_preferences_schema())

    def setUp(self) -> None:
        self.client = TestClient(app)
        self.phone = f"139{uuid4().hex[:8]}"
        self.name = f"DBUser-{uuid4().hex[:6]}"
        self.password = "abcdef"
        self.new_password = "ghijkl"

    def test_register_login_reset_and_preferences_roundtrip_in_db_mode(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": self.phone, "password": self.password, "name": self.name},
        )
        register_body = register_response.json()
        self.assertEqual(register_response.status_code, 200)
        self.assertEqual(register_body["code"], "0")
        user_id = register_body["data"]

        login_code_response = self.client.post("/api/auth/login_1", json={"phone": self.phone})
        self.assertEqual(login_code_response.status_code, 200)
        self.assertEqual(login_code_response.json()["data"]["user"]["name"], self.name)

        login_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": self.phone, "password": self.password},
        )
        self.assertEqual(login_password_response.status_code, 200)
        self.assertEqual(login_password_response.json()["data"]["user"]["id"], user_id)

        default_preferences_response = self.client.get(f"/api/user/preferences?id={user_id}")
        self.assertEqual(default_preferences_response.status_code, 200)
        self.assertEqual(default_preferences_response.json()["data"]["presetMode"], "custom")

        save_preferences_response = self.client.post(
            "/api/user/preferences",
            json={
                "id": user_id,
                "presetMode": "formal",
                "presetPrompts": {"custom": "c1", "concise": "c2", "formal": "c3"},
                "quickActionNames": {"solt1": "n1", "solt2": "n2", "solt3": "n3", "solt4": "n4"},
                "quickActionPrompts": {"solt1": "p1", "solt2": "p2", "solt3": "p3", "solt4": "p4"},
                "memoryContent": "remember me",
            },
        )
        self.assertEqual(save_preferences_response.status_code, 200)

        updated_preferences_response = self.client.get(f"/api/user/preferences?id={user_id}")
        updated_body = updated_preferences_response.json()["data"]
        self.assertEqual(updated_body["presetMode"], "formal")
        self.assertEqual(updated_body["quickActionNames"]["solt3"], "n3")
        self.assertEqual(updated_body["memoryContent"], "remember me")

        reset_response = self.client.post(
            "/api/auth/password/reset",
            json={"phone": self.phone, "newPassword": self.new_password},
        )
        self.assertEqual(reset_response.status_code, 200)

        old_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": self.phone, "password": self.password},
        )
        self.assertEqual(old_password_response.status_code, 400)
        self.assertEqual(old_password_response.json()["code"], "ERR_AUTH_INVALID_PASSWORD")

        new_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": self.phone, "password": self.new_password},
        )
        self.assertEqual(new_password_response.status_code, 200)
        self.assertEqual(new_password_response.json()["data"]["user"]["name"], self.name)


if __name__ == "__main__":
    unittest.main()
