/**
 * Taxonomía de la Biblioteca: etiquetas y categorías para filtros y chips.
 * Solo datos estáticos para demo offline.
 */

export const LIBRARY_TAGS: Record<string, string> = {
  cadena_frio: 'Cadena de frío',
  alto_costo: 'Alto costo',
  anmat: 'ANMAT / trazabilidad',
  multisede: 'Multisede',
  ministerio: 'Ministerio',
  garantias: 'Garantías',
  plazo_corto: 'Plazo corto',
  vacunas: 'Vacunas',
  insumos_criticos: 'Insumos críticos',
  uso_compasivo: 'Uso compasivo',
  compra_centralizada: 'Compra centralizada',
  contratacion_directa: 'Contratación directa',
  convenio_marco: 'Convenio marco',
  documentacion: 'Documentación',
  logistica: 'Logística',
  regulatorio: 'Regulatorio',
  finanzas: 'Finanzas',
  operacion: 'Operación',
}

export const LIBRARY_CATEGORIES = [
  'Procesos',
  'Operación',
  'Regulatorio',
  'Finanzas',
  'Logística',
  'Documentación',
] as const

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number]
