import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listRiskAssessments, RiskAssessmentSummary } from '../api/riskClient'
import { listDemoAssessments } from '../riskScoring'

export default function RiskSimulatorHistory() {
  const [items, setItems] = useState<RiskAssessmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    listRiskAssessments()
      .then((r) => {
        setItems(r.items)
        setUsingDemo(false)
      })
      .catch(() => {
        setItems(listDemoAssessments())
        setUsingDemo(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="app-container">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 30 }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/risk-simulator')}
          style={{ marginBottom: 20 }}
        >
          ← Volver
        </button>
        <h2 style={{ marginBottom: 25, color: 'var(--cofarsur-blue-dark)' }}>Historial de evaluaciones</h2>

        {usingDemo && (
          <div className="demo-banner">
            Mostrando evaluaciones guardadas localmente (modo demo). Conecte el backend para sincronizar.
          </div>
        )}

        {items.length === 0 && (
          <div className="empty-state">No hay evaluaciones aún. Inicie una nueva evaluación.</div>
        )}

        {items.length > 0 && (
          <div className="tender-table-container">
            <table className="tender-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo institución</th>
                  <th>Provincia</th>
                  <th>Modalidad</th>
                  <th>Puntaje</th>
                  <th>Nivel</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr
                    key={r.id}
                    className="tender-row"
                    onClick={() => navigate(`/risk-simulator/result/${r.id}`)}
                  >
                    <td>{new Date(r.created_at).toLocaleDateString('es-AR')}</td>
                    <td>{r.institution_type || '—'}</td>
                    <td>{r.province || '—'}</td>
                    <td>{r.modality || '—'}</td>
                    <td>{r.risk_total}</td>
                    <td>
                      <span className={`badge ${r.tier === 'BAJO' ? 'badge-low' : r.tier === 'MEDIO' ? 'badge-medium' : 'badge-high'}`}>
                        {r.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
