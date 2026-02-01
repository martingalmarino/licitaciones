/** Scoring del Simulador de Riesgo - lógica local (sin backend) */
import type { RiskAnswers } from './api/riskClient'

function scorePlazos(days: string): number {
  const s: Record<string, number> = { '<7': 20, '7–14': 12, '15–30': 6, '>30': 2, 'No informado': 8 }
  return s[days] ?? 8
}

function scoreLogistica(cold: string, multi: string, geo: string): number {
  const c: Record<string, number> = { 'Sí': 15, 'No': 0, 'No aplica': 0, 'No sé': 8 }
  const m: Record<string, number> = { 'Sí': 10, 'No': 0 }
  const g: Record<string, number> = { 'Una ciudad': 0, 'Varias ciudades en la provincia': 4, 'Varias provincias': 8, 'No informado': 4 }
  return Math.min(25, (c[cold] ?? 0) + (m[multi] ?? 0) + (g[geo] ?? 4))
}

function scoreRegulatorio(cat: string, trace: string): number {
  const cats: Record<string, number> = {
    'Alto costo / Onco / biológicos': 10,
    'Uso compasivo / especiales': 15,
    'Vacunas / inmunizaciones': 8,
    'Medicación hospitalaria': 6,
    'Insumos hospitalarios': 3,
    'Descartables / material general': 1
  }
  const t: Record<string, number> = { 'Sí': 10, 'No': 0, 'No sé': 6 }
  return Math.min(20, (cats[cat] ?? 3) + (t[trace] ?? 0))
}

function scoreAdministrativo(doc: string, guar: string, pen: string): number {
  const d: Record<string, number> = { 'Baja (estándar)': 3, 'Media (requiere formatos específicos)': 8, 'Alta (muchos anexos/certificaciones/legalizaciones)': 15 }
  const g: Record<string, number> = { 'No': 0, 'Sí: mantenimiento de oferta': 6, 'Sí: mantenimiento + cumplimiento de contrato': 10, 'No informado': 5 }
  const p: Record<string, number> = { 'Sí': 8, 'No': 0, 'No informado': 4 }
  return Math.min(20, (d[doc] ?? 5) + (g[guar] ?? 5) + (p[pen] ?? 4))
}

function scoreFinanciero(amt: string, pay: string): number {
  const a: Record<string, number> = { '< ARS 20M': 2, 'ARS 20–100M': 5, 'ARS 100–300M': 8, '> ARS 300M': 10, 'No informado': 6 }
  const p: Record<string, number> = { '30 días': 2, '60 días': 6, '90+ días': 12, 'No informado': 7 }
  return Math.min(15, (a[amt] ?? 6) + (p[pay] ?? 7))
}

function relationshipAdj(rel: string): number {
  const r: Record<string, number> = {
    'Ya trabajamos y fue fluido': -5,
    'Ya trabajamos y hubo fricción': 5,
    'Nunca trabajamos': 3,
    'No sé': 2
  }
  return r[rel] ?? 2
}

const MOD_ORDER = ['logistica', 'administrativo', 'regulatorio', 'plazos', 'financiero']
const MOD_CAPS: Record<string, number> = { plazos: 20, logistica: 25, regulatorio: 20, administrativo: 20, financiero: 15 }
const MOD_LABELS: Record<string, string> = {
  plazos: 'Plazos',
  logistica: 'Logística',
  regulatorio: 'Regulatorio/Compliance',
  administrativo: 'Administrativo',
  financiero: 'Financiero'
}

