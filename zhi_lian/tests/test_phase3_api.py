import unittest

from fastapi.testclient import TestClient

from zhi_lian.app.main import app
from zhi_lian.app.services.mock_store import mock_store


class Phase3ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        mock_store.reset()
        self.client = TestClient(app)
        self.seed_user = mock_store.get_user_by_phone("13800000000")
        assert self.seed_user is not None
        self.seed_user_id = self.seed_user["id"]

    def test_send_code_uses_unified_response(self) -> None:
        response = self.client.post("/api/auth/code/send", json={"phone": "13800000000"})
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["code"], "0")
        self.assertEqual(body["message"], "ok")
        self.assertIn("requestId", body["data"])

    def test_login_register_reset_and_logout_flow(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": "13900000000", "password": "abcdef", "name": "New User"},
        )
        register_body = register_response.json()
        self.assertEqual(register_response.status_code, 200)
        self.assertEqual(register_body["code"], "0")
        self.assertIsInstance(register_body["data"], str)

        login_code_response = self.client.post("/api/auth/login_1", json={"phone": "13900000000"})
        self.assertEqual(login_code_response.status_code, 200)
        self.assertEqual(login_code_response.json()["data"]["user"]["name"], "New User")

        login_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": "13900000000", "password": "abcdef"},
        )
        self.assertEqual(login_password_response.status_code, 200)
        self.assertEqual(login_password_response.json()["code"], "0")

        reset_response = self.client.post(
            "/api/auth/password/reset",
            json={"phone": "13900000000", "newPassword": "ghijkl"},
        )
        self.assertEqual(reset_response.status_code, 200)
        self.assertEqual(reset_response.json()["code"], "0")

        old_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": "13900000000", "password": "abcdef"},
        )
        self.assertEqual(old_password_response.status_code, 400)
        self.assertEqual(old_password_response.json()["code"], "ERR_AUTH_INVALID_PASSWORD")

        new_password_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": "13900000000", "password": "ghijkl"},
        )
        self.assertEqual(new_password_response.status_code, 200)
        self.assertEqual(new_password_response.json()["code"], "0")

        logout_response = self.client.post("/api/auth/logout")
        self.assertEqual(logout_response.status_code, 200)
        self.assertEqual(logout_response.json()["data"], {"success": True})

    def test_preferences_roundtrip_uses_query_and_body_contract(self) -> None:
        get_response = self.client.get(f"/api/user/preferences?id={self.seed_user_id}")
        get_body = get_response.json()

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_body["code"], "0")
        self.assertEqual(get_body["data"]["presetMode"], "custom")

        payload = {
            "id": self.seed_user_id,
            "presetMode": "formal",
            "presetPrompts": {
                "custom": "c1",
                "concise": "c2",
                "formal": "c3",
            },
            "quickActionNames": {
                "solt1": "n1",
                "solt2": "n2",
                "solt3": "n3",
                "solt4": "n4",
            },
            "quickActionPrompts": {
                "solt1": "p1",
                "solt2": "p2",
                "solt3": "p3",
                "solt4": "p4",
            },
            "memoryContent": "remember me",
        }
        save_response = self.client.post("/api/user/preferences", json=payload)
        save_body = save_response.json()

        self.assertEqual(save_response.status_code, 200)
        self.assertEqual(save_body["code"], "0")

        updated_response = self.client.get(f"/api/user/preferences?id={self.seed_user_id}")
        updated_body = updated_response.json()

        self.assertEqual(updated_body["data"]["presetMode"], "formal")
        self.assertEqual(updated_body["data"]["quickActionNames"]["solt3"], "n3")
        self.assertEqual(updated_body["data"]["memoryContent"], "remember me")

    def test_portal_seed_month_and_empty_month(self) -> None:
        seeded_response = self.client.get(
            f"/api/portal/calendar?userId={self.seed_user_id}&year=2026&month=3"
        )
        seeded_body = seeded_response.json()
        self.assertEqual(seeded_response.status_code, 200)
        self.assertEqual(seeded_body["code"], "0")
        self.assertIn("19", {str(key): value for key, value in seeded_body["data"]["monthData"].items()})

        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": "13700000000", "password": "abcdef", "name": "Portal User"},
        )
        new_user_id = register_response.json()["data"]
        empty_month_response = self.client.get(
            f"/api/portal/calendar?userId={new_user_id}&year=2026&month=3"
        )
        self.assertEqual(empty_month_response.status_code, 200)
        self.assertEqual(empty_month_response.json()["data"]["monthData"], {})

    def test_portal_day_upsert_and_delete(self) -> None:
        payload = {
            "userId": self.seed_user_id,
            "year": 2026,
            "month": 5,
            "day": 7,
            "dayData": {
                "keys": ["summary-0507"],
                "todoKeys": ["todo-0507-a"],
                "workflowKeys": ["workflow-0507-a"],
                "detailBodyText": "5月7日：新增 portal 数据。",
                "countdownCards": [
                    {
                        "id": "card_0507_1",
                        "title": "联调提醒",
                        "subtitle": "测试内容：完成 portal 接口联调",
                        "badge": "1天",
                    }
                ],
            },
        }
        create_response = self.client.post("/api/portal/day", json=payload)
        self.assertEqual(create_response.status_code, 200)
        self.assertEqual(create_response.json()["data"], {"success": True})

        month_response = self.client.get(
            f"/api/portal/calendar?userId={self.seed_user_id}&year=2026&month=5"
        )
        month_body = month_response.json()
        self.assertEqual(month_body["data"]["monthData"]["7"]["detailBodyText"], "5月7日：新增 portal 数据。")

        overwrite_payload = {
            **payload,
            "dayData": {
                "keys": ["summary-0507-updated"],
                "detailBodyText": "5月7日：覆盖 portal 数据。",
            },
        }
        overwrite_response = self.client.post("/api/portal/day", json=overwrite_payload)
        self.assertEqual(overwrite_response.status_code, 200)

        updated_month_response = self.client.get(
            f"/api/portal/calendar?userId={self.seed_user_id}&year=2026&month=5"
        )
        updated_day = updated_month_response.json()["data"]["monthData"]["7"]
        self.assertEqual(updated_day["keys"], ["summary-0507-updated"])
        self.assertEqual(updated_day["detailBodyText"], "5月7日：覆盖 portal 数据。")

        delete_response = self.client.request(
            "DELETE",
            "/api/portal/day",
            json={
                "userId": self.seed_user_id,
                "year": 2026,
                "month": 5,
                "day": 7,
            },
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(delete_response.json()["code"], "0")

        deleted_month_response = self.client.get(
            f"/api/portal/calendar?userId={self.seed_user_id}&year=2026&month=5"
        )
        self.assertEqual(deleted_month_response.json()["data"]["monthData"], {})

        delete_missing_response = self.client.request(
            "DELETE",
            "/api/portal/day",
            json={
                "userId": self.seed_user_id,
                "year": 2026,
                "month": 5,
                "day": 99,
            },
        )
        self.assertEqual(delete_missing_response.status_code, 200)
        self.assertEqual(delete_missing_response.json()["data"], {"success": True})

    def test_history_sessions_crud(self) -> None:
        get_response = self.client.get(f"/api/history/sessions?id={self.seed_user_id}")
        get_body = get_response.json()
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_body["code"], "0")
        self.assertGreaterEqual(len(get_body["data"]["sessions"]), 1)

        create_response = self.client.post(
            "/api/history/sessions",
            json={
                "userId": self.seed_user_id,
                "title": "新的历史会话",
                "previewText": "新的预览文本",
            },
        )
        create_body = create_response.json()
        self.assertEqual(create_response.status_code, 200)
        self.assertEqual(create_body["code"], "0")
        created_session = create_body["data"]["session"]
        self.assertEqual(created_session["title"], "新的历史会话")
        self.assertEqual(created_session["previewText"], "新的预览文本")

        rename_response = self.client.put(
            f"/api/history/sessions/{created_session['id']}/title",
            json={
                "userId": self.seed_user_id,
                "newTitle": "重命名后的历史会话",
            },
        )
        self.assertEqual(rename_response.status_code, 200)
        self.assertEqual(rename_response.json()["data"], {"success": True})

        pin_response = self.client.put(
            f"/api/history/sessions/{created_session['id']}/pin",
            json={
                "userId": self.seed_user_id,
                "isPinned": True,
            },
        )
        self.assertEqual(pin_response.status_code, 200)
        self.assertEqual(pin_response.json()["data"], {"success": True})

        updated_list_response = self.client.get(f"/api/history/sessions?id={self.seed_user_id}")
        updated_sessions = updated_list_response.json()["data"]["sessions"]
        updated_session = next(session for session in updated_sessions if session["id"] == created_session["id"])
        self.assertEqual(updated_session["title"], "重命名后的历史会话")
        self.assertTrue(updated_session["isPinned"])
        self.assertGreaterEqual(updated_session["updatedAt"], updated_session["createdAt"])

        delete_response = self.client.request(
            "DELETE",
            f"/api/history/sessions/{created_session['id']}",
            json={"userId": self.seed_user_id},
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(delete_response.json()["data"], {"success": True})

        after_delete_response = self.client.get(f"/api/history/sessions?id={self.seed_user_id}")
        remaining_sessions = after_delete_response.json()["data"]["sessions"]
        self.assertFalse(any(session["id"] == created_session["id"] for session in remaining_sessions))

    def test_history_new_user_and_missing_session_errors(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": "13600000000", "password": "abcdef", "name": "History User"},
        )
        new_user_id = register_response.json()["data"]

        empty_list_response = self.client.get(f"/api/history/sessions?id={new_user_id}")
        self.assertEqual(empty_list_response.status_code, 200)
        self.assertEqual(empty_list_response.json()["data"]["sessions"], [])

        create_without_preview_response = self.client.post(
            "/api/history/sessions",
            json={
                "userId": new_user_id,
                "title": "无预览历史会话",
            },
        )
        self.assertEqual(create_without_preview_response.status_code, 200)
        self.assertEqual(create_without_preview_response.json()["data"]["session"]["previewText"], "")

        delete_missing_response = self.client.request(
            "DELETE",
            "/api/history/sessions/non-existent-session",
            json={"userId": self.seed_user_id},
        )
        self.assertEqual(delete_missing_response.status_code, 404)
        self.assertEqual(delete_missing_response.json()["code"], "ERR_HISTORY_SESSION_NOT_FOUND")

    def test_errors_are_wrapped_in_unified_format(self) -> None:
        missing_user_response = self.client.get("/api/user/preferences?id=999999")
        missing_user_body = missing_user_response.json()
        self.assertEqual(missing_user_response.status_code, 404)
        self.assertEqual(missing_user_body["code"], "ERR_USER_NOT_FOUND")
        self.assertIsNone(missing_user_body["data"])

        missing_portal_response = self.client.get("/api/portal/calendar?userId=999999&year=2026&month=3")
        missing_portal_body = missing_portal_response.json()
        self.assertEqual(missing_portal_response.status_code, 404)
        self.assertEqual(missing_portal_body["code"], "ERR_USER_NOT_FOUND")

        missing_history_response = self.client.get("/api/history/sessions?id=999999")
        missing_history_body = missing_history_response.json()
        self.assertEqual(missing_history_response.status_code, 404)
        self.assertEqual(missing_history_body["code"], "ERR_USER_NOT_FOUND")

        validation_response = self.client.post("/api/auth/register", json={"phone": "1"})
        validation_body = validation_response.json()
        self.assertEqual(validation_response.status_code, 422)
        self.assertEqual(validation_body["code"], "ERR_VALIDATION")
        self.assertIsInstance(validation_body["details"]["errors"], list)


if __name__ == "__main__":
    unittest.main()
