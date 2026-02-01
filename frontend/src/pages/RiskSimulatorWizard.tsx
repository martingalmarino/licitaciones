import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRiskAssessment, RiskAnswers } from '../api/riskClient'
import { computeRiskLocally, saveDemoAssessment } from '../riskScoring'

const EMPTY_ANSWERS: RiskAnswers = {
  institution_type: '',
  province: '',
  modality: '',
  amount_range: '',
  days_to_open_range: '',
  category: '',
  cold_chain: '',
  traceability_anmat: '',
  multisite: '',
  geo_coverage: '',
  documentation_level: '',
  guarantees: '',
  payment_terms: '',
  penalties_sla: '',
  relationship_history: '',
}

export default function RiskSimulatorWizard() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<RiskAnswers>(EMPTY_ANSWERS)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key: keyof RiskAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await createRiskAssessment(answers)
      navigate(`/risk-simulator/result/${result.id}`)
    } catch {
      const computed = computeRiskLocally(answers)
      const demoId = `demo-${Date.now()}`
      saveDemoAssessment(demoId, {
        id: demoId,
        created_at: new Date().toISOString(),
        ...answers,
        ...computed,
        answers
      })
      navigate(`/risk-simulator/result/${demoId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="risk-wizard" style={{ maxWidth: 600, margin: '0 auto', padding: 30 }}>
        <h2 style={{ marginBottom: 20, color: 'var(--cofarsur-blue-dark)' }}>
          Paso {step} de 3
        </h2>

        {step === 1 && (
          <div className="wizard-step">
            <h3>Datos del proceso</h3>
            <div className="form-group">
              <label>Tipo de institución</label>
              <select value={answers.institution_type} onChange={(e) => update('institution_type', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Ministerio/Secretaría</option>
                <option>Hospital público</option>
                <option>Obra social / Prepaga</option>
                <option>Clínica / Sanatorio</option>
                <option>Municipalidad</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <select value={answers.province} onChange={(e) => update('province', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Nacional</option>
                <option>Buenos Aires</option>
                <option>Córdoba</option>
                <option>Santa Fe</option>
                <option>Mendoza</option>
                <option>Tucumán</option>
                <option>Entre Ríos</option>
                <option>Salta</option>
                <option>Chaco</option>
                <option>Misiones</option>
                <option>Otra</option>
              </select>
            </div>
            <div className="form-group">
              <label>Modalidad</label>
              <select value={answers.modality} onChange={(e) => update('modality', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Licitación Pública</option>
                <option>Licitación Privada</option>
                <option>Contratación Directa / Emergencia</option>
                <option>Convenio / Marco</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monto estimado</label>
              <select value={answers.amount_range} onChange={(e) => update('amount_range', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="< ARS 20M">&lt; ARS 20M</option>
                <option value="ARS 20–100M">ARS 20–100M</option>
                <option value="ARS 100–300M">ARS 100–300M</option>
                <option value="> ARS 300M">&gt; ARS 300M</option>
                <option value="No informado">No informado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Días hasta apertura/presentación</label>
              <div className="radio-group">
                {['<7', '7–14', '15–30', '>30', 'No informado'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <input type="radio" name="days" value={opt} checked={answers.days_to_open_range === opt} onChange={(e) => update('days_to_open_range', e.target.value)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h3>Complejidad operativa</h3>
            <div className="form-group">
              <label>Categoría principal</label>
              <select value={answers.category} onChange={(e) => update('category', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Medicación hospitalaria</option>
                <option>Alto costo / Onco / biológicos</option>
                <option>Uso compasivo / especiales</option>
                <option>Insumos hospitalarios</option>
                <option>Vacunas / inmunizaciones</option>
                <option>Descartables / material general</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cadena de frío</label>
              <select value={answers.cold_chain} onChange={(e) => update('cold_chain', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Sí</option>
                <option>No</option>
                <option>No aplica</option>
                <option>No sé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trazabilidad / lote-serie / ANMAT explícito</label>
              <select value={answers.traceability_anmat} onChange={(e) => update('traceability_anmat', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Sí</option>
                <option>No</option>
                <option>No sé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Entrega multisede / múltiples efectores</label>
              <select value={answers.multisite} onChange={(e) => update('multisite', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Sí</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cobertura geográfica</label>
              <select value={answers.geo_coverage} onChange={(e) => update('geo_coverage', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Una ciudad</option>
                <option>Varias ciudades en la provincia</option>
                <option>Varias provincias</option>
                <option>No informado</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h3>Condiciones administrativas y comerciales</h3>
            <div className="form-group">
              <label>Documentación y formalidades del pliego</label>
              <select value={answers.documentation_level} onChange={(e) => update('documentation_level', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Baja (estándar)</option>
                <option>Media (requiere formatos específicos)</option>
                <option>Alta (muchos anexos/certificaciones/legalizaciones)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Garantías</label>
              <select value={answers.guarantees} onChange={(e) => update('guarantees', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>No</option>
                <option>Sí: mantenimiento de oferta</option>
                <option>Sí: mantenimiento + cumplimiento de contrato</option>
                <option>No informado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condición de pago</label>
              <select value={answers.payment_terms} onChange={(e) => update('payment_terms', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>30 días</option>
                <option>60 días</option>
                <option>90+ días</option>
                <option>No informado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Penalidades / SLA estrictos</label>
              <select value={answers.penalties_sla} onChange={(e) => update('penalties_sla', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Sí</option>
                <option>No</option>
                <option>No informado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Historial con la institución</label>
              <select value={answers.relationship_history} onChange={(e) => update('relationship_history', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Ya trabajamos y fue fluido</option>
                <option>Ya trabajamos y hubo fricción</option>
                <option>Nunca trabajamos</option>
                <option>No sé</option>
              </select>
            </div>
          </div>
        )}


        <div className="wizard-actions" style={{ display: 'flex', gap: 15, marginTop: 30 }}>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Siguiente
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Calculando...' : 'Calcular riesgo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
