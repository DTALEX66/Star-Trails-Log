/**
 * 后端 API 客户端
 * 连接 discovery-service (FastAPI)
 * 地址从 uni-app 本地存储读取，默认为 localhost:8766
 */

const API_URL_KEY = 'fan_memory_api_url'
const DEFAULT_URL = 'http://localhost:8766'

function getBaseUrl(): string {
  try {
    return String(uni.getStorageSync(API_URL_KEY) || DEFAULT_URL).replace(/\/+$/, '')
  } catch {
    return DEFAULT_URL
  }
}

interface ApiResult<T> {
  data?: T
  error?: string
  ok: boolean
}

class ApiClient {
  get baseUrl(): string {
    return getBaseUrl() + '/api'
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<ApiResult<T>> {
    try {
      const url = `${this.baseUrl}${path}`
      const options: any = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }
      if (body) options.body = JSON.stringify(body)

      const res = await fetch(url, options)
      const text = await res.text()

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 100)}` }
      }

      const data = text ? JSON.parse(text) : null
      return { ok: true, data }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' }
    }
  }

  // ============ Health ============

  async health() {
    return this.request<{ status: string }>('GET', '/health')
  }

  async stats() {
    return this.request<{
      total_people: number
      total_sources: number
      total_discoveries: number
      new_count: number
    }>('GET', '/stats')
  }

  // ============ People ============

  async listPeople() {
    return this.request<any[]>('GET', '/people/')
  }

  async getPerson(uid: string) {
    return this.request<any>('GET', `/people/${uid}`)
  }

  async createPerson(data: {
    uid: string
    name: string
    person_type: string
    aliases?: string[]
    keywords?: string[]
  }) {
    return this.request<any>('POST', '/people/', data)
  }

  async deletePerson(uid: string) {
    return this.request<any>('DELETE', `/people/${uid}`)
  }

  // ============ Sources ============

  async listSources(personUid: string) {
    return this.request<any[]>('GET', `/people/${personUid}/sources`)
  }

  async createSource(personUid: string, data: {
    uid: string
    person_uid: string
    source_type: string
    platform: string
    url?: string
    keyword?: string
  }) {
    return this.request<any>('POST', `/people/${personUid}/sources`, data)
  }

  // ============ Discovery ============

  async listDiscoveries(params?: {
    person_uid?: string
    status?: string
    limit?: number
  }) {
    const qs = new URLSearchParams()
    if (params?.person_uid) qs.set('person_uid', params.person_uid)
    if (params?.status) qs.set('status', params.status)
    if (params?.limit) qs.set('limit', String(params.limit))
    const q = qs.toString()
    return this.request<any[]>('GET', `/discovery/${q ? '?' + q : ''}`)
  }

  async listNewDiscoveries(limit = 20) {
    return this.request<any[]>('GET', `/discovery/new?limit=${limit}`)
  }

  async actionDiscovery(id: number, action: 'save' | 'ignore' | 'block') {
    return this.request<any>('POST', `/discovery/${id}/action`, { action })
  }

  async batchAction(ids: number[], action: 'save' | 'ignore' | 'block') {
    return this.request<any>('POST', '/discovery/batch-action', { ids, action })
  }

  async triggerDiscovery() {
    return this.request<any>('POST', '/discovery/trigger')
  }

  async getDiscoveryStats() {
    return this.request<{
      total_people: number
      total_sources: number
      total_discoveries: number
      new_count: number
      last_check_time: string | null
    }>('GET', '/discovery/stats')
  }
}

export const api = new ApiClient()
