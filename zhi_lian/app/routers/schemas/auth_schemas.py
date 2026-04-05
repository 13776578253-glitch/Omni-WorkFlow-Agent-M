from typing import Dict, Literal

from pydantic import BaseModel, Field


class PhoneLoginRequest(BaseModel):
    phone: str


class PasswordLoginRequest(BaseModel):
    phone: str
    password: str


class RegisterRequest(BaseModel):
    phone: str
    password: str
    name: str


class PasswordResetRequest(BaseModel):
    phone: str
    newPassword: str


class UserInfo(BaseModel):
    id: str
    name: str


class PreferencePrompts(BaseModel):
    custom: str = ""
    concise: str = ""
    formal: str = ""


class QuickActionSlots(BaseModel):
    solt1: str = ""
    solt2: str = ""
    solt3: str = ""
    solt4: str = ""


class UserPreferencesPayload(BaseModel):
    id: str
    presetMode: Literal["custom", "concise", "formal"]
    presetPrompts: PreferencePrompts
    quickActionNames: QuickActionSlots
    quickActionPrompts: QuickActionSlots
    memoryContent: str = ""


class UserPreferencesResponse(BaseModel):
    presetMode: Literal["custom", "concise", "formal"]
    presetPrompts: Dict[str, str]
    quickActionNames: Dict[str, str]
    quickActionPrompts: Dict[str, str]
    memoryContent: str


class LogoutResponse(BaseModel):
    success: bool = True


class MessageIdResponse(BaseModel):
    data: str = Field(..., description="User id string")


class SendCodeResponse(BaseModel):
    requestId: str
