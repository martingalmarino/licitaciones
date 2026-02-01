"""API del Simulador de Riesgo."""
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db import get_db
from app.models import RiskAssessment
from app.risk_scoring import (
    compute_module_scores,
    compute_total_and_tier,
    get_top_risks,
    generate_checklist,
)
from app.risk_pdf import build_risk_pdf

router = APIRouter(prefix="/risk-assessments", tags=["risk-simulator"])


class RiskAnswers(BaseModel):
    institution_type: str = ""
    province: str = ""
    modality: str = ""
    amount_range: str = ""
    days_to_open_range: str = ""
    category: str = ""
    cold_chain: str = ""
    traceability_anmat: str = ""
    multisite: str = ""
    geo_coverage: str = ""
    documentation_level: str = ""
    guarantees: str = ""
    payment_terms: str = ""
    penalties_sla: str = ""
    relationship_history: str = ""
    lead_name: Optional[str] = None
    lead_role: Optional[str] = None
    lead_institution: Optional[str] = None
    lead_email: Optional[str] = None


@router.post("")
def create_assessment(answers: RiskAnswers, db: Session = Depends(get_db)):
    """Crea una evaluación de riesgo y retorna scores + checklist."""
    ans = answers.model_dump()
    answer_keys = [
        "institution_type", "province", "modality", "amount_range", "days_to_open_range",
        "category", "cold_chain", "traceability_anmat", "multisite", "geo_coverage",
        "documentation_level", "guarantees", "payment_terms", "penalties_sla", "relationship_history",
    ]
    answers_dict = {k: (ans.get(k) or "") for k in answer_keys}

    module_scores = compute_module_scores(answers_dict)
    risk_total, tier = compute_total_and_tier(
        module_scores, answers_dict.get("relationship_history", "No sé")
    )
    top_risks = get_top_risks(module_scores, answers_dict)
    checklist = generate_checklist(answers_dict)

    record = RiskAssessment(
        institution_type=answers.institution_type,
        province=answers.province,
        modality=answers.modality,
        amount_range=answers.amount_range,
        days_to_open_range=answers.days_to_open_range,
        category=answers.category,
        cold_chain=answers.cold_chain,
        traceability_anmat=answers.traceability_anmat,
        multisite=answers.multisite,
        geo_coverage=answers.geo_coverage,
        documentation_level=answers.documentation_level,
        guarantees=answers.guarantees,
        payment_terms=answers.payment_terms,
        penalties_sla=answers.penalties_sla,
        relationship_history=answers.relationship_history,
        risk_total=risk_total,
        tier=tier,
        module_scores=json.dumps(module_scores),
        top_risks=json.dumps(top_risks),
        checklist=json.dumps(checklist),
        lead_name=answers.lead_name,
        lead_role=answers.lead_role,
        lead_institution=answers.lead_institution,
        lead_email=answers.lead_email,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "created_at": record.created_at.isoformat(),
        "risk_total": risk_total,
        "tier": tier,
        "module_scores": module_scores,
        "top_risks": top_risks,
        "checklist": checklist,
        "answers": answers_dict,
    }


@router.get("")
def list_assessments(
    tier: Optional[str] = Query(None),
    province: Optional[str] = Query(None),
    modality: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Lista evaluaciones con filtros y paginación."""
    q = db.query(RiskAssessment)
    if tier:
        q = q.filter(RiskAssessment.tier == tier)
    if province:
        q = q.filter(RiskAssessment.province == province)
    if modality:
        q = q.filter(RiskAssessment.modality == modality)
    total = q.count()
    rows = q.order_by(RiskAssessment.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "institution_type": r.institution_type,
            "province": r.province,
            "modality": r.modality,
            "risk_total": r.risk_total,
            "tier": r.tier,
        }
        for r in rows
    ]
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/{id}")
def get_assessment(id: str, db: Session = Depends(get_db)):
    """Obtiene una evaluación completa."""
    r = db.query(RiskAssessment).filter(RiskAssessment.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return {
        "id": r.id,
        "created_at": r.created_at.isoformat(),
        "institution_type": r.institution_type,
        "province": r.province,
        "modality": r.modality,
        "amount_range": r.amount_range,
        "days_to_open_range": r.days_to_open_range,
        "category": r.category,
        "cold_chain": r.cold_chain,
        "traceability_anmat": r.traceability_anmat,
        "multisite": r.multisite,
        "geo_coverage": r.geo_coverage,
        "documentation_level": r.documentation_level,
        "guarantees": r.guarantees,
        "payment_terms": r.payment_terms,
        "penalties_sla": r.penalties_sla,
        "relationship_history": r.relationship_history,
        "risk_total": r.risk_total,
        "tier": r.tier,
        "module_scores": json.loads(r.module_scores) if r.module_scores else {},
        "top_risks": json.loads(r.top_risks) if r.top_risks else [],
        "checklist": json.loads(r.checklist) if r.checklist else [],
        "answers": {
            "institution_type": r.institution_type,
            "province": r.province,
            "modality": r.modality,
            "amount_range": r.amount_range,
            "days_to_open_range": r.days_to_open_range,
            "category": r.category,
            "cold_chain": r.cold_chain,
            "traceability_anmat": r.traceability_anmat,
            "multisite": r.multisite,
            "geo_coverage": r.geo_coverage,
            "documentation_level": r.documentation_level,
            "guarantees": r.guarantees,
            "payment_terms": r.payment_terms,
            "penalties_sla": r.penalties_sla,
            "relationship_history": r.relationship_history,
        },
    }


@router.get("/{id}/pdf")
def get_assessment_pdf(id: str, db: Session = Depends(get_db)):
    """Genera y descarga el PDF del informe."""
    r = db.query(RiskAssessment).filter(RiskAssessment.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")

    module_scores = json.loads(r.module_scores) if r.module_scores else {}
    top_risks = json.loads(r.top_risks) if r.top_risks else []
    checklist = json.loads(r.checklist) if r.checklist else []

    pdf_bytes = build_risk_pdf(
        assessment_id=r.id,
        created_at=r.created_at.strftime("%Y-%m-%d %H:%M"),
        institution_type=r.institution_type or "",
        province=r.province or "",
        modality=r.modality or "",
        risk_total=r.risk_total or 0,
        tier=r.tier or "MEDIO",
        module_scores=module_scores,
        top_risks=top_risks,
        checklist=checklist,
    )

    date_str = r.created_at.strftime("%Y%m%d")
    filename = f"cofarsur_riesgo_{date_str}_{r.id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
