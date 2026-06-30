import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/utils/storage'
import type { Content, Platform, ContentStatus } from '@/shared/models/index'
import { generateId, ID_PREFIX } from '@/shared/utils/id'
import { identifyPlatform, getContentTypeFromUrl } from '@/shared/utils/platform'

export const useContentStore = defineStore('content', () => {
  const contents = ref<Content[]>([])

  const totalCount = computed(() => contents.value.length)
  const unwatchedCount = computed(() => contents.value.filter(c => !c.watched).length)

  function load() {
    contents.value = storageService.getContents()
  }

  function getById(id: string): Content | undefined {
    return contents.value.find(c => c.id === id)
  }

  function getByPerson(personId: string): Content[] {
    return contents.value.filter(c => c.people.includes(personId))
  }

  function getUnwatchedByPerson(personId: string): number {
    return contents.value.filter(c => c.people.includes(personId) && !c.watched).length
  }

  function getByPlatform(platform: Platform): Content[] {
    return contents.value.filter(c => c.platform === platform)
  }

  function getByStatus(status: ContentStatus): Content[] {
    return contents.value.filter(c => c.status === status)
  }

  /**
   * 添加收藏内容
   * 自动识别平台，检查去重
   */
  function add(params: {
    url: string
    title: string
    people: string[]
    tags?: string[]
    note?: string
    published_at?: string
  }): { content: Content | null; duplicate?: Content } {
    const { url, title, people, tags, note, published_at } = params

    // 去重检查
    if (storageService.isDuplicateUrl(url)) {
      const dup = contents.value.find(c => c.url === url)
      return { content: null, duplicate: dup }
    }

    // 自动识别平台
    const platformInfo = identifyPlatform(url)
    const platform = platformInfo?.platform ?? 'other'
    const contentType = getContentTypeFromUrl(url, platform)

    const content: Content = {
      id: generateId(ID_PREFIX.content),
      title,
      url,
      platform,
      content_type: contentType,
      people,
      teams: [],
      tags: tags ?? [],
      status: 'SAVED',
      watched: false,
      source: 'manual',
      note,
      published_at,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }

    storageService.addContent(content)
    contents.value.push(content)

    // 同步标签
    tags?.forEach(t => storageService.addTag(t))

    return { content }
  }

  function toggleWatched(id: string) {
    const content = contents.value.find(c => c.id === id)
    if (!content) return

    const newWatched = !content.watched
    storageService.updateContent(id, { watched: newWatched })
    content.watched = newWatched
  }

  function updateStatus(id: string, status: ContentStatus) {
    storageService.updateContent(id, { status })
    const content = contents.value.find(c => c.id === id)
    if (content) content.status = status
  }

  function updateContent(id: string, updates: Partial<Content>) {
    storageService.updateContent(id, updates)
    const index = contents.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contents.value[index] = { ...contents.value[index], ...updates, updated_at: new Date().toISOString().split('T')[0] }
    }
  }

  function remove(id: string) {
    storageService.deleteContent(id)
    contents.value = contents.value.filter(c => c.id !== id)
  }

  function search(query: string): Content[] {
    const q = query.toLowerCase()
    return contents.value.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.note?.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  function getTimeline(personId?: string) {
    const items = personId ? getByPerson(personId) : contents.value
    const grouped: Record<string, Content[]> = {}

    for (const item of items) {
      const date = item.published_at || item.created_at
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(item)
    }

    // 按日期倒序
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }))
  }

  return {
    contents,
    totalCount,
    unwatchedCount,
    load,
    getById,
    getByPerson,
    getUnwatchedByPerson,
    getByPlatform,
    getByStatus,
    add,
    toggleWatched,
    updateStatus,
    updateContent,
    remove,
    search,
    getTimeline,
  }
})
