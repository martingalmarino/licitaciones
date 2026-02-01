const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

export interface Tender {
  id: string
  source: string
  external_id: string
  title: string
  description: string | null
  organization: string
  province: string | null
  process_type: string | null
  category: string | null
  keywords: string[]
  publish_date: string | null
  open_date: string | null
  estimated_amount: number | null
  url: string | null
  status: string
  owner: string | null
  notes: string | null
  score_total: number
  score_breakdown: Record<string, any>
  priority: string
  created_at: string
  updated_at: string
}

export interface TenderListResponse {
  items: Tender[]
  total: number
  skip: number
  limit: number
}

export interface TenderFilters {
  province?: string
  priority?: string
  status?: string
  q?: string
  open_date_from?: string
  open_date_to?: string
  sort?: string
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
}

export interface TenderUpdate {
  status?: string
  owner?: string
  notes?: string
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getTenders(filters: TenderFilters = {}): Promise<TenderListResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  const queryString = params.toString()
  return fetchAPI<TenderListResponse>(`/tenders?${queryString}`)
}

export async function getTender(id: string): Promise<Tender> {
  return fetchAPI<Tender>(`/tenders/${id}`)
}

export async function updateTender(id: string, update: TenderUpdate): Promise<Tender> {
  return fetchAPI<Tender>(`/tenders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  })
}

export async function refreshData(): Promise<any> {
  return fetchAPI('/admin/refresh', {
    method: 'POST',
  })
}

export async function createTenderFolder(id: string): Promise<{ success: boolean; folder_path: string; message: string }> {
  return fetchAPI(`/admin/tenders/${id}/create-folder`, {
    method: 'POST',
  })
}
