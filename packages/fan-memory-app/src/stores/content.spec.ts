import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useContentStore } from './content'

const {
  getContentsMock,
  addContentMock,
  addTagMock,
  isDuplicateUrlMock,
} = vi.hoisted(() => ({
  getContentsMock: vi.fn(),
  addContentMock: vi.fn(),
  addTagMock: vi.fn(),
  isDuplicateUrlMock: vi.fn(),
}))

vi.mock('@/utils/storage', () => ({
  storageService: {
    getContents: getContentsMock,
    addContent: addContentMock,
    addTag: addTagMock,
    isDuplicateUrl: isDuplicateUrlMock,
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
  },
}))

describe('content store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getContentsMock.mockReturnValue([])
    isDuplicateUrlMock.mockReturnValue(false)
  })

  it('imports saved backend discoveries as local collection contents', () => {
    const store = useContentStore()
    store.load()

    store.importSavedDiscoveries([
      {
        id: 101,
        status: 'SAVED',
        url: 'https://weibo.com/yibo/status/1',
        title: '王一博新动态',
        platform: 'weibo',
        content_type: 'post',
        person_uid: 'person_yibo',
        published_at: '2026-07-01',
      },
      {
        id: 102,
        status: 'NEW',
        url: 'https://weibo.com/yibo/status/2',
        title: '未处理动态',
        platform: 'weibo',
        content_type: 'post',
      },
    ])

    expect(store.contents).toHaveLength(1)
    expect(store.contents[0]).toMatchObject({
      url: 'https://weibo.com/yibo/status/1',
      title: '王一博新动态',
      people: ['person_yibo'],
      tags: ['weibo', '后端发现'],
      source: 'discovery',
      watched: false,
      status: 'SAVED',
      published_at: '2026-07-01',
    })
    expect(addContentMock).toHaveBeenCalledTimes(1)
  })

  it('skips imported backend discoveries with duplicate urls', () => {
    const store = useContentStore()
    store.load()
    isDuplicateUrlMock.mockReturnValue(true)

    store.importSavedDiscoveries([
      {
        id: 101,
        status: 'SAVED',
        url: 'https://weibo.com/yibo/status/1',
        title: '王一博新动态',
        platform: 'weibo',
      },
    ])

    expect(store.contents).toHaveLength(0)
    expect(addContentMock).not.toHaveBeenCalled()
  })
})
