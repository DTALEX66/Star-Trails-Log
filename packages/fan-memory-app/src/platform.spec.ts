/**
 * 平台识别工具测试
 */
import { describe, it, expect } from 'vitest'
import { identifyPlatform, getPlatformLabel, getContentTypeFromUrl } from '@/shared/utils/platform'
import { generateId, ID_PREFIX } from '@/shared/utils/id'

describe('platform identification', () => {
  it('identifies bilibili', () => {
    const result = identifyPlatform('https://www.bilibili.com/video/BV1GJ411x7')
    expect(result?.platform).toBe('bilibili')
    expect(result?.label).toBe('B站')
  })

  it('identifies bilibili short URL', () => {
    expect(identifyPlatform('https://b23.tv/abc123')?.platform).toBe('bilibili')
  })

  it('identifies QQ Music', () => {
    expect(identifyPlatform('https://y.qq.com/n/ryqq/song/001')?.platform).toBe('qqmusic')
  })

  it('identifies NetEase Music', () => {
    expect(identifyPlatform('https://music.163.com/song?id=123')?.platform).toBe('netease')
  })

  it('identifies YouTube', () => {
    expect(identifyPlatform('https://www.youtube.com/watch?v=abc')?.platform).toBe('youtube')
    expect(identifyPlatform('https://youtu.be/abc123')?.platform).toBe('youtube')
  })

  it('identifies Weibo', () => {
    expect(identifyPlatform('https://weibo.com/123456')?.platform).toBe('weibo')
  })

  it('identifies Twitter/X', () => {
    expect(identifyPlatform('https://x.com/user/status/123')?.platform).toBe('twitter')
  })

  it('identifies Instagram', () => {
    expect(identifyPlatform('https://www.instagram.com/p/abc/')?.platform).toBe('instagram')
  })

  it('identifies Douyin', () => {
    expect(identifyPlatform('https://www.douyin.com/video/123')?.platform).toBe('douyin')
  })

  it('identifies Xiaohongshu', () => {
    expect(identifyPlatform('https://www.xiaohongshu.com/explore/abc')?.platform).toBe('xiaohongshu')
  })

  it('identifies Spotify', () => {
    expect(identifyPlatform('https://open.spotify.com/track/abc')?.platform).toBe('spotify')
  })

  it('identifies Tencent Video', () => {
    expect(identifyPlatform('https://v.qq.com/x/cover/m.html')?.platform).toBe('tencent')
  })

  it('returns other for unknown URLs', () => {
    expect(identifyPlatform('https://example.com')?.platform).toBe('other')
    expect(identifyPlatform('')?.platform).toBe('other')
  })
})

describe('getPlatformLabel', () => {
  it('returns correct labels', () => {
    expect(getPlatformLabel('bilibili')).toBe('B站')
    expect(getPlatformLabel('youtube')).toBe('YouTube')
    expect(getPlatformLabel('qqmusic')).toBe('QQ音乐')
    expect(getPlatformLabel('other')).toBe('其他')
  })
})

describe('getContentTypeFromUrl', () => {
  it('returns music for music platforms', () => {
    expect(getContentTypeFromUrl('https://y.qq.com/song', 'qqmusic')).toBe('music')
    expect(getContentTypeFromUrl('https://music.163.com/song', 'netease')).toBe('music')
    expect(getContentTypeFromUrl('https://spotify.com/track', 'spotify')).toBe('music')
  })

  it('returns video for video URLs', () => {
    expect(getContentTypeFromUrl('https://example.com/video/123', 'bilibili')).toBe('video')
    expect(getContentTypeFromUrl('https://example.com/live', 'bilibili')).toBe('video')
    expect(getContentTypeFromUrl('https://youtube.com/watch', 'youtube')).toBe('video')
  })

  it('returns short for short URLs', () => {
    expect(getContentTypeFromUrl('https://example.com/short/123', 'other')).toBe('short')
    expect(getContentTypeFromUrl('https://example.com/shorts/abc', 'other')).toBe('short')
  })
})

describe('ID generation', () => {
  it('generates person IDs with correct prefix', () => {
    const id = generateId(ID_PREFIX.person)
    expect(id.startsWith('person_')).toBe(true)
  })

  it('generates content IDs with correct prefix', () => {
    const id = generateId(ID_PREFIX.content)
    expect(id.startsWith('content_')).toBe(true)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('test')))
    expect(ids.size).toBe(100)
  })
})
