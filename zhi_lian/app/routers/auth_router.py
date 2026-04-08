from fastapi import APIRouter, HTTPException

try:
    from .schemas import auth_schemas as AS
    from .schemas.common_schemas import error_detail, success_response
    from ..services.auth_preferences_service import AuthPreferencesService
except ImportError:
    from app.routers.schemas import auth_schemas as AS
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.services.auth_preferences_service import AuthPreferencesService


router = APIRouter()


@router.post("/code/send")
async def send_code(data: AS.PhoneLoginRequest) -> dict:
    request_id = await AuthPreferencesService.send_code(data.phone)
    return success_response({"requestId": request_id})


@router.post("/login_1")
async def login_with_code(data: AS.PhoneLoginRequest) -> dict:
    user = await AuthPreferencesService.login_with_code(data.phone)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"user": {"id": user["id"], "name": user["name"]}})


@router.post("/login_2")
async def login_with_password(data: AS.PasswordLoginRequest) -> dict:
    user, error = await AuthPreferencesService.login_with_password(data.phone, data.password)
    if error == "user_not_found":
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )
    if error == "invalid_password":
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_AUTH_INVALID_PASSWORD", "invalid password"),
        )

    return success_response({"user": {"id": user["id"], "name": user["name"]}}) # type: ignore


@router.post("/register")
async def register(data: AS.RegisterRequest) -> dict:
    try:
        user_id = await AuthPreferencesService.register(data.phone, data.password, data.name)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_AUTH_USER_EXISTS", "user already exists"),
        ) from None
    return success_response(user_id)


@router.post("/password/reset")
async def reset_password(data: AS.PasswordResetRequest) -> dict:
    user = await AuthPreferencesService.reset_password(data.phone, data.newPassword)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )

    return success_response(user["id"])


@router.post("/logout")
async def logout() -> dict:
    return success_response({"success": True})
