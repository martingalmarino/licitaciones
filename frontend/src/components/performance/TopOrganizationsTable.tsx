import type { TopOrgRow } from '../../utils/performance'

interface TopOrganizationsTableProps {
  rows: TopOrgRow[]
}

export default function TopOrganizationsTable({ rows }: TopOrganizationsTableProps) {
  return (
    <div className="perf-table-card">
      <h3>Top organismos</h3>
      <div className="tender-table-container">
        <table className="tender-table">
          <thead>
            <tr>
              <th>Organismo</th>
              <th>Provincia</th>
              <th>Total</th>
              <th>Ganadas</th>
              <th>Win rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.organization}>
                <td className="title-cell">{r.organization}</td>
                <td>{r.province}</td>
                <td>{r.total}</td>
                <td>{r.won}</td>
                <td>{(r.winRate * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
