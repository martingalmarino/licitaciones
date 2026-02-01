"""
Lógica determinística de scoring para el Simulador de Riesgo.
"""
import json
from typing import Dict, List, Any


def score_plazos(days_to_open_range: str) -> int:
    """Módulo A: Plazos (0-20)"""
    scores = {
        "<7": 20,
        "7–14": 12,
        "15–30": 6,
        ">30": 2,
        "No informado": 8,
    }
    return scores.get(days_to_open_range, 8)


def score_logistica(cold_chain: str, multisite: str, geo_coverage: str) -> int:
    """Módulo B: Logística (0-25 cap)"""
    cold = {"Sí": 15, "No": 0, "No aplica": 0, "No sé": 8}.get(cold_chain, 0)
    multi = {"Sí": 10, "No": 0}.get(multisite, 0)
    geo = {
        "Una ciudad": 0,
        "Varias ciudades en la provincia": 4,
        "Varias provincias": 8,
        "No informado": 4,
    }.get(geo_coverage, 4)
    return min(25, cold + multi + geo)


def score_regulatorio(category: str, traceability_anmat: str) -> int:
    """Módulo C: Regulatorio/Compliance (0-20 cap)"""
    cat = {
        "Alto costo / Onco / biológicos": 10,
        "Uso compasivo / especiales": 15,
        "Vacunas / inmunizaciones": 8,
        "Medicación hospitalaria": 6,
        "Insumos hospitalarios": 3,
        "Descartables / material general": 1,
    }.get(category, 3)
    trace = {"Sí": 10, "No": 0, "No sé": 6}.get(traceability_anmat, 0)
    return min(20, cat + trace)


def score_administrativo(
    documentation_level: str, guarantees: str, penalties_sla: str
) -> int:
    """Módulo D: Administrativo (0-20 cap)"""
    doc = {
        "Baja (estándar)": 3,
        "Media (requiere formatos específicos)": 8,
        "Alta (muchos anexos/certificaciones/legalizaciones)": 15,
    }.get(documentation_level, 5)
    guar = {
        "No": 0,
        "Sí: mantenimiento de oferta": 6,
        "Sí: mantenimiento + cumplimiento de contrato": 10,
        "No informado": 5,
    }.get(guarantees, 5)
    pen = {"Sí": 8, "No": 0, "No informado": 4}.get(penalties_sla, 4)
    return min(20, doc + guar + pen)


def score_financiero(amount_range: str, payment_terms: str) -> int:
    """Módulo E: Financiero (0-15 cap)"""
    amt = {
        "< ARS 20M": 2,
        "ARS 20–100M": 5,
        "ARS 100–300M": 8,
        "> ARS 300M": 10,
        "No informado": 6,
    }.get(amount_range, 6)
    pay = {
        "30 días": 2,
        "60 días": 6,
        "90+ días": 12,
        "No informado": 7,
    }.get(payment_terms, 7)
    return min(15, amt + pay)


def relationship_adjustment(relationship_history: str) -> int:
    """Ajuste por historial (puede ser negativo)"""
    return {
        "Ya trabajamos y fue fluido": -5,
        "Ya trabajamos y hubo fricción": 5,
        "Nunca trabajamos": 3,
        "No sé": 2,
    }.get(relationship_history, 2)


def compute_module_scores(answers: Dict[str, str]) -> Dict[str, int]:
    """Calcula los 5 módulos de riesgo."""
    return {
        "plazos": score_plazos(answers.get("days_to_open_range", "No informado")),
        "logistica": score_logistica(
            answers.get("cold_chain", "No sé"),
            answers.get("multisite", "No"),
            answers.get("geo_coverage", "No informado"),
        ),
        "regulatorio": score_regulatorio(
            answers.get("category", "Insumos hospitalarios"),
            answers.get("traceability_anmat", "No sé"),
        ),
        "administrativo": score_administrativo(
            answers.get("documentation_level", "Baja (estándar)"),
            answers.get("guarantees", "No informado"),
            answers.get("penalties_sla", "No informado"),
        ),
        "financiero": score_financiero(
            answers.get("amount_range", "No informado"),
            answers.get("payment_terms", "No informado"),
        ),
    }


def compute_total_and_tier(
    module_scores: Dict[str, int], relationship_history: str
) -> tuple[int, str]:
    """Total = min(100, A+B+C+D+E + adjustment). Tier según rangos."""
    total = sum(module_scores.values()) + relationship_adjustment(
        relationship_history or "No sé"
    )
    total = max(0, min(100, total))

    if total <= 35:
        tier = "BAJO"
    elif total <= 65:
        tier = "MEDIO"
    else:
        tier = "ALTO"
    return total, tier


MODULE_ORDER = ["logistica", "administrativo", "regulatorio", "plazos", "financiero"]
MODULE_LABELS = {
    "plazos": "Plazos",
    "logistica": "Logística",
    "regulatorio": "Regulatorio/Compliance",
    "administrativo": "Administrativo",
    "financiero": "Financiero",
}

MODULE_CAPS = {"plazos": 20, "logistica": 25, "regulatorio": 20, "administrativo": 20, "financiero": 15}


