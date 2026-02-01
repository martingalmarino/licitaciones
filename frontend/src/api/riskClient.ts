const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

export interface RiskAnswers {
  institution_type: string
  province: string
  modality: string
  amount_range: string
  days_to_open_range: string
  category: string
  cold_chain: string
  traceability_anmat: string
  multisite: string
  geo_coverage: string
  documentation_level: string
  guarantees: string
  payment_terms: string
  penalties_sla: string
  relationship_history: string
}

export interface RiskAssessment {
  id: string
  created_at: string
  institution_type?: string
  province?: string
  modality?: string
  amount_range?: string
  days_to_open_range?: string
  category?: string
  cold_chain?: string
  traceability_anmat?: string
  multisite?: string
  geo_coverage?: string
  documentation_level?: string
  guarantees?: string
  payment_terms?: string
  penalties_sla?: string
  relationship_history?: string
  risk_total: number
  tier: string
  module_scores: Record<string, number>
  top_risks: string[]
  checklist: { id: string; label: string; category: string; enabled: boolean }[]
  answers?: RiskAnswers
}

export interface RiskAssessmentSummary {
  id: string
  created_at: string
  institution_type?: string
  province?: string
  modality?: string
  risk_total: number
  tier: string
}

export async function createRiskAssessment(answers: RiskAnswers): Promise<RiskAssessment> {
  const res = await fetch(`${API_BASE}/risk-assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  })
  if (!res.ok) throw new Error('Error al crear evaluación')
  return res.json()
}

export async function listRiskAssessments(params?: {
  tier?: string
  province?: string
  modality?: string
  skip?: number
  limit?: number
}): Promise<{ items: RiskAssessmentSummary[]; total: number }> {
  const search = new URLSearchParams()
  if (params?.tier) search.set('tier', params.tier)
  if (params?.province) search.set('province', params.province)
  if (params?.modality) search.set('modality', params.modality)
  if (params?.skip != null) search.set('skip', String(params.skip))
  if (params?.limit != null) search.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/risk-assessments?${search}`)
  if (!res.ok) throw new Error('Error al cargar historial')
  return res.json()
}

export async function getRiskAssessment(id: string): Promise<RiskAssessment> {
  const res = await fetch(`${API_BASE}/risk-assessments/${id}`)
  if (!res.ok) throw new Error('Evaluación no encontrada')
  return res.json()
}

export async function downloadRiskPdf(id: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/risk-assessments/${id}/pdf`)
  if (!res.ok) throw new Error('Error al descargar PDF')
  return res.blob()
}
