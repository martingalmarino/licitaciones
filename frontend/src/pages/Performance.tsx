import { useMemo, useState } from 'react'
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

        <div className="perf-legend">
          <strong>Leyenda de estados:</strong>{' '}
          Nuevo | En análisis | Descartado | Presentado | Ganado | Perdido
        </div>
      </div>
    </div>
  )
}
