from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, TypeAlias
from uuid import uuid4

PortalDayPayload: TypeAlias = Dict[str, Any]
PortalMonthData: TypeAlias = Dict[int, PortalDayPayload]
PortalYearData: TypeAlias = Dict[int, PortalMonthData]
PortalCalendarData: TypeAlias = Dict[int, PortalYearData]
HistorySessionSummary: TypeAlias = Dict[str, Any]
WorkflowBlockPayload: TypeAlias = Dict[str, Any]
WorkflowSessionPayload: TypeAlias = Dict[str, Any]
UploadedFilePayload: TypeAlias = Dict[str, Any]
UploadedAudioPayload: TypeAlias = Dict[str, Any]
LongAudioTaskPayload: TypeAlias = Dict[str, Any]

DEFAULT_HISTORY_SESSIONS: list[HistorySessionSummary] = [
    {
        "id": "mock-1",
        "title": "正畸微植钉术后剧痛缓解",
        "createdAt": 1771200000000,
        "updatedAt": 1771203600000,
        "isPinned": True,
        "previewText": "请问微植钉术后疼痛如何缓解...",
    },
    {
        "id": "mock-2",
        "title": "电脑中病毒 求助排查解决方案",
        "createdAt": 1771286400000,
        "updatedAt": 1771286400000,
        "isPinned": False,
        "previewText": "电脑突然变得很慢，杀毒软件检测到威胁...",
    },
    {
        "id": "mock-3",
        "title": "腾讯元宝AI多轮编辑辱骂事件",
        "createdAt": 1771372800000,
        "updatedAt": 1771376400000,
        "isPinned": False,
        "previewText": "关于最近的 AI 事件分析...",
    },
]

DEFAULT_WORKFLOW_SESSION_SEEDS: Dict[str, WorkflowSessionPayload] = {
    "mock-1": {
        "sessionId": "mock-1",
        "blocks": [
            {
                "id": "user-seed-1",
                "role": "user",
                "content": "请问微植钉术后疼痛如何缓解？",
                "createdAt": 1771200000000,
                "source": "manual_input",
            },
            {
                "id": "ai-seed-1",
                "role": "ai",
                "content": "可以先冰敷、按医嘱用药，并观察是否伴随异常肿胀或持续出血。",
                "createdAt": 1771203600000,
                "sourceBlockId": "user-seed-1",
                "status": "done",
            },
        ],
        "lastModified": 1771203600000,
    },
    "mock-2": {
        "sessionId": "mock-2",
        "blocks": [
            {
                "id": "user-seed-2",
                "role": "user",
                "content": "电脑突然变得很慢，帮我排查病毒风险。",
                "createdAt": 1771286400000,
                "source": "manual_input",
            },
            {
                "id": "ai-seed-2",
                "role": "ai",
                "content": "建议先断网、执行全盘扫描，并检查最近安装的软件和启动项。",
                "createdAt": 1771286401000,
                "sourceBlockId": "user-seed-2",
                "status": "done",
            },
        ],
        "lastModified": 1771286401000,
    },
    "mock-3": {
        "sessionId": "mock-3",
        "blocks": [
            {
                "id": "user-seed-3",
                "role": "user",
                "content": "帮我分析腾讯元宝 AI 多轮编辑事件。",
                "createdAt": 1771372800000,
                "source": "manual_input",
            },
            {
                "id": "ai-seed-3",
                "role": "ai",
                "content": "可以从产品安全边界、内容审核策略和多轮上下文继承风险三个角度分析。",
                "createdAt": 1771376400000,
                "sourceBlockId": "user-seed-3",
                "status": "done",
            },
        ],
        "lastModified": 1771376400000,
    },
}


DEFAULT_PREFERENCES: Dict[str, Any] = {
    "presetMode": "custom",
    "presetPrompts": {
        "custom": "请根据我的偏好整理输出。",
        "concise": "请简洁地总结重点。",
        "formal": "请输出正式、结构化的版本。",
    },
    "quickActionNames": {
        "solt1": "快速总结",
        "solt2": "待办提取",
        "solt3": "正式润色",
        "solt4": "会议纪要",
    },
    "quickActionPrompts": {
        "solt1": "请总结核心要点。",
        "solt2": "请提取待办并按优先级排序。",
        "solt3": "请改写为正式表达。",
        "solt4": "请整理成会议纪要。",
    },
    "memoryContent": "记住我偏好先给结论，再给细节。",
}

