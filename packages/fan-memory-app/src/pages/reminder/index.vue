<template>
  <view class="page-reminder">
    <!-- 连接状态 -->
    <view v-if="!discoveryStore.connected" class="offline-banner">
      <text class="offline-text">⚠️ 发现后端未连接</text>
      <text class="offline-hint">启动 discovery-service 后自动连接</text>
    </view>

    <!-- 统计概览 -->
    <view v-if="discoveryStore.connected" class="stats-bar">
      <view class="stat-item" @click="discoveryStore.triggerDiscovery()">
        <text class="stat-num">{{ stats.new_count }}</text>
        <text class="stat-label">新发现</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.total_discoveries }}</text>
        <text class="stat-label">总计</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.total_sources }}</text>
        <text class="stat-label">追踪源</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ oldItems.length }}</text>
        <text class="stat-label">已处理</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view v-if="discoveryStore.connected" class="actions">
      <button class="btn-primary" @click="discoveryStore.triggerDiscovery()" :disabled="discoveryStore.loading">
        {{ discoveryStore.loading ? '检查中...' : '🔍 检查更新' }}
      </button>
    </view>

    <!-- 当前人物追踪源添加 -->
    <view v-if="discoveryStore.connected && personUid" class="source-form section">
      <view class="section-header">
        <text class="section-title">添加追踪源</text>
      </view>
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">平台</text>
          <input class="input-field" v-model="sourcePlatform" placeholder="weibo / bilibili / other" />
        </view>
        <view class="form-row">
          <text class="form-label">关键词或主页 URL</text>
          <input class="input-field" v-model="sourceValue" placeholder="输入关键词或官方账号链接" />
        </view>
        <button class="btn-primary" :disabled="sourceSaving" @click="createSource">
          {{ sourceSaving ? '添加中...' : '添加追踪源' }}
        </button>
      </view>
    </view>

    <!-- 新发现列表 -->
    <view v-if="discoveryStore.connected" class="section">
      <view class="section-header">
        <text class="section-title">新发现内容</text>
        <text v-if="discoveryStore.newCount" class="badge">{{ discoveryStore.newCount }}</text>
      </view>

      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="newItems.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">暂无新发现</text>
        <text class="empty-hint">点击「检查更新」或等待自动发现</text>
      </view>

      <view v-else class="discovery-list">
        <view v-for="item in newItems" :key="item.id" class="discovery-card card-enter">
          <view class="card-header">
            <text class="platform-tag">{{ getPlatformLabel(item.platform) }}</text>
            <text class="type-tag">{{ item.content_type }}</text>
          </view>
          <text class="card-title">{{ item.title }}</text>
          <text v-if="item.description" class="card-desc">{{ item.description.slice(0, 80) }}</text>
          <view class="card-footer">
            <text class="card-date">{{ item.published_at || item.discovered_at?.slice(0, 10) }}</text>
            <view class="card-actions">
              <text class="action-save" @click="save(item)">收藏</text>
              <text class="action-ignore" @click="ignore(item)">忽略</text>
              <text class="action-block" @click="block(item)">屏蔽</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部发现（非新） -->
    <view v-if="oldItems.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">已处理</text>
        <text class="section-subtitle">收藏 {{ savedCount }} · 忽略 {{ ignoredCount }} · 屏蔽 {{ blockedCount }}</text>
      </view>
      <view class="history-list">
        <view v-for="item in oldItems" :key="item.id" class="history-item">
          <text class="history-status" :class="item.status.toLowerCase()">{{ statusLabel(item.status) }}</text>
          <text class="history-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useDiscoveryStore } from '@/stores/discovery'
import { useContentStore } from '@/stores/content'
import { getPlatformLabel } from '@/shared/utils/platform'
import { generateId } from '@/shared/utils/id'
import { showSuccess } from '@/utils/toast'

const discoveryStore = useDiscoveryStore()
const contentStore = useContentStore()
const loading = ref(false)
const personUid = ref('')
const sourcePlatform = ref('weibo')
const sourceValue = ref('')
const sourceSaving = ref(false)

onShow(async () => {
  loading.value = true
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personUid.value = page.$page?.options?.person || page.options?.person || ''
  if (await discoveryStore.checkConnection()) {
    await Promise.all([
      discoveryStore.loadStats(),
      discoveryStore.loadNewDiscoveries(50),
      discoveryStore.loadAllDiscoveries(),
    ])
  }
  loading.value = false
})

const stats = computed(() => discoveryStore.stats)

const newItems = computed(() =>
  discoveryStore.discoveries.filter(d => d.status === 'NEW').slice(0, 30)
)

const oldItems = computed(() =>
  discoveryStore.discoveries.filter(d => d.status !== 'NEW').slice(0, 20)
)

const savedCount = computed(() => discoveryStore.discoveries.filter(d => d.status === 'SAVED').length)
const ignoredCount = computed(() => discoveryStore.discoveries.filter(d => d.status === 'IGNORED').length)
const blockedCount = computed(() => discoveryStore.discoveries.filter(d => d.status === 'BLOCKED').length)

function statusLabel(s: string) {
  const map: Record<string, string> = { SAVED: '已收藏', IGNORED: '已忽略', BLOCKED: '已屏蔽' }
  return map[s] || s
}

