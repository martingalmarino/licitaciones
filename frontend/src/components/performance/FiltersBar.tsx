import type { PerformanceFilters } from '../../utils/performance'
import type { TenderStatus } from '../../data/sample_tenders'

const STATUS_LABELS: Record<TenderStatus, string> = {
  NEW: 'Nuevo',
  IN_REVIEW: 'En análisis',
  DISCARDED: 'Descartado',
  SUBMITTED: 'Presentado',
  WON: 'Ganado',
  LOST: 'Perdido',
}

const STATUS_OPTIONS: TenderStatus[] = ['NEW', 'IN_REVIEW', 'DISCARDED', 'SUBMITTED', 'WON', 'LOST']

interface FiltersBarProps {
  filters: PerformanceFilters
  onChange: (f: PerformanceFilters) => void
  provinces: string[]
  owners: string[]
}

export default function FiltersBar({ filters, onChange, provinces, owners }: FiltersBarProps) {
  const set = (k: keyof PerformanceFilters, v: unknown) => {
    onChange({ ...filters, [k]: v })
  }

  const toggleStatus = (s: TenderStatus) => {
    const list = filters.statuses ?? []
    const next = list.includes(s) ? list.filter((x) => x !== s) : [...list, s]
    set('statuses', next.length === 0 || next.length === STATUS_OPTIONS.length ? undefined : next)
  }

  const allStatusSelected = !filters.statuses || filters.statuses.length === 0 || filters.statuses.length === STATUS_OPTIONS.length

  return (
    <div className="perf-filters">
      <div className="perf-filters-row">
        <div className="filter-group">
          <label>Provincia</label>
          <select
            value={filters.province ?? 'Todas'}
            onChange={(e) => set('province', e.target.value === 'Todas' ? undefined : e.target.value)}
          >
            <option value="Todas">Todas</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Responsable</label>
          <select
            value={filters.owner ?? 'Todos'}
            onChange={(e) => set('owner', e.target.value === 'Todos' ? undefined : e.target.value)}
          >
            <option value="Todos">Todos</option>
            {owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Fecha publicación desde</label>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => set('dateFrom', e.target.value || undefined)}
          />
        </div>
        <div className="filter-group">
          <label>Fecha publicación hasta</label>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => set('dateTo', e.target.value || undefined)}
          />
        </div>
      </div>
      <div className="perf-filters-status">
        <label>Estado</label>
        <div className="status-chips">
          <button
            type="button"
            className={`status-chip ${allStatusSelected ? 'active' : ''}`}
            onClick={() => set('statuses', undefined)}
          >
            Todos
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`status-chip ${(filters.statuses || []).includes(s) ? 'active' : ''}`}
              onClick={() => toggleStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
