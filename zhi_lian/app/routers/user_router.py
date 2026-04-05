from fastapi import APIRouter, HTTPException, Query

try:
    from .schemas import auth_schemas as AS
    from .schemas.common_schemas import error_detail, success_response
    from ..services.mock_store import mock_store
except ImportError:
    from app.routers.schemas import auth_schemas as AS
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.services.mock_store import mock_store


router = APIRouter()


@router.get("/preferences")
async def get_preferences(id: str = Query(...)) -> dict:
    preferences = mock_store.get_preferences(id)
    if not preferences:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response(preferences)


@router.post("/preferences")
async def save_preferences(data: AS.UserPreferencesPayload) -> dict:
    saved = mock_store.save_preferences(
        data.id,
        {
            "presetMode": data.presetMode,
            "presetPrompts": data.presetPrompts.model_dump(),
            "quickActionNames": data.quickActionNames.model_dump(),
            "quickActionPrompts": data.quickActionPrompts.model_dump(),
            "memoryContent": data.memoryContent,
        },
    )
    if not saved:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"success": True})
