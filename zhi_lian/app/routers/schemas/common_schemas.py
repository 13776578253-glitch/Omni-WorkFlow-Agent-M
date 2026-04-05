from typing import Any, Dict, Optional

from pydantic import BaseModel


class ApiErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


def success_response(data: Any) -> Dict[str, Any]:
    return {
        "code": "0",
        "message": "ok",
        "data": data,
    }


def error_detail(code: str, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"code": code, "message": message}
    if details is not None:
        payload["details"] = details
    return payload
