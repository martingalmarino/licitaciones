import type { SummaryKPIs } from '../../utils/performance'

interface KpiCardsProps {
  kpis: SummaryKPIs
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-label">Detectadas</div>
        <div className="kpi-value">{kpis.detectadas}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Trabajadas</div>
        <div className="kpi-value">{kpis.trabajadas}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Presentadas</div>
        <div className="kpi-value">{kpis.presentadas}</div>
      </div>
      <div className="kpi-card kpi-won">
        <div className="kpi-label">Ganadas</div>
        <div className="kpi-value">{kpis.ganadas}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Tasa de adjudicación</div>
        <div className="kpi-value">{((kpis.tasaAdjudicacion || 0) * 100).toFixed(1)}%</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Pipeline activo</div>
        <div className="kpi-value">{kpis.pipelineActivo}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Tasa de descarte</div>
        <div className="kpi-value">{((kpis.tasaDescarte || 0) * 100).toFixed(1)}%</div>
      </div>
    </div>
  )
}
