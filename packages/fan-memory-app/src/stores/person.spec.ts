import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePersonStore } from './person'

const { listPeopleMock, getPeopleMock } = vi.hoisted(() => ({
  listPeopleMock: vi.fn(),
  getPeopleMock: vi.fn(),
}))

vi.mock('@/utils/api', () => ({
  api: {
    listPeople: listPeopleMock,
  },
}))

vi.mock('@/utils/storage', () => ({
  storageService: {
    getPeople: getPeopleMock,
    addPerson: vi.fn(),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
  },
}))

describe('person store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    listPeopleMock.mockReset()
    getPeopleMock.mockReset()
  })

  it('loads people from discovery API and maps backend fields to frontend model', async () => {
    listPeopleMock.mockResolvedValue({
      ok: true,
      data: [{
        uid: 'p1',
        name: '王一珩',
        person_type: 'star',
        aliases: ['一珩'],
        keywords: ['王一珩'],
        created_at: '2026-06-30T16:06:30.660935',
        updated_at: '2026-06-30T16:06:30.660935',
      }],
    })
    getPeopleMock.mockReturnValue([])

    const store = usePersonStore()
    await store.load()

    expect(listPeopleMock).toHaveBeenCalledTimes(1)
    expect(getPeopleMock).not.toHaveBeenCalled()
    expect(store.people).toEqual([
      {
        id: 'p1',
        name: '王一珩',
        type: 'star',
        aliases: ['一珩'],
        teams: [],
        keywords: ['王一珩'],
        created_at: '2026-06-30T16:06:30.660935',
        updated_at: '2026-06-30T16:06:30.660935',
      },
    ])
  })

  it('falls back to local storage when discovery API fails', async () => {
    listPeopleMock.mockResolvedValue({ ok: false, error: 'Network error' })
    getPeopleMock.mockReturnValue([
      {
        id: 'local_1',
        name: '本地明星',
        type: 'star',
        aliases: [],
        teams: [],
        keywords: ['本地明星'],
        created_at: '2026-07-01',
        updated_at: '2026-07-01',
      },
    ])

    const store = usePersonStore()
    await store.load()

    expect(store.people).toHaveLength(1)
    expect(store.people[0].id).toBe('local_1')
  })
})
