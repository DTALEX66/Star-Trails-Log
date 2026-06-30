// 平台识别工具

import type { Platform, ContentType } from '../models/index'

interface PlatformRule {
  platform: Platform
  patterns: RegExp[]
  label: string
}

const PLATFORM_RULES: PlatformRule[] = [
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
  { platform: 'kugou',       patterns: [/kugou\.com/i],                                   label: '酷狗音乐' },
  { platform: 'kuwo',        patterns: [/kuwo\.cn/i],                                     label: '酷我音乐' },
  { platform: 'youtube',     patterns: [/youtube\.com/i, /youtu\.be/i],                   label: 'YouTube' },
  { platform: 'spotify',     patterns: [/spotify\.com/i],                                 label: 'Spotify' },
  { platform: 'twitter',     patterns: [/twitter\.com/i, /x\.com/i],                      label: 'X / Twitter' },
  { platform: 'instagram',   patterns: [/instagram\.com/i],                               label: 'Instagram' },
]

export function identifyPlatform(url: string): { platform: Platform; label: string } | null {
  for (const rule of PLATFORM_RULES) {
    if (rule.patterns.some(p => p.test(url))) {
      return { platform: rule.platform, label: rule.label }
    }
  }
  return { platform: 'other', label: '其他' }
}

export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_RULES.find(r => r.platform === platform)?.label ?? '其他'
}

export function getContentTypeFromUrl(url: string, platform: Platform): ContentType {
  if (platform === 'qqmusic' || platform === 'netease' || platform === 'spotify') {
    return 'music'
  }
  if (url.includes('/video/') || url.includes('live') || platform === 'youtube') {
    return 'video'
  }
  if (url.includes('/short/') || url.includes('/shorts/')) {
    return 'short'
  }
  return 'other'
}
