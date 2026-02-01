import { Link } from 'react-router-dom'
import type { LibraryItem } from '../../data/library_items'
import { LIBRARY_TAGS } from '../../data/library_taxonomy'

interface LibraryCardProps {
  item: LibraryItem
}

export default function LibraryCard({ item }: LibraryCardProps) {
  const typeLabel = item.type === 'CHECKLIST' ? 'Checklist' : 'Pliego inteligente'
  const audienceLabel = item.audience === 'INTERNO' ? 'Interno' : item.audience === 'CLIENTE' ? 'Cliente' : 'Ambos'

  return (
    <Link to={`/library/item/${item.id}`} className="library-card">
      <div className="library-card-header">
        <span className={`library-card-type library-card-type--${item.type.toLowerCase()}`}>
          {typeLabel}
        </span>
        <span className="library-card-audience">{audienceLabel}</span>
      </div>
      <h3 className="library-card-title">{item.title}</h3>
      <p className="library-card-description">{item.description}</p>
      <div className="library-card-tags">
        {item.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="library-tag">
            {LIBRARY_TAGS[tag] ?? tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
