from pydantic import BaseModel
from enum import Enum
from typing import Dict


class PresetMode(str, Enum):
    custom = "custom"
    concise = "concise"
    formal = "formal"

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

class UserIdRequest(BaseModel):
    id: str

class UserInfo(BaseModel):
    id: int
    name: str

class LoginResponse(BaseModel):
    user: UserInfo

class MessageInfo(BaseModel):
    code: str
    message: str
    data: str

class MessageResponse(BaseModel):
    message: MessageInfo

class PresetConfigRequest(BaseModel):
    presetMode: PresetMode
    presetPrompts: Dict[str, str]
    quickActionNames: Dict[str, str]
    quickActionPrompts: Dict[str, str]
    memoryContent: str

class CodeRequest(BaseModel):
    requestId: str