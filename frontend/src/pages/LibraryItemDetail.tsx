import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLibraryItemById } from '../utils/library'
import { attachLibraryItemToTender } from '../utils/localAttachments'
import { getDemoTenders, type Tender } from '../api/client'
import { LIBRARY_TAGS } from '../data/library_taxonomy'
import ChecklistView from '../components/library/ChecklistView'
import type { LibraryItem } from '../data/library_items'

function useChecklistState(_item: LibraryItem | undefined): [Record<string, boolean>, (id: string) => void] {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const onToggle = (stepId: string) => {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }))
  }

  return [checked, onToggle]
}

function PrintableContent({ item }: { item: LibraryItem }) {
  const byGroup: Record<string, typeof item.steps> = {}
  for (const step of item.steps) {
    if (!byGroup[step.group]) byGroup[step.group] = []
    byGroup[step.group].push(step)
  }
  const groups = Object.keys(byGroup).sort()

  return (
    <div className="library-print-root">
      <header className="library-print-header">
        <h1>COFARSUR – Biblioteca</h1>
        <p className="library-print-meta">
          {item.type === 'CHECKLIST' ? 'Checklist' : 'Pliego inteligente'} · {item.category} ·{' '}
          {item.tags.map((t) => LIBRARY_TAGS[t] ?? t).join(', ')}
        </p>
      </header>
      <h2 className="library-print-title">{item.title}</h2>
      <p className="library-print-desc">{item.description}</p>
      <div className="library-print-sections">
        {item.sections.map((s, i) => (
          <div key={i} className="library-print-section">
            <h3>{s.heading}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
      <div className="library-print-checklist">
        <h3>Checklist operativa</h3>
        {groups.map((group) => (
          <div key={group}>
            <h4>{group}</h4>
            <ul>
              {byGroup[group].map((step) => (
                <li key={step.id}>☐ {step.label}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LibraryItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const item = id ? getLibraryItemById(id) : undefined

  const [checked, onToggle] = useChecklistState(item)
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [tenders, setTenders] = useState<Tender[]>([])
  const [attachLoading, setAttachLoading] = useState(false)
  const [selectedTenderId, setSelectedTenderId] = useState('')

  useEffect(() => {
    if (!showAttachModal) return
    setAttachLoading(true)
    getDemoTenders()
      .then((res) => setTenders(res.items))
      .catch(() => setTenders([]))
      .finally(() => setAttachLoading(false))
  }, [showAttachModal])

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => alert('Enlace copiado al portapapeles.'))
  }

  const handleExportPdf = () => {
    const printRoot = document.getElementById('library-print-area')
    if (!printRoot) return
    const prevTitle = document.title
    document.title = `cofarsur_biblioteca_${item?.id ?? 'item'}.pdf`
    const win = window.open('', '_blank')
    if (!win) {
      alert('Permita ventanas emergentes para exportar.')
      document.title = prevTitle
      return
    }
    win.document.write(`
      <!DOCTYPE html><html><head><title>${document.title}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; max-width: 800px; margin: 0 auto; }
        .library-print-header { border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 16px; }
        .library-print-title { font-size: 1.25rem; margin: 12px 0; }
        .library-print-desc { color: #555; margin-bottom: 20px; }
        .library-print-section { margin-bottom: 16px; }
        .library-print-section h3 { font-size: 1rem; margin-bottom: 6px; }
        .library-print-checklist h3 { margin-top: 24px; margin-bottom: 12px; }
        .library-print-checklist h4 { font-size: 0.9rem; margin: 12px 0 6px; }
        .library-print-checklist ul { list-style: none; padding-left: 0; }
        .library-print-checklist li { margin: 4px 0; }
      </style></head><body>
      ${printRoot.innerHTML}
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
      document.title = prevTitle
    }, 250)
  }

  const handleAttachToProcess = () => {
    if (!item || !selectedTenderId) return
    attachLibraryItemToTender(selectedTenderId, item.id)
    setShowAttachModal(false)
    setSelectedTenderId('')
    alert('Recurso adjuntado al proceso. Verá el enlace en el detalle de la licitación.')
  }

  if (!id || !item) {
    return (
      <div className="app-container">
        <div className="library-detail-empty">
          <p>Ítem no encontrado.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/library')}>
            Volver a Biblioteca
          </button>
        </div>
      </div>
    )
  }

  const typeLabel = item.type === 'CHECKLIST' ? 'Checklist' : 'Pliego inteligente'
  const audienceLabel = item.audience === 'INTERNO' ? 'Interno' : item.audience === 'CLIENTE' ? 'Cliente' : 'Ambos'

  return (
    <div className="app-container">
      <div id="library-print-area" className="library-print-area-hidden" aria-hidden="true">
        <PrintableContent item={item} />
      </div>

      <div className="library-detail library-detail-screen">
        <button type="button" className="btn btn-secondary library-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <header className="library-detail-header">
          <div className="library-detail-badges">
            <span className={`library-badge library-badge--${item.type.toLowerCase()}`}>
              {typeLabel}
            </span>
            <span className="library-badge library-badge--category">{item.category}</span>
            <span className="library-badge library-badge--audience">{audienceLabel}</span>
          </div>
          <h1 className="library-detail-title">{item.title}</h1>
          <div className="library-detail-tags">
            {item.tags.map((tag) => (
              <span key={tag} className="library-tag">
                {LIBRARY_TAGS[tag] ?? tag}
              </span>
            ))}
          </div>
        </header>

        <section className="library-detail-section">
          <h2>Resumen</h2>
          <p>{item.description}</p>
        </section>

        {item.usageNotes && item.usageNotes.length > 0 && (
          <section className="library-detail-section">
            <h2>Notas de uso</h2>
            <ul>
              {item.usageNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="library-detail-section">
          <h2>Secciones</h2>
          {item.sections.map((s, i) => (
            <div key={i} className="library-detail-block">
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </section>

        <ChecklistView item={item} checkedIds={checked} onToggle={onToggle} />

        <div className="library-detail-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
            Copiar enlace
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleExportPdf}>
            Exportar PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowAttachModal(true)}>
            Usar en proceso
          </button>
        </div>
      </div>

      {showAttachModal && (
        <div className="library-modal-overlay" onClick={() => setShowAttachModal(false)}>
          <div className="library-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Usar en proceso</h3>
            <p className="library-modal-desc">
              Seleccione una licitación para adjuntar este recurso. Podrá verlo en el detalle de la licitación.
            </p>
            {attachLoading ? (
              <p>Cargando licitaciones...</p>
            ) : tenders.length === 0 ? (
              <p className="library-modal-empty">
                No hay licitaciones disponibles. Use el Radar en modo demo para ver licitaciones.
              </p>
            ) : (
              <>
                <select
                  className="library-modal-select"
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                >
                  <option value="">-- Seleccionar licitación --</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.organization})
                    </option>
                  ))}
                </select>
                <div className="library-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAttachModal(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAttachToProcess}
                    disabled={!selectedTenderId}
                  >
                    Adjuntar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
