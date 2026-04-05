from fastapi import APIRouter, HTTPException

try:
    from .schemas import auth_schemas as AS
    from .schemas.common_schemas import error_detail, success_response
    from ..services.mock_store import mock_store
except ImportError:
    from app.routers.schemas import auth_schemas as AS
    from app.routers.schemas.common_schemas import error_detail, success_response
    from app.services.mock_store import mock_store


router = APIRouter()


@router.post("/code/send")
async def send_code(data: AS.PhoneLoginRequest) -> dict:
    request_id = mock_store.generate_code(data.phone)
    return success_response({"requestId": request_id})


@router.post("/login_1")
async def login_with_code(data: AS.PhoneLoginRequest) -> dict:
    user = mock_store.login_with_code(data.phone)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )

    return success_response({"user": {"id": user["id"], "name": user["name"]}})


@router.post("/login_2")
async def login_with_password(data: AS.PasswordLoginRequest) -> dict:
    existing_user = mock_store.get_user_by_phone(data.phone)
    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )

    user = mock_store.login_with_password(data.phone, data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_AUTH_INVALID_PASSWORD", "invalid password"),
        )

    return success_response({"user": {"id": user["id"], "name": user["name"]}})


@router.post("/register")
async def register(data: AS.RegisterRequest) -> dict:
    if mock_store.get_user_by_phone(data.phone):
        raise HTTPException(
            status_code=400,
            detail=error_detail("ERR_AUTH_USER_EXISTS", "user already exists"),
        )

    user = mock_store.create_user(phone=data.phone, password=data.password, name=data.name)
    return success_response(user["id"])


@router.post("/password/reset")
async def reset_password(data: AS.PasswordResetRequest) -> dict:
    user = mock_store.reset_password(data.phone, data.newPassword)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=error_detail("ERR_AUTH_USER_NOT_FOUND", "user not found"),
        )

    return success_response(user["id"])


@router.post("/logout")
async def logout() -> dict:
    return success_response({"success": True})
