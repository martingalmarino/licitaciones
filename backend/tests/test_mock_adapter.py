import pytest
from app.adapters.mock import MockSourceAdapter
from app.schemas import TenderCreate


@pytest.mark.asyncio
async def test_mock_adapter_fetch():
    """Test that mock adapter fetches tenders"""
    adapter = MockSourceAdapter()
    items = await adapter.fetch()
    
    assert len(items) > 0
    assert isinstance(items, list)
    assert "title" in items[0]
    assert "organization" in items[0]


@pytest.mark.asyncio
async def test_mock_adapter_normalize():
    """Test that mock adapter normalizes correctly"""
    adapter = MockSourceAdapter()
    items = await adapter.fetch()
    
    if items:
        raw_item = items[0]
        normalized = adapter.normalize(raw_item)
        
        assert isinstance(normalized, TenderCreate)
        assert normalized.source == "mock"
        assert normalized.title is not None
        assert normalized.organization is not None
        assert normalized.external_id is not None


@pytest.mark.asyncio
async def test_mock_adapter_external_id_generation():
    """Test that external_id is generated if missing"""
    adapter = MockSourceAdapter()
    
    raw_item = {
        "title": "Test Tender",
        "organization": "Test Hospital",
        "open_date": "2024-02-20T00:00:00"
    }
    
    normalized = adapter.normalize(raw_item)
    assert normalized.external_id is not None
    assert len(normalized.external_id) > 0
