from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4
import uuid

from sqlalchemy import Column, String, Integer, Float, Date, Text, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class TenderStatus(str, Enum):
    NEW = "NEW"
    IN_REVIEW = "IN_REVIEW"
    DISCARDED = "DISCARDED"
    SUBMITTED = "SUBMITTED"
    WON = "WON"
    LOST = "LOST"


class Priority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    source = Column(String, nullable=False, index=True)
    external_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    organization = Column(String, nullable=False, index=True)
    province = Column(String, index=True)
    process_type = Column(String)
    category = Column(String)
    keywords = Column(Text)  # JSON array as text
    publish_date = Column(Date)
    open_date = Column(Date, index=True)
    estimated_amount = Column(Float)
    url = Column(String)
    raw_payload = Column(Text)  # JSON as text

    # Operational fields
    status = Column(SQLEnum(TenderStatus), default=TenderStatus.NEW, index=True)
    owner = Column(String)
    notes = Column(Text)

    # Scoring fields
    score_total = Column(Integer, default=0, index=True)
    score_breakdown = Column(Text)  # JSON as text
    priority = Column(SQLEnum(Priority), default=Priority.LOW, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SourceRun(Base):
    __tablename__ = "source_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    source = Column(String, nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime)
    items_fetched = Column(Integer, default=0)
    items_inserted = Column(Integer, default=0)
    items_updated = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)
    log_path = Column(String)
