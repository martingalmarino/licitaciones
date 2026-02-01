from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.crud import get_tender, list_tenders, update_tender
from app.schemas import TenderResponse, TenderUpdate
from app.models import TenderStatus, Priority
import json

router = APIRouter(prefix="/tenders", tags=["tenders"])


@router.get("", response_model=dict)
def get_tenders_list(
    province: Optional[str] = Query(None),
    priority: Optional[Priority] = Query(None),
    status: Optional[TenderStatus] = Query(None),
    q: Optional[str] = Query(None),
    open_date_from: Optional[str] = Query(None),
    open_date_to: Optional[str] = Query(None),
    sort: str = Query("open_date"),
    order: str = Query("asc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List tenders with filters and pagination"""
    # Parse date strings
    open_date_from_dt = None
    open_date_to_dt = None
    if open_date_from:
        try:
            open_date_from_dt = date.fromisoformat(open_date_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid open_date_from format (use YYYY-MM-DD)")
    if open_date_to:
        try:
            open_date_to_dt = date.fromisoformat(open_date_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid open_date_to format (use YYYY-MM-DD)")
    
    tenders, total = list_tenders(
        db=db,
        province=province,
        priority=priority,
        status=status,
        q=q,
        open_date_from=open_date_from_dt,
        open_date_to=open_date_to_dt,
        sort=sort,
        order=order,
        skip=skip,
        limit=limit
    )
    
    # Convert to response format
    tender_list = []
    for tender in tenders:
        tender_dict = {
            "id": tender.id,
            "source": tender.source,
            "external_id": tender.external_id,
            "title": tender.title,
            "description": tender.description,
            "organization": tender.organization,
            "province": tender.province,
            "process_type": tender.process_type,
            "category": tender.category,
            "keywords": json.loads(tender.keywords) if tender.keywords else [],
            "publish_date": tender.publish_date.isoformat() if tender.publish_date else None,
            "open_date": tender.open_date.isoformat() if tender.open_date else None,
            "estimated_amount": tender.estimated_amount,
            "url": tender.url,
            "status": tender.status.value,
            "owner": tender.owner,
            "notes": tender.notes,
            "score_total": tender.score_total,
            "score_breakdown": json.loads(tender.score_breakdown) if tender.score_breakdown else {},
            "priority": tender.priority.value,
            "created_at": tender.created_at.isoformat(),
            "updated_at": tender.updated_at.isoformat()
        }
        tender_list.append(tender_dict)
    
    return {
        "items": tender_list,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{tender_id}", response_model=dict)
def get_tender_detail(tender_id: str, db: Session = Depends(get_db)):
    """Get tender details by ID"""
    tender = get_tender(db, tender_id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    return {
        "id": tender.id,
        "source": tender.source,
        "external_id": tender.external_id,
        "title": tender.title,
        "description": tender.description,
        "organization": tender.organization,
        "province": tender.province,
        "process_type": tender.process_type,
        "category": tender.category,
        "keywords": json.loads(tender.keywords) if tender.keywords else [],
        "publish_date": tender.publish_date.isoformat() if tender.publish_date else None,
        "open_date": tender.open_date.isoformat() if tender.open_date else None,
        "estimated_amount": tender.estimated_amount,
        "url": tender.url,
        "raw_payload": json.loads(tender.raw_payload) if tender.raw_payload else None,
        "status": tender.status.value,
        "owner": tender.owner,
        "notes": tender.notes,
        "score_total": tender.score_total,
        "score_breakdown": json.loads(tender.score_breakdown) if tender.score_breakdown else {},
        "priority": tender.priority.value,
        "created_at": tender.created_at.isoformat(),
        "updated_at": tender.updated_at.isoformat()
    }


@router.patch("/{tender_id}", response_model=dict)
def update_tender_endpoint(
    tender_id: str,
    update_data: TenderUpdate,
    db: Session = Depends(get_db)
):
    """Update tender operational fields"""
    tender = update_tender(db, tender_id, update_data)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    return {
        "id": tender.id,
        "status": tender.status.value,
        "owner": tender.owner,
        "notes": tender.notes,
        "updated_at": tender.updated_at.isoformat()
    }
