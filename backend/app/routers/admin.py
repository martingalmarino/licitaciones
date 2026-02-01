from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.refresh import refresh_all
from app.services.folder_creator import create_process_folder
from app.crud import get_source_runs, get_source_run, get_tender
import json

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/refresh")
async def trigger_refresh(db: Session = Depends(get_db)):
    """Trigger refresh of all data sources"""
    try:
        results = await refresh_all(db)
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")


@router.get("/runs")
def list_source_runs(source: str = None, limit: int = 50, db: Session = Depends(get_db)):
    """List source runs"""
    runs = get_source_runs(db, source=source, limit=limit)
    return {
        "runs": [
            {
                "id": run.id,
                "source": run.source,
                "started_at": run.started_at.isoformat(),
                "finished_at": run.finished_at.isoformat() if run.finished_at else None,
                "items_fetched": run.items_fetched,
                "items_inserted": run.items_inserted,
                "items_updated": run.items_updated,
                "errors_count": run.errors_count,
                "log_path": run.log_path
            }
            for run in runs
        ]
    }


@router.get("/runs/{run_id}")
def get_source_run_detail(run_id: str, db: Session = Depends(get_db)):
    """Get source run details"""
    run = get_source_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Source run not found")
    
    return {
        "id": run.id,
        "source": run.source,
        "started_at": run.started_at.isoformat(),
        "finished_at": run.finished_at.isoformat() if run.finished_at else None,
        "items_fetched": run.items_fetched,
        "items_inserted": run.items_inserted,
        "items_updated": run.items_updated,
        "errors_count": run.errors_count,
        "log_path": run.log_path
    }


@router.post("/tenders/{tender_id}/create-folder")
def create_tender_folder(tender_id: str, db: Session = Depends(get_db)):
    """Create process folder for a tender"""
    tender = get_tender(db, tender_id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    try:
        folder_path = create_process_folder(tender)
        return {
            "success": True,
            "folder_path": str(folder_path),
            "message": f"Carpeta creada en: {folder_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating folder: {str(e)}")
