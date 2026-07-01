export interface DiscoverySeed {
  keyword: string
  platform: string
  source_type: 'keyword'
}

const BASE_SUFFIXES = ['', ' 工作室', ' 微博', ' 超话']

const DIRECTION_SUFFIXES: Record<string, string[]> = {
  影视作品: [' 新剧', ' 电影'],
  舞台音乐: [' 舞台', ' 音乐'],
  商务代言: [' 代言', ' 品牌'],
  综艺采访: [' 综艺', ' 采访'],
  全部动态: [' 新剧', ' 舞台', ' 代言', ' 综艺'],
}

export function buildDiscoverySeeds(name: string, directions: string[]): DiscoverySeed[] {
  const normalizedName = name.trim()
  const suffixes = BASE_SUFFIXES.slice()

  directions.forEach(direction => {
    const extra = DIRECTION_SUFFIXES[direction] || []
    extra.forEach(suffix => suffixes.push(suffix))
  })

  const seen: Record<string, boolean> = {}
  const keywords: string[] = []

  suffixes.forEach(suffix => {
    const keyword = `${normalizedName}${suffix}`.trim()
    if (keyword && !seen[keyword]) {
      seen[keyword] = true
      keywords.push(keyword)
    }
  })

  return keywords.map(keyword => ({
    keyword,
    platform: 'weibo',
    source_type: 'keyword',
  }))
}
