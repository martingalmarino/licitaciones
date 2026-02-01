import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchLibraryItems, filterLibraryItems } from '../utils/library'
import SearchAndFilters from '../components/library/SearchAndFilters'
import LibraryCard from '../components/library/LibraryCard'
import type { LibraryItemType } from '../data/library_items'

interface LibraryListProps {
  type: LibraryItemType
}

export default function LibraryList({ type }: LibraryListProps) {
  const [searchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''

  const [searchQuery, setSearchQuery] = useState(qFromUrl)
  useEffect(() => {
    setSearchQuery(qFromUrl)
  }, [qFromUrl])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')

  const items = useMemo(() => {
    let list = searchLibraryItems(searchQuery, type)
    list = filterLibraryItems(list, {
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      category: selectedCategory || undefined,
    })
    return list
  }, [type, searchQuery, selectedTags, selectedCategory])

  const title = type === 'CHECKLIST' ? 'Checklists sector salud' : 'Pliegos inteligentes'
  const subtitle =
    type === 'CHECKLIST'
      ? 'Listas de verificación por tipo de proceso.'
      : 'Plantillas con guía operativa.'

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="app-container">
      <div className="library-page library-list">
        <header className="library-header">
          <h1>{title}</h1>
          <p className="library-subtitle">{subtitle}</p>
        </header>

        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="library-results">
          <p className="library-results-count">
            {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
          </p>
          <div className="library-cards-list">
            {items.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
          {items.length === 0 && (
            <p className="library-empty">No se encontraron ítems con los filtros aplicados.</p>
          )}
        </div>
      </div>
    </div>
  )
}
