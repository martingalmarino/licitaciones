interface ScoreBreakdownProps {
  breakdown: Record<string, any>
}

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  if (!breakdown || typeof breakdown !== 'object') {
    return <div>No hay información de puntaje disponible</div>
  }

  const components = [
    { key: 'catalog_match', label: 'Coincidencia de Catálogo', max: 30 },
    { key: 'administrative_complexity', label: 'Complejidad Administrativa', max: 20 },
    { key: 'time_window', label: 'Ventana de Tiempo', max: 15 },
    { key: 'institution_type', label: 'Tipo de Institución', max: 15 },
    { key: 'relationship', label: 'Relación', max: 10 },
  ]

  return (
    <div className="score-breakdown">
      <h3>Desglose de Puntaje</h3>
      <div className="breakdown-list">
        {components.map((comp) => {
          const component = breakdown[comp.key]
          if (!component) return null

          const score = component.score || 0
          const percentage = (score / comp.max) * 100

          return (
            <div key={comp.key} className="breakdown-item">
              <div className="breakdown-header">
                <span className="breakdown-label">{comp.label}</span>
                <span className="breakdown-score">
                  {score} / {comp.max}
                </span>
              </div>
              <div className="breakdown-bar">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {component.details && (
                <div className="breakdown-details">
                  {Object.entries(component.details).map(([key, value]) => (
                    <div key={key} className="detail-item">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="breakdown-total">
        <strong>Total: {breakdown.total || 0} / {breakdown.max_possible || 90}</strong>
      </div>
    </div>
  )
}
