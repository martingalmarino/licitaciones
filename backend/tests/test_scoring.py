import pytest
from datetime import date, timedelta
from app.scoring import (
    score_catalog_match,
    score_administrative_complexity,
    score_time_window,
    score_institution_type,
    score_relationship,
    score_tender
)
from app.models import Priority


def test_score_catalog_match_high():
    """Test catalog match with many keyword hits"""
    title = "Medicamentos Oncológicos de Alto Costo para Tratamiento de Cáncer"
    description = "Incluye quimioterapia, radioterapia y terapia biológica"
    score, breakdown = score_catalog_match(title, description)
    assert score >= 20
    assert breakdown["hits"] > 0


def test_score_catalog_match_bonus():
    """Test catalog match with alto costo bonus"""
    title = "Medicamentos de Alto Costo y Uso Compasivo"
    description = "Tratamiento especializado"
    score, breakdown = score_catalog_match(title, description)
    assert breakdown["bonus_applied"] is True


def test_score_administrative_complexity_import():
    """Test administrative complexity with import keywords"""
    title = "Importación de Medicamentos con Trazabilidad"
    description = "Requiere cadena de frío y certificación ANMAT"
    score, breakdown = score_administrative_complexity(title, description)
    assert score >= 15
    assert "importación" in breakdown["matched_keywords"]


def test_score_administrative_complexity_cold_chain():
    """Test administrative complexity with cold chain"""
    title = "Medicamentos con Cadena de Frío"
    description = "Conservación a temperatura controlada"
    score, breakdown = score_administrative_complexity(title, description)
    assert score >= 10
    assert "cadena de frío" in breakdown["matched_keywords"]


def test_score_time_window_far():
    """Test time window scoring for far future dates"""
    future_date = date.today() + timedelta(days=25)
    score, breakdown = score_time_window(future_date)
    assert score == 15
    assert breakdown["days_to_open"] >= 20


def test_score_time_window_near():
    """Test time window scoring for near dates"""
    near_date = date.today() + timedelta(days=5)
    score, breakdown = score_time_window(near_date)
    assert score == 0
    assert breakdown["days_to_open"] < 7


def test_score_institution_type_ministerio():
    """Test institution type scoring for Ministerio"""
    org = "Ministerio de Salud de la Nación"
    score, breakdown = score_institution_type(org)
    assert score == 15
    assert breakdown["type_detected"] == "Ministerio"


def test_score_institution_type_hospital():
    """Test institution type scoring for Hospital"""
    org = "Hospital Rawson"
    score, breakdown = score_institution_type(org)
    assert score == 12
    assert breakdown["type_detected"] == "Hospital"


def test_score_relationship_habitual():
    """Test relationship scoring for habitual account"""
    org = "Hospital Rawson"
    score, breakdown = score_relationship(org)
    assert score == 10
    assert breakdown["relationship"] == "habitual"


def test_score_relationship_occasional():
    """Test relationship scoring for occasional account"""
    org = "Hospital Alemán"
    score, breakdown = score_relationship(org)
    assert score == 5
    assert breakdown["relationship"] == "occasional"


def test_score_tender_high_priority():
    """Test complete scoring for high priority tender"""
    title = "Medicamentos Oncológicos de Alto Costo con Trazabilidad"
    description = "Importación de medicamentos oncológicos con cadena de frío, certificación ANMAT y trazabilidad de lote y serie"
    org = "Hospital Rawson"
    open_date = date.today() + timedelta(days=25)
    
    score, breakdown, priority = score_tender(
        title=title,
        description=description,
        organization=org,
        open_date=open_date
    )
    
    assert score >= 65
    assert priority == Priority.HIGH
    assert breakdown["total"] == score


def test_score_tender_medium_priority():
    """Test complete scoring for medium priority tender"""
    title = "Insumos Hospitalarios Básicos"
    description = "Material descartable y soluciones"
    org = "Hospital de Niños"
    open_date = date.today() + timedelta(days=15)
    
    score, breakdown, priority = score_tender(
        title=title,
        description=description,
        organization=org,
        open_date=open_date
    )
    
    assert 40 <= score < 65
    assert priority == Priority.MEDIUM


def test_score_tender_low_priority():
    """Test complete scoring for low priority tender"""
    title = "Material de Oficina"
    description = "Papel y útiles de escritorio"
    org = "Municipalidad de Córdoba"
    open_date = date.today() + timedelta(days=3)
    
    score, breakdown, priority = score_tender(
        title=title,
        description=description,
        organization=org,
        open_date=open_date
    )
    
    assert score < 40
    assert priority == Priority.LOW