function explain(k: string, ans: Record<string, string>): string {
  if (k === 'logistica') {
    const p: string[] = []
    if (ans.cold_chain === 'Sí') p.push('Cadena de frío')
    if (ans.multisite === 'Sí') p.push('multisede')
    if (['Varias ciudades en la provincia', 'Varias provincias'].includes(ans.geo_coverage || '')) p.push('cobertura amplia')
    return p.length ? p.join(' + ') : 'Complejidad logística'
  }
  if (k === 'administrativo') {
    const p: string[] = []
    if ((ans.documentation_level || '').includes('Alta')) p.push('Documentación alta')
    if (ans.penalties_sla === 'Sí') p.push('SLA')
    if ((ans.guarantees || '').includes('cumplimiento')) p.push('garantías')
    return p.length ? p.join(' + ') : 'Requisitos administrativos'
  }
  if (k === 'regulatorio') {
    const c = ans.category || ''
    if (c.includes('Alto costo') || c.includes('Uso compasivo')) return 'Productos especiales / ANMAT'
    if (ans.traceability_anmat === 'Sí') return 'Trazabilidad / ANMAT explícito'
    return 'Categoría regulatoria'
  }
  if (k === 'plazos') {
    const d = ans.days_to_open_range || ''
    if (d === '<7') return 'Plazo muy ajustado'
    if (d === '7–14') return 'Plazo reducido'
    return 'Urgencia temporal'
  }
  if (k === 'financiero') {
    const p: string[] = []
    if ((ans.amount_range || '').includes('300')) p.push('Monto alto')
    if ((ans.payment_terms || '').includes('90')) p.push('pago diferido')
    return p.length ? p.join(' + ') : 'Exposición financiera'
  }
  return ''
}

export function computeRiskLocally(answers: RiskAnswers) {
  const a = answers as unknown as Record<string, string>
  const modules = {
    plazos: scorePlazos(a.days_to_open_range || 'No informado'),
    logistica: scoreLogistica(a.cold_chain || 'No sé', a.multisite || 'No', a.geo_coverage || 'No informado'),
    regulatorio: scoreRegulatorio(a.category || 'Insumos hospitalarios', a.traceability_anmat || 'No sé'),
    administrativo: scoreAdministrativo(a.documentation_level || 'Baja (estándar)', a.guarantees || 'No informado', a.penalties_sla || 'No informado'),
    financiero: scoreFinanciero(a.amount_range || 'No informado', a.payment_terms || 'No informado')
  }
  const total = Math.max(0, Math.min(100, Object.values(modules).reduce((s, v) => s + v, 0) + relationshipAdj(a.relationship_history || 'No sé')))
  const tier = total <= 35 ? 'BAJO' : total <= 65 ? 'MEDIO' : 'ALTO'

  const sorted = [...Object.keys(modules)].sort((x, y) => {
    const dx = modules[x as keyof typeof modules]
    const dy = modules[y as keyof typeof modules]
    if (dy !== dx) return dy - dx
    return MOD_ORDER.indexOf(x) - MOD_ORDER.indexOf(y)
  })
  const top3 = sorted.slice(0, 3).map(k => {
    const cap = MOD_CAPS[k] ?? 20
    const lab = MOD_LABELS[k] ?? k
    return `${lab} (${modules[k as keyof typeof modules]}/${cap}): ${explain(k, a)}`
  })

  const checklist = generateChecklist(a)
  return { risk_total: total, tier, module_scores: modules, top_risks: top3, checklist }
}

