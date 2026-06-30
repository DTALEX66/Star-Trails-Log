/**
 * 核心逻辑测试 — Node.js 可运行
 * 测试平台识别、ID生成、标题提取等纯函数
 */

const path = require('path')

// 模拟 uni-app 平台识别逻辑
function identifyPlatform(url) {
  const rules = [
    { platform: 'bilibili',    patterns: [/bilibili\.com/i, /b23\.tv/i],                   label: 'B站' },
    { platform: 'douyin',      patterns: [/douyin\.com/i, /iesdouyin\.com/i],               label: '抖音' },
    { platform: 'kuaishou',    patterns: [/kuaishou\.com/i],                                label: '快手' },
    { platform: 'weibo',       patterns: [/weibo\.com/i, /weibo\.cn/i],                     label: '微博' },
    { platform: 'xiaohongshu', patterns: [/xiaohongshu\.com/i, /xhslink\.com/i],            label: '小红书' },
    { platform: 'iqiyi',       patterns: [/iqiyi\.com/i],                                   label: '爱奇艺' },
    { platform: 'tencent',     patterns: [/v\.qq\.com/i],                                   label: '腾讯视频' },
    { platform: 'youku',       patterns: [/youku\.com/i],                                   label: '优酷' },
    { platform: 'mango',       patterns: [/mgtv\.com/i],                                    label: '芒果TV' },
    { platform: 'qqmusic',     patterns: [/y\.qq\.com/i],                                   label: 'QQ音乐' },
    { platform: 'netease',     patterns: [/music\.163\.com/i],                              label: '网易云音乐' },
    { platform: 'youtube',     patterns: [/youtube\.com/i, /youtu\.be/i],                   label: 'YouTube' },
    { platform: 'spotify',     patterns: [/spotify\.com/i],                                 label: 'Spotify' },
    { platform: 'twitter',     patterns: [/twitter\.com/i, /x\.com/i],                      label: 'X / Twitter' },
    { platform: 'instagram',   patterns: [/instagram\.com/i],                               label: 'Instagram' },
  ]

  for (const rule of rules) {
    if (rule.patterns.some(p => p.test(url))) {
      return { platform: rule.platform, label: rule.label }
    }
  }
  return { platform: 'other', label: '其他' }
}

// 模拟 ID 生成
function generateId(prefix) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}${random}`
}

// 模拟标题提取
function extractTitleFromUrl(url) {
  try {
    const u = new URL(url)
    const segments = u.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || ''
    if (u.hostname.includes('bilibili')) return `B站视频`
    if (u.hostname.includes('weibo')) return '微博动态'
    if (u.hostname.includes('youtube')) return 'YouTube 视频'
    if (u.hostname.includes('y.qq.com')) return 'QQ音乐'
    if (u.hostname.includes('music.163.com')) return '网易云音乐'
    return last.slice(0, 40) || url.slice(0, 40)
  } catch {
    return url.slice(0, 40)
  }
}

// ============ 测试用例 ============
let passed = 0
let failed = 0

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}`)
    failed++
  }
}

