import { describe, expect, it } from 'vitest'
import { buildDiscoverySeeds } from './discoverySeeds'

describe('buildDiscoverySeeds', () => {
  it('generates base search keywords for a new followed star', () => {
    const seeds = buildDiscoverySeeds('王一博', [])

    expect(seeds.map(seed => seed.keyword)).toEqual(expect.arrayContaining([
      '王一博',
      '王一博 工作室',
      '王一博 微博',
      '王一博 超话',
    ]))
  })

  it('adds direction keywords without duplicates', () => {
    const seeds = buildDiscoverySeeds('王一博', ['影视作品', '舞台音乐', '商务代言'])

    expect(seeds.map(seed => seed.keyword)).toEqual(expect.arrayContaining([
      '王一博 新剧',
      '王一博 电影',
      '王一博 舞台',
      '王一博 音乐',
      '王一博 代言',
      '王一博 品牌',
    ]))
    expect(new Set(seeds.map(seed => seed.keyword)).size).toBe(seeds.length)
  })
})
