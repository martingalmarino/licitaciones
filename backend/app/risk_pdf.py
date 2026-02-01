"""Generación de PDF para informe de riesgo."""
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


def build_risk_pdf(
    assessment_id: str,
    created_at: str,
    institution_type: str,
    province: str,
    modality: str,
    risk_total: int,
    tier: str,
    module_scores: dict,
    top_risks: list,
    checklist: list,
) -> bytes:
    """Genera un PDF de 1-2 páginas con el informe de riesgo."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1.5*cm, bottomMargin=1.5*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Heading1"], fontSize=16, spaceAfter=12
    )

    flow = []

    flow.append(Paragraph("Informe de Riesgo de Proceso de Licitación", title_style))
    flow.append(Paragraph(f"Fecha: {created_at}", styles["Normal"]))
    flow.append(Spacer(1, 0.8*cm))

    flow.append(Paragraph("<b>Datos del proceso</b>", styles["Heading2"]))
    flow.append(Paragraph(f"Institución: {institution_type or '—'}", styles["Normal"]))
    flow.append(Paragraph(f"Provincia: {province or '—'}", styles["Normal"]))
    flow.append(Paragraph(f"Modalidad: {modality or '—'}", styles["Normal"]))
    flow.append(Spacer(1, 0.5*cm))

    tier_color = {"BAJO": "green", "MEDIO": "orange", "ALTO": "red"}.get(tier, "gray")
    flow.append(Paragraph(f"<b>Riesgo Total: {risk_total}/100</b>", styles["Heading2"]))
    flow.append(Paragraph(
        f'<font color="{tier_color}"><b>Nivel: {tier}</b></font>',
        styles["Normal"]
    ))
    flow.append(Spacer(1, 0.8*cm))

    flow.append(Paragraph("<b>Desglose por módulos</b>", styles["Heading2"]))
    mod_labels = {
        "plazos": "Plazos",
        "logistica": "Logística",
        "regulatorio": "Regulatorio/Compliance",
        "administrativo": "Administrativo",
        "financiero": "Financiero",
    }
    mod_caps = {"plazos": 20, "logistica": 25, "regulatorio": 20, "administrativo": 20, "financiero": 15}
    table_data = [["Módulo", "Puntaje", "Máximo"]]
    for k, v in module_scores.items():
        cap = mod_caps.get(k, 20)
        table_data.append([mod_labels.get(k, k), str(v), str(cap)])
    t = Table(table_data)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 0.8*cm))

    flow.append(Paragraph("<b>Top 3 riesgos detectados</b>", styles["Heading2"]))
    for r in (top_risks or [])[:3]:
        flow.append(Paragraph(f"• {r}", styles["Normal"]))
    flow.append(Spacer(1, 1*cm))

    flow.append(PageBreak())
    flow.append(Paragraph("<b>Checklist de mitigación</b>", styles["Heading2"]))
    flow.append(Spacer(1, 0.5*cm))

    enabled_items = [c for c in checklist if c.get("enabled")]
    for item in enabled_items:
        flow.append(Paragraph(f"☐ {item.get('label', '')}", styles["Normal"]))
    flow.append(Spacer(1, 0.5*cm))
    flow.append(Paragraph("<b>Próximos pasos</b>", styles["Heading2"]))
    flow.append(Paragraph("Revise el checklist y asigne responsables. Programe reuniones de seguimiento según los plazos del proceso.", styles["Normal"]))

    doc.build(flow)
    return buffer.getvalue()
