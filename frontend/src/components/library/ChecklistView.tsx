import { useMemo } from 'react'
import type { LibraryItem } from '../../data/library_items'

interface ChecklistViewProps {
  item: LibraryItem
  checkedIds: Record<string, boolean>
  onToggle: (stepId: string) => void
}

export default function ChecklistView({ item, checkedIds, onToggle }: ChecklistViewProps) {
  const byGroup = useMemo(() => {
    const map: Record<string, typeof item.steps> = {}
    for (const step of item.steps) {
      if (!map[step.group]) map[step.group] = []
      map[step.group].push(step)
    }
    return map
  }, [item.steps])

  const groups = Object.keys(byGroup).sort()

  return (
    <div className="library-checklist-view">
      <h3 className="library-checklist-title">Checklist operativa</h3>
      {groups.map((group) => (
        <div key={group} className="library-checklist-group">
          <h4 className="library-checklist-group-title">{group}</h4>
          <ul className="library-checklist-list">
            {byGroup[group].map((step) => (
              <li key={step.id} className="library-checklist-item">
                <label className="library-checklist-label">
                  <input
                    type="checkbox"
                    checked={checkedIds[step.id] ?? false}
                    onChange={() => onToggle(step.id)}
                  />
                  <span>{step.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