DEFAULT_PORTAL_CALENDAR: PortalCalendarData = {
    2026: {
        3: {
            16: {
                "keys": ["summary-0316"],
                "workflowKeys": ["mock-1"],
                "detailBodyText": "3月16日：已归档 1 条历史工作流记录，请按计划推进。",
                "countdownCards": [
                    {
                        "id": "card_0316_1",
                        "title": "流程复盘提醒",
                        "subtitle": "测试内容：检查上周工作流节点完成情况",
                        "badge": "2天",
                    }
                ],
            },
            18: {
                "keys": ["summary-0318"],
                "todoKeys": ["todo-0318-a"],
                "detailBodyText": "3月18日：今日待办较多，建议优先处理高优先级任务。",
                "countdownCards": [
                    {
                        "id": "card_0318_1",
                        "title": "需求确认",
                        "subtitle": "测试内容：与产品同步本周迭代细节",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0318_2",
                        "title": "接口联调",
                        "subtitle": "测试内容：准备前后端联调清单",
                        "badge": "3天",
                    },
                ],
            },
            19: {
                "keys": ["summary-0319"],
                "todoKeys": ["todo-0319-a"],
                "workflowKeys": ["mock-2"],
                "detailBodyText": "3月19日：当日有待办与历史流程，请同时关注执行与回顾。",
                "countdownCards": [
                    {
                        "id": "card_0319_1",
                        "title": "测试消息模板 A",
                        "subtitle": "测试内容：这是第一条倒计时消息",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0319_2",
                        "title": "测试消息模板 B",
                        "subtitle": "测试内容：这是第二条倒计时消息",
                        "badge": "3天",
                    },
                ],
            },
            20: {
                "keys": ["summary-0320"],
                "workflowKeys": ["mock-3"],
                "detailBodyText": "3月20日：建议完成流程节点归档，确保里程碑状态更新。",
                "countdownCards": [
                    {
                        "id": "card_0320_1",
                        "title": "里程碑检查",
                        "subtitle": "测试内容：核对流程里程碑与交付状态",
                        "badge": "2天",
                    }
                ],
            },
            22: {
                "keys": ["summary-0322"],
                "todoKeys": ["todo-0322-a"],
                "workflowKeys": ["mock-1"],
                "detailBodyText": "3月22日：代办与工作流并行，注意同步风险项和依赖项。",
                "countdownCards": [
                    {
                        "id": "card_0322_1",
                        "title": "发布前准备",
                        "subtitle": "测试内容：整理上线前检查项",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0322_2",
                        "title": "历史记录复核",
                        "subtitle": "测试内容：确认关键流程日志完整",
                        "badge": "4天",
                    },
                ],
            },
            24: {
                "keys": ["summary-0324"],
                "todoKeys": ["todo-0324-a"],
                "workflowKeys": ["mock-2"],
                "detailBodyText": "3月24日：请完成版本收尾，更新任务看板并发送日报。",
                "countdownCards": [
                    {
                        "id": "card_0324_1",
                        "title": "版本收尾",
                        "subtitle": "测试内容：完成回归与文档整理",
                        "badge": "2天",
                    }
                ],
            },
        },
        4: {
            16: {
                "keys": ["summary-0416"],
                "workflowKeys": ["mock-1"],
                "detailBodyText": "4月16日：已归档 1 条历史工作流记录，请按计划推进。",
                "countdownCards": [
                    {
                        "id": "card_0416_1",
                        "title": "流程复盘提醒",
                        "subtitle": "测试内容：检查上周工作流节点完成情况",
                        "badge": "2天",
                    }
                ],
            },
            18: {
                "keys": ["summary-0418"],
                "todoKeys": ["todo-0418-a"],
                "detailBodyText": "4月18日：今日待办较多，建议优先处理高优先级任务。",
                "countdownCards": [
                    {
                        "id": "card_0418_1",
                        "title": "需求确认",
                        "subtitle": "测试内容：与产品同步本周迭代细节",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0418_2",
                        "title": "接口联调",
                        "subtitle": "测试内容：准备前后端联调清单",
                        "badge": "3天",
                    },
                ],
            },
            19: {
                "keys": ["summary-0419"],
                "todoKeys": ["todo-0419-a"],
                "workflowKeys": ["mock-2"],
                "detailBodyText": "4月19日：当日有待办与历史流程，请同时关注执行与回顾。",
                "countdownCards": [
                    {
                        "id": "card_0419_1",
                        "title": "测试消息模板 A",
                        "subtitle": "测试内容：这是第一条倒计时消息",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0419_2",
                        "title": "测试消息模板 B",
                        "subtitle": "测试内容：这是第二条倒计时消息",
                        "badge": "3天",
                    },
                ],
            },
            20: {
                "keys": ["summary-0420"],
                "workflowKeys": ["mock-3"],
                "detailBodyText": "4月20日：建议完成流程节点归档，确保里程碑状态更新。",
                "countdownCards": [
                    {
                        "id": "card_0420_1",
                        "title": "里程碑检查",
                        "subtitle": "测试内容：核对流程里程碑与交付状态",
                        "badge": "2天",
                    }
                ],
            },
            22: {
                "keys": ["summary-0422"],
                "todoKeys": ["todo-0422-a"],
                "workflowKeys": ["mock-1"],
                "detailBodyText": "4月22日：代办与工作流并行，注意同步风险项和依赖项。",
                "countdownCards": [
                    {
                        "id": "card_0422_1",
                        "title": "发布前准备",
                        "subtitle": "测试内容：整理上线前检查项",
                        "badge": "1天",
                    },
                    {
                        "id": "card_0422_2",
                        "title": "历史记录复核",
                        "subtitle": "测试内容：确认关键流程日志完整",
                        "badge": "4天",
                    },
                ],
            },
            24: {
                "keys": ["summary-0424"],
                "todoKeys": ["todo-0424-a"],
                "workflowKeys": ["mock-2"],
                "detailBodyText": "4月24日：请完成版本收尾，更新任务看板并发送日报。",
                "countdownCards": [
                    {
                        "id": "card_0424_1",
                        "title": "版本收尾",
                        "subtitle": "测试内容：完成回归与文档整理",
                        "badge": "2天",
                    }
                ],
            },
        },
    }
}