def _explain_logistica(answers: Dict[str, str]) -> str:
    parts = []
    if answers.get("cold_chain") == "Sí":
        parts.append("Cadena de frío")
    if answers.get("multisite") == "Sí":
        parts.append("multisede")
    if answers.get("geo_coverage") in ("Varias ciudades en la provincia", "Varias provincias"):
        parts.append("cobertura amplia")
    return " + ".join(parts) if parts else "Complejidad logística"


def _explain_administrativo(answers: Dict[str, str]) -> str:
    parts = []
    if "Alta" in (answers.get("documentation_level") or ""):
        parts.append("Documentación alta")
    if answers.get("penalties_sla") == "Sí":
        parts.append("SLA")
    if "cumplimiento" in (answers.get("guarantees") or ""):
        parts.append("garantías")
    return " + ".join(parts) if parts else "Requisitos administrativos"


def _explain_regulatorio(answers: Dict[str, str]) -> str:
    cat = answers.get("category", "")
    if "Alto costo" in cat or "Uso compasivo" in cat:
        return "Productos especiales / ANMAT"
    if answers.get("traceability_anmat") == "Sí":
        return "Trazabilidad / ANMAT explícito"
    return "Categoría regulatoria"


def _explain_plazos(answers: Dict[str, str]) -> str:
    d = answers.get("days_to_open_range", "")
    if d == "<7":
        return "Plazo muy ajustado"
    if d == "7–14":
        return "Plazo reducido"
    return "Urgencia temporal"


def _explain_financiero(answers: Dict[str, str]) -> str:
    parts = []
    if "300" in (answers.get("amount_range") or ""):
        parts.append("Monto alto")
    if "90" in (answers.get("payment_terms") or ""):
        parts.append("pago diferido")
    return " + ".join(parts) if parts else "Exposición financiera"


EXPLAINERS = {
    "logistica": _explain_logistica,
    "administrativo": _explain_administrativo,
    "regulatorio": _explain_regulatorio,
    "plazos": _explain_plazos,
    "financiero": _explain_financiero,
}


def get_top_risks(
    module_scores: Dict[str, int], answers: Dict[str, str]
) -> List[str]:
    """Top 3 riesgos ordenados por score, con prioridad en empates."""
    sorted_keys = sorted(
        module_scores.keys(),
        key=lambda k: (-module_scores[k], MODULE_ORDER.index(k)),
    )
    top3 = sorted_keys[:3]
    result = []
    for k in top3:
        cap = MODULE_CAPS.get(k, 20)
        label = MODULE_LABELS.get(k, k)
        expl = EXPLAINERS.get(k, lambda a: "")(answers)
        result.append(f"{label} ({module_scores[k]}/{cap}): {expl}")
    return result


