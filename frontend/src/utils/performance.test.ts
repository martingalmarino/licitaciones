import { describe, it, expect } from 'vitest'
import {
  filterTenders,
  computeSummaryKPIs,
  computeStatusCounts,
  computeMonthlyTrends,
  computeProvinceStats,
  computeTopOrganizations,
  computeOwnerPerformance,
  computeTimeMetrics,
} from './performance'
import type { SampleTender } from '../data/sample_tenders'
import type { StatusEvent } from '../data/sample_status_events'

const MOCK_TENDERS: SampleTender[] = [
  { id: 't1', title: 'T1', organization: 'Org A', province: 'Córdoba', institutionType: 'Hospital', category: 'Med', publishDate: '2024-08-01T00:00:00Z', openDate: '2024-09-15T00:00:00Z', status: 'WON', owner: 'María' },
  { id: 't2', title: 'T2', organization: 'Org B', province: 'Buenos Aires', institutionType: 'Ministerio', category: 'Med', publishDate: '2024-08-10T00:00:00Z', openDate: '2024-09-20T00:00:00Z', status: 'LOST', owner: 'María' },
  { id: 't3', title: 'T3', organization: 'Org A', province: 'Córdoba', institutionType: 'Hospital', category: 'Med', publishDate: '2024-09-01T00:00:00Z', openDate: '2024-10-01T00:00:00Z', status: 'SUBMITTED', owner: 'Juan' },
  { id: 't4', title: 'T4', organization: 'Org C', province: 'Santa Fe', institutionType: 'Clínica', category: 'Med', publishDate: '2024-09-15T00:00:00Z', openDate: '2024-11-01T00:00:00Z', status: 'DISCARDED', owner: 'Sofía' },
  { id: 't5', title: 'T5', organization: 'Org A', province: 'Córdoba', institutionType: 'Hospital', category: 'Med', publishDate: '2024-07-01T00:00:00Z', openDate: '2024-08-15T00:00:00Z', status: 'NEW', owner: 'Diego' },
]

const MOCK_EVENTS: StatusEvent[] = [
  { tenderId: 't1', oldStatus: 'NEW', newStatus: 'IN_REVIEW', changedAt: '2024-08-05T00:00:00Z' },
  { tenderId: 't2', oldStatus: 'NEW', newStatus: 'IN_REVIEW', changedAt: '2024-08-15T00:00:00Z' },
  { tenderId: 't3', oldStatus: 'NEW', newStatus: 'IN_REVIEW', changedAt: '2024-09-10T00:00:00Z' },
]

describe('filterTenders', () => {
  it('returns all when no filters', () => {
    const r = filterTenders(MOCK_TENDERS, {})
    expect(r).toHaveLength(5)
  })

  it('filters by province', () => {
    const r = filterTenders(MOCK_TENDERS, { province: 'Córdoba' })
    expect(r).toHaveLength(3)
    expect(r.every((t) => t.province === 'Córdoba')).toBe(true)
  })

  it('filters by owner', () => {
    const r = filterTenders(MOCK_TENDERS, { owner: 'María' })
    expect(r).toHaveLength(2)
  })

  it('filters by date range', () => {
    const r = filterTenders(MOCK_TENDERS, { dateFrom: '2024-08-15', dateTo: '2024-09-15' })
    expect(r).toHaveLength(2)
  })

  it('filters by statuses', () => {
    const r = filterTenders(MOCK_TENDERS, { statuses: ['WON', 'LOST'] })
    expect(r).toHaveLength(2)
  })
})

describe('computeSummaryKPIs', () => {
  it('calculates win rate correctly', () => {
    const kpis = computeSummaryKPIs(MOCK_TENDERS)
    expect(kpis.ganadas).toBe(1)
    expect(kpis.tasaAdjudicacion).toBe(1 / 2)
  })

  it('handles division by zero when no closed', () => {
    const onlyNew = MOCK_TENDERS.filter((t) => t.status === 'NEW')
    const kpis = computeSummaryKPIs(onlyNew)
    expect(kpis.tasaAdjudicacion).toBe(0)
  })

  it('computes tasa descarte', () => {
    const kpis = computeSummaryKPIs(MOCK_TENDERS)
    expect(kpis.tasaDescarte).toBe(1 / 5)
  })

  it('computes pipeline activo', () => {
    const kpis = computeSummaryKPIs(MOCK_TENDERS)
    expect(kpis.pipelineActivo).toBe(2)
  })
})

describe('computeStatusCounts', () => {
  it('counts each status', () => {
    const c = computeStatusCounts(MOCK_TENDERS)
    expect(c.NEW).toBe(1)
    expect(c.WON).toBe(1)
    expect(c.LOST).toBe(1)
    expect(c.SUBMITTED).toBe(1)
    expect(c.DISCARDED).toBe(1)
  })
})

describe('computeTimeMetrics', () => {
  it('excludes missing dates', () => {
    const withMissing = [
      ...MOCK_TENDERS,
      { ...MOCK_TENDERS[0], id: 'tx', publishDate: '', openDate: '', status: 'WON' as const },
    ]
    const m = computeTimeMetrics(withMissing as SampleTender[], MOCK_EVENTS)
    expect(m.tiempoMedioCiclo).not.toBeNull()
  })

  it('computes tiempo a primer acción from events', () => {
    const m = computeTimeMetrics(MOCK_TENDERS, MOCK_EVENTS)
    expect(m.tiempoPrimerAccion).not.toBeNull()
  })

  it('returns null when no data', () => {
    const m = computeTimeMetrics([], [])
    expect(m.tiempoMedioCiclo).toBeNull()
    expect(m.tiempoPrimerAccion).toBeNull()
  })
})

describe('computeMonthlyTrends', () => {
  it('returns last 6 months', () => {
    const trends = computeMonthlyTrends(MOCK_TENDERS, 6)
    expect(trends).toHaveLength(6)
  })

  it('groups by month correctly', () => {
    const trends = computeMonthlyTrends(MOCK_TENDERS, 6)
    const labels = trends.map((t) => t.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('computeProvinceStats', () => {
  it('aggregates by province', () => {
    const s = computeProvinceStats(MOCK_TENDERS)
    const cordoba = s.find((p) => p.province === 'Córdoba')
    expect(cordoba?.total).toBe(3)
    expect(cordoba?.won).toBe(1)
  })
})

describe('computeTopOrganizations', () => {
  it('respects limit', () => {
    const top = computeTopOrganizations(MOCK_TENDERS, 2)
    expect(top).toHaveLength(2)
  })

  it('sorts by total descending', () => {
    const top = computeTopOrganizations(MOCK_TENDERS)
    expect(top[0].total).toBeGreaterThanOrEqual(top[1]?.total ?? 0)
  })
})

describe('computeOwnerPerformance', () => {
  it('aggregates by owner', () => {
    const perf = computeOwnerPerformance(MOCK_TENDERS)
    const maria = perf.find((p) => p.owner === 'María')
    expect(maria?.submitted).toBe(2)
    expect(maria?.ganadas).toBe(1)
    expect(maria?.perdidas).toBe(1)
  })
})
