import type { TenderStatus } from '../../data/sample_tenders'

const STATUS_LABELS: Record<TenderStatus, string> = {
  NEW: 'Nuevo',
  IN_REVIEW: 'En análisis',
  DISCARDED: 'Descartado',
  SUBMITTED: 'Presentado',
  WON: 'Ganado',
  LOST: 'Perdido',
}

const STATUS_COLORS: Record<TenderStatus, string> = {
  NEW: '#9e9e9e',
  IN_REVIEW: '#2196f3',
  DISCARDED: '#ff9800',
  SUBMITTED: '#9c27b0',
  WON: '#4caf50',
  LOST: '#f44336',
}

interface StatusBarChartProps {
  counts: Record<TenderStatus, number>
}

const ORDER: TenderStatus[] = ['NEW', 'IN_REVIEW', 'SUBMITTED', 'DISCARDED', 'WON', 'LOST']

export default function StatusBarChart({ counts }: StatusBarChartProps) {
  const max = Math.max(...Object.values(counts), 1)

  return (
    <div className="perf-chart-card">
      <h3>Distribución por estado</h3>
      <div className="bar-chart-vertical">
        {ORDER.map((status) => {
          const n = counts[status] ?? 0
          const pct = max > 0 ? (n / max) * 100 : 0
          return (
            <div key={status} className="bar-row">
              <span className="bar-label">{STATUS_LABELS[status]}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
              </div>
              <span className="bar-value">{n}</span>
            </div>
          )
        })}
      </div>
      <div className="chart-legend">
        {ORDER.map((s) => (
          <span key={s} className="legend-item">
            <span className="legend-dot" style={{ background: STATUS_COLORS[s] }} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  )
}
