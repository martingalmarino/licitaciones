from typing import List
from sqlalchemy.orm import Session
from app.adapters.base import SourceAdapter
from app.adapters.mock import MockSourceAdapter
from app.adapters.comprar_stub import ComprarGobArAdapter
from app.crud import upsert_tender, create_source_run, update_source_run
from app.utils.logging import setup_logger

logger = setup_logger("refresh_service")

# Register all adapters
ADAPTERS: List[SourceAdapter] = [
    MockSourceAdapter(),
    ComprarGobArAdapter(),
]


async def refresh_source(db: Session, adapter: SourceAdapter) -> dict:
    """
    Refresh data from a single source adapter
    Returns: dict with stats
    """
    logger.info(f"Starting refresh for source: {adapter.name}")
    
    # Create source run record
    run = create_source_run(db, adapter.name)
    
    items_fetched = 0
    items_inserted = 0
    items_updated = 0
    errors_count = 0
    
    try:
        # Fetch raw items
        raw_items = await adapter.fetch()
        items_fetched = len(raw_items)
        logger.info(f"Fetched {items_fetched} items from {adapter.name}")
        
        # Normalize and upsert
        for raw_item in raw_items:
            try:
                normalized = adapter.normalize(raw_item)
                # Check if exists before upsert
                from app.models import Tender
                existing = db.query(Tender).filter(
                    Tender.source == normalized.source,
                    Tender.external_id == normalized.external_id
                ).first()
                
                was_new = existing is None
                tender = upsert_tender(db, normalized)
                
                if was_new:
                    items_inserted += 1
                else:
                    items_updated += 1
                    
            except Exception as e:
                logger.error(f"Error processing item from {adapter.name}: {e}")
                errors_count += 1
        
        logger.info(f"Completed refresh for {adapter.name}: {items_inserted} inserted, {items_updated} updated")
        
    except Exception as e:
        logger.error(f"Error refreshing source {adapter.name}: {e}")
        errors_count += 1
    
    # Update source run
    update_source_run(
        db,
        run.id,
        items_fetched=items_fetched,
        items_inserted=items_inserted,
        items_updated=items_updated,
        errors_count=errors_count
    )
    
    return {
        "source": adapter.name,
        "items_fetched": items_fetched,
        "items_inserted": items_inserted,
        "items_updated": items_updated,
        "errors_count": errors_count
    }


async def refresh_all(db: Session) -> List[dict]:
    """
    Refresh data from all registered adapters
    Returns: List of stats dicts
    """
    logger.info("Starting refresh for all sources")
    results = []
    
    for adapter in ADAPTERS:
        try:
            result = await refresh_source(db, adapter)
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to refresh {adapter.name}: {e}")
            results.append({
                "source": adapter.name,
                "error": str(e)
            })
    
    logger.info("Completed refresh for all sources")
    return results
