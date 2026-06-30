import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '@/utils/storage'
import type { Team } from '@/shared/models/index'
import { generateId, ID_PREFIX } from '@/shared/utils/id'

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([])

  function load() {
    teams.value = storageService.getTeams()
  }

  function getById(id: string): Team | undefined {
    return teams.value.find(t => t.id === id)
  }

  function add(name: string, options?: {
    aliases?: string[]
    members?: string[]
    keywords?: string[]
    notes?: string
  }) {
    const team: Team = {
      id: generateId(ID_PREFIX.team),
      name,
      aliases: options?.aliases ?? [],
      members: options?.members ?? [],
      keywords: options?.keywords ?? [name],
      notes: options?.notes,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }
    storageService.addTeam(team)
    teams.value.push(team)
    return team
  }

  function update(id: string, updates: Partial<Team>) {
    const idx = teams.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      teams.value[idx] = { ...teams.value[idx], ...updates }
    }
  }

  function remove(id: string) {
    teams.value = teams.value.filter(t => t.id !== id)
  }

  return { teams, load, getById, add, update, remove }
})
