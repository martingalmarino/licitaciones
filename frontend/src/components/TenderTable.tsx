import { Tender } from '../api/client'

interface TenderTableProps {
  tenders: Tender[]
  onSelectTender: (tender: Tender) => void
}

export default function TenderTable({ tenders, onSelectTender }: TenderTableProps) {
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'badge-high'
      case 'MEDIUM':
        return 'badge-medium'
      case 'LOW':
        return 'badge-low'
      default:
        return ''
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'ALTA'
      case 'MEDIUM':
        return 'MEDIA'
      case 'LOW':
        return 'BAJA'
      default:
        return priority
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      IN_REVIEW: 'En análisis',
      DISCARDED: 'Descartado',
      SUBMITTED: 'Presentado',
      WON: 'Ganado',
      LOST: 'Perdido',
    }
    return labels[status] || status
  }

  return (
    <div className="tender-table-container">
      <table className="tender-table">
        <thead>
          <tr>
            <th>Prioridad</th>
            <th>Puntaje</th>
            <th>Organismo</th>
            <th>Provincia</th>
            <th>Título</th>
            <th>Apertura</th>
            <th>Estado</th>
            <th>Fuente</th>
          </tr>
        </thead>
        <tbody>
          {tenders.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-state">
                No se encontraron licitaciones
              </td>
            </tr>
          ) : (
            tenders.map((tender) => (
              <tr
                key={tender.id}
                onClick={() => onSelectTender(tender)}
                className="tender-row"
              >
                <td>
                  <span className={`badge ${getPriorityBadgeClass(tender.priority)}`}>
                    {getPriorityLabel(tender.priority)}
                  </span>
                </td>
                <td className="score-cell">{tender.score_total}</td>
                <td>{tender.organization}</td>
                <td>{tender.province || 'N/A'}</td>
                <td className="title-cell">{tender.title}</td>
                <td>
                  {tender.open_date
                    ? new Date(tender.open_date).toLocaleDateString('es-AR')
                    : 'N/A'}
                </td>
                <td>{getStatusLabel(tender.status)}</td>
                <td>{tender.source}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
