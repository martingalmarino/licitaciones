import type { OwnerPerfRow } from '../../utils/performance'

interface OwnerPerformanceTableProps {
  rows: OwnerPerfRow[]
}

export default function OwnerPerformanceTable({ rows }: OwnerPerformanceTableProps) {
  return (
    <div className="perf-table-card">
      <h3>Performance por responsable</h3>
      <div className="tender-table-container">
        <table className="tender-table">
          <thead>
            <tr>
              <th>Responsable</th>
              <th>En análisis</th>
              <th>Presentadas</th>
              <th>Ganadas</th>
              <th>Perdidas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.owner}>
                <td className="title-cell">{r.owner}</td>
                <td>{r.inReview}</td>
                <td>{r.submitted}</td>
                <td>{r.ganadas}</td>
                <td>{r.perdidas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