class MockStore:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.users_by_id: Dict[str, Dict[str, Any]] = {}
        self.user_ids_by_phone: Dict[str, str] = {}
        self.codes_by_phone: Dict[str, str] = {}
        self.preferences_by_user_id: Dict[str, Dict[str, Any]] = {}
        self.portal_by_user_id: Dict[str, PortalCalendarData] = {}
        self.history_by_user_id: Dict[str, list[HistorySessionSummary]] = {}
        self.workflow_by_session_id: Dict[str, WorkflowSessionPayload] = {}
        self.uploaded_files_by_id: Dict[str, UploadedFilePayload] = {}
        self.uploaded_audio_by_id: Dict[str, UploadedAudioPayload] = {}
        self.long_audio_tasks_by_id: Dict[str, LongAudioTaskPayload] = {}
        self._next_user_id = 1000
        self._seed()

    def _seed(self) -> None:
        self.create_user(
            phone="13800000000",
            password="123456",
            name="Mock User",
            portal_seed=DEFAULT_PORTAL_CALENDAR,
        )

    def _build_seed_workflow_sessions(self, history_sessions: list[HistorySessionSummary]) -> Dict[str, WorkflowSessionPayload]:
        seeded_sessions: Dict[str, WorkflowSessionPayload] = {}
        for session in history_sessions:
            session_id = session["id"]
            seeded_payload = DEFAULT_WORKFLOW_SESSION_SEEDS.get(session_id)
            if seeded_payload:
                seeded_sessions[session_id] = deepcopy(seeded_payload)
            else:
                seeded_sessions[session_id] = {
                    "sessionId": session_id,
                    "blocks": [],
                    "lastModified": session.get("updatedAt", session["createdAt"]),
                }
        return seeded_sessions

    def _new_user_id(self) -> str:
        self._next_user_id += 1
        return str(self._next_user_id)

    def create_user(
        self,
        phone: str,
        password: str,
        name: str,
        portal_seed: PortalCalendarData | None = None,
    ) -> Dict[str, Any]:
        if phone in self.user_ids_by_phone:
            raise ValueError("user already exists")

        user_id = self._new_user_id()
        user = {
            "id": user_id,
            "phone": phone,
            "password": password,
            "name": name,
        }
        self.users_by_id[user_id] = user
        self.user_ids_by_phone[phone] = user_id
        self.preferences_by_user_id[user_id] = deepcopy(DEFAULT_PREFERENCES)
        self.portal_by_user_id[user_id] = deepcopy(portal_seed or {})
        history_sessions = deepcopy(DEFAULT_HISTORY_SESSIONS if portal_seed else [])
        self.history_by_user_id[user_id] = history_sessions
        for session_id, workflow_payload in self._build_seed_workflow_sessions(history_sessions).items():
            self.workflow_by_session_id[session_id] = workflow_payload
        return deepcopy(user)

    def get_user_by_phone(self, phone: str) -> Dict[str, Any] | None:
        user_id = self.user_ids_by_phone.get(phone)
        if not user_id:
            return None
        return deepcopy(self.users_by_id[user_id])

    def get_user_by_id(self, user_id: str) -> Dict[str, Any] | None:
        user = self.users_by_id.get(str(user_id))
        return deepcopy(user) if user else None

    def generate_code(self, phone: str) -> str:
        request_id = f"mock-code-{uuid4().hex[:8]}"
        self.codes_by_phone[phone] = request_id
        return request_id

    def login_with_code(self, phone: str) -> Dict[str, Any] | None:
        return self.get_user_by_phone(phone)

    def login_with_password(self, phone: str, password: str) -> Dict[str, Any] | None:
        user = self.get_user_by_phone(phone)
        if not user or user["password"] != password:
            return None
        return user

    def reset_password(self, phone: str, new_password: str) -> Dict[str, Any] | None:
        user = self.get_user_by_phone(phone)
        if not user:
            return None

        stored_user = self.users_by_id[user["id"]]
        stored_user["password"] = new_password
        return deepcopy(stored_user)

    def get_preferences(self, user_id: str) -> Dict[str, Any] | None:
        preferences = self.preferences_by_user_id.get(str(user_id))
        return deepcopy(preferences) if preferences else None

    def save_preferences(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any] | None:
        if str(user_id) not in self.users_by_id:
            return None
        self.preferences_by_user_id[str(user_id)] = deepcopy(payload)
        return deepcopy(payload)

    def get_portal_month(self, user_id: str, year: int, month: int) -> PortalMonthData | None:
        if str(user_id) not in self.users_by_id:
            return None
        month_data = self.portal_by_user_id.get(str(user_id), {}).get(year, {}).get(month, {})
        return deepcopy(month_data)

    def save_portal_day(
        self,
        user_id: str,
        year: int,
        month: int,
        day: int,
        day_data: PortalDayPayload,
    ) -> bool:
        if str(user_id) not in self.users_by_id:
            return False

        user_portal = self.portal_by_user_id.setdefault(str(user_id), {})
        year_data = user_portal.setdefault(year, {})
        month_data = year_data.setdefault(month, {})
        month_data[day] = deepcopy(day_data)
        return True

    def delete_portal_day(self, user_id: str, year: int, month: int, day: int) -> bool:
        if str(user_id) not in self.users_by_id:
            return False

        user_portal = self.portal_by_user_id.setdefault(str(user_id), {})
        year_data = user_portal.setdefault(year, {})
        month_data = year_data.setdefault(month, {})
        month_data.pop(day, None)
        return True

    def get_history_sessions(self, user_id: str) -> list[HistorySessionSummary] | None:
        if str(user_id) not in self.users_by_id:
            return None

        return deepcopy(self.history_by_user_id.get(str(user_id), []))

    def create_history_session(
        self,
        user_id: str,
        title: str,
        preview_text: str | None = None,
    ) -> HistorySessionSummary | None:
        if str(user_id) not in self.users_by_id:
            return None

        timestamp = 1775203200000 + len(self.history_by_user_id.get(str(user_id), [])) * 60000
        session = {
            "id": f"session-{uuid4().hex[:12]}",
            "title": title,
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "isPinned": False,
            "previewText": preview_text or "",
        }
        self.history_by_user_id.setdefault(str(user_id), []).insert(0, session)
        self.workflow_by_session_id.setdefault(
            session["id"],
            {
                "sessionId": session["id"],
                "blocks": [],
                "lastModified": timestamp,
            },
        )
        return deepcopy(session)

    def delete_history_session(self, user_id: str, session_id: str) -> bool | None:
        if str(user_id) not in self.users_by_id:
            return None

        sessions = self.history_by_user_id.setdefault(str(user_id), [])
        initial_count = len(sessions)
        sessions[:] = [session for session in sessions if session["id"] != session_id]
        if len(sessions) != initial_count:
            self.workflow_by_session_id.pop(session_id, None)
        return len(sessions) != initial_count

    def rename_history_session(self, user_id: str, session_id: str, new_title: str) -> bool | None:
        if str(user_id) not in self.users_by_id:
            return None

        sessions = self.history_by_user_id.setdefault(str(user_id), [])
        for session in sessions:
            if session["id"] == session_id:
                session["title"] = new_title
                session["updatedAt"] = session.get("updatedAt", session["createdAt"]) + 1
                return True
        return False

    def pin_history_session(self, user_id: str, session_id: str, is_pinned: bool) -> bool | None:
        if str(user_id) not in self.users_by_id:
            return None

        sessions = self.history_by_user_id.setdefault(str(user_id), [])
        for session in sessions:
            if session["id"] == session_id:
                session["isPinned"] = is_pinned
                session["updatedAt"] = session.get("updatedAt", session["createdAt"]) + 1
                return True
        return False

    def ensure_session_compat(self, session_id: str | None, legacy_id: str | None) -> str | None:
        normalized_session_id = session_id or legacy_id
        if session_id and legacy_id and session_id != legacy_id:
            raise ValueError("sessionId and id must match")
        return normalized_session_id

    def _find_history_owner(self, session_id: str) -> tuple[str, HistorySessionSummary] | None:
        for user_id, sessions in self.history_by_user_id.items():
            for session in sessions:
                if session["id"] == session_id:
                    return user_id, session
        return None

    def _touch_history_session(self, session_id: str, preview_text: str | None = None) -> None:
        located = self._find_history_owner(session_id)
        if not located:
            return

        _, session = located
        session["updatedAt"] = session.get("updatedAt", session["createdAt"]) + 1
        if preview_text is not None:
            session["previewText"] = preview_text

    def _ensure_workflow_session_shell(self, session_id: str) -> WorkflowSessionPayload | None:
        if session_id in self.workflow_by_session_id:
            return self.workflow_by_session_id[session_id]

        located = self._find_history_owner(session_id)
        if not located:
            return None

        _, history_session = located
        shell: WorkflowSessionPayload = {
            "sessionId": session_id,
            "blocks": [],
            "lastModified": history_session.get("updatedAt", history_session["createdAt"]),
        }
        self.workflow_by_session_id[session_id] = shell
        return shell

    def _append_blocks(
        self,
        session_id: str,
        blocks: list[WorkflowBlockPayload],
        recorded_audio: Dict[str, Any] | None = None,
    ) -> WorkflowSessionPayload | None:
        session = self._ensure_workflow_session_shell(session_id)
        if session is None:
            return None

        session.setdefault("blocks", []).extend(deepcopy(blocks))
        session["lastModified"] = session.get("lastModified", 1775203200000) + 1
        if recorded_audio is not None:
            session["recordedAudio"] = deepcopy(recorded_audio)
        return session

    def get_workflow_session(self, session_id: str) -> WorkflowSessionPayload | None:
        session = self._ensure_workflow_session_shell(session_id)
        return deepcopy(session) if session else None

    def _build_ai_attachment(self, session_id: str, suffix: str = "result") -> Dict[str, Any]:
        attachment_id = f"att-{uuid4().hex[:8]}"
        file_id = f"file-{uuid4().hex[:8]}"
        file_name = f"{session_id}-{suffix}.md"
        file_ref = {
            "url": f"/mock/workflow/files/{file_id}/{file_name}",
            "path": f"/mock/files/{file_name}",
            "fileName": file_name,
            "mimeType": "text/markdown",
        }
        return {
            "id": attachment_id,
            "type": "file",
            "fileName": file_name,
            "mimeType": "text/markdown",
            "fileRef": file_ref,
            "uploadStatus": "success",
        }

    def submit_workflow_input(
        self,
        session_id: str,
        text: str | None,
        file_ref: Dict[str, Any] | None,
        blocks: list[WorkflowBlockPayload],
    ) -> Dict[str, Any] | None:
        session = self._ensure_workflow_session_shell(session_id)
        if session is None:
            return None

        now = session.get("lastModified", 1775203200000) + 1
        user_block_id = f"user-{uuid4().hex[:10]}"
        source = "uploaded_file" if file_ref else "manual_input"
        user_block: WorkflowBlockPayload = {
            "id": user_block_id,
            "role": "user",
            "content": text or "",
            "createdAt": now,
            "source": source,
        }
        if file_ref:
            user_block["fileRef"] = deepcopy(file_ref)
            user_block["attachments"] = [
                {
                    "id": f"att-{uuid4().hex[:8]}",
                    "type": "file",
                    "fileName": file_ref.get("fileName", "upload.bin"),
                    "mimeType": file_ref.get("mimeType"),
                    "fileRef": deepcopy(file_ref),
                    "uploadStatus": "success",
                }
            ]

        ai_block_id = f"ai-{uuid4().hex[:10]}"
        ai_block: WorkflowBlockPayload = {
            "id": ai_block_id,
            "role": "ai",
            "content": f"Mock AI response for session {session_id}: 已根据你的输入生成结果。",
            "createdAt": now + 1,
            "sourceBlockId": user_block_id,
            "status": "done",
        }
        if file_ref:
            ai_block["attachments"] = [self._build_ai_attachment(session_id)]

        self.workflow_by_session_id[session_id] = {
            "sessionId": session_id,
            "blocks": deepcopy(blocks) + [user_block, ai_block],
            "lastModified": now + 1,
            **({"recordedAudio": deepcopy(session["recordedAudio"])} if "recordedAudio" in session else {}),
        }
        preview_text = text or (file_ref.get("fileName") if file_ref else "") or ""
        self._touch_history_session(session_id, preview_text=preview_text)
        return {
            "userBlockId": user_block_id,
            "aiBlock": deepcopy(ai_block),
        }

    def generate_workflow_block(
        self,
        session_id: str,
        blocks: list[WorkflowBlockPayload],
        action: str,
        after_block_id: str | None,
    ) -> Dict[str, Any] | None:
        session = self._ensure_workflow_session_shell(session_id)
        if session is None:
            return None
        if action == "append_after" and not after_block_id:
            raise ValueError("afterBlockId is required for append_after")

        source_block_id = after_block_id or (blocks[0]["id"] if blocks else "user-root")
        block_id = f"ai-{uuid4().hex[:10]}"
        generated_block = {
            "id": block_id,
            "role": "ai",
            "content": f"Mock generated content for {action}.",
            "createdAt": session.get("lastModified", 1775203200000) + 1,
            "sourceBlockId": source_block_id,
            "status": "done",
        }
        self.workflow_by_session_id[session_id] = {
            "sessionId": session_id,
            "blocks": deepcopy(blocks) + [deepcopy(generated_block)],
            "lastModified": generated_block["createdAt"],
            **({"recordedAudio": deepcopy(session["recordedAudio"])} if "recordedAudio" in session else {}),
        }
        self._touch_history_session(session_id, preview_text=generated_block["content"])
        return {
            "blockId": generated_block["id"],
            "content": generated_block["content"],
            "sourceBlockId": generated_block["sourceBlockId"],
            "status": "done",
        }

    def upload_workflow_file(
        self,
        file_name: str,
        mime_type: str,
        session_id: str | None = None,
    ) -> Dict[str, Any]:
        file_id = f"file-{uuid4().hex[:10]}"
        file_ref = {
            "url": f"/mock/workflow/files/{file_id}/{file_name}",
            "path": f"/mock/files/{file_name}",
            "fileName": file_name,
            "mimeType": mime_type,
        }
        payload = {
            "id": file_id,
            "sessionId": session_id,
            "fileRef": deepcopy(file_ref),
        }
        self.uploaded_files_by_id[file_id] = payload
        return deepcopy(file_ref)

    def upload_workflow_audio(
        self,
        file_name: str,
        mime_type: str,
        duration_ms: int | None,
        session_id: str | None = None,
    ) -> Dict[str, Any]:
        audio_id = f"audio-{uuid4().hex[:10]}"
        payload = {
            "id": audio_id,
            "sessionId": session_id,
            "fileName": file_name,
            "mimeType": mime_type,
            "durationMs": duration_ms or 0,
            "url": f"/mock/workflow/audio/{audio_id}/{file_name}",
        }
        self.uploaded_audio_by_id[audio_id] = payload
        return {
            "remoteAudioId": audio_id,
            "url": payload["url"],
        }

    def transcript_audio(
        self,
        audio_resource_id: str | None,
        audio_uri: str | None = None,
    ) -> Dict[str, Any]:
        normalized_id = audio_resource_id or (audio_uri.rsplit("/", 1)[-1] if audio_uri else "audio-unknown")
        full_text = f"Mock transcript for {normalized_id}."
        return {
            "segments": [
                {"startTime": 0, "endTime": 1800, "text": "Mock transcript "},
                {"startTime": 1800, "endTime": 3600, "text": f"for {normalized_id}."},
            ],
            "fullText": full_text,
        }

    def create_long_audio_task(
        self,
        session_id: str,
        audio_resource_id: str,
        prompt: str,
        duration_ms: int | None,
    ) -> Dict[str, Any] | None:
        session = self._ensure_workflow_session_shell(session_id)
        if session is None:
            return None

        task_id = f"long-task-{uuid4().hex[:10]}"
        self.long_audio_tasks_by_id[task_id] = {
            "taskId": task_id,
            "sessionId": session_id,
            "audioResourceId": audio_resource_id,
            "prompt": prompt,
            "durationMs": duration_ms or self.uploaded_audio_by_id.get(audio_resource_id, {}).get("durationMs", 0),
            "status": "pending",
            "pollCount": 0,
        }
        return {
            "accepted": True,
            "taskId": task_id,
            "sessionId": session_id,
        }

    def get_long_audio_task_status(self, task_id: str) -> Dict[str, Any] | None:
        task = self.long_audio_tasks_by_id.get(task_id)
        if task is None:
            return None

        task["pollCount"] += 1
        poll_count = task["pollCount"]
        if poll_count == 1:
            task["status"] = "pending"
        elif poll_count == 2:
            task["status"] = "processing"
        else:
            task["status"] = "completed"
            if not task.get("completedApplied"):
                session_id = task["sessionId"]
                audio_id = task["audioResourceId"]
                duration_ms = task.get("durationMs", 0)
                transcript = self.transcript_audio(audio_id)
                user_block = {
                    "id": f"user-{uuid4().hex[:10]}",
                    "role": "user",
                    "content": transcript["fullText"],
                    "createdAt": self.workflow_by_session_id.get(session_id, {}).get("lastModified", 1775203200000) + 1,
                    "source": "transcript",
                    "shouldGenerateSummary": True,
                    "hasSummary": True,
                    "summaryContent": f"Summary for {audio_id}",
                }
                ai_block = {
                    "id": f"ai-{uuid4().hex[:10]}",
                    "role": "ai",
                    "content": f"Mock long-form result for session {session_id}: {task['prompt']}",
                    "createdAt": user_block["createdAt"] + 1,
                    "sourceBlockId": user_block["id"],
                    "status": "done",
                }
                audio_payload = self.uploaded_audio_by_id.get(audio_id, {})
                self._append_blocks(
                    session_id,
                    [user_block, ai_block],
                    recorded_audio={
                        "audioResourceId": audio_id,
                        "audioUri": audio_payload.get("url", f"/mock/workflow/audio/{audio_id}"),
                        "durationMs": duration_ms,
                    },
                )
                self._touch_history_session(session_id, preview_text=ai_block["content"])
                task["completedApplied"] = True
                task["result"] = {"summary": ai_block["content"]}

        response = {
            "taskId": task_id,
            "status": task["status"],
            "sessionId": task["sessionId"],
        }
        if task.get("result") is not None:
            response["result"] = deepcopy(task["result"])
        return response


mock_store = MockStore()
