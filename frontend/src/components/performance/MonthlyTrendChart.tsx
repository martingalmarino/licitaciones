import type { MonthlyData } from '../../utils/performance'

/** Altura mínima (%) para barras con valor > 0, para que meses con pocos datos se vean bien. */
const MIN_BAR_PERCENT = 8

function barHeight(value: number, maxVal: number): string {
  if (value === 0) return '0'
  const pct = (value / maxVal) * 100
  return `${Math.max(pct, MIN_BAR_PERCENT)}%`
}

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
                style={{ height: barHeight(m.detectadas, maxVal) }}
                title={`Detectadas: ${m.detectadas}`}
              />
              <div
                className="monthly-bar presentadas"
                style={{ height: barHeight(m.presentadas, maxVal) }}
                title={`Presentadas: ${m.presentadas}`}
              />
              <div
                className="monthly-bar ganadas"
                style={{ height: barHeight(m.ganadas, maxVal) }}
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
