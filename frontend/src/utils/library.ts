/**
 * Utilidades para la Biblioteca: búsqueda, filtrado y recomendaciones.
 * Todo offline con datos estáticos.
 */

import type { LibraryItem } from '../data/library_items'
import { LIBRARY_ITEMS } from '../data/library_items'
import type { RiskAnswers } from '../api/riskClient'

/** Búsqueda global: título, descripción y labels de steps */
export function searchLibraryItems(
  query: string,
  type?: 'CHECKLIST' | 'PLIEGO'
): LibraryItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return type ? LIBRARY_ITEMS.filter((i) => i.type === type) : [...LIBRARY_ITEMS]

  const pool = type ? LIBRARY_ITEMS.filter((i) => i.type === type) : LIBRARY_ITEMS
  return pool.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(q)
    const inDesc = item.description.toLowerCase().includes(q)
    const inTags = item.tags.some((t) => t.toLowerCase().includes(q))
    const inSteps = item.steps.some((s) => s.label.toLowerCase().includes(q))
    return inTitle || inDesc || inTags || inSteps
  })
}

/** Filtro por tags (intersección) y categoría */
export function filterLibraryItems(
  items: LibraryItem[],
  options: { tags?: string[]; category?: string }
): LibraryItem[] {
  let out = [...items]
  if (options.tags && options.tags.length > 0) {
    const set = new Set(options.tags)
    out = out.filter((i) => i.tags.some((t) => set.has(t)))
  }
  if (options.category) {
    out = out.filter((i) => i.category === options.category)
  }
  return out
}

/** Recomendar ítems por overlap de tags. Ordena por score y devuelve hasta `limit`. */
export function recommendByTags(
  queryTags: string[],
  options: { limit?: number; types?: ('CHECKLIST' | 'PLIEGO')[] } = {}
): Array<{ item: LibraryItem; score: number; matchingTags: string[] }> {
  const limit = options.limit ?? 5
  const types = options.types ?? ['CHECKLIST', 'PLIEGO']

  const pool = LIBRARY_ITEMS.filter((i) => types.includes(i.type))
  const withScores = pool.map((item) => {
    const matchingTags = item.tags.filter((t) => queryTags.includes(t))
    const score = matchingTags.length
    return { item, score, matchingTags }
  })

  return withScores
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Deriva tags de un tender (title, description, category, organization, dates). */
export function deriveTenderTags(tender: {
  title?: string | null
  description?: string | null
  category?: string | null
  organization?: string | null
  publish_date?: string | null
  open_date?: string | null
}): string[] {
  const tags: string[] = []
  const title = (tender.title ?? '').toLowerCase()
  const desc = (tender.description ?? '').toLowerCase()
  const cat = (tender.category ?? '').toLowerCase()
  const org = (tender.organization ?? '').toLowerCase()
  const text = `${title} ${desc} ${cat}`

  if (/cadena de frío|vacunas|frio/.test(text) || /vacunas/.test(cat)) tags.push('cadena_frio')
  if (/alto costo|oncológ|biológic|onco/.test(text)) tags.push('alto_costo')
  if (/anmat|trazabilidad|lote|serie/.test(text)) tags.push('anmat')
  if (/multisede|efector|distribución a|múltiples sedes/.test(text)) tags.push('multisede')
  if (/ministerio/.test(org)) tags.push('ministerio')
  if (/garantía|penalidad|sla/.test(text)) tags.push('garantias')
  if (/uso compasivo|compasivo/.test(text)) tags.push('uso_compasivo')
  if (/insumo crítico|insumos hospitalarios/.test(text)) tags.push('insumos_criticos')
  if (/compra centralizada|centralizada/.test(text)) tags.push('compra_centralizada')
  if (/contratación directa|directa|urgencia/.test(text)) tags.push('contratacion_directa')
  if (/convenio marco/.test(text)) tags.push('convenio_marco')

  if (tender.publish_date && tender.open_date) {
    const open = new Date(tender.open_date).getTime()
    const pub = new Date(tender.publish_date).getTime()
    const daysToOpen = (open - pub) / (1000 * 60 * 60 * 24)
    if (daysToOpen < 7) tags.push('plazo_corto')
  }

  return [...new Set(tags)]
}

/** Mapea respuestas del Simulador de Riesgo a tags para recomendaciones. */
export function riskAnswersToTags(answers: RiskAnswers | Record<string, string>): string[] {
  const a = answers as Record<string, string>
  const tags: string[] = []

  if (a.cold_chain === 'Sí') tags.push('cadena_frio')
  if (a.traceability_anmat === 'Sí') tags.push('anmat')
  if (a.multisite === 'Sí') tags.push('multisede')
  const cat = (a.category ?? '').toLowerCase()
  if (cat.includes('alto costo') || cat.includes('onco') || cat.includes('biológic')) tags.push('alto_costo')
  const inst = (a.institution_type ?? '').toLowerCase()
  if (inst.includes('ministerio')) tags.push('ministerio')
  if ((a.days_to_open_range ?? '') === '<7') tags.push('plazo_corto')
  const guar = (a.guarantees ?? '').toLowerCase()
  if (guar && guar !== 'no') tags.push('garantias')
  if ((a.documentation_level ?? '').toLowerCase().includes('alta')) tags.push('documentacion')
  if (cat.includes('vacuna')) tags.push('vacunas')
  if (cat.includes('insumo')) tags.push('insumos_criticos')

  return [...new Set(tags)]
}

/** Obtener ítem por id */
export function getLibraryItemById(id: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find((i) => i.id === id)
}
