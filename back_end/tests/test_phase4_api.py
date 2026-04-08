import unittest

from fastapi.testclient import TestClient

from zhi_lian.app.main import app
from zhi_lian.app.services.mock_store import mock_store


class Phase4ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        mock_store.reset()
        self.client = TestClient(app)
        self.seed_user = mock_store.get_user_by_phone("13800000000")
        assert self.seed_user is not None
        self.seed_user_id = self.seed_user["id"]

    def _create_history_session(self, title: str = "workflow test session") -> str:
        response = self.client.post(
            "/api/history/sessions",
            json={"userId": self.seed_user_id, "title": title},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["data"]["session"]["id"]

    def test_auth_preferences_portal_history_regression(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={"phone": "13900000000", "password": "abcdef", "name": "New User"},
        )
        self.assertEqual(register_response.status_code, 200)
        new_user_id = register_response.json()["data"]

        login_response = self.client.post(
            "/api/auth/login_2",
            json={"phone": "13900000000", "password": "abcdef"},
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["data"]["user"]["name"], "New User")

        preferences_payload = {
            "id": self.seed_user_id,
            "presetMode": "formal",
            "presetPrompts": {"custom": "c1", "concise": "c2", "formal": "c3"},
            "quickActionNames": {"solt1": "n1", "solt2": "n2", "solt3": "n3", "solt4": "n4"},
            "quickActionPrompts": {"solt1": "p1", "solt2": "p2", "solt3": "p3", "solt4": "p4"},
            "memoryContent": "remember me",
        }
        save_preferences = self.client.post("/api/user/preferences", json=preferences_payload)
        self.assertEqual(save_preferences.status_code, 200)
        get_preferences = self.client.get(f"/api/user/preferences?id={self.seed_user_id}")
        self.assertEqual(get_preferences.json()["data"]["presetMode"], "formal")

        portal_response = self.client.get(
            f"/api/portal/calendar?userId={self.seed_user_id}&year=2026&month=3"
        )
        self.assertEqual(portal_response.status_code, 200)
        self.assertTrue(portal_response.json()["data"]["monthData"])
        self.assertEqual(portal_response.json()["data"]["monthData"]["16"]["workflowKeys"], ["mock-1"])

        history_response = self.client.get(f"/api/history/sessions?id={new_user_id}")
        self.assertEqual(history_response.status_code, 200)
        self.assertEqual(history_response.json()["data"]["sessions"], [])

    def test_seed_history_sessions_have_workflow_details(self) -> None:
        history_response = self.client.get(f"/api/history/sessions?id={self.seed_user_id}")
        sessions = history_response.json()["data"]["sessions"]
        self.assertTrue(sessions)

        first_session_id = sessions[0]["id"]
        workflow_response = self.client.get(f"/api/workflow/sessions/{first_session_id}")
        workflow_body = workflow_response.json()["data"]

        self.assertEqual(workflow_response.status_code, 200)
        self.assertEqual(workflow_body["sessionId"], first_session_id)
        self.assertGreaterEqual(len(workflow_body["blocks"]), 2)
        self.assertEqual(workflow_body["blocks"][0]["role"], "user")
        self.assertEqual(workflow_body["blocks"][1]["role"], "ai")

    def test_workflow_input_and_get_session(self) -> None:
        session_id = self._create_history_session()
        response = self.client.post(
            "/api/workflow/input",
            json={
                "sessionId": session_id,
                "id": session_id,
                "text": "请帮我整理会议内容",
                "blocks": [],
            },
        )
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["code"], "0")
        self.assertIn("userBlockId", body["data"])
        self.assertEqual(body["data"]["aiBlock"]["status"], "done")

        session_response = self.client.get(f"/api/workflow/sessions/{session_id}")
        session_body = session_response.json()["data"]
        self.assertEqual(session_response.status_code, 200)
        self.assertEqual(session_body["sessionId"], session_id)
        self.assertEqual(len(session_body["blocks"]), 2)
        self.assertEqual(session_body["blocks"][0]["role"], "user")
        self.assertEqual(session_body["blocks"][1]["role"], "ai")

    def test_workflow_generate_and_invalid_append_after(self) -> None:
        session_id = self._create_history_session()
        input_response = self.client.post(
            "/api/workflow/input",
            json={"sessionId": session_id, "text": "原始内容", "blocks": []},
        )
        blocks = self.client.get(f"/api/workflow/sessions/{session_id}").json()["data"]["blocks"]

        valid_response = self.client.post(
            "/api/workflow/generate",
            json={
                "sessionId": session_id,
                "blocks": blocks,
                "action": "append_after",
                "afterBlockId": blocks[-1]["id"],
            },
        )
        self.assertEqual(valid_response.status_code, 200)
        self.assertEqual(valid_response.json()["data"]["status"], "done")

        invalid_response = self.client.post(
            "/api/workflow/generate",
            json={
                "sessionId": session_id,
                "blocks": blocks,
                "action": "append_after",
            },
        )
        self.assertEqual(invalid_response.status_code, 400)
        self.assertEqual(invalid_response.json()["code"], "ERR_WORKFLOW_INVALID_REQUEST")
        self.assertEqual(input_response.status_code, 200)

    def test_workflow_file_upload_and_input_attachment(self) -> None:
        session_id = self._create_history_session()
        upload_response = self.client.post(
            "/api/workflow/file/upload",
            files={"file": ("report.pdf", b"fake-pdf", "application/pdf")},
            data={"sessionId": session_id, "id": session_id},
        )
        upload_body = upload_response.json()["data"]["fileRef"]
        self.assertEqual(upload_response.status_code, 200)
        self.assertEqual(upload_body["fileName"], "report.pdf")
        self.assertEqual(upload_body["mimeType"], "application/pdf")

        input_response = self.client.post(
            "/api/workflow/input",
            json={
                "sessionId": session_id,
                "text": "请分析附件",
                "fileRef": upload_body,
                "blocks": [],
            },
        )
        ai_block = input_response.json()["data"]["aiBlock"]
        self.assertEqual(input_response.status_code, 200)
        self.assertTrue(ai_block["attachments"])

    def test_workflow_audio_upload_transcript_and_long_task(self) -> None:
        session_id = self._create_history_session()
        upload_response = self.client.post(
            "/api/workflow/audio/upload",
            files={"file": ("meeting.m4a", b"fake-audio", "audio/m4a")},
            data={"sessionId": session_id, "durationMs": "98321"},
        )
        upload_body = upload_response.json()["data"]
        self.assertEqual(upload_response.status_code, 200)
        self.assertTrue(upload_body["remoteAudioId"].startswith("audio-"))

        transcript_response = self.client.post(
            "/api/workflow/audio/transcript",
            json={"audioResourceId": upload_body["remoteAudioId"], "sessionId": session_id},
        )
        transcript_body = transcript_response.json()["data"]
        self.assertEqual(transcript_response.status_code, 200)
        self.assertTrue(transcript_body["fullText"])
        self.assertTrue(transcript_body["segments"])

        long_task_response = self.client.post(
            "/api/workflow/audio/long-form",
            json={
                "audioResourceId": upload_body["remoteAudioId"],
                "prompt": "请整理成长文摘要",
                "durationMs": 98321,
                "sessionId": session_id,
                "id": session_id,
            },
        )
        long_task_body = long_task_response.json()["data"]
        self.assertEqual(long_task_response.status_code, 200)
        self.assertTrue(long_task_body["accepted"])
        task_id = long_task_body["taskId"]

        first_poll = self.client.get(f"/api/workflow/audio/tasks/{task_id}")
        second_poll = self.client.get(f"/api/workflow/audio/tasks/{task_id}")
        third_poll = self.client.get(f"/api/workflow/audio/tasks/{task_id}")

        self.assertEqual(first_poll.json()["data"]["status"], "pending")
        self.assertEqual(second_poll.json()["data"]["status"], "processing")
        self.assertEqual(third_poll.json()["data"]["status"], "completed")

        session_response = self.client.get(f"/api/workflow/sessions/{session_id}")
        session_body = session_response.json()["data"]
        self.assertTrue(session_body["recordedAudio"]["audioResourceId"].startswith("audio-"))
        self.assertGreaterEqual(len(session_body["blocks"]), 2)

        mismatch_transcript_response = self.client.post(
            "/api/workflow/audio/transcript",
            json={
                "audioResourceId": upload_body["remoteAudioId"],
                "sessionId": session_id,
                "id": "session-other",
            },
        )
        self.assertEqual(mismatch_transcript_response.status_code, 400)
        self.assertEqual(
            mismatch_transcript_response.json()["code"],
            "ERR_WORKFLOW_SESSION_MISMATCH",
        )

    def test_workflow_error_wrapping_and_session_mismatch(self) -> None:
        session_id = self._create_history_session()
        mismatch_response = self.client.post(
            "/api/workflow/input",
            json={"sessionId": session_id, "id": "session-other", "text": "x", "blocks": []},
        )
        self.assertEqual(mismatch_response.status_code, 400)
        self.assertEqual(mismatch_response.json()["code"], "ERR_WORKFLOW_SESSION_MISMATCH")

        missing_session_response = self.client.get("/api/workflow/sessions/non-existent-session")
        self.assertEqual(missing_session_response.status_code, 404)
        self.assertEqual(
            missing_session_response.json()["code"],
            "ERR_WORKFLOW_SESSION_NOT_FOUND",
        )

        missing_task_response = self.client.get("/api/workflow/audio/tasks/non-existent-task")
        self.assertEqual(missing_task_response.status_code, 404)
        self.assertEqual(missing_task_response.json()["code"], "ERR_WORKFLOW_TASK_NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
