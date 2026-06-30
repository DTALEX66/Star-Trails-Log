/**
 * 本地存储服务 - StorageService
 * Phase 1 使用 uni-app 本地缓存
 * 数据以 JSON 格式存储，支持导入/导出
 */

import type { LocalDatabase, Person, Team, Content, IgnoreRule } from '@/shared/models/index'

const STORAGE_KEY = 'fan_memory_db'
const DB_VERSION = 1

class StorageService {
  private db: LocalDatabase | null = null

  /** 初始化/加载数据库 */
  load(): LocalDatabase {
    if (this.db) return this.db

    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (raw) {
        this.db = JSON.parse(raw) as LocalDatabase
        return this.db!
      }
    } catch (e) {
      console.warn('Storage load failed, reinitializing', e)
    }

    this.db = this.createEmpty()
    this.save()
    return this.db
  }

  /** 保存数据库到本地 */
  private save(): void {
    if (!this.db) return
    this.db.last_updated = new Date().toISOString()
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.db))
    } catch (e) {
      console.error('Storage save failed', e)
    }
  }

  /** 创建空数据库 */
  private createEmpty(): LocalDatabase {
    return {
      version: DB_VERSION,
      people: [],
      teams: [],
      contents: [],
      ignore_rules: [],
      tags: [],
      last_updated: new Date().toISOString(),
    }
  }

  // ============ People ============

  getPeople(): Person[] {
    return this.load().people
  }

  getPerson(id: string): Person | undefined {
    return this.load().people.find(p => p.id === id)
  }

  addPerson(person: Person): void {
    const db = this.load()
    db.people.push(person)
    this.save()
  }

  updatePerson(id: string, updates: Partial<Person>): void {
    const db = this.load()
    const index = db.people.findIndex(p => p.id === id)
    if (index !== -1) {
      db.people[index] = { ...db.people[index], ...updates, updated_at: new Date().toISOString() }
      this.save()
    }
  }

  deletePerson(id: string): void {
    const db = this.load()
    db.people = db.people.filter(p => p.id !== id)
    // 同时删除关联内容
    db.contents = db.contents.filter(c => !c.people.includes(id))
    this.save()
  }

  // ============ Teams ============

  getTeams(): Team[] {
    return this.load().teams
  }

  addTeam(team: Team): void {
    const db = this.load()
    db.teams.push(team)
    this.save()
  }

  // ============ Contents ============

  getContents(): Content[] {
    return this.load().contents
  }

  getContent(id: string): Content | undefined {
    return this.load().contents.find(c => c.id === id)
  }

  addContent(content: Content): void {
    const db = this.load()
    db.contents.push(content)
    this.save()
  }

  updateContent(id: string, updates: Partial<Content>): void {
    const db = this.load()
    const index = db.contents.findIndex(c => c.id === id)
    if (index !== -1) {
      db.contents[index] = { ...db.contents[index], ...updates, updated_at: new Date().toISOString() }
      this.save()
    }
  }

  deleteContent(id: string): void {
    const db = this.load()
    db.contents = db.contents.filter(c => c.id !== id)
    this.save()
  }

  getContentsByPerson(personId: string): Content[] {
    return this.load().contents.filter(c => c.people.includes(personId))
  }

  getUnwatchedCount(personId: string): number {
    return this.load().contents.filter(c => c.people.includes(personId) && !c.watched).length
  }

  // ============ Dedup ============

  /** 检查URL是否已存在 */
  isDuplicateUrl(url: string): boolean {
    return this.load().contents.some(c => c.url === url)
  }

  /** 获取疑似重复内容（同平台+同来源） */
  getPotentialDuplicate(platform: string, title: string): Content | undefined {
    return this.load().contents.find(c =>
      c.platform === platform &&
      this.similarTitle(c.title, title)
    )
  }

  /** 标题相似度检查（简单版：包含关系） */
  private similarTitle(a: string, b: string): boolean {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()
    return aLower.includes(bLower) || bLower.includes(aLower)
  }

  // ============ Ignore Rules ============

  getIgnoreRules(): IgnoreRule[] {
    return this.load().ignore_rules
  }

  addIgnoreRule(rule: IgnoreRule): void {
    const db = this.load()
    db.ignore_rules.push(rule)
    this.save()
  }

  isBlocked(url: string): boolean {
    const rules = this.load().ignore_rules
    return rules.some(r => {
      if (r.rule_type === 'url_pattern' && url.includes(r.value)) return true
      if (r.rule_type === 'platform') {
        // Check if content's platform matches
      }
      return false
    })
  }

  // ============ Tags ============

  getAllTags(): string[] {
    return this.load().tags
  }

  addTag(tag: string): void {
    const db = this.load()
    if (!db.tags.includes(tag)) {
      db.tags.push(tag)
      this.save()
    }
  }

  // ============ Import / Export ============

  exportJSON(): string {
    return JSON.stringify(this.load(), null, 2)
  }

  importJSON(jsonString: string): { success: boolean; count: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonString) as LocalDatabase
      const errors: string[] = []

      if (!data.people || !data.contents) {
        return { success: false, count: 0, errors: ['无效的数据格式'] }
      }

      const db = this.load()

      // 合并 people（按 ID 去重）
      let count = 0
      for (const person of data.people) {
        const exists = db.people.find(p => p.id === person.id)
        if (!exists) {
          db.people.push(person)
          count++
        }
      }

      // 合并 contents（按 URL 去重）
      for (const content of data.contents) {
        const exists = db.contents.find(c => c.url === content.url)
        if (!exists) {
          db.contents.push(content)
          count++
        }
      }

      this.save()
      return { success: true, count, errors }
    } catch (e) {
      return { success: false, count: 0, errors: [(e as Error).message] }
    }
  }

  /** 重置所有数据 */
  reset(): void {
    this.db = this.createEmpty()
    this.save()
  }
}

export const storageService = new StorageService()
