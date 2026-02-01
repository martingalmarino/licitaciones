from datetime import date, datetime
from typing import Dict, Any, List
import json
from pathlib import Path
from app.models import Priority
from app.utils.text import normalize_text

# Load catalog keywords
CATALOG_PATH = Path(__file__).parent.parent / "data" / "catalog_keywords.json"
ACCOUNTS_PATH = Path(__file__).parent.parent / "data" / "accounts.json"


def load_catalog_keywords() -> Dict[str, List[str]]:
    """Load catalog keywords from JSON file"""
    try:
        with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def load_accounts() -> Dict[str, Dict[str, str]]:
    """Load known accounts from JSON file"""
    try:
        with open(ACCOUNTS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def score_catalog_match(title: str, description: str, keywords: List[str] = None) -> tuple[int, Dict[str, Any]]:
    """
    Score based on catalog keyword matches (0-30 points)
    Returns: (score, breakdown_dict)
    """
    catalog = load_catalog_keywords()
    
    text = f"{title} {description or ''}".lower()
    if keywords:
        text += " " + " ".join(keywords).lower()
    
    hits = 0
    matched_families = []
    
    for family, family_keywords in catalog.items():
        for keyword in family_keywords:
            if keyword.lower() in text:
                hits += 1
                if family not in matched_families:
                    matched_families.append(family)
                break  # Count each family only once
    
    # Base score on hit count
    if hits == 0:
        score = 0
    elif hits <= 2:
        score = 10
    elif hits <= 5:
        score = 20
    else:
        score = 30
    
    # Bonus for "alto costo" or "uso compasivo"
    bonus_keywords = ["alto costo", "uso compasivo", "altocosto"]
    has_bonus = any(bk in text for bk in bonus_keywords)
    if has_bonus and score < 30:
        score = min(30, score + 5)
    
    return score, {
        "hits": hits,
        "matched_families": matched_families,
        "bonus_applied": has_bonus
    }


def score_administrative_complexity(title: str, description: str) -> tuple[int, Dict[str, Any]]:
    """
    Score based on administrative complexity (0-20 points)
    Returns: (score, breakdown_dict)
    """
    text = f"{title} {description or ''}".lower()
    
    score = 5  # Base score
    
    complexity_keywords = {
        "importación": 5,
        "trazabilidad": 5,
        "cadena de frío": 5,
        "multisede": 5,
        "consolidada": 5,
        "anmat": 5,
        "lote": 2,
        "serie": 2
    }
    
    matched = []
    for keyword, points in complexity_keywords.items():
        if keyword in text:
            score += points
            matched.append(keyword)
    
    score = min(20, score)  # Cap at 20
    
    return score, {
        "matched_keywords": matched,
        "base_score": 5
    }


def score_time_window(open_date: date) -> tuple[int, Dict[str, Any]]:
    """
    Score based on time until open date (0-15 points)
    Returns: (score, breakdown_dict)
    """
    if not open_date:
        return 3, {"reason": "no_open_date"}
    
    today = date.today()
    days_to_open = (open_date - today).days
    
    if days_to_open >= 20:
        score = 15
    elif days_to_open >= 10:
        score = 8
    elif days_to_open >= 7:
        score = 4
    else:
        score = 0
    
    return score, {
        "days_to_open": days_to_open,
        "open_date": open_date.isoformat()
    }


def score_institution_type(organization: str) -> tuple[int, Dict[str, Any]]:
    """
    Score based on institution type (0-15 points)
    Returns: (score, breakdown_dict)
    """
    org_lower = organization.lower()
    
    if "ministerio" in org_lower:
        score = 15
        type_detected = "Ministerio"
    elif "hospital" in org_lower:
        score = 12
        type_detected = "Hospital"
    elif "municipalidad" in org_lower:
        score = 6
        type_detected = "Municipalidad"
    else:
        score = 5
        type_detected = "Otro"
    
    return score, {
        "type_detected": type_detected
    }


def score_relationship(organization: str) -> tuple[int, Dict[str, Any]]:
    """
    Score based on known account relationship (0-10 points)
    Returns: (score, breakdown_dict)
    """
    accounts = load_accounts()
    org_normalized = normalize_text(organization)
    
    for account_name, account_data in accounts.items():
        if normalize_text(account_name) == org_normalized:
            relationship = account_data.get("relationship", "unknown")
            if relationship == "habitual":
                return 10, {"account": account_name, "relationship": "habitual"}
            elif relationship == "occasional":
                return 5, {"account": account_name, "relationship": "occasional"}
    
    return 0, {"account": None}


def score_tender(
    title: str,
    description: str,
    organization: str,
    open_date: date = None,
    keywords: List[str] = None
) -> tuple[int, Dict[str, Any], Priority]:
    """
    Compute total score and breakdown for a tender
    Returns: (score_total, breakdown_dict, priority)
    """
    breakdown = {}
    
    # A) Catalog match (0-30)
    cat_score, cat_breakdown = score_catalog_match(title, description, keywords)
    breakdown["catalog_match"] = {
        "score": cat_score,
        "max": 30,
        "details": cat_breakdown
    }
    
    # B) Administrative complexity (0-20)
    admin_score, admin_breakdown = score_administrative_complexity(title, description)
    breakdown["administrative_complexity"] = {
        "score": admin_score,
        "max": 20,
        "details": admin_breakdown
    }
    
    # C) Time window (0-15)
    time_score, time_breakdown = score_time_window(open_date)
    breakdown["time_window"] = {
        "score": time_score,
        "max": 15,
        "details": time_breakdown
    }
    
    # D) Institution type (0-15)
    inst_score, inst_breakdown = score_institution_type(organization)
    breakdown["institution_type"] = {
        "score": inst_score,
        "max": 15,
        "details": inst_breakdown
    }
    
    # E) Relationship (0-10)
    rel_score, rel_breakdown = score_relationship(organization)
    breakdown["relationship"] = {
        "score": rel_score,
        "max": 10,
        "details": rel_breakdown
    }
    
    # Total score (max 90)
    total_score = cat_score + admin_score + time_score + inst_score + rel_score
    total_score = min(90, total_score)  # Cap at 90
    
    breakdown["total"] = total_score
    breakdown["max_possible"] = 90
    
    # Priority tier
    if total_score >= 65:
        priority = Priority.HIGH
    elif total_score >= 40:
        priority = Priority.MEDIUM
    else:
        priority = Priority.LOW
    
    return total_score, breakdown, priority
