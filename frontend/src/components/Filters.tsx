import { TenderFilters } from '../api/client'

interface FiltersProps {
  filters: TenderFilters
  onFiltersChange: (filters: TenderFilters) => void
}

export default function Filters({ filters, onFiltersChange }: FiltersProps) {
  const updateFilter = (key: keyof TenderFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, skip: 0 })
  }

  return (
    <div className="filters">
      <div className="filters-row">
        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Título, organismo, descripción..."
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Provincia:</label>
          <input
            type="text"
            placeholder="Ej: Buenos Aires"
            value={filters.province || ''}
            onChange={(e) => updateFilter('province', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Prioridad:</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => updateFilter('priority', e.target.value || undefined)}
          >
            <option value="">Todas</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
          >
            <option value="">Todos</option>
            <option value="NEW">Nuevo</option>
            <option value="IN_REVIEW">En análisis</option>
            <option value="DISCARDED">Descartado</option>
            <option value="SUBMITTED">Presentado</option>
            <option value="WON">Ganado</option>
            <option value="LOST">Perdido</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select
            value={filters.sort || 'open_date'}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="open_date">Fecha de Apertura</option>
            <option value="score">Puntaje</option>
            <option value="publish_date">Fecha de Publicación</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Orden:</label>
          <select
            value={filters.order || 'asc'}
            onChange={(e) => updateFilter('order', e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>
    </div>
  )
}
