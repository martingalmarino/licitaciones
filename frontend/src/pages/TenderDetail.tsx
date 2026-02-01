import { useState, useEffect } from 'react'
import { getTender, updateTender, createTenderFolder, Tender, TenderUpdate } from '../api/client'
import ScoreBreakdown from '../components/ScoreBreakdown'
import Header from '../components/Header'

interface TenderDetailProps {
  tenderId: string
  initialTender?: Tender | null
  onClose: () => void
  onUpdate: (tender: Tender) => void
}

export default function TenderDetail({ tenderId, initialTender, onClose, onUpdate }: TenderDetailProps) {
  const [tender, setTender] = useState<Tender | null>(initialTender || null)
  const [loading, setLoading] = useState(!initialTender)
  const [saving, setSaving] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [formData, setFormData] = useState<TenderUpdate>({
    status: initialTender?.status || '',
    owner: initialTender?.owner || '',
    notes: initialTender?.notes || '',
  })
  const isDemoTender = tenderId.startsWith('demo-')

  useEffect(() => {
    if (initialTender && initialTender.id === tenderId) {
      setTender(initialTender)
      setFormData({ status: initialTender.status, owner: initialTender.owner || '', notes: initialTender.notes || '' })
      setLoading(false)
      return
    }
    loadTender()
  }, [tenderId, initialTender?.id])

  const loadTender = async () => {
    if (initialTender?.id === tenderId) return
    setLoading(true)
    try {
      const data = await getTender(tenderId)
      setTender(data)
      setFormData({
        status: data.status,
        owner: data.owner || '',
        notes: data.notes || '',
      })
    } catch (error) {
      console.error('Error loading tender:', error)
      if (initialTender) {
        setTender(initialTender)
        setFormData({ status: initialTender.status, owner: initialTender.owner || '', notes: initialTender.notes || '' })
      } else {
        alert('Error al cargar la licitación')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!tender) return

    setSaving(true)
    try {
      const updated = await updateTender(tenderId, formData)
      setTender(updated)
      onUpdate(updated)
      alert('Cambios guardados correctamente')
    } catch (error) {
      console.error('Error updating tender:', error)
      alert('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!tender) return

    setCreatingFolder(true)
    try {
      const result = await createTenderFolder(tenderId)
      alert(`Carpeta creada: ${result.folder_path}`)
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Error al crear la carpeta')
    } finally {
      setCreatingFolder(false)
    }
  }

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


  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading">Cargando...</div>
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="app-container">
        <Header />
        <div className="tender-detail">
          <div className="empty-state">Licitación no encontrada</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header />
      <div className="tender-detail">
        <div className="tender-detail-header">
          <button className="btn btn-secondary" onClick={onClose}>
            ← Volver
          </button>
          {isDemoTender && (
            <div className="demo-banner">Modo demo: datos de ejemplo. Conecte el backend para guardar cambios.</div>
          )}
          <h1>{tender.title}</h1>
        </div>

      <div className="tender-detail-content">
        <div className="tender-detail-main">
          <div className="tender-info-section">
            <h2>Información General</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Organismo:</label>
                <span>{tender.organization}</span>
              </div>
              <div className="info-item">
                <label>Provincia:</label>
                <span>{tender.province || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Tipo de Proceso:</label>
                <span>{tender.process_type || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Categoría:</label>
                <span>{tender.category || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Fecha de Publicación:</label>
                <span>{tender.publish_date ? new Date(tender.publish_date).toLocaleDateString('es-AR') : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Fecha de Apertura:</label>
                <span>{tender.open_date ? new Date(tender.open_date).toLocaleDateString('es-AR') : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Monto Estimado:</label>
                <span>{tender.estimated_amount ? `$${tender.estimated_amount.toLocaleString('es-AR')}` : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Fuente:</label>
                <span>{tender.source}</span>
              </div>
            </div>

            {tender.url && (
              <div className="info-item">
                <label>URL:</label>
                <a href={tender.url} target="_blank" rel="noopener noreferrer">
                  Ver licitación original
                </a>
              </div>
            )}

            {tender.description && (
              <div className="info-item description">
                <label>Descripción:</label>
                <p>{tender.description}</p>
              </div>
            )}
          </div>

          <div className="tender-scoring-section">
            <h2>Puntaje y Prioridad</h2>
            <div className="score-display">
              <div className="score-total">
                <span className="score-value">{tender.score_total}</span>
                <span className="score-max">/ 90</span>
              </div>
              <div className={`priority-badge ${getPriorityBadgeClass(tender.priority)}`}>
                {tender.priority === 'HIGH' ? 'ALTA' : tender.priority === 'MEDIUM' ? 'MEDIA' : 'BAJA'}
              </div>
            </div>
            <ScoreBreakdown breakdown={tender.score_breakdown} />
          </div>
        </div>

        <div className="tender-detail-sidebar">
          <div className="tender-actions-section">
            <h2>Acciones</h2>

            <div className="form-group">
              <label>Estado:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="NEW">Nuevo</option>
                <option value="IN_REVIEW">En análisis</option>
                <option value="DISCARDED">Descartado</option>
                <option value="SUBMITTED">Presentado</option>
                <option value="WON">Ganado</option>
                <option value="LOST">Perdido</option>
              </select>
            </div>

            <div className="form-group">
              <label>Responsable:</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Nombre del responsable"
              />
            </div>

            <div className="form-group">
              <label>Notas:</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas internas..."
                rows={5}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || isDemoTender}
                title={isDemoTender ? 'Requiere backend conectado' : ''}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCreateFolder}
                disabled={creatingFolder || isDemoTender}
                title={isDemoTender ? 'Requiere backend conectado' : ''}
              >
                {creatingFolder ? 'Creando...' : 'Crear Carpeta de Proceso'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
