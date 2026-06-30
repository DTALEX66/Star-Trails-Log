/**
 * Toast 提示工具 — 统一反馈
 */

type ToastType = 'success' | 'error' | 'info'

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

export function showToast(message: string, type: ToastType = 'info', duration = 2000) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration,
    mask: true,
  })
}

export function showSuccess(message: string) {
  showToast(message, 'success')
}

export function showError(message: string) {
  showToast(message, 'error')
}

/**
 * 从URL中提取基础标题
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const u = new URL(url)
    // 提取路径最后一段作为标题
    const segments = u.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || ''

    // 如果是 B站视频
    if (u.hostname.includes('bilibili') || u.hostname.includes('b23')) {
      return `B站视频 ${last.slice(0, 12)}`
    }

    // 如果是微博
    if (u.hostname.includes('weibo')) {
      return '微博动态'
    }

    // 如果是 YouTube
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) {
      return 'YouTube 视频'
    }

    // 如果是音乐平台
    if (u.hostname.includes('y.qq.com')) return 'QQ音乐'
    if (u.hostname.includes('music.163.com')) return '网易云音乐'
    if (u.hostname.includes('spotify.com')) return 'Spotify'

    // 兜底：从 URL 提取
    return last
      .replace(/\.(html|shtml|php|aspx)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .slice(0, 40) || url.slice(0, 40)
  } catch {
    return url.slice(0, 40)
  }
}

/**
 * 确认对话框
 */
export function confirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
    })
  })
}
