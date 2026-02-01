import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { searchLibraryItems } from '../utils/library'

export default function LibraryHome() {
  const [searchQuery, setSearchQuery] = useState('')

  const results = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return { checklists: 0, pliegos: 0 }
    const items = searchLibraryItems(q)
    return {
      checklists: items.filter((i) => i.type === 'CHECKLIST').length,
      pliegos: items.filter((i) => i.type === 'PLIEGO').length,
    }
  }, [searchQuery])

  return (
    <div className="app-container">
      <div className="library-page library-home">
        <header className="library-header">
          <h1>Biblioteca</h1>
          <p className="library-subtitle">
            Recursos operativos para estandarizar procesos de licitación sanitaria.
          </p>
        </header>

        <div className="library-search-global">
          <input
            type="search"
            className="library-search-input library-search-input--large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, descripción o ítems..."
            aria-label="Buscar en la biblioteca"
          />
          {searchQuery.trim() && (
            <p className="library-search-hint">
              {results.checklists} checklist(s), {results.pliegos} pliego(s) encontrados.
              <Link to={`/library/checklists?q=${encodeURIComponent(searchQuery.trim())}`}>
                Ver checklists
              </Link>
              {' · '}
              <Link to={`/library/pliegos?q=${encodeURIComponent(searchQuery.trim())}`}>
                Ver pliegos
              </Link>
            </p>
          )}
        </div>

        <div className="library-cards-grid">
          <Link to="/library/checklists" className="library-big-card library-big-card--checklist">
            <h2>Checklists</h2>
            <p>Listas de verificación por tipo de proceso: licitación estándar, compra centralizada, cadena de frío, ANMAT, multisede y más.</p>
          </Link>
          <Link to="/library/pliegos" className="library-big-card library-big-card--pliego">
            <h2>Pliegos inteligentes</h2>
            <p>Plantillas con guía operativa: qué validar, fechas críticas, documentación típica, riesgos y mitigación.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
