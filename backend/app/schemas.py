from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models import TenderStatus, Priority


class TenderBase(BaseModel):
    source: str
    external_id: str
    title: str
    description: Optional[str] = None
    organization: str
    province: Optional[str] = None
    process_type: Optional[str] = None
    category: Optional[str] = None
    keywords: Optional[List[str]] = None
    publish_date: Optional[date] = None
    open_date: Optional[date] = None
    estimated_amount: Optional[float] = None
    url: Optional[str] = None
    raw_payload: Optional[Dict[str, Any]] = None


class TenderCreate(TenderBase):
    pass


class TenderUpdate(BaseModel):
    status: Optional[TenderStatus] = None
    owner: Optional[str] = None
    notes: Optional[str] = None


class TenderResponse(TenderBase):
    id: str
    status: TenderStatus
    owner: Optional[str] = None
    notes: Optional[str] = None
    score_total: int
    score_breakdown: Optional[Dict[str, Any]] = None
    priority: Priority
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SourceRunResponse(BaseModel):
    id: str
    source: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    items_fetched: int
    items_inserted: int
    items_updated: int
    errors_count: int
    log_path: Optional[str] = None

    class Config:
        from_attributes = True