function generateChecklist(a: Record<string, string>): { id: string; label: string; category: string; enabled: boolean }[] {
  const items: { id: string; label: string; category: string; enabled: boolean }[] = []
  items.push({ id: 'c1', label: 'Confirmar fechas críticas (apertura, consultas, entrega de muestras si aplica)', category: 'General', enabled: true })
  items.push({ id: 'c2', label: 'Identificar responsables internos (legal, logística, compras, comercial)', category: 'General', enabled: true })
  items.push({ id: 'c3', label: 'Crear carpeta de proceso con estructura estándar', category: 'General', enabled: true })
  items.push({ id: 'c4', label: 'Verificar alcance del pliego vs capacidad real', category: 'General', enabled: true })

  const doc = a.documentation_level || ''
  const docEnabled = doc.includes('Media') || doc.includes('Alta')
  items.push({ id: 'c5', label: 'Validar certificaciones y formularios obligatorios', category: 'Documentación', enabled: docEnabled })
  items.push({ id: 'c6', label: 'Verificar firma, legalizaciones y formatos exigidos', category: 'Documentación', enabled: docEnabled })
  items.push({ id: 'c7', label: 'Preparar cronograma interno "D-10 / D-5 / D-2"', category: 'Documentación', enabled: docEnabled })

  const guar = a.guarantees || ''
  const guarEnabled = !!(guar && guar !== 'No')
  items.push({ id: 'c8', label: 'Calcular y aprobar internamente montos y condiciones de garantía', category: 'Garantías', enabled: guarEnabled })
  items.push({ id: 'c9', label: 'Definir instrumento / entidad emisora', category: 'Garantías', enabled: guarEnabled })
  items.push({ id: 'c10', label: 'Checklist de vencimientos y renovación', category: 'Garantías', enabled: guarEnabled })

  const coldEnabled = a.cold_chain === 'Sí'
  items.push({ id: 'c11', label: 'Confirmar embalaje térmico y validación de temperatura', category: 'Cadena de frío', enabled: coldEnabled })
  items.push({ id: 'c12', label: 'Definir trazabilidad de temperatura (registro)', category: 'Cadena de frío', enabled: coldEnabled })
  items.push({ id: 'c13', label: 'Plan de contingencia ante desvíos / demoras', category: 'Cadena de frío', enabled: coldEnabled })
  items.push({ id: 'c14', label: 'Confirmar condiciones de recepción en el efector', category: 'Cadena de frío', enabled: coldEnabled })

  const traceEnabled = a.traceability_anmat === 'Sí'
  items.push({ id: 'c15', label: 'Verificar requisitos de lote/serie por renglón', category: 'ANMAT/Trazabilidad', enabled: traceEnabled })
  items.push({ id: 'c16', label: 'Documentación de origen y habilitaciones', category: 'ANMAT/Trazabilidad', enabled: traceEnabled })
  items.push({ id: 'c17', label: 'Procedimiento de devoluciones / recall', category: 'ANMAT/Trazabilidad', enabled: traceEnabled })

  const multiEnabled = a.multisite === 'Sí'
  items.push({ id: 'c18', label: 'Mapa de efectores y ventanas de entrega por sede', category: 'Multisede', enabled: multiEnabled })
  items.push({ id: 'c19', label: 'Plan de ruteo y consolidación', category: 'Multisede', enabled: multiEnabled })
  items.push({ id: 'c20', label: 'Confirmar responsables de recepción por sede', category: 'Multisede', enabled: multiEnabled })

  const payEnabled = a.payment_terms === '90+ días'
  items.push({ id: 'c21', label: 'Evaluación de riesgo financiero institucional', category: 'Finanzas', enabled: payEnabled })
  items.push({ id: 'c22', label: 'Plan de cobertura de flujo de caja', category: 'Finanzas', enabled: payEnabled })
  items.push({ id: 'c23', label: 'Revisar condiciones de actualización/redeterminación (si aplica)', category: 'Finanzas', enabled: payEnabled })

  const daysEnabled = a.days_to_open_range === '<7'
  items.push({ id: 'c24', label: 'Reunión interna "war room" hoy (30 min)', category: 'Plazos', enabled: daysEnabled })
  items.push({ id: 'c25', label: 'Asignación de tareas por responsable con deadlines diarios', category: 'Plazos', enabled: daysEnabled })
  items.push({ id: 'c26', label: 'Usar plantillas estándar de documentación', category: 'Plazos', enabled: daysEnabled })

  return items
}

const STORAGE_KEY = 'cofarsur_risk_demo'

export function saveDemoAssessment(id: string, data: Record<string, unknown>) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  all.push({ id, ...data })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getDemoAssessment(id: string): Record<string, unknown> | null {
  const all: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  return all.find((x: Record<string, unknown>) => x.id === id) || null
}

export function listDemoAssessments(): Array<{ id: string; created_at: string; institution_type?: string; province?: string; modality?: string; risk_total: number; tier: string }> {
  const all: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  return all
    .map((x: Record<string, unknown>) => ({
      id: x.id as string,
      created_at: (x.created_at as string) || new Date().toISOString(),
      institution_type: x.institution_type as string,
      province: x.province as string,
      modality: x.modality as string,
      risk_total: (x.risk_total as number) || 0,
      tier: (x.tier as string) || 'MEDIO'
    }))
    .reverse()
}
