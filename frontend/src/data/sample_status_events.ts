/**
 * Eventos de cambio de estado para simular "tiempo a primer acción".
 * Edite junto con sample_tenders.ts para mantener consistencia.
 */

export interface StatusEvent {
  tenderId: string
  oldStatus: string
  newStatus: string
  changedAt: string
}

import { SAMPLE_TENDERS } from './sample_tenders'

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateStatusEvents(): StatusEvent[] {
  const events: StatusEvent[] = []

  SAMPLE_TENDERS.forEach((t, i) => {
    const needsReviewEvent = ['IN_REVIEW', 'SUBMITTED', 'WON', 'LOST'].includes(t.status)
    if (!needsReviewEvent) return

    const daysToFirstAction = 1 + Math.floor(seededRandom(i * 47) * 19)
    const changedAt = addDays(t.publishDate, daysToFirstAction)
    events.push({
      tenderId: t.id,
      oldStatus: 'NEW',
      newStatus: 'IN_REVIEW',
      changedAt,
    })
  })

  return events
}

export const SAMPLE_STATUS_EVENTS = generateStatusEvents()
