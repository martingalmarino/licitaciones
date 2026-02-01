import pytest
from sqlalchemy.orm import Session
from app.db import SessionLocal, init_db, engine
from app.models import Tender
from app.crud import upsert_tender, get_tender
from app.schemas import TenderCreate
from datetime import date


@pytest.fixture
def db():
    """Create a test database session"""
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up test database
        from app.models import Base
        Base.metadata.drop_all(bind=engine)


def test_upsert_create_new(db: Session):
    """Test creating a new tender via upsert"""
    tender_data = TenderCreate(
        source="test",
        external_id="test_001",
        title="Test Tender",
        description="Test description",
        organization="Test Hospital",
        province="Buenos Aires",
        open_date=date.today()
    )
    
    tender = upsert_tender(db, tender_data)
    
    assert tender.id is not None
    assert tender.title == "Test Tender"
    assert tender.source == "test"
    assert tender.external_id == "test_001"
    assert tender.score_total >= 0


def test_upsert_update_existing(db: Session):
    """Test updating an existing tender via upsert"""
    # Create first
    tender_data = TenderCreate(
        source="test",
        external_id="test_002",
        title="Original Title",
        description="Original description",
        organization="Test Hospital",
        province="Buenos Aires"
    )
    
    tender1 = upsert_tender(db, tender_data)
    original_id = tender1.id
    
    # Update
    updated_data = TenderCreate(
        source="test",
        external_id="test_002",
        title="Updated Title",
        description="Updated description",
        organization="Test Hospital",
        province="Córdoba"
    )
    
    tender2 = upsert_tender(db, updated_data)
    
    assert tender2.id == original_id
    assert tender2.title == "Updated Title"
    assert tender2.province == "Córdoba"


def test_upsert_same_source_external_id(db: Session):
    """Test that same source+external_id updates, different creates"""
    # First tender
    tender1_data = TenderCreate(
        source="test",
        external_id="test_003",
        title="Tender 1",
        organization="Hospital A"
    )
    tender1 = upsert_tender(db, tender1_data)
    
    # Same source+external_id should update
    tender1_data_updated = TenderCreate(
        source="test",
        external_id="test_003",
        title="Tender 1 Updated",
        organization="Hospital A"
    )
    tender1_updated = upsert_tender(db, tender1_data_updated)
    assert tender1_updated.id == tender1.id
    
    # Different external_id should create new
    tender2_data = TenderCreate(
        source="test",
        external_id="test_004",
        title="Tender 2",
        organization="Hospital B"
    )
    tender2 = upsert_tender(db, tender2_data)
    assert tender2.id != tender1.id
