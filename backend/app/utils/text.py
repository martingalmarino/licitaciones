import re
import hashlib
from typing import List


def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text (simple tokenization)"""
    if not text:
        return []
    
    # Convert to lowercase and split by non-alphanumeric
    words = re.findall(r'\b\w+\b', text.lower())
    # Filter out very short words and common stop words
    stop_words = {'el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'o', 'a', 'por', 'para', 'con', 'sin', 'sobre', 'entre'}
    keywords = [w for w in words if len(w) > 3 and w not in stop_words]
    return list(set(keywords))  # Remove duplicates


def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text.strip().lower())


def generate_external_id(title: str, organization: str, open_date: str = None) -> str:
    """Generate a stable external_id from title, organization, and date"""
    combined = f"{normalize_text(title)}|{normalize_text(organization)}|{open_date or ''}"
    return hashlib.md5(combined.encode()).hexdigest()
