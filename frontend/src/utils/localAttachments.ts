/**
 * Adjuntos de Biblioteca a procesos (tenders). Solo localStorage, demo offline.
 */

const STORAGE_KEY = 'cofarsur_process_attachments'

export interface ProcessAttachment {
  itemId: string
  addedAt: string // ISO
}

export type AttachmentsMap = Record<string, ProcessAttachment[]>

export function getProcessAttachments(): AttachmentsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as AttachmentsMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function getAttachmentsForTender(tenderId: string): ProcessAttachment[] {
  const all = getProcessAttachments()
  return all[tenderId] ?? []
}

export function attachLibraryItemToTender(tenderId: string, itemId: string): void {
  const all = getProcessAttachments()
  const list = all[tenderId] ?? []
  if (list.some((a) => a.itemId === itemId)) return
  list.push({ itemId, addedAt: new Date().toISOString() })
  all[tenderId] = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function removeAttachment(tenderId: string, itemId: string): void {
  const all = getProcessAttachments()
  const list = (all[tenderId] ?? []).filter((a) => a.itemId !== itemId)
  if (list.length === 0) delete all[tenderId]
  else all[tenderId] = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
