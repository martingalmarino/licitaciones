import type { MonthlyData } from '../../utils/performance'

interface MonthlyTrendChartProps {
  data: MonthlyData[]
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.detectadas, d.presentadas, d.ganadas]),
    1
  )

  return (
    <div className="perf-chart-card">
      <h3>Tendencia mensual (últimos 6 meses)</h3>
      <div className="monthly-chart">
        {data.map((m) => (
          <div key={m.month} className="monthly-group">
            <div className="monthly-bars">
              <div
                className="monthly-bar detectadas"
                style={{ height: `${(m.detectadas / maxVal) * 100}%` }}
                title={`Detectadas: ${m.detectadas}`}
              />
              <div
                className="monthly-bar presentadas"
                style={{ height: `${(m.presentadas / maxVal) * 100}%` }}
                title={`Presentadas: ${m.presentadas}`}
              />
              <div
                className="monthly-bar ganadas"
                style={{ height: `${(m.ganadas / maxVal) * 100}%` }}
                title={`Ganadas: ${m.ganadas}`}
              />
            </div>
            <span className="monthly-label">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot detectadas" /> Detectadas
        </span>
        <span className="legend-item">
          <span className="legend-dot presentadas" /> Presentadas
        </span>
        <span className="legend-item">
          <span className="legend-dot ganadas" /> Ganadas
        </span>
      </div>
    </div>
  )
}
