import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/utils/storage'
import type { Person } from '@/shared/models/index'
import { generateId, ID_PREFIX } from '@/shared/utils/id'

export const usePersonStore = defineStore('person', () => {
  const people = ref<Person[]>([])

  const totalCount = computed(() => people.value.length)

  function load() {
    people.value = storageService.getPeople()
  }

  function getById(id: string): Person | undefined {
    return people.value.find(p => p.id === id)
  }

  function add(name: string, options?: {
    type?: 'star' | 'group'
    aliases?: string[]
    teams?: string[]
    keywords?: string[]
    notes?: string
  }) {
    const person: Person = {
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
    storageService.addPerson(person)
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
