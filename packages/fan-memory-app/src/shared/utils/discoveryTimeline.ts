export interface DiscoveryTimelineItem {
  id: string
  title: string
  platform: string
  content_type: string
  status: string
  watched: boolean
  source: 'discovery'
  people: string[]
  published_at?: string
  created_at: string
}

export interface DiscoveryTimelineDay {
  date: string
  items: DiscoveryTimelineItem[]
}

function dateOnly(value?: string): string {
  return (value || new Date().toISOString()).split('T')[0]
}

export function groupDiscoveryTimeline(discoveries: any[]): DiscoveryTimelineDay[] {
  const grouped: Record<string, DiscoveryTimelineItem[]> = {}

  discoveries.forEach(item => {
    const date = dateOnly(item.published_at || item.discovered_at)
    if (!grouped[date]) grouped[date] = []
    grouped[date].push({
      id: `discovery-${item.id}`,
      title: item.title || item.url || '未命名发现',
      platform: item.platform || 'other',
      content_type: item.content_type || 'post',
      status: item.status || 'NEW',
      watched: item.status === 'SAVED',
      source: 'discovery',
      people: item.person_uid ? [item.person_uid] : [],
      published_at: item.published_at,
      created_at: date,
    })
  })

  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({ date, items: grouped[date] }))
}
