from fastapi import APIRouter, File, Form, HTTPException, UploadFile

try:
    from .schemas.common_schemas import error_detail, success_response
    from .schemas import workflow_schemas as WS
    from ..services.mock_store import mock_store
except ImportError:
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.routers.schemas import workflow_schemas as WS
    from app.services.mock_store import mock_store


router = APIRouter()


def _resolve_session_id(session_id: str | None, legacy_id: str | None) -> str:
    try:
        resolved = mock_store.ensure_session_compat(session_id, legacy_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_WORKFLOW_SESSION_MISMATCH", "sessionId and id must match"),
        ) from None

    if not resolved:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_WORKFLOW_SESSION_REQUIRED", "sessionId is required"),
        )
    return resolved


def _validate_session_compat_if_present(session_id: str | None, legacy_id: str | None) -> None:
    try:
        mock_store.ensure_session_compat(session_id, legacy_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_WORKFLOW_SESSION_MISMATCH", "sessionId and id must match"),
        ) from None


@router.get("/sessions/{sessionId}")
async def get_session(sessionId: str) -> dict:
    session = mock_store.get_workflow_session(sessionId)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_WORKFLOW_SESSION_NOT_FOUND", "workflow session not found"),
        )
    return success_response(session)


@router.post("/input")
async def submit_input(data: WS.WorkflowInputRequest) -> dict:
    session_id = _resolve_session_id(data.sessionId, data.id)
    result = mock_store.submit_workflow_input(
        session_id=session_id,
        text=data.text,
        file_ref=data.fileRef.model_dump(exclude_none=True) if data.fileRef else None,
        blocks=[block.model_dump(exclude_none=True) for block in data.blocks],
    )
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_WORKFLOW_SESSION_NOT_FOUND", "workflow session not found"),
        )
    return success_response(result)


@router.post("/generate")
async def generate(data: WS.WorkflowGenerateRequest) -> dict:
    session_id = _resolve_session_id(data.sessionId, data.id)
    try:
        result = mock_store.generate_workflow_block(
            session_id=session_id,
            blocks=[block.model_dump(exclude_none=True) for block in data.blocks],
            action=data.action,
            after_block_id=data.afterBlockId,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_WORKFLOW_INVALID_REQUEST", str(exc)),
        ) from exc
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_WORKFLOW_SESSION_NOT_FOUND", "workflow session not found"),
        )
    return success_response(result)


@router.post("/file/upload")
async def upload_file(
    file: UploadFile = File(...),
    sessionId: str | None = Form(default=None),
    id: str | None = Form(default=None),
) -> dict:
    session_id = None
    if sessionId or id:
        session_id = _resolve_session_id(sessionId, id)

    file_ref = mock_store.upload_workflow_file(
        file_name=file.filename or "upload.bin",
        mime_type=file.content_type or "application/octet-stream",
        session_id=session_id,
    )
    return success_response({"fileRef": file_ref})


@router.post("/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    durationMs: int | None = Form(default=None),
    sessionId: str | None = Form(default=None),
    id: str | None = Form(default=None),
) -> dict:
    session_id = None
    if sessionId or id:
        session_id = _resolve_session_id(sessionId, id)

    result = mock_store.upload_workflow_audio(
        file_name=file.filename or "audio.bin",
        mime_type=file.content_type or "application/octet-stream",
        duration_ms=durationMs,
        session_id=session_id,
    )
    return success_response(result)


@router.post("/audio/transcript")
async def transcript_audio(data: WS.WorkflowTranscriptRequest) -> dict:
    _validate_session_compat_if_present(data.sessionId, data.id)
    result = mock_store.transcript_audio(
        audio_resource_id=data.audioResourceId,
        audio_uri=data.audioUri,
    )
    return success_response(result)


@router.post("/audio/long-form")
async def create_long_form_task(data: WS.WorkflowLongAudioTaskRequest) -> dict:
    session_id = _resolve_session_id(data.sessionId, data.id)
    result = mock_store.create_long_audio_task(
        session_id=session_id,
        audio_resource_id=data.audioResourceId,
        prompt=data.prompt,
        duration_ms=data.durationMs,
    )
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_WORKFLOW_SESSION_NOT_FOUND", "workflow session not found"),
        )
    return success_response(result)


@router.get("/audio/tasks/{taskId}")
async def get_long_form_task(taskId: str) -> dict:
    result = mock_store.get_long_audio_task_status(taskId)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_WORKFLOW_TASK_NOT_FOUND", "workflow task not found"),
        )
    return success_response(result)
