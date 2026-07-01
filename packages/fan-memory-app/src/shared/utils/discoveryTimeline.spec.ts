import { describe, expect, it } from 'vitest'
import { groupDiscoveryTimeline } from './discoveryTimeline'

describe('groupDiscoveryTimeline', () => {
  it('groups backend discoveries by published or discovered date in descending order', () => {
    const timeline = groupDiscoveryTimeline([
      {
        id: 1,
        title: '旧动态',
        platform: 'weibo',
        content_type: 'post',
        status: 'SAVED',
        published_at: '2026-06-30T10:00:00',
      },
      {
        id: 2,
        title: '新动态',
        platform: 'bilibili',
        content_type: 'video',
        status: 'NEW',
        discovered_at: '2026-07-01T09:00:00',
      },
    ])

    expect(timeline.map(day => day.date)).toEqual(['2026-07-01', '2026-06-30'])
    expect(timeline[0].items[0]).toMatchObject({
      id: 'discovery-2',
      title: '新动态',
      source: 'discovery',
      status: 'NEW',
      watched: false,
    })
  })
})
