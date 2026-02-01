/**
 * Cálculos de KPIs y utilidades para el Panel de Performance.
 */

import type { SampleTender, TenderStatus } from '../data/sample_tenders'
import type { StatusEvent } from '../data/sample_status_events'

export interface PerformanceFilters {
  province?: string
  owner?: string
  dateFrom?: string
  dateTo?: string
  statuses?: TenderStatus[]
}

export function filterTenders(
  tenders: SampleTender[],
  filters: PerformanceFilters
): SampleTender[] {
  return tenders.filter((t) => {
    if (filters.province && filters.province !== 'Todas' && t.province !== filters.province)
      return false
    if (filters.owner && filters.owner !== 'Todos') {
      if (filters.owner === 'Sin asignar') {
        if (t.owner) return false
      } else if (!t.owner || t.owner !== filters.owner) {
        return false
      }
    }
    const pub = t.publishDate?.slice(0, 10)
    if (filters.dateFrom && pub && pub < filters.dateFrom) return false
    if (filters.dateTo && pub && pub > filters.dateTo) return false
    if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(t.status))
      return false
    return true
  })
}

export interface SummaryKPIs {
  detectadas: number
  trabajadas: number
  presentadas: number
  ganadas: number
  tasaAdjudicacion: number
  tasaDescarte: number
  pipelineActivo: number
}

export function computeSummaryKPIs(tenders: SampleTender[]): SummaryKPIs {
  const total = tenders.length
  const trabajadas = tenders.filter((t) =>
    ['IN_REVIEW', 'SUBMITTED', 'WON', 'LOST'].includes(t.status)
  ).length
  const presentadas = tenders.filter((t) =>
    ['SUBMITTED', 'WON', 'LOST'].includes(t.status)
  ).length
  const ganadas = tenders.filter((t) => t.status === 'WON').length
  const perdidas = tenders.filter((t) => t.status === 'LOST').length
  const descartadas = tenders.filter((t) => t.status === 'DISCARDED').length
  const pipelineActivo = tenders.filter((t) =>
    ['NEW', 'IN_REVIEW'].includes(t.status)
  ).length

  const closed = ganadas + perdidas
  const tasaAdjudicacion = closed > 0 ? ganadas / closed : 0
  const tasaDescarte = total > 0 ? descartadas / total : 0

  return {
    detectadas: total,
    trabajadas,
    presentadas,
    ganadas,
    tasaAdjudicacion,
    tasaDescarte,
    pipelineActivo,
  }
}

export function computeStatusCounts(tenders: SampleTender[]): Record<TenderStatus, number> {
  const counts: Record<TenderStatus, number> = {
    NEW: 0,
    IN_REVIEW: 0,
    DISCARDED: 0,
    SUBMITTED: 0,
    WON: 0,
    LOST: 0,
  }
  for (const t of tenders) {
    if (t.status in counts) counts[t.status as TenderStatus]++
  }
  return counts
}

export interface MonthlyData {
  month: string
  year: number
  label: string
  detectadas: number
  presentadas: number
  ganadas: number
}

export function computeMonthlyTrends(
  tenders: SampleTender[],
  monthsBack = 6
): MonthlyData[] {
  const now = new Date()
  const result: MonthlyData[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const monthStr = `${year}-${month}`
    const nextMonth = new Date(year, d.getMonth() + 1, 1)

    const inMonth = tenders.filter((t) => {
      const pub = new Date(t.publishDate)
      return pub >= d && pub < nextMonth
    })

    const detectadas = inMonth.length
    const presentadas = inMonth.filter((t) =>
      ['SUBMITTED', 'WON', 'LOST'].includes(t.status)
    ).length
    const ganadas = inMonth.filter((t) => t.status === 'WON').length

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    result.push({
      month: monthStr,
      year,
      label: `${monthNames[d.getMonth()]} ${year}`,
      detectadas,
      presentadas,
      ganadas,
    })
  }
  return result
}

export interface ProvinceStat {
  province: string
  total: number
  won: number
}

