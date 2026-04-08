import unittest

from fastapi.testclient import TestClient

from zhi_lian.app.main import app
from zhi_lian.app.services.mock_store import mock_store


class Phase5ApiEdgeCaseTests(unittest.TestCase):
    def setUp(self) -> None:
        mock_store.reset()
        self.client = TestClient(app)
        self.seed_user = mock_store.get_user_by_phone("13800000000")
        assert self.seed_user is not None
        self.seed_user_id = self.seed_user["id"]

    def _create_history_session(self, title: str = "edge-case session") -> str:
        response = self.client.post(
            "/api/history/sessions",
            json={"userId": self.seed_user_id, "title": title},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["data"]["session"]["id"]

    def test_auth_validation_errors_use_unified_response(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": "13800000001", "password": "abcdef"},
        )
        register_body = register_response.json()
        self.assertEqual(register_response.status_code, 422)
        self.assertEqual(register_body["code"], "ERR_VALIDATION")
        self.assertIsNone(register_body["data"])

        reset_response = self.client.post("/api/auth/password/reset", json={"phone": "13800000001"})
        reset_body = reset_response.json()
        self.assertEqual(reset_response.status_code, 422)
        self.assertEqual(reset_body["code"], "ERR_VALIDATION")
        self.assertTrue(reset_body["details"]["errors"])

    def test_workflow_requires_session_for_input_and_generate(self) -> None:
        input_response = self.client.post(
            "/api/workflow/input",
            json={
                "text": "missing session",
                "blocks": [],
            },
        )
        input_body = input_response.json()
        self.assertEqual(input_response.status_code, 400)
        self.assertEqual(input_body["code"], "ERR_WORKFLOW_SESSION_REQUIRED")

        generate_response = self.client.post(
            "/api/workflow/generate",
            json={
                "blocks": [],
                "action": "regenerate_from_first",
            },
        )
        generate_body = generate_response.json()
        self.assertEqual(generate_response.status_code, 400)
        self.assertEqual(generate_body["code"], "ERR_WORKFLOW_SESSION_REQUIRED")

    def test_workflow_validation_errors_are_wrapped(self) -> None:
        session_id = self._create_history_session()

        long_task_response = self.client.post(
            "/api/workflow/audio/long-form",
            json={
                "prompt": "请整理成长文摘要",
                "sessionId": session_id,
            },
        )
        long_task_body = long_task_response.json()
        self.assertEqual(long_task_response.status_code, 422)
        self.assertEqual(long_task_body["code"], "ERR_VALIDATION")

        input_response = self.client.post(
            "/api/workflow/input",
            json={
                "sessionId": session_id,
                "blocks": [
                    {
                        "id": "invalid-block",
                        "role": "user",
                        "createdAt": 1,
                    }
                ],
            },
        )
        input_body = input_response.json()
        self.assertEqual(input_response.status_code, 422)
        self.assertEqual(input_body["code"], "ERR_VALIDATION")

    def test_workflow_upload_endpoints_validate_missing_file(self) -> None:
        file_upload_response = self.client.post(
            "/api/workflow/file/upload",
            data={"sessionId": "session-001"},
        )
        self.assertEqual(file_upload_response.status_code, 422)
        self.assertEqual(file_upload_response.json()["code"], "ERR_VALIDATION")

        audio_upload_response = self.client.post(
            "/api/workflow/audio/upload",
            data={"sessionId": "session-001", "durationMs": "1200"},
        )
        self.assertEqual(audio_upload_response.status_code, 422)
        self.assertEqual(audio_upload_response.json()["code"], "ERR_VALIDATION")

    def test_workflow_upload_endpoints_accept_zero_byte_files(self) -> None:
        session_id = self._create_history_session()

        file_upload_response = self.client.post(
            "/api/workflow/file/upload",
            files={"file": ("empty.txt", b"", "application/octet-stream")},
            data={"sessionId": session_id},
        )
        file_upload_body = file_upload_response.json()["data"]["fileRef"]
        self.assertEqual(file_upload_response.status_code, 200)
        self.assertEqual(file_upload_body["fileName"], "empty.txt")
        self.assertEqual(file_upload_body["mimeType"], "application/octet-stream")

        audio_upload_response = self.client.post(
            "/api/workflow/audio/upload",
            files={"file": ("empty.m4a", b"", "application/octet-stream")},
            data={"sessionId": session_id},
        )
        audio_upload_body = audio_upload_response.json()["data"]
        self.assertEqual(audio_upload_response.status_code, 200)
        self.assertTrue(audio_upload_body["remoteAudioId"].startswith("audio-"))

    def test_workflow_upload_endpoints_reject_session_mismatch(self) -> None:
        session_id = self._create_history_session()

        file_upload_response = self.client.post(
            "/api/workflow/file/upload",
            files={"file": ("report.pdf", b"fake-pdf", "application/pdf")},
            data={"sessionId": session_id, "id": "session-other"},
        )
        self.assertEqual(file_upload_response.status_code, 400)
        self.assertEqual(file_upload_response.json()["code"], "ERR_WORKFLOW_SESSION_MISMATCH")

        audio_upload_response = self.client.post(
            "/api/workflow/audio/upload",
            files={"file": ("meeting.m4a", b"fake-audio", "audio/m4a")},
            data={"sessionId": session_id, "id": "session-other"},
        )
        self.assertEqual(audio_upload_response.status_code, 400)
        self.assertEqual(audio_upload_response.json()["code"], "ERR_WORKFLOW_SESSION_MISMATCH")


if __name__ == "__main__":
    unittest.main()