async function save(item: any) {
  // 先收藏到本地
  const result = contentStore.add({
    url: item.url,
    title: item.title,
    people: [], // 暂不关联人物
    tags: [item.platform],
  })

  // 再通知后端
  await discoveryStore.takeAction(item.id, 'save')

  if (result.content) {
    showSuccess('已收藏')
  }
}

async function ignore(item: any) {
  await discoveryStore.takeAction(item.id, 'ignore')
  showSuccess('已忽略')
}

async function block(item: any) {
  await discoveryStore.takeAction(item.id, 'block')
  showSuccess('已屏蔽')
}

async function createSource() {
  const value = sourceValue.value.trim()
  if (!value) return
  sourceSaving.value = true
  const isUrl = /^https?:\/\//.test(value)
  const ok = await discoveryStore.syncSource(personUid.value, {
    uid: generateId('source'),
    source_type: isUrl ? 'official_account' : 'keyword',
    platform: sourcePlatform.value.trim() || 'other',
    keyword: isUrl ? '' : value,
    url: isUrl ? value : '',
  })
  sourceSaving.value = false
  if (ok) {
    sourceValue.value = ''
    await discoveryStore.loadStats()
    showSuccess('追踪源已添加')
  }
}
</script>

<style scoped>
.page-reminder { padding: 0 0 40rpx; }

.offline-banner { background: #FFF3E0; padding: 20rpx 32rpx; text-align: center; }
.offline-text { font-size: 26rpx; color: #E65100; display: block; }
.offline-hint { font-size: 22rpx; color: #FFB74D; margin-top: 4rpx; display: block; }

.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8rpx; padding: 24rpx; background: #FFF; margin: 16rpx; border-radius: 12rpx; }
.stat-item { text-align: center; }
.stat-num { font-size: 36rpx; font-weight: 700; color: #007AFF; display: block; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }

.actions { padding: 0 32rpx 16rpx; }
.actions .btn-primary { width: 100%; }

.form-card { background: #FFF; border-radius: 14rpx; padding: 22rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.form-row { margin-bottom: 18rpx; }
.form-label { font-size: 23rpx; color: #666; display: block; margin-bottom: 8rpx; font-weight: 600; }
.input-field { background: #FAFAFA; border: 2rpx solid #E8E8E8; border-radius: 10rpx; padding: 16rpx 18rpx; font-size: 25rpx; width: 100%; box-sizing: border-box; }
.form-card .btn-primary { width: 100%; }

.section { padding: 0 16rpx; margin-bottom: 16rpx; }
.section-header { display: flex; align-items: center; gap: 12rpx; padding: 16rpx; flex-wrap: wrap; }
.section-title { font-size: 28rpx; font-weight: 600; }
.section-subtitle { font-size: 21rpx; color: #aaa; }
.badge { background: #FF5252; color: #FFF; font-size: 20rpx; padding: 2rpx 14rpx; border-radius: 20rpx; }

.loading-state { text-align: center; padding: 60rpx; }
.loading-text { font-size: 24rpx; color: #999; }

.empty-state { text-align: center; padding: 60rpx 32rpx; }
.empty-icon { font-size: 48rpx; display: block; }
.empty-text { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }
.empty-hint { font-size: 22rpx; color: #ccc; margin-top: 4rpx; display: block; }

.discovery-list { display: flex; flex-direction: column; gap: 10rpx; }
.discovery-card { background: #FFF; border-radius: 12rpx; padding: 20rpx; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.card-header { display: flex; gap: 8rpx; margin-bottom: 8rpx; }
.platform-tag { font-size: 20rpx; color: #007AFF; background: #E8F0FE; padding: 2rpx 12rpx; border-radius: 4rpx; }
.type-tag { font-size: 20rpx; color: #666; background: #F5F5F5; padding: 2rpx 12rpx; border-radius: 4rpx; }
.card-title { font-size: 26rpx; color: #1a1a1a; display: block; line-height: 1.5; }
.card-desc { font-size: 22rpx; color: #999; margin-top: 6rpx; display: block; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10rpx; }
.card-date { font-size: 20rpx; color: #bbb; }
.card-actions { display: flex; gap: 12rpx; }
.action-save { font-size: 22rpx; color: #007AFF; padding: 4rpx 16rpx; background: #E8F0FE; border-radius: 4rpx; }
.action-ignore { font-size: 22rpx; color: #999; padding: 4rpx 16rpx; background: #F5F5F5; border-radius: 4rpx; }
.action-block { font-size: 22rpx; color: #FF5252; padding: 4rpx 16rpx; background: #FFEBEE; border-radius: 4rpx; }

.history-list { background: #FFF; border-radius: 12rpx; overflow: hidden; }
.history-item { display: flex; align-items: center; padding: 16rpx 20rpx; border-bottom: 2rpx solid #F5F5F5; gap: 12rpx; }
.history-item:last-child { border-bottom: none; }
.history-status { font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 4rpx; flex-shrink: 0; }
.history-status.saved { color: #4CAF50; background: #E8F5E9; }
.history-status.ignored { color: #999; background: #F5F5F5; }
.history-status.blocked { color: #FF5252; background: #FFEBEE; }
.history-title { font-size: 24rpx; color: #666; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
