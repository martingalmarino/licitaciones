"""Tests para el Simulador de Riesgo."""
import pytest
from app.risk_scoring import (
    score_plazos,
    score_logistica,
    score_regulatorio,
    score_administrativo,
    score_financiero,
    relationship_adjustment,
    compute_module_scores,
    compute_total_and_tier,
    get_top_risks,
    generate_checklist,
)


# --- Plazos ---
def test_plazos_menos_7():
    assert score_plazos("<7") == 20


def test_plazos_7_14():
    assert score_plazos("7–14") == 12


def test_plazos_15_30():
    assert score_plazos("15–30") == 6


def test_plazos_mas_30():
    assert score_plazos(">30") == 2


def test_plazos_no_informado():
    assert score_plazos("No informado") == 8


# --- Logística (cap 25) ---
def test_logistica_cold_chain_si():
    assert score_logistica("Sí", "No", "No informado") == 15


def test_logistica_multisite_si():
    assert score_logistica("No", "Sí", "Una ciudad") == 10


def test_logistica_cap_25():
    s = score_logistica("Sí", "Sí", "Varias provincias")
    assert s == 25


# --- Regulatorio (cap 20) ---
def test_regulatorio_uso_compasivo():
    assert score_regulatorio("Uso compasivo / especiales", "No") == 15


def test_regulatorio_traceability_si():
    assert score_regulatorio("Insumos hospitalarios", "Sí") == 13


def test_regulatorio_cap():
    s = score_regulatorio("Uso compasivo / especiales", "Sí")
    assert s == 20


# --- Administrativo (cap 20) ---
def test_administrativo_alta():
    s = score_administrativo("Alta (muchos anexos/certificaciones/legalizaciones)", "No", "No")
    assert s == 15


# --- Financiero (cap 15) ---
def test_financiero_90_dias():
    s = score_financiero("> ARS 300M", "90+ días")
    assert s == 15


# --- Relationship adjustment ---
def test_relationship_fluido():
    assert relationship_adjustment("Ya trabajamos y fue fluido") == -5


def test_relationship_friccion():
    assert relationship_adjustment("Ya trabajamos y hubo fricción") == 5


# --- Total and tier ---
def test_tier_bajo():
    mods = {"plazos": 2, "logistica": 0, "regulatorio": 1, "administrativo": 3, "financiero": 2}
    total, tier = compute_total_and_tier(mods, "Ya trabajamos y fue fluido")
    assert total <= 35
    assert tier == "BAJO"


def test_tier_alto():
    mods = {"plazos": 20, "logistica": 25, "regulatorio": 20, "administrativo": 20, "financiero": 15}
    total, tier = compute_total_and_tier(mods, "Nunca trabajamos")
    assert total >= 66
    assert tier == "ALTO"


def test_total_cap_100():
    mods = {"plazos": 20, "logistica": 25, "regulatorio": 20, "administrativo": 20, "financiero": 15}
    total, _ = compute_total_and_tier(mods, "Ya trabajamos y hubo fricción")
    assert total == 100


def test_negative_adjustment():
    mods = {"plazos": 6, "logistica": 0, "regulatorio": 3, "administrativo": 5, "financiero": 5}
    total, tier = compute_total_and_tier(mods, "Ya trabajamos y fue fluido")
    assert total == max(0, 6 + 0 + 3 + 5 + 5 - 5)


# --- Top risks ---
def test_top_risks_ordering():
    mods = {"plazos": 20, "logistica": 25, "regulatorio": 15, "administrativo": 18, "financiero": 10}
    ans = {"cold_chain": "Sí", "multisite": "Sí", "documentation_level": "Alta", "penalties_sla": "Sí"}
    top = get_top_risks(mods, ans)
    assert len(top) == 3
    assert "Logística" in top[0]


# --- Checklist ---
def test_checklist_always_has_general():
    ans = {}
    items = generate_checklist(ans)
    general = [i for i in items if i["category"] == "General" and i["enabled"]]
    assert len(general) >= 4


def test_checklist_cold_chain_enabled():
    ans = {"cold_chain": "Sí"}
    items = generate_checklist(ans)
    cold = [i for i in items if i["category"] == "Cadena de frío" and i["enabled"]]
    assert len(cold) >= 1


def test_checklist_multisite_enabled():
    ans = {"multisite": "Sí"}
    items = generate_checklist(ans)
    multi = [i for i in items if i["category"] == "Multisede" and i["enabled"]]
    assert len(multi) >= 1


def test_checklist_documentation_media():
    ans = {"documentation_level": "Media (requiere formatos específicos)"}
    items = generate_checklist(ans)
    doc = [i for i in items if i["category"] == "Documentación" and i["enabled"]]
    assert len(doc) >= 1
