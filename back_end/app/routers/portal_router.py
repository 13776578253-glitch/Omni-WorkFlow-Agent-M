from fastapi import APIRouter, HTTPException, Query

try:
    from .schemas.common_schemas import error_detail, success_response
    from .schemas import portal_schemas as PS
    from ..services.mock_store import mock_store
except ImportError:
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.routers.schemas import portal_schemas as PS
    from app.services.mock_store import mock_store


router = APIRouter()


@router.get("/calendar")
async def get_month_calendar(
    userId: str = Query(...),
    year: int = Query(...),
    month: int = Query(...),
) -> dict:
    month_data = mock_store.get_portal_month(userId, year, month)
    if month_data is None:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"monthData": month_data})


@router.post("/day")
async def save_day_data(data: PS.PortalDayUpsertRequest) -> dict:
    saved = mock_store.save_portal_day(
        data.userId,
        data.year,
        data.month,
        data.day,
        data.dayData.model_dump(exclude_none=True),
    )
    if not saved:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"success": True})


@router.delete("/day")
async def delete_day_data(data: PS.PortalDayDeleteRequest) -> dict:
    deleted = mock_store.delete_portal_day(
        data.userId,
        data.year,
        data.month,
        data.day,
    )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"success": True})
