import { Link } from 'react-router-dom'
import type { LibraryItem } from '../../data/library_items'
import { LIBRARY_TAGS } from '../../data/library_taxonomy'

export interface RecommendedItem {
  item: LibraryItem
  matchingTags: string[]
}

interface RecommendedItemsPanelProps {
  title: string
  items: RecommendedItem[]
  emptyMessage?: string
}

export default function RecommendedItemsPanel({
  title,
  items,
  emptyMessage = 'No hay recomendaciones para este contexto.',
}: RecommendedItemsPanelProps) {
  if (items.length === 0) {
    return (
      <div className="library-recommended-panel">
        <h3 className="library-recommended-title">{title}</h3>
        <p className="library-recommended-empty">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="library-recommended-panel">
      <h3 className="library-recommended-title">{title}</h3>
      <div className="library-recommended-list">
        {items.map(({ item, matchingTags }) => (
          <Link
            key={item.id}
            to={`/library/item/${item.id}`}
            className="library-recommended-card"
          >
            <span className="library-recommended-card-type">
              {item.type === 'CHECKLIST' ? 'Checklist' : 'Pliego'}
            </span>
            <span className="library-recommended-card-title">{item.title}</span>
            <span className="library-recommended-card-reason">
              Coincide: {matchingTags.map((t) => LIBRARY_TAGS[t] ?? t).join(', ')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
