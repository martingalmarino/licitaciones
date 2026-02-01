import { LIBRARY_TAGS, LIBRARY_CATEGORIES } from '../../data/library_taxonomy'

interface SearchAndFiltersProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  placeholder?: string
}

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedTags,
  onToggleTag,
  selectedCategory,
  onCategoryChange,
  placeholder = 'Buscar por título, descripción o ítems...',
}: SearchAndFiltersProps) {
  const tagEntries = Object.entries(LIBRARY_TAGS)

  return (
    <div className="library-search-filters">
      <input
        type="search"
        className="library-search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar en la biblioteca"
      />
      <div className="library-filters-row">
        <div className="library-filter-group">
          <label className="library-filter-label">Categoría:</label>
          <select
            className="library-filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Todas</option>
            {LIBRARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="library-filter-group library-tags-group">
          <span className="library-filter-label">Etiquetas:</span>
          <div className="library-tags-chips">
            {tagEntries.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`library-tag-chip ${selectedTags.includes(key) ? 'library-tag-chip--active' : ''}`}
                onClick={() => onToggleTag(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
