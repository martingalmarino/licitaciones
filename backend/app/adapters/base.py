from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.schemas import TenderCreate


class SourceAdapter(ABC):
    """Base class for source adapters"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the source"""
        pass
    
    @abstractmethod
    async def fetch(self) -> List[Dict[str, Any]]:
        """
        Fetch raw items from the source
        Returns: List of raw item dictionaries
        """
        pass
    
    @abstractmethod
    def normalize(self, raw_item: Dict[str, Any]) -> TenderCreate:
        """
        Normalize a raw item into a TenderCreate schema
        """
        pass
