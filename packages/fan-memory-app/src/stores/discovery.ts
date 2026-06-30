import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { showToast } from '@/utils/toast'

export const useDiscoveryStore = defineStore('discovery', () => {
  const discoveries = ref<any[]>([])
  const stats = ref({ total_people: 0, total_sources: 0, total_discoveries: 0, new_count: 0 })
  const loading = ref(false)
  const connected = ref(false)

  const newCount = computed(() => stats.value.new_count)
  const newDiscoveries = computed(() => discoveries.value.filter(d => d.status === 'NEW'))

  async function checkConnection() {
    const r = await api.health()
    connected.value = r.ok
    return r.ok
  }

  async function loadStats() {
    if (!connected.value && !(await checkConnection())) return
    const r = await api.getDiscoveryStats()
    if (r.ok && r.data) stats.value = r.data
  }

  async function loadNewDiscoveries(limit = 20) {
    if (!connected.value && !(await checkConnection())) return
    loading.value = true
    const r = await api.listNewDiscoveries(limit)
    if (r.ok && r.data) discoveries.value = r.data
    loading.value = false
  }

  async function loadAllDiscoveries(params?: { person_uid?: string; status?: string }) {
    if (!connected.value && !(await checkConnection())) return
    loading.value = true
    const r = await api.listDiscoveries(params)
    if (r.ok && r.data) discoveries.value = r.data
    loading.value = false
  }

  async function takeAction(discoveryId: number, action: 'save' | 'ignore' | 'block') {
    const r = await api.actionDiscovery(discoveryId, action)
    if (r.ok) {
      const item = discoveries.value.find(d => d.id === discoveryId)
      if (item) item.status = action === 'save' ? 'SAVED' : action === 'ignore' ? 'IGNORED' : 'BLOCKED'
      await loadStats()
    }
    return r.ok
  }

  async function triggerDiscovery() {
    const r = await api.triggerDiscovery()
    if (r.ok) {
      showToast(`发现完成，新增 ${r.data?.new_items || 0} 条`)
      await loadNewDiscoveries()
      await loadStats()
    } else {
      showToast('后端未连接', 'error')
    }
    return r.ok
  }

  async function syncPerson(person: { uid: string; name: string; type?: string; aliases?: string[]; keywords?: string[] }) {
    if (!(await checkConnection())) return
    const r = await api.createPerson({
      uid: person.uid,
      name: person.name,
      person_type: person.type || 'star',
      aliases: person.aliases || [],
      keywords: person.keywords || [person.name],
    })
    return r.ok
  }

  async function syncSource(personUid: string, source: {
    uid: string
    source_type: string
    platform: string
    keyword?: string
    url?: string
  }) {
    if (!(await checkConnection())) return
    const r = await api.createSource(personUid, {
      ...source,
      person_uid: personUid,
    })
    return r.ok
  }

  return {
    discoveries,
    stats,
    loading,
    connected,
    newCount,
    newDiscoveries,
    checkConnection,
    loadStats,
    loadNewDiscoveries,
    loadAllDiscoveries,
    takeAction,
    triggerDiscovery,
    syncPerson,
    syncSource,
  }
})
