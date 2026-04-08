from typing import Optional

from pydantic import BaseModel


class HistorySessionDto(BaseModel):
    id: str
    title: str
    createdAt: int
    updatedAt: Optional[int] = None
    isPinned: bool
    previewText: Optional[str] = None


class CreateHistorySessionRequest(BaseModel):
    userId: str
    title: str
    previewText: Optional[str] = None


class DeleteHistorySessionRequest(BaseModel):
    userId: str


class RenameHistorySessionRequest(BaseModel):
    userId: str
    newTitle: str


class PinHistorySessionRequest(BaseModel):
    userId: str
    isPinned: bool
