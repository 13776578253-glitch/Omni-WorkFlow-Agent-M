from fastapi import APIRouter, HTTPException, Query

try:
    from .schemas.common_schemas import error_detail, success_response
    from .schemas import history_schemas as HS
    from ..services.mock_store import mock_store
except ImportError:
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.routers.schemas import history_schemas as HS
    from app.services.mock_store import mock_store


router = APIRouter()


@router.get("/sessions")
async def get_sessions(id: str = Query(...)) -> dict:
    sessions = mock_store.get_history_sessions(id)
    if sessions is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"sessions": sessions})


@router.post("/sessions")
async def create_session(data: HS.CreateHistorySessionRequest) -> dict:
    session = mock_store.create_history_session(data.userId, data.title, data.previewText)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"session": session})


@router.delete("/sessions/{sessionId}")
async def delete_session(sessionId: str, data: HS.DeleteHistorySessionRequest) -> dict:
    deleted = mock_store.delete_history_session(data.userId, sessionId)
    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_HISTORY_SESSION_NOT_FOUND", "history session not found"),
        )

    return success_response({"success": True})


@router.put("/sessions/{sessionId}/title")
async def rename_session(sessionId: str, data: HS.RenameHistorySessionRequest) -> dict:
    renamed = mock_store.rename_history_session(data.userId, sessionId, data.newTitle)
    if renamed is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )
    if not renamed:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_HISTORY_SESSION_NOT_FOUND", "history session not found"),
        )

    return success_response({"success": True})


@router.put("/sessions/{sessionId}/pin")
async def pin_session(sessionId: str, data: HS.PinHistorySessionRequest) -> dict:
    pinned = mock_store.pin_history_session(data.userId, sessionId, data.isPinned)
    if pinned is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )
    if not pinned:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_HISTORY_SESSION_NOT_FOUND", "history session not found"),
        )

    return success_response({"success": True})
