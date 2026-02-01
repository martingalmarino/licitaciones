/**
 * Datos de muestra para el Panel de Performance (demo offline).
 * Edite este archivo para cambiar los datos del dashboard.
 */

export type TenderStatus = 'NEW' | 'IN_REVIEW' | 'DISCARDED' | 'SUBMITTED' | 'WON' | 'LOST'
export type AmountRange = '<20M' | '20-100M' | '100-300M' | '>300M' | 'No informado'

export interface SampleTender {
  id: string
  title: string
  organization: string
  province: string
  institutionType: string
  category: string
  publishDate: string
  openDate: string
  status: TenderStatus
  owner?: string
  amountRange?: AmountRange
}

const OWNERS = ['María', 'Juan', 'Sofía', 'Diego', 'Lucía', 'Carlos']
const PROVINCES = ['Córdoba', 'Buenos Aires', 'Santa Fe', 'Mendoza', 'Tucumán', 'Nacional'] as const
const INST_TYPES = ['Ministerio', 'Hospital', 'Obra Social', 'Clínica', 'Municipalidad']
const CATEGORIES = ['Medicación hospitalaria', 'Alto costo/Onco', 'Insumos hospitalarios', 'Uso compasivo']

const TITLES = [
  'Adquisición de medicación oncológica',
  'Compra de insumos hospitalarios descartables',
  'Provisión de biológicos',
  'Medicamentos de alto costo',
  'Cadena de frío para vacunas',
  'Insumos quirúrgicos descartables',
  'Medicación para tratamiento oncológico',
  'Vacunas del calendario nacional',
  'Material de sutura y hemostasia',
  'Productos para diálisis',
  'Medicamentos de uso compasivo',
  'Inmunoglobulina humana',
  'Reactivos de laboratorio',
  'Material de curación',
  'Antibióticos de amplio espectro',
  'Quimioterápicos',
  'Hormonas de crecimiento',
  'Provisión de hemoderivados',
  'Equipamiento médico descartable',
  'Medicamentos biosimilares',
  'Vacunas antigripales',
  'Material osteosíntesis',
  'Productos de nutrición parenteral',
  'Insumos para terapia intensiva',
]

const ORGS = [
  'Hospital Rawson',
  'Ministerio de Salud de Córdoba',
  'Obra Social de la Provincia',
  'Sanatorio Allende',
  'Hospital de Clínicas',
  'Hospital Italiano',
  'Obra Social del Personal de la Construcción',
  'Municipalidad de Córdoba',
  'Hospital Fernández',
  'Clínica Reina Fabiola',
  'Ministerio de Salud de Santa Fe',
  'Hospital Provincial del Centenario',
  'Obra Social OSPACP',
  'Hospital Córdoba',
  'Sanatorio del Salvador',
  'Municipalidad de Rosario',
  'Hospital de Niños',
  'Instituto de Cardiología',
  'Obra Social UPCN',
  'Hospital de Mendoza',
  'Clínica Colón',
  'Ministerio de Salud Nacional',
  'Hospital de Tucumán',
  'Obra Social Sindicato de Comercio',
  'Sanatorio del Sur',
  'Hospital Posadas',
  'Municipalidad de Mendoza',
  'Clínica Privada Belgrano',
  'Hospital Eva Perón',
  'Obra Social Bancaria',
]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function randomItem<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)]
}

function randomDate(start: Date, end: Date, r: number): string {
  const t = start.getTime() + r * (end.getTime() - start.getTime())
  return new Date(t).toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function generateSampleTenders(): SampleTender[] {
  const tenders: SampleTender[] = []
  const now = new Date()
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const statusWeights: TenderStatus[] = [
    ...Array(12).fill('NEW'),
    ...Array(15).fill('IN_REVIEW'),
    ...Array(22).fill('DISCARDED'),
    ...Array(18).fill('SUBMITTED'),
    ...Array(10).fill('WON'),
    ...Array(13).fill('LOST'),
  ]

  const amountRanges: AmountRange[] = ['<20M', '20-100M', '100-300M', '>300M', 'No informado']

  for (let i = 0; i < 75; i++) {
    const r1 = seededRandom(i * 7 + 1)
    const r2 = seededRandom(i * 11 + 2)
    const r3 = seededRandom(i * 13 + 3)
    const r4 = seededRandom(i * 17 + 4)

    const publishDate = randomDate(sixMonthsAgo, now, r1)
    const openDate = addDays(publishDate, 14 + Math.floor(r2 * 45))
    const status = randomItem(statusWeights, r3)
    const owner = r4 > 0.15 ? randomItem(OWNERS, r4) : undefined

    tenders.push({
      id: `t-${String(i + 1).padStart(3, '0')}`,
      title: randomItem(TITLES, seededRandom(i * 19)),
      organization: randomItem(ORGS, seededRandom(i * 23)),
      province: randomItem([...PROVINCES], seededRandom(i * 29)),
      institutionType: randomItem(INST_TYPES, seededRandom(i * 31)),
      category: randomItem(CATEGORIES, seededRandom(i * 37)),
      publishDate: publishDate + 'T00:00:00.000Z',
      openDate: openDate + 'T00:00:00.000Z',
      status,
      owner,
      amountRange: randomItem(amountRanges, seededRandom(i * 41)),
    })
  }

  return tenders.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
}

export const SAMPLE_TENDERS = generateSampleTenders()