def generate_checklist(answers: Dict[str, str]) -> List[Dict[str, Any]]:
    """Genera checklist dinámico según respuestas."""
    items = []

    # Siempre habilitados
    items.append({"id": "c1", "label": "Confirmar fechas críticas (apertura, consultas, entrega de muestras si aplica)", "category": "General", "enabled": True})
    items.append({"id": "c2", "label": "Identificar responsables internos (legal, logística, compras, comercial)", "category": "General", "enabled": True})
    items.append({"id": "c3", "label": "Crear carpeta de proceso con estructura estándar", "category": "General", "enabled": True})
    items.append({"id": "c4", "label": "Verificar alcance del pliego vs capacidad real", "category": "General", "enabled": True})

    doc = answers.get("documentation_level", "")
    if doc in ("Media (requiere formatos específicos)", "Alta (muchos anexos/certificaciones/legalizaciones)"):
        items.append({"id": "c5", "label": "Validar certificaciones y formularios obligatorios", "category": "Documentación", "enabled": True})
        items.append({"id": "c6", "label": "Verificar firma, legalizaciones y formatos exigidos", "category": "Documentación", "enabled": True})
        items.append({"id": "c7", "label": "Preparar cronograma interno \"D-10 / D-5 / D-2\"", "category": "Documentación", "enabled": True})
    else:
        items.append({"id": "c5", "label": "Validar certificaciones y formularios obligatorios", "category": "Documentación", "enabled": False})
        items.append({"id": "c6", "label": "Verificar firma, legalizaciones y formatos exigidos", "category": "Documentación", "enabled": False})
        items.append({"id": "c7", "label": "Preparar cronograma interno \"D-10 / D-5 / D-2\"", "category": "Documentación", "enabled": False})

    guar = answers.get("guarantees", "")
    if guar and guar != "No":
        items.append({"id": "c8", "label": "Calcular y aprobar internamente montos y condiciones de garantía", "category": "Garantías", "enabled": True})
        items.append({"id": "c9", "label": "Definir instrumento / entidad emisora", "category": "Garantías", "enabled": True})
        items.append({"id": "c10", "label": "Checklist de vencimientos y renovación", "category": "Garantías", "enabled": True})
    else:
        items.append({"id": "c8", "label": "Calcular y aprobar internamente montos y condiciones de garantía", "category": "Garantías", "enabled": False})
        items.append({"id": "c9", "label": "Definir instrumento / entidad emisora", "category": "Garantías", "enabled": False})
        items.append({"id": "c10", "label": "Checklist de vencimientos y renovación", "category": "Garantías", "enabled": False})

    cold = answers.get("cold_chain", "")
    if cold == "Sí":
        items.append({"id": "c11", "label": "Confirmar embalaje térmico y validación de temperatura", "category": "Cadena de frío", "enabled": True})
        items.append({"id": "c12", "label": "Definir trazabilidad de temperatura (registro)", "category": "Cadena de frío", "enabled": True})
        items.append({"id": "c13", "label": "Plan de contingencia ante desvíos / demoras", "category": "Cadena de frío", "enabled": True})
        items.append({"id": "c14", "label": "Confirmar condiciones de recepción en el efector", "category": "Cadena de frío", "enabled": True})
    else:
        items.append({"id": "c11", "label": "Confirmar embalaje térmico y validación de temperatura", "category": "Cadena de frío", "enabled": False})
        items.append({"id": "c12", "label": "Definir trazabilidad de temperatura (registro)", "category": "Cadena de frío", "enabled": False})
        items.append({"id": "c13", "label": "Plan de contingencia ante desvíos / demoras", "category": "Cadena de frío", "enabled": False})
        items.append({"id": "c14", "label": "Confirmar condiciones de recepción en el efector", "category": "Cadena de frío", "enabled": False})

    trace = answers.get("traceability_anmat", "")
    if trace == "Sí":
        items.append({"id": "c15", "label": "Verificar requisitos de lote/serie por renglón", "category": "ANMAT/Trazabilidad", "enabled": True})
        items.append({"id": "c16", "label": "Documentación de origen y habilitaciones", "category": "ANMAT/Trazabilidad", "enabled": True})
        items.append({"id": "c17", "label": "Procedimiento de devoluciones / recall", "category": "ANMAT/Trazabilidad", "enabled": True})
    else:
        items.append({"id": "c15", "label": "Verificar requisitos de lote/serie por renglón", "category": "ANMAT/Trazabilidad", "enabled": False})
        items.append({"id": "c16", "label": "Documentación de origen y habilitaciones", "category": "ANMAT/Trazabilidad", "enabled": False})
        items.append({"id": "c17", "label": "Procedimiento de devoluciones / recall", "category": "ANMAT/Trazabilidad", "enabled": False})

    multi = answers.get("multisite", "")
    if multi == "Sí":
        items.append({"id": "c18", "label": "Mapa de efectores y ventanas de entrega por sede", "category": "Multisede", "enabled": True})
        items.append({"id": "c19", "label": "Plan de ruteo y consolidación", "category": "Multisede", "enabled": True})
        items.append({"id": "c20", "label": "Confirmar responsables de recepción por sede", "category": "Multisede", "enabled": True})
    else:
        items.append({"id": "c18", "label": "Mapa de efectores y ventanas de entrega por sede", "category": "Multisede", "enabled": False})
        items.append({"id": "c19", "label": "Plan de ruteo y consolidación", "category": "Multisede", "enabled": False})
        items.append({"id": "c20", "label": "Confirmar responsables de recepción por sede", "category": "Multisede", "enabled": False})

    pay = answers.get("payment_terms", "")
    if pay == "90+ días":
        items.append({"id": "c21", "label": "Evaluación de riesgo financiero institucional", "category": "Finanzas", "enabled": True})
        items.append({"id": "c22", "label": "Plan de cobertura de flujo de caja", "category": "Finanzas", "enabled": True})
        items.append({"id": "c23", "label": "Revisar condiciones de actualización/redeterminación (si aplica)", "category": "Finanzas", "enabled": True})
    else:
        items.append({"id": "c21", "label": "Evaluación de riesgo financiero institucional", "category": "Finanzas", "enabled": False})
        items.append({"id": "c22", "label": "Plan de cobertura de flujo de caja", "category": "Finanzas", "enabled": False})
        items.append({"id": "c23", "label": "Revisar condiciones de actualización/redeterminación (si aplica)", "category": "Finanzas", "enabled": False})

    days = answers.get("days_to_open_range", "")
    if days == "<7":
        items.append({"id": "c24", "label": "Reunión interna \"war room\" hoy (30 min)", "category": "Plazos", "enabled": True})
        items.append({"id": "c25", "label": "Asignación de tareas por responsable con deadlines diarios", "category": "Plazos", "enabled": True})
        items.append({"id": "c26", "label": "Usar plantillas estándar de documentación", "category": "Plazos", "enabled": True})
    else:
        items.append({"id": "c24", "label": "Reunión interna \"war room\" hoy (30 min)", "category": "Plazos", "enabled": False})
        items.append({"id": "c25", "label": "Asignación de tareas por responsable con deadlines diarios", "category": "Plazos", "enabled": False})
        items.append({"id": "c26", "label": "Usar plantillas estándar de documentación", "category": "Plazos", "enabled": False})

    return [it for it in items if it.get("label")]

