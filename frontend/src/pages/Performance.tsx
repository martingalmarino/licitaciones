import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLibraryItemById } from '../utils/library'
import { SAMPLE_TENDERS } from '../data/sample_tenders'
import { SAMPLE_STATUS_EVENTS } from '../data/sample_status_events'
import {
  filterTenders,
  computeSummaryKPIs,
  computeStatusCounts,
  computeMonthlyTrends,
  computeProvinceStats,
  computeTopOrganizations,
  computeOwnerPerformance,
  computeTimeMetrics,
  type PerformanceFilters,
} from '../utils/performance'
import FiltersBar from '../components/performance/FiltersBar'
import KpiCards from '../components/performance/KpiCards'
import StatusBarChart from '../components/performance/StatusBarChart'
import MonthlyTrendChart from '../components/performance/MonthlyTrendChart'
import ProvinceBarChart from '../components/performance/ProvinceBarChart'
import TopOrganizationsTable from '../components/performance/TopOrganizationsTable'
import OwnerPerformanceTable from '../components/performance/OwnerPerformanceTable'

const PROVINCES = ['Córdoba', 'Buenos Aires', 'Santa Fe', 'Mendoza', 'Tucumán', 'Nacional']
const OWNERS = ['María', 'Juan', 'Sofía', 'Diego', 'Lucía', 'Carlos', 'Sin asignar']

/** Fricciones recurrentes (demo): título, conteo simulado, ids de ítems de biblioteca */
const FRICCIONES_DEMO: Array<{ label: string; count: number; itemIds: string[] }> = [
  { label: 'Documentación alta', count: 24, itemIds: ['checklist-base', 'pliego-compra-centralizada'] },
  { label: 'Cadena de frío', count: 18, itemIds: ['checklist-cadena-frio'] },
  { label: 'Garantías', count: 15, itemIds: ['checklist-garantias'] },
  { label: 'Multisede', count: 12, itemIds: ['checklist-multisede'] },
  { label: 'ANMAT / trazabilidad', count: 10, itemIds: ['checklist-anmat'] },
]

export default function Performance() {
  const [filters, setFilters] = useState<PerformanceFilters>({})

  const filtered = useMemo(() => filterTenders(SAMPLE_TENDERS, filters), [filters])

  const kpis = useMemo(() => computeSummaryKPIs(filtered), [filtered])
  const statusCounts = useMemo(() => computeStatusCounts(filtered), [filtered])
  const monthlyTrends = useMemo(() => computeMonthlyTrends(filtered), [filtered])
  const provinceStats = useMemo(() => computeProvinceStats(filtered), [filtered])
  const topOrgs = useMemo(() => computeTopOrganizations(filtered, 10), [filtered])
  const ownerPerf = useMemo(() => computeOwnerPerformance(filtered), [filtered])
  const timeMetrics = useMemo(
    () => computeTimeMetrics(filtered, SAMPLE_STATUS_EVENTS),
    [filtered]
  )

  return (
    <div className="app-container">
      <div className="perf-page">
        <header className="perf-header">
          <h1>Panel de performance de licitaciones</h1>
          <p className="perf-subtitle">
            Visión ejecutiva y operativa del pipeline y resultados.
          </p>
        </header>

        <FiltersBar
          filters={filters}
          onChange={setFilters}
          provinces={PROVINCES}
          owners={OWNERS}
        />

        <section className="perf-section">
          <KpiCards kpis={kpis} />
        </section>

        <section className="perf-section perf-time-metrics">
          <h3>Métricas de tiempo</h3>
          <div className="time-metrics-row">
            <div className="time-metric-card">
              <div className="time-metric-label">Tiempo medio de ciclo (días)</div>
              <div className="time-metric-value">
                {timeMetrics.tiempoMedioCiclo != null
                  ? timeMetrics.tiempoMedioCiclo
                  : '—'}
              </div>
            </div>
            <div className="time-metric-card">
              <div className="time-metric-label">Tiempo a primer acción (días)</div>
              <div className="time-metric-value">
                {timeMetrics.tiempoPrimerAccion != null
                  ? timeMetrics.tiempoPrimerAccion
                  : '—'}
              </div>
            </div>
          </div>
        </section>

        <section className="perf-section perf-charts">
          <StatusBarChart counts={statusCounts} />
          <MonthlyTrendChart data={monthlyTrends} />
          <ProvinceBarChart data={provinceStats} />
        </section>

        <section className="perf-section perf-tables">
          <TopOrganizationsTable rows={topOrgs} />
          <OwnerPerformanceTable rows={ownerPerf} />
        </section>

        <section className="perf-section perf-fricciones">
          <h3>Fricciones recurrentes (demo)</h3>
          <p className="perf-fricciones-desc">
            Temas que más aparecen en procesos. Enlace a recursos de la Biblioteca.
          </p>
          <div className="perf-fricciones-list">
            {FRICCIONES_DEMO.map((f) => (
              <div key={f.label} className="perf-friccion-card">
                <span className="perf-friccion-label">{f.label}</span>
                <span className="perf-friccion-count">{f.count} procesos</span>
                <div className="perf-friccion-links">
                  {f.itemIds.map((itemId) => {
                    const libItem = getLibraryItemById(itemId)
                    return (
                      <Link key={itemId} to={`/library/item/${itemId}`} className="perf-friccion-link">
                        {libItem ? libItem.title : 'Ver recurso'}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="perf-legend">
          <strong>Leyenda de estados:</strong>
          <span>Nuevo</span>
          <span>En análisis</span>
          <span>Descartado</span>
          <span>Presentado</span>
          <span>Ganado</span>
          <span>Perdido</span>
        </div>
      </div>
    </div>
  )
}