export function computeProvinceStats(tenders: SampleTender[]): ProvinceStat[] {
  const byProv: Record<string, { total: number; won: number }> = {}
  for (const t of tenders) {
    const p = t.province || 'Sin provincia'
    if (!byProv[p]) byProv[p] = { total: 0, won: 0 }
    byProv[p].total++
    if (t.status === 'WON') byProv[p].won++
  }
  return Object.entries(byProv).map(([province, v]) => ({
    province,
    total: v.total,
    won: v.won,
  })).sort((a, b) => b.total - a.total)
}

export interface TopOrgRow {
  organization: string
  province: string
  total: number
  won: number
  winRate: number
}

export function computeTopOrganizations(
  tenders: SampleTender[],
  limit = 10
): TopOrgRow[] {
  const byOrg: Record<string, { province: string; total: number; won: number }> = {}
  for (const t of tenders) {
    const org = t.organization || 'Sin organismo'
    if (!byOrg[org]) byOrg[org] = { province: t.province, total: 0, won: 0 }
    byOrg[org].total++
    if (t.status === 'WON') byOrg[org].won++
  }
  return Object.entries(byOrg)
    .map(([organization, v]) => ({
      organization,
      province: v.province,
      total: v.total,
      won: v.won,
      winRate: v.total > 0 ? v.won / v.total : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export interface OwnerPerfRow {
  owner: string
  inReview: number
  submitted: number
  ganadas: number
  perdidas: number
}

export function computeOwnerPerformance(tenders: SampleTender[]): OwnerPerfRow[] {
  const byOwner: Record<string, OwnerPerfRow> = {}
  for (const t of tenders) {
    const owner = t.owner || 'Sin asignar'
    if (!byOwner[owner])
      byOwner[owner] = { owner, inReview: 0, submitted: 0, ganadas: 0, perdidas: 0 }
    if (t.status === 'IN_REVIEW') byOwner[owner].inReview++
    if (['SUBMITTED', 'WON', 'LOST'].includes(t.status)) byOwner[owner].submitted++
    if (t.status === 'WON') byOwner[owner].ganadas++
    if (t.status === 'LOST') byOwner[owner].perdidas++
  }
  return Object.values(byOwner).sort((a, b) => b.submitted - a.submitted)
}

export interface TimeMetrics {
  tiempoMedioCiclo: number | null
  tiempoPrimerAccion: number | null
}

export function computeTimeMetrics(
  tenders: SampleTender[],
  events: StatusEvent[]
): TimeMetrics {
  const cicloDiffs: number[] = []
  for (const t of tenders) {
    if (!['SUBMITTED', 'WON', 'LOST'].includes(t.status)) continue
    const pub = t.publishDate ? new Date(t.publishDate).getTime() : NaN
    const open = t.openDate ? new Date(t.openDate).getTime() : NaN
    if (isNaN(pub) || isNaN(open)) continue
    const days = (open - pub) / (1000 * 60 * 60 * 24)
    cicloDiffs.push(days)
  }

  const tiempoMedioCiclo =
    cicloDiffs.length > 0
      ? Math.round(cicloDiffs.reduce((s, d) => s + d, 0) / cicloDiffs.length * 10) / 10
      : null

  const tenderIds = new Set(tenders.map((t) => t.id))
  const firstActionDiffs: number[] = []
  for (const e of events) {
    if (e.oldStatus !== 'NEW' || e.newStatus !== 'IN_REVIEW') continue
    if (!tenderIds.has(e.tenderId)) continue
    const tender = tenders.find((t) => t.id === e.tenderId)
    if (!tender?.publishDate) continue
    const pub = new Date(tender.publishDate).getTime()
    const changed = new Date(e.changedAt).getTime()
    const days = (changed - pub) / (1000 * 60 * 60 * 24)
    firstActionDiffs.push(days)
  }

  const tiempoPrimerAccion =
    firstActionDiffs.length > 0
      ? Math.round(firstActionDiffs.reduce((s, d) => s + d, 0) / firstActionDiffs.length * 10) / 10
      : null

  return { tiempoMedioCiclo, tiempoPrimerAccion }
}
