import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/utils/storage'
import { api } from '@/utils/api'
import type { Person, PersonType } from '@/shared/models/index'
import { generateId, ID_PREFIX } from '@/shared/utils/id'

type BackendPerson = {
  uid?: string
  id?: string | number
  name: string
  person_type?: PersonType
  type?: PersonType
  aliases?: string[]
  keywords?: string[]
  created_at?: string
  updated_at?: string
}

function mapBackendPerson(person: BackendPerson): Person {
  return {
    id: String(person.uid ?? person.id),
    name: person.name,
    type: person.person_type ?? person.type ?? 'star',
    aliases: person.aliases ?? [],
    teams: [],
    keywords: person.keywords ?? [person.name],
    created_at: person.created_at ?? new Date().toISOString(),
    updated_at: person.updated_at ?? new Date().toISOString(),
  }
}

export const usePersonStore = defineStore('person', () => {
  const people = ref<Person[]>([])

  const totalCount = computed(() => people.value.length)

  async function load() {
    const result = await api.listPeople()
    if (result.ok && Array.isArray(result.data)) {
      people.value = result.data.map(mapBackendPerson)
      return
    }

    people.value = storageService.getPeople()
  }

  function getById(id: string): Person | undefined {
    return people.value.find(p => p.id === id)
  }

  async function add(name: string, options?: {
    type?: 'star' | 'group'
    aliases?: string[]
    teams?: string[]
    keywords?: string[]
    notes?: string
  }) {
    const fallbackPerson: Person = {
      id: generateId(ID_PREFIX.person),
      name,
      type: options?.type ?? 'star',
      aliases: options?.aliases ?? [],
      teams: options?.teams ?? [],
      keywords: options?.keywords ?? [name],
      notes: options?.notes,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }

    const result = await api.createPerson({
      uid: fallbackPerson.id,
      name: fallbackPerson.name,
      person_type: fallbackPerson.type,
      aliases: fallbackPerson.aliases,
      keywords: fallbackPerson.keywords,
    })

    const person = result.ok && result.data
      ? mapBackendPerson(result.data)
      : fallbackPerson

    if (!result.ok) {
      storageService.addPerson(person)
    }

    people.value.push(person)
    return person
  }

  function update(id: string, updates: Partial<Person>) {
    storageService.updatePerson(id, updates)
    const index = people.value.findIndex(p => p.id === id)
    if (index !== -1) {
      people.value[index] = { ...people.value[index], ...updates }
    }
  }

  function remove(id: string) {
    storageService.deletePerson(id)
    people.value = people.value.filter(p => p.id !== id)
  }

  function search(query: string): Person[] {
    const q = query.toLowerCase()
    return people.value.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.aliases.some(a => a.toLowerCase().includes(q))
    )
  }

  return {
    people,
    totalCount,
    load,
    getById,
    add,
    update,
    remove,
    search,
  }
})
