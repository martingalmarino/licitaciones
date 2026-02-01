import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from app.adapters.base import SourceAdapter
from app.schemas import TenderCreate
from app.utils.text import generate_external_id


class MockSourceAdapter(SourceAdapter):
    """Mock adapter that loads tenders from JSON file"""
    
    @property
    def name(self) -> str:
        return "mock"
    
    async def fetch(self) -> List[Dict[str, Any]]:
        """Load mock tenders from JSON file"""
        data_path = Path(__file__).parent.parent.parent / "data" / "mock_tenders.json"
        
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def normalize(self, raw_item: Dict[str, Any]) -> TenderCreate:
        """Normalize mock tender data"""
        # Parse dates
        publish_date = None
        if raw_item.get("publish_date"):
            publish_date = datetime.fromisoformat(raw_item["publish_date"]).date()
        
        open_date = None
        if raw_item.get("open_date"):
            open_date = datetime.fromisoformat(raw_item["open_date"]).date()
        
        # Generate external_id if not provided
        external_id = raw_item.get("external_id")
        if not external_id:
            external_id = generate_external_id(
                raw_item.get("title", ""),
                raw_item.get("organization", ""),
                raw_item.get("open_date", "")
            )
        
        return TenderCreate(
            source=self.name,
            external_id=external_id,
            title=raw_item.get("title", ""),
            description=raw_item.get("description"),
            organization=raw_item.get("organization", ""),
            province=raw_item.get("province"),
            process_type=raw_item.get("process_type"),
            category=raw_item.get("category"),
            keywords=raw_item.get("keywords", []),
            publish_date=publish_date,
            open_date=open_date,
            estimated_amount=raw_item.get("estimated_amount"),
            url=raw_item.get("url"),
            raw_payload=raw_item
        )
