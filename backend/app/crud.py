from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from app.models import Tender, SourceRun, TenderStatus, Priority
from app.schemas import TenderCreate, TenderUpdate
from app.scoring import score_tender
import json


def upsert_tender(db: Session, tender_data: TenderCreate) -> Tender:
    """
    Upsert a tender based on (source, external_id)
    If exists, update; if not, create.
    """
    existing = db.query(Tender).filter(
        Tender.source == tender_data.source,
        Tender.external_id == tender_data.external_id
    ).first()
    
    # Compute score
    keywords_list = tender_data.keywords or []
    score_total, score_breakdown, priority = score_tender(
        title=tender_data.title,
        description=tender_data.description or "",
        organization=tender_data.organization,
        open_date=tender_data.open_date,
        keywords=keywords_list
    )
    
    if existing:
        # Update existing
        existing.title = tender_data.title
        existing.description = tender_data.description
        existing.organization = tender_data.organization
        existing.province = tender_data.province
        existing.process_type = tender_data.process_type
        existing.category = tender_data.category
        existing.keywords = json.dumps(keywords_list) if keywords_list else None
        existing.publish_date = tender_data.publish_date
        existing.open_date = tender_data.open_date
        existing.estimated_amount = tender_data.estimated_amount
        existing.url = tender_data.url
        existing.raw_payload = json.dumps(tender_data.raw_payload) if tender_data.raw_payload else None
        existing.score_total = score_total
        existing.score_breakdown = json.dumps(score_breakdown)
        existing.priority = priority
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new
        new_tender = Tender(
            source=tender_data.source,
            external_id=tender_data.external_id,
            title=tender_data.title,
            description=tender_data.description,
            organization=tender_data.organization,
            province=tender_data.province,
            process_type=tender_data.process_type,
            category=tender_data.category,
            keywords=json.dumps(keywords_list) if keywords_list else None,
            publish_date=tender_data.publish_date,
            open_date=tender_data.open_date,
            estimated_amount=tender_data.estimated_amount,
            url=tender_data.url,
            raw_payload=json.dumps(tender_data.raw_payload) if tender_data.raw_payload else None,
            score_total=score_total,
            score_breakdown=json.dumps(score_breakdown),
            priority=priority
        )
        db.add(new_tender)
        db.commit()
        db.refresh(new_tender)
        return new_tender


def get_tender(db: Session, tender_id: str) -> Optional[Tender]:
    """Get a tender by ID"""
    return db.query(Tender).filter(Tender.id == tender_id).first()


def update_tender(db: Session, tender_id: str, update_data: TenderUpdate) -> Optional[Tender]:
    """Update tender operational fields"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        return None
    
    if update_data.status is not None:
        tender.status = update_data.status
    if update_data.owner is not None:
        tender.owner = update_data.owner
    if update_data.notes is not None:
        tender.notes = update_data.notes
    
    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    return tender


def list_tenders(
    db: Session,
    province: Optional[str] = None,
    priority: Optional[Priority] = None,
    status: Optional[TenderStatus] = None,
    q: Optional[str] = None,
    open_date_from: Optional[datetime] = None,
    open_date_to: Optional[datetime] = None,
    sort: str = "open_date",
    order: str = "asc",
    skip: int = 0,
    limit: int = 100
) -> tuple[List[Tender], int]:
    """List tenders with filters and pagination"""
    query = db.query(Tender)
    
    # Apply filters
    if province:
        query = query.filter(Tender.province == province)
    if priority:
        query = query.filter(Tender.priority == priority)
    if status:
        query = query.filter(Tender.status == status)
    if open_date_from:
        query = query.filter(Tender.open_date >= open_date_from.date())
    if open_date_to:
        query = query.filter(Tender.open_date <= open_date_to.date())
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Tender.title.ilike(search_term),
                Tender.organization.ilike(search_term),
                Tender.description.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    if sort == "open_date":
        sort_column = Tender.open_date
    elif sort == "score":
        sort_column = Tender.score_total
    elif sort == "publish_date":
        sort_column = Tender.publish_date
    else:
        sort_column = Tender.open_date
    
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    tenders = query.offset(skip).limit(limit).all()
    
    return tenders, total


def create_source_run(db: Session, source: str) -> SourceRun:
    """Create a new source run record"""
    run = SourceRun(source=source, started_at=datetime.utcnow())
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def update_source_run(
    db: Session,
    run_id: str,
    items_fetched: int = 0,
    items_inserted: int = 0,
    items_updated: int = 0,
    errors_count: int = 0,
    log_path: Optional[str] = None
) -> Optional[SourceRun]:
    """Update source run with results"""
    run = db.query(SourceRun).filter(SourceRun.id == run_id).first()
    if not run:
        return None
    
    run.finished_at = datetime.utcnow()
    run.items_fetched = items_fetched
    run.items_inserted = items_inserted
    run.items_updated = items_updated
    run.errors_count = errors_count
    if log_path:
        run.log_path = log_path
    
    db.commit()
    db.refresh(run)
    return run


def get_source_runs(db: Session, source: Optional[str] = None, limit: int = 50) -> List[SourceRun]:
    """Get source runs, optionally filtered by source"""
    query = db.query(SourceRun)
    if source:
        query = query.filter(SourceRun.source == source)
    return query.order_by(SourceRun.started_at.desc()).limit(limit).all()


def get_source_run(db: Session, run_id: str) -> Optional[SourceRun]:
    """Get a source run by ID"""
    return db.query(SourceRun).filter(SourceRun.id == run_id).first()