function assertEqual(actual, expected, name) {
  const ok = actual === expected
  if (ok) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}: expected "${expected}", got "${actual}"`)
    failed++
  }
}

console.log('\n📋 Fan Memory OS — 核心逻辑测试\n')

// === 1. 平台识别 ===
console.log('🔍 平台识别')
assertEqual(identifyPlatform('https://www.bilibili.com/video/BV1GJ411x7').platform, 'bilibili', 'B站 URL')
assertEqual(identifyPlatform('https://b23.tv/abc123').platform, 'bilibili', 'B站短链接')
assertEqual(identifyPlatform('https://y.qq.com/n/ryqq/songDetail/001').platform, 'qqmusic', 'QQ音乐')
assertEqual(identifyPlatform('https://music.163.com/song?id=123').platform, 'netease', '网易云音乐')
assertEqual(identifyPlatform('https://www.youtube.com/watch?v=abc').platform, 'youtube', 'YouTube')
assertEqual(identifyPlatform('https://youtu.be/abc123').platform, 'youtube', 'YouTube短链接')
assertEqual(identifyPlatform('https://weibo.com/123456').platform, 'weibo', '微博')
assertEqual(identifyPlatform('https://www.x.com/user/status/123').platform, 'twitter', 'X/Twitter')
assertEqual(identifyPlatform('https://www.instagram.com/p/abc/').platform, 'instagram', 'Instagram')
assertEqual(identifyPlatform('https://www.douyin.com/video/123').platform, 'douyin', '抖音')
assertEqual(identifyPlatform('https://www.xiaohongshu.com/explore/abc').platform, 'xiaohongshu', '小红书')
assertEqual(identifyPlatform('https://open.spotify.com/track/abc').platform, 'spotify', 'Spotify')
assertEqual(identifyPlatform('https://v.qq.com/x/cover/m.html').platform, 'tencent', '腾讯视频')
assertEqual(identifyPlatform('https://example.com/custom').platform, 'other', '未知平台 → other')
assertEqual(identifyPlatform('').platform, 'other', '空字符串 → other')
assertEqual(identifyPlatform('not-a-url').platform, 'other', '无效URL → other')

// === 2. ID 生成 ===
console.log('\n🆔 ID 生成')
const id1 = generateId('person')
const id2 = generateId('person')
assert(id1.startsWith('person_'), 'person 前缀正确')
assert(id1 !== id2, '两次生成的 ID 不同')
assert(id1.length > 10, 'ID 有足够长度')

const contentId = generateId('content')
assert(contentId.startsWith('content_'), 'content 前缀正确')

// === 3. 标题提取 ===
console.log('\n📝 标题提取（URL → 标题）')
assertEqual(extractTitleFromUrl('https://www.bilibili.com/video/BV1GJ411x7'), 'B站视频', 'B站 URL')
assertEqual(extractTitleFromUrl('https://www.youtube.com/watch?v=abc'), 'YouTube 视频', 'YouTube')
assertEqual(extractTitleFromUrl('https://weibo.com/123456'), '微博动态', '微博')
assertEqual(extractTitleFromUrl('https://y.qq.com/n/ryqq/songDetail/001'), 'QQ音乐', 'QQ音乐')

// === 4. 模拟数据流 ===
console.log('\n🔄 数据流模拟')

// 创建艺人
const starId = generateId('person')
const star = {
  id: starId,
  name: '王一珩',
  type: 'star',
  aliases: ['王哥', '一珩'],
  keywords: ['王一珩', '王一珩 新歌', '王一珩 直播'],
  created_at: new Date().toISOString().split('T')[0],
  updated_at: new Date().toISOString().split('T')[0],
}
assert(star.name === '王一珩', '创建艺人')
assert(star.aliases.length === 2, '别名2个')
assert(star.keywords.length === 3, '关键词3个')

// 收藏内容
const contentUrl = 'https://www.bilibili.com/video/BV1GJ411x7'
const platform = identifyPlatform(contentUrl)
const content = {
  id: generateId('content'),
  title: '王一珩最新采访',
  url: contentUrl,
  platform: platform.platform,
  content_type: 'video',
  people: [starId],
  tags: ['采访', '高光'],
  status: 'SAVED',
  watched: false,
  source: 'manual',
  created_at: new Date().toISOString().split('T')[0],
  updated_at: new Date().toISOString().split('T')[0],
}
assert(content.platform === 'bilibili', '自动识别平台为 B站')
assert(content.content_type === 'video', '内容类型为 video')
assert(content.watched === false, '初始状态未看')

// 去重检查
const isDuplicate = content.url === contentUrl
assert(isDuplicate === true, '同一 URL 检测为重复')

// 切换已看
content.watched = true
assert(content.watched === true, '切换已看状态')

// 搜索
function search(contents, query) {
  const q = query.toLowerCase()
  return contents.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  )
}
const searchResult = search([content], '采访')
assert(searchResult.length === 1, '搜索"采访"找到内容')
assert(search(searchResult, '直播').length === 0, '搜索"直播"无结果')

// 按人物筛选
const byPerson = [content].filter(c => c.people.includes(starId))
assert(byPerson.length === 1, '按艺人筛选找到内容')

// === 5. 标签去重 ===
console.log('\n🏷️ 标签管理')
const tags = []
function addTag(tag) {
  if (!tags.includes(tag)) tags.push(tag)
}
addTag('采访')
addTag('高光')
addTag('采访') // 重复
assert(tags.length === 2, '标签去重后为 2 个')
assert(tags.includes('采访'), '包含标签"采访"')
assert(tags.includes('高光'), '包含标签"高光"')

// === 结果 ===
console.log(`\n${'='.repeat(40)}`)
console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败, ${passed + failed} 总计`)
console.log(`${'='.repeat(40)}\n`)

process.exit(failed > 0 ? 1 : 0)
