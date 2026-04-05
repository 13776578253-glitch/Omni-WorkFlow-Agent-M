from typing import Dict, Optional

from pydantic import BaseModel


class PortalCountdownCard(BaseModel):
    id: str
    title: str
    subtitle: str
    badge: str


class PortalDayData(BaseModel):
    keys: list[str]
    todoKeys: Optional[list[str]] = None
    workflowKeys: Optional[list[str]] = None
    detailBodyText: Optional[str] = None
    countdownCards: Optional[list[PortalCountdownCard]] = None


class PortalMonthResponse(BaseModel):
    monthData: Dict[int, PortalDayData]


class PortalDayUpsertRequest(BaseModel):
    userId: str
    year: int
    month: int
    day: int
    dayData: PortalDayData


class PortalDayDeleteRequest(BaseModel):
    userId: str
    year: int
    month: int
    day: int
