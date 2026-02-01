import { useNavigate } from 'react-router-dom'

export default function RiskSimulatorLanding() {
  const navigate = useNavigate()

  return (
    <div className="app-container">
      <div className="risk-landing" style={{ maxWidth: 700, margin: '0 auto', padding: 60 }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--cofarsur-blue-dark)', marginBottom: 12 }}>
          Simulador de Riesgo de Licitación
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--cofarsur-text-light)', marginBottom: 30, lineHeight: 1.6 }}>
          Evaluá en 2 minutos el nivel de riesgo operativo y administrativo de un proceso de compra sanitaria.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/risk-simulator/wizard')}
          style={{ padding: '14px 32px', fontSize: '1.1rem' }}
        >
          Iniciar evaluación
        </button>
        <div className="risk-bullets" style={{ marginTop: 40 }}>
          <div className="risk-bullet">
            <strong>Resultado: puntaje + semáforo</strong>
          </div>
          <div className="risk-bullet">
            <strong>Checklist de mitigación descargable</strong>
          </div>
          <div className="risk-bullet">
            <strong>Ideal para compras institucionales y alto costo</strong>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/risk-simulator/history')}
          style={{ marginTop: 30 }}
        >
          Ver historial
        </button>
      </div>
    </div>
  )
}
