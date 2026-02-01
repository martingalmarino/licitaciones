import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRiskAssessment, downloadRiskPdf, RiskAssessment } from '../api/riskClient'

const MOD_CAPS: Record<string, number> = { plazos: 20, logistica: 25, regulatorio: 20, administrativo: 20, financiero: 15 }
const MOD_LABELS: Record<string, string> = {
  plazos: 'Plazos',
  logistica: 'Logística',
  regulatorio: 'Regulatorio/Compliance',
  administrativo: 'Administrativo',
  financiero: 'Financiero',
}

export default function RiskSimulatorResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    getRiskAssessment(id)
      .then(setAssessment)
      .catch(() => alert('Error al cargar evaluación'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    if (!id) return
    setPdfLoading(true)
    try {
      const blob = await downloadRiskPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cofarsur_riesgo_${new Date().toISOString().slice(0, 10)}_${id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al descargar PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const toggleCheck = (itemId: string) => {
    setChecklistState((s) => ({ ...s, [itemId]: !s[itemId] }))
  }

  if (loading || !assessment) {
    return <div className="loading">Cargando...</div>
  }

  const tierClass = assessment.tier === 'BAJO' ? 'badge-low' : assessment.tier === 'MEDIO' ? 'badge-medium' : 'badge-high'
  const enabledItems = (assessment.checklist || []).filter((c) => c.enabled)

  return (
    <div className="app-container">
      <div className="risk-result" style={{ maxWidth: 800, margin: '0 auto', padding: 30 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/risk-simulator')} style={{ marginBottom: 20 }}>
          ← Volver
        </button>

        <div className="risk-score-panel" style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 25 }}>
          <h2 style={{ marginBottom: 15, color: 'var(--cofarsur-blue-dark)' }}>Riesgo Total</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700 }}>{assessment.risk_total}</span>
            <span style={{ fontSize: '1.5rem', color: '#999' }}>/ 100</span>
            <span className={`badge ${tierClass}`} style={{ padding: '10px 20px' }}>
              {assessment.tier}
            </span>
          </div>
        </div>

        <div className="risk-modules" style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 25 }}>
          <h3 style={{ marginBottom: 20, color: 'var(--cofarsur-blue-dark)' }}>Módulos de riesgo</h3>
          {Object.entries(assessment.module_scores || {}).map(([key, score]) => {
            const cap = MOD_CAPS[key] || 20
            const pct = (score / cap) * 100
            return (
              <div key={key} style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{MOD_LABELS[key] || key}</span>
                  <span>{score}/{cap}</span>
                </div>
                <div style={{ height: 10, background: '#eee', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--cofarsur-blue)', borderRadius: 5 }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="top-risks" style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 25 }}>
          <h3 style={{ marginBottom: 15, color: 'var(--cofarsur-blue-dark)' }}>Top 3 riesgos detectados</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(assessment.top_risks || []).map((r, i) => (
              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                • {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="checklist-panel" style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 25 }}>
          <h3 style={{ marginBottom: 15, color: 'var(--cofarsur-blue-dark)' }}>Checklist de mitigación</h3>
          {enabledItems.map((item) => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklistState[item.id] ?? false}
                onChange={() => toggleCheck(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? 'Generando...' : 'Descargar informe PDF'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/risk-simulator/history')}>
            Ver historial
          </button>
        </div>
      </div>
    </div>
  )
}
