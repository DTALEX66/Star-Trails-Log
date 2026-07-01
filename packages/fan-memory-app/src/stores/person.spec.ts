import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePersonStore } from './person'

const {
  listPeopleMock,
  createPersonMock,
  updatePersonMock,
  deletePersonMock,
  getPeopleMock,
  addPersonMock,
  storageUpdatePersonMock,
  storageDeletePersonMock,
} = vi.hoisted(() => ({
  listPeopleMock: vi.fn(),
  createPersonMock: vi.fn(),
  updatePersonMock: vi.fn(),
  deletePersonMock: vi.fn(),
  getPeopleMock: vi.fn(),
  addPersonMock: vi.fn(),
  storageUpdatePersonMock: vi.fn(),
  storageDeletePersonMock: vi.fn(),
}))

vi.mock('@/utils/api', () => ({
  api: {
    listPeople: listPeopleMock,
    createPerson: createPersonMock,
    updatePerson: updatePersonMock,
    deletePerson: deletePersonMock,
  },
}))

vi.mock('@/utils/storage', () => ({
  storageService: {
    getPeople: getPeopleMock,
    addPerson: addPersonMock,
    updatePerson: storageUpdatePersonMock,
    deletePerson: storageDeletePersonMock,
  },
}))

const backendWang = {
  uid: 'p1',
  name: '王一珩',
  person_type: 'star',
  aliases: ['一珩'],
  keywords: ['王一珩'],
  created_at: '2026-06-30T16:06:30.660935',
  updated_at: '2026-06-30T16:06:30.660935',
}

describe('person store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    listPeopleMock.mockReset()
    createPersonMock.mockReset()
    updatePersonMock.mockReset()
    deletePersonMock.mockReset()
    getPeopleMock.mockReset()
    addPersonMock.mockReset()
    storageUpdatePersonMock.mockReset()
    storageDeletePersonMock.mockReset()
  })

  it('loads people from discovery API and maps backend fields to frontend model', async () => {
    listPeopleMock.mockResolvedValue({ ok: true, data: [backendWang] })
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

  it('creates people through discovery API and adds the mapped response to state', async () => {
    createPersonMock.mockResolvedValue({
      ok: true,
      data: {
        uid: 'person_backend_1',
        name: '赵一博',
        person_type: 'star',
        aliases: ['一博'],
        keywords: ['赵一博', '种地吧'],
        created_at: '2026-07-01T09:00:00',
        updated_at: '2026-07-01T09:00:00',
      },
    })

    const store = usePersonStore()
    const person = await store.add('赵一博', {
      aliases: ['一博'],
      keywords: ['赵一博', '种地吧'],
    })

    expect(createPersonMock).toHaveBeenCalledTimes(1)
    expect(createPersonMock).toHaveBeenCalledWith({
      uid: expect.stringMatching(/^person_/),
      name: '赵一博',
      person_type: 'star',
      aliases: ['一博'],
      keywords: ['赵一博', '种地吧'],
    })
    expect(addPersonMock).not.toHaveBeenCalled()
    expect(person.id).toBe('person_backend_1')
    expect(store.people).toEqual([person])
  })

  it('falls back to local creation when discovery API create fails', async () => {
    createPersonMock.mockResolvedValue({ ok: false, error: 'Network error' })

    const store = usePersonStore()
    const person = await store.add('本地明星')

    expect(addPersonMock).toHaveBeenCalledWith(person)
    expect(store.people).toEqual([person])
  })

  it('updates people through discovery API and maps the response into state', async () => {
    listPeopleMock.mockResolvedValue({ ok: true, data: [backendWang] })
    updatePersonMock.mockResolvedValue({
      ok: true,
      data: {
        ...backendWang,
        name: '王一珩 edited',
        aliases: ['小王'],
        updated_at: '2026-07-01T10:00:00',
      },
    })

    const store = usePersonStore()
    await store.load()
    await store.update('p1', { name: '王一珩 edited', aliases: ['小王'] })

    expect(updatePersonMock).toHaveBeenCalledWith('p1', {
      name: '王一珩 edited',
      aliases: ['小王'],
    })
    expect(storageUpdatePersonMock).not.toHaveBeenCalled()
    expect(store.people[0].name).toBe('王一珩 edited')
    expect(store.people[0].aliases).toEqual(['小王'])
  })

  it('falls back to local update when discovery API update fails', async () => {
    listPeopleMock.mockResolvedValue({ ok: false })
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
    updatePersonMock.mockResolvedValue({ ok: false, error: 'Network error' })

    const store = usePersonStore()
    await store.load()
    await store.update('local_1', { name: '本地明星 edited' })

    expect(storageUpdatePersonMock).toHaveBeenCalledWith('local_1', { name: '本地明星 edited' })
    expect(store.people[0].name).toBe('本地明星 edited')
  })

  it('deletes people through discovery API and removes them from state', async () => {
    listPeopleMock.mockResolvedValue({ ok: true, data: [backendWang] })
    deletePersonMock.mockResolvedValue({ ok: true })

    const store = usePersonStore()
    await store.load()
    await store.remove('p1')

    expect(deletePersonMock).toHaveBeenCalledWith('p1')
    expect(storageDeletePersonMock).not.toHaveBeenCalled()
    expect(store.people).toEqual([])
  })

  it('falls back to local deletion when discovery API delete fails', async () => {
    listPeopleMock.mockResolvedValue({ ok: false })
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
    deletePersonMock.mockResolvedValue({ ok: false, error: 'Network error' })

    const store = usePersonStore()
    await store.load()
    await store.remove('local_1')

    expect(storageDeletePersonMock).toHaveBeenCalledWith('local_1')
    expect(store.people).toEqual([])
  })
})
