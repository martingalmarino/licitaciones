import type { ProvinceStat } from '../../utils/performance'

interface ProvinceBarChartProps {
  data: ProvinceStat[]
}

export default function ProvinceBarChart({ data }: ProvinceBarChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="perf-chart-card">
      <h3>Por provincia</h3>
      <div className="bar-chart-horizontal">
        {data.map((d) => {
          const totalPct = (d.total / maxTotal) * 100
          const wonOfTotal = d.total > 0 ? d.won / d.total : 0
          return (
            <div key={d.province} className="province-row">
              <span className="province-label">{d.province}</span>
              <div className="province-track">
                <div
                  className="province-fill total"
                  style={{ width: `${totalPct}%` }}
                >
                  <div
                    className="province-fill won"
                    style={{ width: `${wonOfTotal * 100}%` }}
                  />
                </div>
              </div>
              <span className="province-values">
                {d.total} total / {d.won} ganadas
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
